import { useEffect, useMemo } from 'react';
import { PageHeader } from '@/features/_shared/PageHeader';
import { Disclaimer } from '@/shared/ui';
import { useProgressStore } from '@/store/useProgressStore';
import { SKUS } from '@/mock/marketplace';
import { computeAll, forecastTurnover } from '@/lib/unitEconomics';
import { Dashboard } from './Dashboard';
import { SourcesLegend } from './SourcesLegend';
import { DynamicsChart } from './DynamicsChart';
import { SkuTable } from './SkuTable';
import { Recommendations } from './Recommendations';

export function MpAnalyticsPage() {
  const completeStep = useProgressStore((s) => s.complete);
  useEffect(() => {
    completeStep('/analytics');
  }, [completeStep]);

  const { items, totals } = useMemo(() => computeAll(SKUS), []);
  const forecast = useMemo(() => forecastTurnover(SKUS, 3), []);

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        eyebrow="Блок 5 · Единое окно"
        title="Аналитика маркетплейсов"
        description="Реальная чистая прибыль по каждому товару: продажи, комиссии и логистика МП, себестоимость, реклама и налоги — сведены в одно окно."
        badge="Юнит-экономика"
      />

      <Dashboard totals={totals} />
      <SourcesLegend />

      <div className="grid gap-5 lg:grid-cols-2">
        <DynamicsChart points={forecast} />
        <Recommendations items={items} />
      </div>

      <SkuTable items={items} />

      <Disclaimer>
        Прогноз оборота построен по тренду продаж за период и носит аналитический характер. Юнит-экономика
        учитывает мок-данные комиссий и затрат — на реальных данных цифры уточнятся.
      </Disclaimer>
    </div>
  );
}
