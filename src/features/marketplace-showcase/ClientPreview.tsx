import { useState, type ReactNode } from 'react';
import { Search, MapPin, Check, Wallet, Radar, SearchX } from 'lucide-react';
import { Card } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { formatRub } from '@/lib/format';
import {
  CLIENT_PERSONAS,
  FEED_CATEGORIES,
  NEARBY_BUSINESSES,
  interestLabel,
  type ClientPersona,
  type FeedCategory,
} from '@/mock/audience';
import { useStorefrontStore } from '@/store/useStorefrontStore';
import { personaRelevance } from './storefront';
import { StorefrontCard } from './StorefrontCard';

/** Превью витрины «глазами клиента»: лента «Рядом с вами» в стиле Альфа Онлайн. */
export function ClientPreview() {
  const card = useStorefrontStore((s) => s.card);
  const settings = useStorefrontStore((s) => s.settings);
  const [personaId, setPersonaId] = useState(CLIENT_PERSONAS[0].id);
  const persona = CLIENT_PERSONAS.find((p) => p.id === personaId) ?? CLIENT_PERSONAS[0];

  // Живые фильтры ленты: категория (чипы) + строка поиска.
  const [category, setCategory] = useState<FeedCategory>('coffee');
  const [query, setQuery] = useState('');

  const rel = personaRelevance(persona, settings);
  const relevant = rel.score >= 0.5;

  const q = query.trim().toLowerCase();
  const matchesQuery = (...fields: string[]) =>
    q === '' || fields.some((f) => f.toLowerCase().includes(q));

  // Карточка Анны — категория «Кофе»; поиск ищет по названию/нише/офферу.
  const annaVisible =
    (q !== '' || category === 'coffee') && matchesQuery(card.name, card.nicheLabel, card.offer);
  const nearby = NEARBY_BUSINESSES.filter(
    (b) => (q !== '' ? true : b.category === category) && matchesQuery(b.name, b.nicheLabel, b.offer),
  );
  const feedEmpty = !annaVisible && nearby.length === 0;

  const annaCard = (
    <StorefrontCard
      card={card}
      variant="feed"
      distanceM={150}
      highlighted={relevant}
      reason={relevant ? persona.reason : undefined}
    />
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* Выбор персоны + объяснение попадания */}
      <div className="space-y-4">
        <Card>
          <div className="mb-3 text-sm font-semibold text-alfa-ink">Кому показываем</div>
          <div className="space-y-2">
            {CLIENT_PERSONAS.map((p) => (
              <PersonaRow key={p.id} persona={p} active={p.id === personaId} onSelect={() => setPersonaId(p.id)} />
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold text-alfa-ink">Почему карточка попадает</div>
          <div className="space-y-2.5">
            <MatchRow
              ok={rel.sharedInterests.length > 0}
              icon={<Radar className="h-4 w-4" />}
              label="Совпадение интересов"
              detail={
                rel.sharedInterests.length > 0
                  ? rel.sharedInterests.map(interestLabel).join(', ')
                  : 'нет пересечений — добавьте интересы'
              }
            />
            <MatchRow
              ok={rel.inSpend}
              icon={<Wallet className="h-4 w-4" />}
              label="Траты в диапазоне"
              detail={`${formatRub(persona.monthlySpend)}/мес ${rel.inSpend ? 'входит' : 'вне диапазона'}`}
            />
            <MatchRow
              ok
              icon={<MapPin className="h-4 w-4" />}
              label="В радиусе показа"
              detail={`${settings.radiusKm.toFixed(1)} км от точки`}
            />
          </div>
          <div
            className={cn(
              'mt-4 rounded-xl px-3 py-2.5 text-sm font-medium',
              relevant ? 'bg-emerald-50 text-risk-low' : 'bg-bg text-muted',
            )}
          >
            {relevant
              ? `Карточка «${card.name}» попадает в ленту ${persona.name}а как релевантная.`
              : `Для ${persona.name}а карточка пока не релевантна — настройте аудиторию слева.`}
          </div>
        </Card>
      </div>

      {/* Лента «Рядом с вами» */}
      <Card padded={false} className="overflow-hidden">
        <div className="border-b border-line bg-bg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-alfa-ink">Альфа Онлайн · Рядом с вами</div>
            <span className="flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5" />
              {persona.name}, {persona.age}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm focus-within:border-alfa-red/50 focus-within:shadow-focus transition-shadow">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск мест рядом"
              className="w-full bg-transparent text-alfa-ink placeholder:text-muted focus:outline-none"
              aria-label="Поиск мест рядом"
            />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {FEED_CATEGORIES.map((c) => {
              const active = q === '' && c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    setQuery('');
                  }}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs transition-colors',
                    active
                      ? 'bg-alfa-red text-white'
                      : 'bg-surface text-alfa-graphite border border-line hover:border-alfa-red/40 hover:text-alfa-ink',
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 p-4">
          {annaVisible && relevant && annaCard}
          {nearby.slice(0, 2).map((b) => (
            <StorefrontCard
              key={b.id}
              variant="feed"
              distanceM={b.distanceM}
              rating={b.rating}
              reviews={b.reviews}
              card={{ name: b.name, nicheLabel: b.nicheLabel, offer: b.offer, tone: b.tone, emoji: b.emoji }}
            />
          ))}
          {annaVisible && !relevant && annaCard}
          {nearby.slice(2).map((b) => (
            <StorefrontCard
              key={b.id}
              variant="feed"
              distanceM={b.distanceM}
              rating={b.rating}
              reviews={b.reviews}
              card={{ name: b.name, nicheLabel: b.nicheLabel, offer: b.offer, tone: b.tone, emoji: b.emoji }}
            />
          ))}
          {feedEmpty && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <SearchX className="h-8 w-8 text-muted" strokeWidth={1.6} />
              <div className="text-sm font-medium text-alfa-ink">Рядом ничего не нашлось</div>
              <div className="text-xs text-muted">Попробуйте другой запрос или категорию.</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function PersonaRow({
  persona,
  active,
  onSelect,
}: {
  persona: ClientPersona;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors',
        active ? 'border-alfa-red/40 bg-alfa-red-50/50' : 'border-line hover:bg-bg',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
          active ? 'bg-alfa-red text-white' : 'bg-bg text-alfa-graphite',
        )}
      >
        {persona.initials}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-alfa-ink">
          {persona.name}, {persona.age}
        </div>
        <div className="truncate text-xs text-muted">{persona.tagline}</div>
      </div>
    </button>
  );
}

function MatchRow({
  ok,
  icon,
  label,
  detail,
}: {
  ok: boolean;
  icon: ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
          ok ? 'bg-emerald-50 text-risk-low' : 'bg-bg text-muted',
        )}
      >
        {ok ? <Check className="h-3.5 w-3.5" /> : icon}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-alfa-ink">{label}</div>
        <div className="text-xs text-muted">{detail}</div>
      </div>
    </div>
  );
}
