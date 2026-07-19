import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { SceneShell } from './SceneShell';
import { Kicker } from '../bits/Kicker';
import { Counter } from '../bits/Counter';
import { formatRub } from '@/lib/format';
import type { SceneProps } from './types';

/**
 * Сцена 4. Разрешение страха: крупная плашка-инсайт.
 * «Безопасно взять 450 000 ₽, окупаемость — 7 месяцев даже при спросе −30%».
 */
export function S4Insight({ story }: SceneProps) {
  const { insight } = story;

  return (
    <SceneShell tone="light" disclaimer>
      <div className="flex-1 flex flex-col items-center justify-center px-[6cqw] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className="mb-[1.6cqw] flex h-[6cqw] w-[6cqw] min-h-[48px] min-w-[48px] items-center justify-center rounded-[1.6cqw] bg-emerald-50 text-risk-low"
        >
          <ShieldCheck className="h-[3.4cqw] w-[3.4cqw] min-h-[28px] min-w-[28px]" strokeWidth={1.8} />
        </motion.div>

        <Kicker delay={0.5}>Ответ на страх Анны</Kicker>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-[0.8cqw] text-[clamp(15px,2.4cqw,34px)] font-medium text-alfa-graphite"
        >
          {insight.headline}
        </motion.div>

        {/* Главная цифра */}
        <div className="mt-[0.4cqw] text-[clamp(46px,9.6cqw,150px)] font-bold tracking-tight leading-none text-alfa-ink">
          <Counter value={insight.amount} format={formatRub} duration={1.8} delay={1.1} />
        </div>

        {/* Три опоры уверенности */}
        <div className="mt-[2.6cqw] grid grid-cols-3 gap-[2.4cqw]">
          {insight.stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6 + i * 0.4, duration: 0.5 }}
              className="rounded-[1.2cqw] border border-line bg-white px-[2cqw] py-[1.4cqw] shadow-card"
            >
              <div className="text-[clamp(14px,2.3cqw,32px)] font-bold text-alfa-ink">{s.value}</div>
              <div className="mt-[0.3cqw] text-[clamp(10px,1.4cqw,17px)] text-muted">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.4, duration: 0.8 }}
          className="mt-[2.6cqw] text-[clamp(12px,1.8cqw,24px)] text-muted"
        >
          {insight.micro}
        </motion.p>
      </div>
    </SceneShell>
  );
}
