/** Общие константы приложения Альфа-старт. */

/** Дисклеймер для любого слота с прогнозами/сценариями. */
export const FORECAST_DISCLAIMER =
  'Аналитические сценарии, не рекомендация. Итоговые решения вы принимаете сами.';

/** Ключи localStorage. */
export const STORAGE_KEYS = {
  mode: 'alfa-start:mode',
  progress: 'alfa-start:progress',
  storefront: 'alfa-start:storefront',
  tenders: 'alfa-start:tenders',
  pocketAdmin: 'alfa-start:pocket-admin',
  activation: 'alfa-start:activation',
} as const;

/** Идентификаторы аналитических блоков (используются в контракте /api/analyze). */
export type BlockId =
  | 'idea'
  | 'storefront'
  | 'tenders'
  | 'admin'
  | 'analytics';
