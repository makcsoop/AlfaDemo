import type { Payment, TaxRegime } from '@/mock/pocketAdmin';

/**
 * Расчётная логика Блока 4: сводка по деньгам, оценка налога под режим,
 * платёжная ссылка и генератор псевдо-QR (офлайн, без внешних библиотек).
 */

/** Условная доля прибыли в выручке услуг — для виджета «прибыль (оценка)». */
export const SERVICE_MARGIN = 0.4;

export interface MoneySummary {
  revenue: number;
  profit: number;
  count: number;
  avgCheck: number;
}

/** Сводка по платежам за период (в днях). */
export function moneySummary(payments: Payment[], periodDays: number): MoneySummary {
  const inPeriod = payments.filter((p) => p.daysAgo <= periodDays);
  const revenue = inPeriod.reduce((s, p) => s + p.amount, 0);
  const count = inPeriod.length;
  return {
    revenue,
    profit: Math.round(revenue * SERVICE_MARGIN),
    count,
    avgCheck: count > 0 ? Math.round(revenue / count) : 0,
  };
}

export interface TaxEstimate {
  amount: number;
  base: number;
  baseLabel: string;
}

/** Оценка налога за период под выбранный режим. */
export function estimateTax(revenue: number, regime: TaxRegime): TaxEstimate {
  // УСН 15% считается с прибыли (доходы−расходы), остальные — с дохода.
  const base = regime.id === 'ooo_usn' ? Math.round(revenue * SERVICE_MARGIN) : revenue;
  const baseLabel = regime.id === 'ooo_usn' ? 'с прибыли' : 'с дохода';
  return { amount: Math.round(base * regime.rate), base, baseLabel };
}

// ── Платёжная ссылка и код ───────────────────────────────────────────

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Короткий код платежа (мок). */
export function paymentCode(seed = Date.now()): string {
  let x = seed >>> 0;
  let out = '';
  for (let i = 0; i < 8; i++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    out += CODE_ALPHABET[x % CODE_ALPHABET.length];
  }
  return out;
}

export const makePaymentLink = (code: string) => `https://pay.alfa.ru/i/${code}`;

// ── Псевдо-QR ────────────────────────────────────────────────────────

/**
 * Детерминированная QR-подобная матрица из строки: три «глаза»-локатора по углам
 * и псевдослучайные модули по хешу. Это визуальный мок (не сканируется), но
 * выглядит как настоящий QR — достаточно для демо приёма оплаты.
 */
export function qrMatrix(text: string, size = 25): boolean[][] {
  // FNV-1a хеш строки как сид.
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  const rnd = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };

  const grid: boolean[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => rnd() > 0.5));

  // Три локатора 7×7 (как в настоящем QR): TL, TR, BL.
  const stampFinder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const quiet = r === -1 || r === 7 || c === -1 || c === 7;
        grid[rr][cc] = quiet ? false : border || center;
      }
    }
  };
  stampFinder(0, 0);
  stampFinder(0, size - 7);
  stampFinder(size - 7, 0);

  return grid;
}
