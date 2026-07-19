import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Приподнимать карточку при наведении (для кликабельных). */
  interactive?: boolean;
  padded?: boolean;
}

export function Card({ interactive, padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface border border-line shadow-card',
        interactive && 'transition-shadow hover:shadow-card-hover cursor-pointer',
        padded && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-alfa-ink truncate">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mt-4 pt-4 border-t border-line', className)}>{children}</div>;
}
