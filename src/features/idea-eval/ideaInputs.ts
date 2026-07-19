import type { AnalyzeRequest, IdeaInput } from '@/lib/schema';
import { DEMO_BUSINESS } from '@/mock/business';
import { DISTRICTS, NICHES, getNiche, suggestExpenses } from '@/mock/markets';

/** Опции формы Блока 1 — из справочника рынка markets.ts. */
export const NICHE_OPTIONS = NICHES.map((n) => ({ value: n.id, label: n.label }));

export const DISTRICT_OPTIONS = DISTRICTS.map((d) => ({
  value: d.id,
  label: d.label,
  competition: d.competition,
}));

/**
 * Предзаполнение формы из профиля бизнеса (онбординг) + типовые расходы района.
 * Персона по умолчанию — «Кофейня Анны», спальный район Казани.
 */
export const DEFAULT_IDEA_INPUT: IdeaInput = {
  idea: DEMO_BUSINESS.description,
  city: DEMO_BUSINESS.city,
  district: 'residential',
  niche: 'coffee',
  budget: 400_000,
  desiredCredit: 400_000,
  expenses: suggestExpenses('coffee', 'residential'),
};

/** Собирает запрос к ИИ-ядру из вводных формы. */
export function ideaToRequest(input: IdeaInput): AnalyzeRequest {
  return {
    block: 'idea',
    business: {
      name: DEMO_BUSINESS.name,
      city: input.city,
      category: getNiche(input.niche).label,
      description: input.idea,
    },
    input,
  };
}
