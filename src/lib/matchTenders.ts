import { TENDERS, type Tender, type TenderProfile } from '@/mock/tenders';
import { formatRubCompact } from '@/lib/format';

/**
 * Детерминированный подбор тендеров под профиль бизнеса.
 *
 * Каждый критерий (ОКВЭД, регион, оборот, опыт, посильность суммы) даёт
 * pass/partial/fail и взвешенный вклад в матч-скор 0..100. Возвращает список,
 * отсортированный по убыванию скора, с объяснением «соответствуете / не хватает».
 */

export type CriterionStatus = 'pass' | 'partial' | 'fail';

export interface Criterion {
  id: string;
  label: string;
  status: CriterionStatus;
  detail: string;
}

export type MatchVerdict = 'strong' | 'partial' | 'weak';

export interface ScoredTender {
  tender: Tender;
  score: number;
  verdict: MatchVerdict;
  criteria: Criterion[];
  /** Чего не хватает для полного соответствия. */
  missing: string[];
  /** Критичные несоответствия, блокирующие участие. */
  blockers: string[];
}

interface Weighted {
  weight: number;
  value: number; // 0..1
  criterion: Criterion;
  critical?: boolean; // fail этого критерия блокирует участие
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function okvedCriterion(t: Tender, p: TenderProfile): Weighted {
  const overlap = t.okved.some((c) => p.okved.includes(c));
  const sameField = t.category.includes('общепит') && p.category.includes('общепит');
  const value = overlap ? 1 : sameField ? 0.4 : 0;
  const status: CriterionStatus = overlap ? 'pass' : sameField ? 'partial' : 'fail';
  return {
    weight: 30,
    value,
    critical: true,
    criterion: {
      id: 'okved',
      label: 'ОКВЭД / профиль',
      status,
      detail: overlap
        ? `Ваш ОКВЭД ${p.okved.join(', ')} подходит под требования`
        : sameField
          ? 'Смежная сфера — возможно, потребуется добавить код ОКВЭД'
          : `Требуется ОКВЭД ${t.okved.join(', ')} — у вас другой профиль`,
    },
  };
}

function regionCriterion(t: Tender, p: TenderProfile): Weighted {
  // Казань входит в Татарстан; «Москва» для казанского профиля — другой регион.
  const inRegion = t.region === p.region || (t.region === 'Татарстан' && p.region === 'Казань');
  const value = inRegion ? 1 : 0;
  return {
    weight: 20,
    value,
    critical: true,
    criterion: {
      id: 'region',
      label: 'Регион',
      status: inRegion ? 'pass' : 'fail',
      detail: inRegion ? `${t.region} — ваш регион` : `${t.region} — другой регион, участие невыгодно`,
    },
  };
}

function turnoverCriterion(t: Tender, p: TenderProfile): Weighted {
  if (t.minAnnualTurnover === 0) {
    return {
      weight: 20,
      value: 1,
      criterion: { id: 'turnover', label: 'Оборот', status: 'pass', detail: 'Требований по обороту нет' },
    };
  }
  const ratio = p.annualTurnover / t.minAnnualTurnover;
  const value = ratio >= 1 ? 1 : ratio >= 0.6 ? 0.5 : 0;
  const status: CriterionStatus = ratio >= 1 ? 'pass' : ratio >= 0.6 ? 'partial' : 'fail';
  return {
    weight: 20,
    value,
    criterion: {
      id: 'turnover',
      label: 'Оборот',
      status,
      detail:
        status === 'pass'
          ? `Ваш оборот ${formatRubCompact(p.annualTurnover)} покрывает требование`
          : `Требуется оборот от ${formatRubCompact(t.minAnnualTurnover)}, у вас ${formatRubCompact(p.annualTurnover)}`,
    },
  };
}

function experienceCriterion(t: Tender, p: TenderProfile): Weighted {
  if (t.minExperienceMonths === 0) {
    return {
      weight: 15,
      value: 1,
      criterion: { id: 'experience', label: 'Опыт', status: 'pass', detail: 'Опыт не требуется — можно новичку' },
    };
  }
  const ratio = p.experienceMonths / t.minExperienceMonths;
  const value = ratio >= 1 ? 1 : ratio >= 0.5 ? 0.5 : 0;
  const status: CriterionStatus = ratio >= 1 ? 'pass' : ratio >= 0.5 ? 'partial' : 'fail';
  return {
    weight: 15,
    value,
    criterion: {
      id: 'experience',
      label: 'Опыт работы',
      status,
      detail:
        status === 'pass'
          ? `Опыта ${p.experienceMonths} мес достаточно`
          : `Требуется опыт от ${t.minExperienceMonths} мес, у вас ${p.experienceMonths} мес`,
    },
  };
}

function sumFitCriterion(t: Tender, p: TenderProfile): Weighted {
  const ratio = t.sum / p.annualTurnover;
  const value = ratio <= 0.5 ? 1 : ratio <= 1 ? 0.6 : 0.3;
  const status: CriterionStatus = ratio <= 0.5 ? 'pass' : ratio <= 1 ? 'partial' : 'fail';
  return {
    weight: 15,
    value,
    criterion: {
      id: 'sum',
      label: 'Посильность суммы',
      status,
      detail:
        status === 'pass'
          ? 'Сумма контракта посильна для вашего масштаба'
          : status === 'partial'
            ? 'Сумма крупная — оцените ресурсы на исполнение'
            : 'Сумма великовата для текущего оборота',
    },
  };
}

export function scoreTender(t: Tender, p: TenderProfile): ScoredTender {
  const parts = [
    okvedCriterion(t, p),
    regionCriterion(t, p),
    turnoverCriterion(t, p),
    experienceCriterion(t, p),
    sumFitCriterion(t, p),
  ];

  const raw = Math.round(parts.reduce((s, x) => s + x.weight * x.value, 0));
  const criteria = parts.map((x) => x.criterion);
  const missing = parts.filter((x) => x.criterion.status !== 'pass').map((x) => x.criterion.detail);
  const blockers = parts.filter((x) => x.critical && x.criterion.status === 'fail').map((x) => x.criterion.detail);

  // Критичное несоответствие (чужой ОКВЭД/регион) не даёт набрать высокий балл
  // за второстепенные критерии — такой тендер уходит вниз списка.
  const score = clamp(blockers.length > 0 ? Math.min(raw, 45) : raw, 0, 100);
  const verdict: MatchVerdict = blockers.length > 0 ? 'weak' : score >= 75 ? 'strong' : score >= 55 ? 'partial' : 'weak';

  return { tender: t, score, verdict, criteria, missing, blockers };
}

/** Подбирает и ранжирует тендеры под профиль. */
export function matchTenders(profile: TenderProfile): ScoredTender[] {
  return TENDERS.map((t) => scoreTender(t, profile)).sort((a, b) => b.score - a.score);
}
