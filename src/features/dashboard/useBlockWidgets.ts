import type { ComponentType } from 'react';
import { Lightbulb, Store, Gavel, Smartphone, BarChart3, Radar, type LucideProps } from 'lucide-react';
import { formatRub, formatRubCompact, formatNumber } from '@/lib/format';
import { featureForRoute } from '@/lib/registration';
import { getGoldenResult } from '@/mock/golden';
import { matchTenders } from '@/lib/matchTenders';
import { TENDER_PROFILE } from '@/mock/tenders';
import { computeAll } from '@/lib/unitEconomics';
import { SKUS } from '@/mock/marketplace';
import { detectAnomalies } from '@/lib/financialRadar';
import { RADAR_PERSONA, SHIFTS, OVERDRAFT_PARAMS } from '@/mock/financialRadar';
import { computeReach } from '@/features/marketplace-showcase/storefront';
import { moneySummary } from '@/lib/pocketAdmin';
import { useProgressStore } from '@/store/useProgressStore';
import { useActivationStore } from '@/store/useActivationStore';
import { useStorefrontStore } from '@/store/useStorefrontStore';
import { usePocketAdminStore } from '@/store/usePocketAdminStore';

/**
 * Виджеты-плитки блоков для дашборда. Ключевая цифра каждого блока считается
 * теми же функциями/сторами, что и сам блок, — поэтому числа на дашборде
 * гарантированно совпадают с числами внутри блоков (DoD «цифры согласованы»).
 */
export interface BlockWidget {
  id: string;
  label: string;
  to: string;
  icon: ComponentType<LucideProps>;
  /** Крупная ключевая цифра. */
  metric: string;
  /** Подпись под цифрой. */
  metricLabel: string;
  /** Второстепенная деталь (мелким). */
  hint?: string;
  gated: boolean;
  unlocked: boolean;
  done: boolean;
}

function useRouteState(route: string) {
  const features = useActivationStore((s) => s.features);
  const done = useProgressStore((s) => s.steps[route] === 'done');
  const feature = featureForRoute(route);
  const gated = Boolean(feature);
  const unlocked = feature ? Boolean(features[feature.id]) : true;
  return { gated, unlocked, done };
}

export function useBlockWidgets(): BlockWidget[] {
  // Живые данные из сторов — виджеты реагируют на изменения блоков.
  const storefrontSettings = useStorefrontStore((s) => s.settings);
  const payments = usePocketAdminStore((s) => s.payments);

  const idea = getGoldenResult('idea');
  const ideaBase = idea.scenarios.find((s) => s.id === 'base') ?? idea.scenarios[0];
  const payback = ideaBase.metrics?.paybackMonth ?? null;

  const reach = computeReach(storefrontSettings);

  const scoredTenders = matchTenders(TENDER_PROFILE);
  const fitTenders = scoredTenders.filter((t) => t.verdict !== 'weak').length;

  const money = moneySummary(payments, 30);

  const mp = computeAll(SKUS);

  const anomalies = detectAnomalies(SHIFTS, RADAR_PERSONA.normCostRatio, OVERDRAFT_PARAMS.anomalyThreshold);

  const ideaState = useRouteState('/idea');
  const storefrontState = useRouteState('/storefront');
  const tendersState = useRouteState('/tenders');
  const adminState = useRouteState('/admin');
  const analyticsState = useRouteState('/analytics');
  const radarState = useRouteState('/radar');

  return [
    {
      id: 'idea',
      label: 'Оценка идеи',
      to: '/idea',
      icon: Lightbulb,
      metric: payback ? `${payback} мес` : '> 12 мес',
      metricLabel: 'Окупаемость, базовый сценарий',
      hint: idea.credit ? `Безопасный кредит ${formatRubCompact(idea.credit.safeAmount)}` : undefined,
      ...ideaState,
    },
    {
      id: 'storefront',
      label: 'Локальная витрина',
      to: '/storefront',
      icon: Store,
      metric: formatNumber(reach.impressions),
      metricLabel: 'Показы витрины за период',
      hint: `${formatNumber(reach.clicks)} переходов · CTR ${(reach.ctr * 100).toFixed(1)}%`,
      ...storefrontState,
    },
    {
      id: 'tenders',
      label: 'Тендеры',
      to: '/tenders',
      icon: Gavel,
      metric: String(fitTenders),
      metricLabel: 'Подходящих тендеров',
      hint: `Из ${scoredTenders.length} найденных закупок`,
      ...tendersState,
    },
    {
      id: 'admin',
      label: 'Администратор в кармане',
      to: '/admin',
      icon: Smartphone,
      metric: formatRub(money.revenue),
      metricLabel: 'Выручка за 30 дней',
      hint: `${money.count} оплат · чек ${formatRub(money.avgCheck)}`,
      ...adminState,
    },
    {
      id: 'analytics',
      label: 'Аналитика МП',
      to: '/analytics',
      icon: BarChart3,
      metric: formatRub(mp.totals.netProfit),
      metricLabel: 'Чистая прибыль за месяц',
      hint: `${mp.items.length} SKU · маржа ${Math.round(mp.totals.marginPct * 100)}%`,
      ...analyticsState,
    },
    {
      id: 'radar',
      label: 'Финансовый радар',
      to: '/radar',
      icon: Radar,
      metric: anomalies.length > 0 ? `${anomalies.length} сигнал` : 'Норма',
      metricLabel: anomalies.length > 0 ? 'Аномалия «расход↔выручка»' : 'Аномалий не найдено',
      hint: `Персона: ${RADAR_PERSONA.name}`,
      ...radarState,
    },
  ];
}
