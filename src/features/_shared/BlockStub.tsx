import type { ComponentType } from 'react';
import { CheckCircle2, Circle, type LucideProps } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Card, CardHeader, Badge, Disclaimer, Button } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

export interface BlockStubProps {
  eyebrow?: string;
  title: string;
  badge?: string;
  description: string;
  icon: ComponentType<LucideProps>;
  /** Что появится на экране в следующих промптах. */
  planned: string[];
  /** Показать слот дисклеймера (для блоков с прогнозами). */
  hasForecast?: boolean;
}

/**
 * Универсальная заглушка блока для шага 1 (каркас).
 * Демонстрирует дизайн-систему и оставляет явные точки для наполнения.
 */
export function BlockStub({
  eyebrow,
  title,
  badge,
  description,
  icon: Icon,
  planned,
  hasForecast,
}: BlockStubProps) {
  const mode = useAppStore((s) => s.mode);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        badge={badge}
        description={description}
        actions={
          <Badge tone={mode === 'demo' ? 'red' : 'green'} dot>
            {mode === 'demo' ? 'ДЕМО-режим' : 'LIVE-режим'}
          </Badge>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Что здесь будет"
            description="Экран собирается в следующих промптах по этому блоку"
            action={
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alfa-red-50 text-alfa-red">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </div>
            }
          />
          <ul className="space-y-2.5">
            {planned.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] text-alfa-graphite">
                {i === 0 ? (
                  <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-alfa-red" />
                ) : (
                  <Circle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-line" />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Источник данных" />
            <p className="text-sm text-muted">
              {mode === 'demo'
                ? '«Золотые» данные из src/mock — офлайн и воспроизводимо.'
                : 'Реальный анализ через POST /api/analyze (DeepSeek) с фоллбэком.'}
            </p>
            <Button variant="secondary" size="sm" className="mt-4" disabled>
              Запустить анализ
            </Button>
          </Card>

          {hasForecast && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Слот дисклеймера
              </div>
              <Disclaimer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
