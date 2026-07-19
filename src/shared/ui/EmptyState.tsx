import type { ComponentType, ReactNode } from 'react';
import { Inbox, type LucideProps } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps {
  icon?: ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-14 px-6',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-alfa-red-50 text-alfa-red">
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-alfa-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
