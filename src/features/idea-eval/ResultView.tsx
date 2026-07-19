import { ArrowRight, Check, Pencil, ShieldAlert } from 'lucide-react';
import { Badge, Button, Card, Disclaimer, RiskLight } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { AnalyzeResult, Source, Verdict } from '@/lib/schema';
import { ScenarioBoard } from './ScenarioBoard';
import { MarketBlock } from './MarketBlock';
import { CreditBlock } from './CreditBlock';

const VERDICT: Record<Verdict, { label: string; tone: 'green' | 'amber' | 'red' }> = {
  go: { label: 'Идея жизнеспособна', tone: 'green' },
  caution: { label: 'Жизнеспособна с оговорками', tone: 'amber' },
  stop: { label: 'Высокий риск запуска', tone: 'red' },
};

const SOURCE_LABEL: Record<Source, string> = {
  demo: 'Демо-данные',
  live: 'DeepSeek',
  fallback: 'Модель Альфа-старт',
};

export interface ResultViewProps {
  result: AnalyzeResult;
  onEdit: () => void;
  onRegister: () => void;
}

export function ResultView({ result, onEdit, onRegister }: ResultViewProps) {
  const verdict = VERDICT[result.verdict];
  const viable = result.verdict !== 'stop';

  return (
    <div className="animate-fade-up space-y-5">
      {/* Вердикт + оценка */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <Badge tone={verdict.tone} size="md" dot>
                {verdict.label}
              </Badge>
              <Badge tone="outline">{SOURCE_LABEL[result.meta.source]}</Badge>
            </div>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-alfa-graphite">{result.summary}</p>
          </div>
          <ScoreRing score={result.score} tone={verdict.tone} />
        </div>
      </Card>

      {/* Три сценария */}
      <ScenarioBoard scenarios={result.scenarios} />

      {/* Рынок и кредит */}
      <div className="grid gap-5 lg:grid-cols-2">
        {result.market && <MarketBlock market={result.market} />}
        {result.credit && <CreditBlock credit={result.credit} />}
      </div>

      {/* Сильные стороны и риски */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm font-semibold text-alfa-ink">Сильные стороны</div>
          <ul className="space-y-2.5">
            {result.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-alfa-graphite">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-risk-low" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-3 text-sm font-semibold text-alfa-ink">Риски</div>
          <ul className="space-y-3">
            {result.risks.map((r) => (
              <li key={r.title} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-alfa-ink">{r.title}</div>
                  <div className="text-sm text-muted">{r.note}</div>
                </div>
                <RiskLight level={r.level} size="sm" showLabel={false} className="mt-0.5 shrink-0" />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Крупный дисклеймер (без дублирования result.disclaimer — тот же смысл) */}
      <Disclaimer className="px-4 py-3.5">
        <span className="text-sm font-medium text-alfa-graphite">Это аналитические сценарии, а не рекомендация.</span>{' '}
        Итоговое решение о кредите и запуске вы принимаете сами.
      </Disclaimer>

      {/* CTA */}
      <Card className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between')}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              viable ? 'bg-emerald-50 text-risk-low' : 'bg-alfa-red-50 text-alfa-red',
            )}
          >
            {viable ? <Check className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
          </span>
          <div>
            <div className="text-[15px] font-semibold text-alfa-ink">
              {viable ? 'Идея жизнеспособна — можно запускать бизнес' : 'Стоит скорректировать вводные'}
            </div>
            <div className="text-sm text-muted">
              {viable
                ? 'Следующий шаг — регистрация бизнеса и стартовый пакет.'
                : 'Уменьшите кредит или пересмотрите расходы и повторите расчёт.'}
            </div>
          </div>
        </div>
        {/* На телефоне кнопки в столбик на всю ширину — в строку не помещаются. */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row">
          <Button variant="secondary" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Скорректировать вводные
          </Button>
          <Button onClick={onRegister} disabled={!viable}>
            Зарегистрировать бизнес
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

/** Кольцевой индикатор оценки 0..100. */
function ScoreRing({ score, tone }: { score: number; tone: 'green' | 'amber' | 'red' }) {
  const color = tone === 'green' ? '#12A150' : tone === 'amber' ? '#F5A524' : '#EF3124';
  // Тонкое кольцо у края: внутри остаётся достаточно места, чтобы
  // «NN / из 100» не прижимался к обводке.
  const r = 29;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#EDEEF1" strokeWidth="4.5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-2xl font-bold text-alfa-ink">{score}</span>
        <span className="mt-1 text-[11px] text-muted">из 100</span>
      </div>
    </div>
  );
}
