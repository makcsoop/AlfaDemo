/** Форматтеры для рублей, процентов и дат — единый стиль по всему приложению. */

const rub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const rubCompact = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatRub(value: number): string {
  return rub.format(value);
}

export function formatRubCompact(value: number): string {
  return rubCompact.format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}
