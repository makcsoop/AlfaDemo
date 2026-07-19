import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SceneShell } from './SceneShell';
import { Kicker } from '../bits/Kicker';
import { Counter } from '../bits/Counter';
import { formatRub, formatNumber } from '@/lib/format';
import { cn } from '@/shared/lib/cn';
import type { SceneProps } from './types';
import type { MontageFrame } from '@/mock/goldenAnalysis';

const FRAME_MS = 4100;

/**
 * Сцена 5. Быстрый монтаж остального пути: регистрация → стартовый пакет →
 * витрина → запись+QR → тендер → аналитика прибыли. Каждый кадр — одна
 * эффектная цифра. Клик по точке фиксирует кадр (для рассказа со сцены).
 */
export function S5Montage({ story }: SceneProps) {
  const frames = story.montage;
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false);

  // Внутренний авто-монтаж: листает кадры, пока докладчик не вмешался.
  useEffect(() => {
    if (locked) return;
    const iv = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, FRAME_MS);
    return () => clearInterval(iv);
  }, [locked, frames.length]);

  const frame = frames[index];

  return (
    <SceneShell tone="light">
      <div className="flex-1 flex flex-col items-center px-[5cqw] pt-[2.6cqw] pb-[2cqw] min-h-0">
        <Kicker>Дальше — весь путь за 25 секунд</Kicker>

        <div className="relative mt-[1cqw] flex-1 w-full min-h-0">
          <AnimatePresence mode="wait">
            <MontageCard key={`${frame.id}-${index}`} frame={frame} step={index + 1} total={frames.length} />
          </AnimatePresence>
        </div>

        {/* Точки-навигация по кадрам */}
        <div className="mt-[1.2cqw] flex items-center gap-[1cqw]">
          {frames.map((f, i) => (
            <button
              key={f.id}
              type="button"
              aria-label={f.title}
              onClick={() => {
                setIndex(i);
                setLocked(true);
              }}
              className={cn(
                'h-[1.1cqw] min-h-[8px] rounded-full transition-all',
                i === index
                  ? 'w-[3.4cqw] min-w-[26px] bg-alfa-red'
                  : 'w-[1.1cqw] min-w-[8px] bg-line hover:bg-muted/50',
              )}
            />
          ))}
        </div>
      </div>
    </SceneShell>
  );
}

function MontageCard({ frame, step, total }: { frame: MontageFrame; step: number; total: number }) {
  const Icon = frame.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 56, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -56, scale: 0.97 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <div className="mb-[1.4cqw] flex h-[6.4cqw] w-[6.4cqw] min-h-[50px] min-w-[50px] items-center justify-center rounded-[1.8cqw] bg-alfa-red-50 text-alfa-red">
        <Icon className="h-[3.4cqw] w-[3.4cqw] min-h-[26px] min-w-[26px]" strokeWidth={1.8} />
      </div>

      <div className="text-[clamp(13px,2cqw,28px)] font-medium text-alfa-graphite">{frame.title}</div>

      <div className="mt-[0.3cqw] text-[clamp(40px,8.4cqw,130px)] font-bold tracking-tight leading-none text-alfa-ink">
        {frame.kind === 'rub' ? (
          <>
            <Counter value={frame.stat} format={formatRub} duration={1.1} delay={0.25} />
            {frame.suffix}
          </>
        ) : (
          <>
            <Counter value={frame.stat} format={formatNumber} duration={0.9} delay={0.25} />
            {frame.suffix}
          </>
        )}
      </div>

      <div className="mt-[0.8cqw] text-[clamp(12px,1.7cqw,22px)] text-muted">{frame.sub}</div>

      <div className="mt-[1.6cqw] text-[clamp(10px,1.2cqw,15px)] font-medium text-muted/70">
        {step} / {total}
      </div>
    </motion.div>
  );
}
