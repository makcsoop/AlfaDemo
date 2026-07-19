import { Boxes, Landmark, Receipt, ArrowRight, LayoutGrid } from 'lucide-react';
import { Card } from '@/shared/ui';
import { DATA_SOURCES } from '@/mock/marketplace';

const ICONS = [Boxes, Landmark, Receipt];

/** Визуальная легенда: как три источника сводятся в единое окно аналитики. */
export function SourcesLegend() {
  return (
    <Card>
      <div className="mb-4 text-sm font-semibold text-alfa-ink">Как собираются данные</div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {DATA_SOURCES.map((s, i) => {
            const Icon = ICONS[i] ?? Boxes;
            return (
              <div key={s.id} className="rounded-xl border border-line bg-surface p-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="mt-2.5 text-sm font-medium text-alfa-ink">{s.label}</div>
                <p className="mt-0.5 text-xs text-muted">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center lg:flex-col">
          <ArrowRight className="h-5 w-5 text-muted lg:hidden" />
          <ArrowRight className="hidden h-5 w-5 rotate-0 text-muted lg:block" />
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-alfa-red/30 bg-alfa-red-50/40 p-4 text-center lg:w-48">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-alfa-red text-white">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div className="mt-2 text-sm font-semibold text-alfa-ink">Единое окно</div>
          <p className="text-xs text-muted">Чистая прибыль по каждому товару без ручных сверок</p>
        </div>
      </div>
    </Card>
  );
}
