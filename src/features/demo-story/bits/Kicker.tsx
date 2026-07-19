import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

/** Маленький красный заголовок-кикер сцены («ШАГ 1 · ОЦЕНКА ИДЕИ»). */
export function Kicker({
  children,
  delay = 0,
  tone = 'red',
  className,
}: {
  children: ReactNode;
  delay?: number;
  tone?: 'red' | 'white';
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'text-[clamp(10px,1.3cqw,16px)] font-semibold uppercase tracking-[0.14em]',
        tone === 'red' ? 'text-alfa-red' : 'text-white/70',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
