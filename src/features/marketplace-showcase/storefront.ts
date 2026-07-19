import { AUDIENCE_SEGMENTS, type AudienceSegment, type ClientPersona } from '@/mock/audience';

/**
 * Модель локальной витрины: карточка бизнеса, настройки аудитории и
 * детерминированный расчёт охвата/метрик. Метрики монотонно растут при
 * расширении аудитории (радиус ↑, больше интересов, шире диапазон трат).
 */

export interface BusinessCard {
  name: string;
  nicheLabel: string;
  district: string;
  city: string;
  tagline: string;
  services: string[];
  /** Спецпредложение для старта. */
  offer: string;
  /** Ключ градиента фото-заглушки. */
  tone: string;
  emoji: string;
}

export interface AudienceSettings {
  radiusKm: number;
  interests: string[];
  spendMin: number;
  spendMax: number;
}

export interface SegmentReach {
  id: string;
  label: string;
  reached: number;
  matched: boolean;
}

export interface Metrics {
  reached: number;
  impressions: number;
  clicks: number;
  ctr: number;
  segments: SegmentReach[];
}

const REF_RADIUS_KM = 2;
const SHOW_RATE = 0.7; // доля охвата, получившая показ за период
const CTR_MIN = 0.03;
const CTR_MAX = 0.12;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Пересечение интересов сегмента и выбранного таргетинга. */
function overlap(segment: AudienceSegment, interests: string[]): number {
  if (interests.length === 0) return 0;
  const hits = segment.interests.filter((i) => interests.includes(i)).length;
  return hits / segment.interests.length;
}

/**
 * Считает охват и метрики по настройкам аудитории.
 * Сегмент попадает в охват, если его средние траты в диапазоне и (при заданных
 * интересах) есть пересечение по интересам. Радиус масштабирует размер сегмента.
 */
export function computeReach(settings: AudienceSettings): Metrics {
  const radiusFactor = clamp(settings.radiusKm / REF_RADIUS_KM, 0.2, 2.6);
  const noInterests = settings.interests.length === 0;

  let totalOverlapWeight = 0;
  let overlapWeighted = 0;

  const segments: SegmentReach[] = AUDIENCE_SEGMENTS.map((seg) => {
    const inSpend = seg.avgSpend >= settings.spendMin && seg.avgSpend <= settings.spendMax;
    const ov = overlap(seg, settings.interests);
    const matched = inSpend && (noInterests || ov > 0);

    // Без выбранных интересов охват шире, но «размытее» (коэффициент 0.5).
    const quality = noInterests ? 0.5 : ov;
    const reached = matched ? Math.round(seg.size * radiusFactor * (0.4 + 0.6 * quality)) : 0;

    if (reached > 0) {
      totalOverlapWeight += reached;
      overlapWeighted += reached * (noInterests ? 0.3 : Math.max(ov, seg.affinity * 0.6));
    }

    return { id: seg.id, label: seg.label, reached, matched };
  });

  const reached = segments.reduce((s, x) => s + x.reached, 0);
  const impressions = Math.round(reached * SHOW_RATE);

  // Точность таргетинга поднимает CTR: чем выше средневзвешенное пересечение — тем выше.
  const precision = totalOverlapWeight > 0 ? overlapWeighted / totalOverlapWeight : 0.3;
  const ctr = clamp(CTR_MIN + precision * 0.12, CTR_MIN, CTR_MAX);
  const clicks = Math.round(impressions * ctr);

  return {
    reached,
    impressions,
    clicks,
    ctr,
    segments: segments.sort((a, b) => b.reached - a.reached),
  };
}

/** Насколько карточка релевантна персоне (0..1) при текущих настройках. */
export function personaRelevance(persona: ClientPersona, settings: AudienceSettings): {
  score: number;
  sharedInterests: string[];
  inSpend: boolean;
} {
  const shared = persona.interests.filter((i) => settings.interests.includes(i));
  const inSpend = persona.monthlySpend >= settings.spendMin && persona.monthlySpend <= settings.spendMax;
  const interestScore = settings.interests.length === 0 ? 0.4 : shared.length / Math.max(1, persona.interests.length);
  const score = clamp((inSpend ? 0.5 : 0.15) + interestScore * 0.5, 0, 1);
  return { score, sharedInterests: shared, inSpend };
}
