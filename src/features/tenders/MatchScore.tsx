import { cn } from '@/shared/lib/cn';
import type { MatchVerdict } from '@/lib/matchTenders';

export const VERDICT: Record<MatchVerdict, { label: string; color: string; tone: string }> = {
  strong: { label: 'Хорошо подходит', color: '#12A150', tone: 'text-risk-low' },
  partial: { label: 'Подходит частично', color: '#F5A524', tone: 'text-amber-600' },
  weak: { label: 'Слабое соответствие', color: '#EF3124', tone: 'text-alfa-red' },
};

/** Кольцо матч-скора 0..100 с цветом по вердикту. */
export function MatchScore({ score, verdict, size = 56 }: { score: number; verdict: MatchVerdict; size?: number }) {
  const color = VERDICT[verdict].color;
  const stroke = 5;
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDEEF1" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-alfa-ink">{score}</span>
      </div>
    </div>
  );
}

export function VerdictBadge({ verdict }: { verdict: MatchVerdict }) {
  const v = VERDICT[verdict];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', v.tone)}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: v.color }} />
      {v.label}
    </span>
  );
}
