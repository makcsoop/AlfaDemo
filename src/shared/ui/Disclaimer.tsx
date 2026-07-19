import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { FORECAST_DISCLAIMER } from '@/lib/constants';

export interface DisclaimerProps {
  /** По умолчанию — стандартный текст про аналитические сценарии. */
  children?: ReactNode;
  className?: string;
}

/**
 * Единый слот-дисклеймер для любых прогнозов и сценариев.
 * Ставится рядом с графиками/выводами по всему приложению.
 */
export function Disclaimer({ children, className }: DisclaimerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl bg-bg border border-line px-3.5 py-2.5',
        className,
      )}
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
      <p className="text-xs leading-relaxed text-muted">{children ?? FORECAST_DISCLAIMER}</p>
    </div>
  );
}
