import { MapPin, Star, Sparkles } from 'lucide-react';
import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

/** Полные классы градиента — чтобы Tailwind не срезал динамические строки. */
const TONE_GRADIENT: Record<string, string> = {
  rose: 'from-rose-100 to-orange-100',
  amber: 'from-amber-100 to-yellow-100',
  violet: 'from-violet-100 to-fuchsia-100',
  emerald: 'from-emerald-100 to-teal-100',
  sky: 'from-sky-100 to-cyan-100',
};

export function PhotoPlaceholder({
  tone,
  emoji,
  className,
}: {
  tone: string;
  emoji: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br',
        TONE_GRADIENT[tone] ?? TONE_GRADIENT.rose,
        className,
      )}
      aria-hidden
    >
      <span className="text-4xl drop-shadow-sm">{emoji}</span>
    </div>
  );
}

export interface StorefrontCardData {
  name: string;
  nicheLabel: string;
  tagline?: string;
  offer: string;
  tone: string;
  emoji: string;
  services?: string[];
  district?: string;
}

export interface StorefrontCardProps {
  card: StorefrontCardData;
  variant?: 'full' | 'feed';
  distanceM?: number;
  rating?: number;
  reviews?: number;
  highlighted?: boolean;
  reason?: string;
}

const formatDistance = (m: number) => (m < 1000 ? `${m} м` : `${(m / 1000).toFixed(1)} км`);

export function StorefrontCard({
  card,
  variant = 'full',
  distanceM,
  rating,
  reviews,
  highlighted,
  reason,
}: StorefrontCardProps) {
  if (variant === 'feed') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border bg-surface transition-shadow',
          highlighted ? 'border-alfa-red/40 shadow-card-hover ring-1 ring-alfa-red/20' : 'border-line shadow-card',
        )}
      >
        {highlighted && (
          <div className="flex items-center gap-1.5 bg-alfa-red px-3 py-1.5 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" />
            Подобрано для вас
          </div>
        )}
        <div className="flex gap-3 p-3">
          <PhotoPlaceholder tone={card.tone} emoji={card.emoji} className="h-20 w-20 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-alfa-ink">{card.name}</div>
                <div className="text-xs text-muted">{card.nicheLabel}</div>
              </div>
              {typeof distanceM === 'number' && (
                <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(distanceM)}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              {reviews ? (
                <span className="flex items-center gap-0.5 text-xs font-medium text-alfa-ink">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {rating?.toFixed(1)}
                  <span className="font-normal text-muted">· {reviews}</span>
                </span>
              ) : (
                <Badge tone="green" size="sm">
                  Новинка рядом
                </Badge>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-alfa-red-50 px-2 py-1 text-xs text-alfa-red">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span className="truncate">{card.offer}</span>
            </div>
            {highlighted && reason && <p className="mt-2 text-xs text-muted">{reason}</p>}
          </div>
        </div>
      </div>
    );
  }

  // variant === 'full'
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <PhotoPlaceholder tone={card.tone} emoji={card.emoji} className="h-40 w-full" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-alfa-ink">{card.name}</h3>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-muted">
              <span>{card.nicheLabel}</span>
              {card.district && (
                <>
                  <span className="text-line">·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {card.district}
                  </span>
                </>
              )}
            </div>
          </div>
          <Badge tone="green" dot>
            Опубликована
          </Badge>
        </div>

        {card.tagline && <p className="mt-3 text-sm text-alfa-graphite">{card.tagline}</p>}

        {card.services && card.services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.services.map((s) => (
              <span key={s} className="rounded-full bg-bg px-2.5 py-1 text-xs text-alfa-graphite">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-alfa-red-50 px-3 py-2.5 text-sm font-medium text-alfa-red">
          <Sparkles className="h-4 w-4 shrink-0" />
          {card.offer}
        </div>
      </div>
    </div>
  );
}
