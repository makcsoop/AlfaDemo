import { useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatNumber, formatPercent } from '@/lib/format';
import type { SkuEconomics } from '@/lib/unitEconomics';
import type { Marketplace } from '@/mock/marketplace';

const MP_TONE: Record<Marketplace, string> = {
  Ozon: 'bg-blue-50 text-blue-600',
  Wildberries: 'bg-fuchsia-50 text-fuchsia-600',
  'Яндекс Маркет': 'bg-amber-50 text-amber-600',
};

export function SkuTable({ items }: { items: SkuEconomics[] }) {
  const [onlyLoss, setOnlyLoss] = useState(false);
  const rows = onlyLoss ? items.filter((i) => i.unprofitable) : items;
  const lossCount = items.filter((i) => i.unprofitable).length;

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-alfa-ink">Юнит-экономика по товарам</div>
          <div className="text-xs text-muted">Чистая прибыль на единицу с учётом всех затрат</div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-alfa-graphite">
          <input
            type="checkbox"
            checked={onlyLoss}
            onChange={(e) => setOnlyLoss(e.target.checked)}
            style={{ accentColor: '#EF3124' }}
          />
          Только убыточные
          {lossCount > 0 && <Badge tone="red" size="sm">{lossCount}</Badge>}
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-y border-line bg-bg text-xs text-muted">
              <Th className="sticky left-0 bg-bg text-left">Товар</Th>
              <Th>Цена</Th>
              <Th>Себест.</Th>
              <Th>Комиссия</Th>
              <Th>Логистика</Th>
              <Th>Возвраты</Th>
              <Th>Реклама</Th>
              <Th>Налог</Th>
              <Th>Чистая/ед</Th>
              <Th>Маржа</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr
                key={e.sku.id}
                className={cn(
                  'border-b border-line last:border-0',
                  e.unprofitable ? 'bg-alfa-red-50/40' : 'hover:bg-bg',
                )}
              >
                <td className="sticky left-0 z-10 max-w-[240px] bg-inherit px-5 py-3">
                  <div className="flex items-center gap-2">
                    {e.unprofitable && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-alfa-red" />}
                    <div className="min-w-0">
                      <div className="truncate font-medium text-alfa-ink">{e.sku.name}</div>
                      <span className={cn('mt-0.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium', MP_TONE[e.sku.marketplace])}>
                        {e.sku.marketplace}
                      </span>
                    </div>
                  </div>
                </td>
                <Td>{formatNumber(e.perUnit.revenue)}</Td>
                <Td>{formatNumber(e.perUnit.cogs)}</Td>
                <Td>{formatNumber(Math.round(e.perUnit.commission))}</Td>
                <Td>{formatNumber(e.perUnit.logistics)}</Td>
                <Td>{formatNumber(Math.round(e.perUnit.returns))}</Td>
                <Td>{formatNumber(e.perUnit.ads)}</Td>
                <Td>{formatNumber(Math.round(e.perUnit.tax))}</Td>
                <Td className={cn('font-semibold', e.netPerUnit < 0 ? 'text-alfa-red' : 'text-alfa-ink')}>
                  {e.netPerUnit > 0 ? '+' : ''}{formatNumber(e.netPerUnit)}
                </Td>
                <Td>
                  <span
                    className={cn(
                      'font-semibold',
                      e.marginPct < 0 ? 'text-alfa-red' : e.marginPct < 0.1 ? 'text-amber-600' : 'text-risk-low',
                    )}
                  >
                    {formatPercent(e.marginPct, 0)}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn('whitespace-nowrap px-3 py-2.5 text-right font-medium', className)}>{children}</th>;
}

function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('whitespace-nowrap px-3 py-3 text-right tabular-nums text-alfa-graphite', className)}>{children}</td>;
}
