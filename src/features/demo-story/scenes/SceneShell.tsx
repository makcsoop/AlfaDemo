import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { STORY_DISCLAIMER } from '@/mock/goldenAnalysis';

type Tone = 'light' | 'dark' | 'red';

export interface SceneShellProps {
  tone?: Tone;
  children: ReactNode;
  /** Показать дисклеймер внизу кадра (обязателен на сценах с цифрами кредита). */
  disclaimer?: boolean;
  className?: string;
}

const tones: Record<Tone, string> = {
  light: 'bg-white text-alfa-ink',
  dark: 'bg-alfa-ink text-white',
  red: 'bg-alfa-red text-white',
};

/**
 * Кадр демо-сценария: absolute-заливка сцены 16:9, тон фона, кинематографичный
 * кроссфейд входа/выхода и слот дисклеймера. Все сцены оборачиваются в него.
 */
export function SceneShell({ tone = 'light', children, disclaimer, className }: SceneShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.988 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.012 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className={cn('absolute inset-0 flex flex-col overflow-hidden', tones[tone], className)}
    >
      {/* Мягкое фирменное свечение в углу кадра */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0',
          tone === 'light' &&
            'bg-[radial-gradient(60%_50%_at_100%_0%,rgba(239,49,36,0.05),transparent_70%)]',
          tone === 'dark' &&
            'bg-[radial-gradient(70%_60%_at_50%_110%,rgba(239,49,36,0.22),transparent_70%)]',
          tone === 'red' &&
            'bg-[radial-gradient(70%_60%_at_50%_-10%,rgba(255,255,255,0.16),transparent_70%)]',
        )}
      />
      <div className="relative flex-1 flex flex-col min-h-0">{children}</div>
      {disclaimer && (
        <div
          className={cn(
            'relative pb-[1.6cqw] px-[4cqw] text-center text-[clamp(9px,1.15cqw,14px)] leading-snug',
            tone === 'light' ? 'text-muted' : 'text-white/60',
          )}
        >
          {STORY_DISCLAIMER}
        </div>
      )}
    </motion.div>
  );
}
