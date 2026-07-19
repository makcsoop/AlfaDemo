import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/** Плейсхолдер-загрузка с мягким shimmer-эффектом. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg bg-line/70', className)}
      aria-hidden
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

/** Готовый скелет карточки для экранов анализа. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-surface border border-line shadow-card p-5', className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="mt-3 h-4 w-2/3" />
      <Skeleton className="mt-6 h-40 w-full" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}
