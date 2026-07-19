import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type Tone = 'neutral' | 'red' | 'green' | 'amber' | 'outline';
type Size = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  dot?: boolean;
}

const tones: Record<Tone, string> = {
  neutral: 'bg-bg text-alfa-graphite',
  red: 'bg-alfa-red-50 text-alfa-red',
  green: 'bg-emerald-50 text-risk-low',
  amber: 'bg-amber-50 text-amber-600',
  outline: 'bg-transparent text-alfa-graphite border border-line',
};

const dotColors: Record<Tone, string> = {
  neutral: 'bg-muted',
  red: 'bg-alfa-red',
  green: 'bg-risk-low',
  amber: 'bg-risk-medium',
  outline: 'bg-muted',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
};

export function Badge({ tone = 'neutral', size = 'sm', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        tones[tone],
        sizes[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[tone])} aria-hidden />}
      {children}
    </span>
  );
}
