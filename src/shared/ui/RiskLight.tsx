import { cn } from '@/shared/lib/cn';
import type { RiskLevel } from '@/lib/schema';

type Size = 'sm' | 'md' | 'lg';

export interface RiskLightProps {
  level: RiskLevel;
  size?: Size;
  showLabel?: boolean;
  /** Горизонтальный или вертикальный (как настоящий светофор) вид. */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const LABELS: Record<RiskLevel, string> = {
  low: 'Низкий риск',
  medium: 'Средний риск',
  high: 'Высокий риск',
};

const ORDER: RiskLevel[] = ['high', 'medium', 'low'];

const COLORS: Record<RiskLevel, string> = {
  low: 'bg-risk-low',
  medium: 'bg-risk-medium',
  high: 'bg-risk-high',
};

const lampSizes: Record<Size, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3.5 w-3.5',
  lg: 'h-5 w-5',
};

export function RiskLight({
  level,
  size = 'md',
  showLabel = true,
  orientation = 'horizontal',
  className,
}: RiskLightProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)} role="img" aria-label={LABELS[level]}>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-alfa-ink/90 p-1.5',
          orientation === 'vertical' && 'flex-col',
        )}
      >
        {ORDER.map((lvl) => {
          const on = lvl === level;
          return (
            <span
              key={lvl}
              className={cn(
                'rounded-full transition-all',
                lampSizes[size],
                on ? cn(COLORS[lvl], 'shadow-[0_0_8px_currentColor]') : 'bg-white/20',
              )}
            />
          );
        })}
      </div>
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium',
            level === 'low' && 'text-risk-low',
            level === 'medium' && 'text-amber-600',
            level === 'high' && 'text-alfa-red',
          )}
        >
          {LABELS[level]}
        </span>
      )}
    </div>
  );
}
