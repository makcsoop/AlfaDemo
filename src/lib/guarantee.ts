import { DEFAULT_SECURITY_PERCENT, GUARANTEE_TARIFFS, type GuaranteeTariff } from '@/mock/guarantee';

/**
 * Экспресс-калькулятор банковской гарантии.
 *
 * Сумма контракта → сумма обеспечения (гарантии) и её стоимость по обычному и
 * льготному «старт»-тарифу. Льгота доступна новичкам до 25 без кредитной истории
 * и в пределах лимита льготного тарифа. Возвращает обе цены для сравнения и
 * экономию по льготе. Детерминированно, без сети.
 */

export interface GuaranteeCalc {
  /** Сумма гарантии (обеспечение заявки), ₽. */
  amount: number;
  /** Стоимость по применённому тарифу, ₽. */
  price: number;
  /** Применённый тариф. */
  tariff: GuaranteeTariff;
  /** Проходит ли по льготному тарифу. */
  eligible: boolean;
  priceStandard: number;
  pricePreferential: number;
  /** Экономия по льготе относительно обычного тарифа, ₽. */
  savings: number;
  termDays: number;
  securityPercent: number;
}

function tariffPrice(amount: number, tariff: GuaranteeTariff, termDays: number): number {
  const byRate = amount * tariff.annualRate * (termDays / 365);
  return Math.max(tariff.minCommission, Math.round(byRate));
}

/**
 * @param contractSum       НМЦК контракта, ₽
 * @param isYoungNoHistory  новичок до 25 без кредитной истории (гейт льготы)
 * @param securityPercent   доля обеспечения заявки (по умолчанию 5%)
 * @param termDays          срок действия гарантии, дней (по умолчанию 90)
 */
export function calcGuarantee(
  contractSum: number,
  isYoungNoHistory: boolean,
  securityPercent: number = DEFAULT_SECURITY_PERCENT,
  termDays = 90,
): GuaranteeCalc {
  const amount = Math.round(contractSum * securityPercent);

  const { standard, preferential } = GUARANTEE_TARIFFS;
  const priceStandard = tariffPrice(amount, standard, termDays);
  const pricePreferential = tariffPrice(amount, preferential, termDays);

  // Льгота действует, если предприниматель — новичок и сумма в пределах лимита.
  const eligible = isYoungNoHistory && amount <= preferential.maxAmount;
  const tariff = eligible ? preferential : standard;
  const price = eligible ? pricePreferential : priceStandard;
  const savings = eligible ? Math.max(0, priceStandard - pricePreferential) : 0;

  return { amount, price, tariff, eligible, priceStandard, pricePreferential, savings, termDays, securityPercent };
}
