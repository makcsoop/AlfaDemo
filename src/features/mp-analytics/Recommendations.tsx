import { Trash2, ArrowUpCircle, Rocket, RotateCcw, Lightbulb } from 'lucide-react';
import { Card, Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { recommendSku, type RecoAction, type SkuEconomics } from '@/lib/unitEconomics';

const ACTION_META: Record<RecoAction, { icon: typeof Rocket; tone: 'red' | 'amber' | 'green' | 'neutral'; order: number }> = {
  remove: { icon: Trash2, tone: 'red', order: 0 },
  fix_returns: { icon: RotateCcw, tone: 'red', order: 1 },
  raise_price: { icon: ArrowUpCircle, tone: 'amber', order: 2 },
  scale: { icon: Rocket, tone: 'green', order: 3 },
  keep: { icon: Lightbulb, tone: 'neutral', order: 4 },
};

const BADGE_TONE = { red: 'red', amber: 'amber', green: 'green', neutral: 'neutral' } as const;

export function Recommendations({ items }: { items: SkuEconomics[] }) {
  const recos = items
    .map((e) => ({ e, reco: recommendSku(e) }))
    .filter(({ reco }) => reco.action !== 'keep')
    .sort((a, b) => ACTION_META[a.reco.action].order - ACTION_META[b.reco.action].order);

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-alfa-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-alfa-red-50 text-alfa-red">
          <Lightbulb className="h-4 w-4" />
        </span>
        Рекомендации по ассортименту
        <Badge tone="neutral" size="sm">{recos.length}</Badge>
      </div>

      <div className="space-y-2.5">
        {recos.map(({ e, reco }) => {
          const meta = ACTION_META[reco.action];
          return (
            <div key={e.sku.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  meta.tone === 'red' && 'bg-alfa-red-50 text-alfa-red',
                  meta.tone === 'amber' && 'bg-amber-50 text-amber-600',
                  meta.tone === 'green' && 'bg-emerald-50 text-risk-low',
                  meta.tone === 'neutral' && 'bg-bg text-muted',
                )}
              >
                <meta.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-alfa-ink">{e.sku.name}</span>
                  <Badge tone={BADGE_TONE[reco.tone]} size="sm">{reco.label}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted">{reco.reason}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
