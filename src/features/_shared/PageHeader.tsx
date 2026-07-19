import type { ReactNode } from 'react';
import { Badge } from '@/shared/ui';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-alfa-red">
            {eyebrow}
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-alfa-ink">{title}</h1>
          {badge && <Badge tone="neutral">{badge}</Badge>}
        </div>
        {description && <p className="mt-2 max-w-2xl text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
