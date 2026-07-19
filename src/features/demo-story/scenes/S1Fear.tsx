import { motion } from 'framer-motion';
import { SceneShell } from './SceneShell';
import { Kicker } from '../bits/Kicker';
import type { SceneProps } from './types';

/** Сцена 1. Завязка: страх Анны перед кредитом. Тёмный кадр, эмоциональный тизер. */
export function S1Fear({ story }: SceneProps) {
  const { fear } = story;

  return (
    <SceneShell tone="dark">
      {/* Логотип-кикер в углу */}
      <div className="absolute left-[3cqw] top-[2.6cqw] flex items-center gap-[0.9cqw]">
        <div className="flex h-[2.8cqw] w-[2.8cqw] min-h-[22px] min-w-[22px] items-center justify-center rounded-[0.7cqw] bg-alfa-red text-white font-bold text-[clamp(11px,1.5cqw,20px)]">
          А
        </div>
        <span className="text-[clamp(11px,1.4cqw,18px)] font-semibold text-white/85">
          Альфа-старт
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-[8cqw] text-center">
        {/* Аватар */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-[2.2cqw] flex h-[7cqw] w-[7cqw] min-h-[52px] min-w-[52px] items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20 text-[clamp(16px,2.4cqw,34px)] font-semibold text-white"
        >
          АС
        </motion.div>

        <Kicker tone="white" delay={0.3}>
          {fear.name} · Казань
        </Kicker>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-[1.4cqw] text-[clamp(26px,5.2cqw,76px)] font-bold tracking-tight leading-[1.08]"
        >
          {fear.line1}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.15 }}
          className="mt-[0.6cqw] text-[clamp(26px,5.2cqw,76px)] font-bold tracking-tight leading-[1.08] text-alfa-red"
        >
          {fear.line2}
        </motion.p>

        {/* Страхи — облако мыслей */}
        <div className="mt-[3.2cqw] flex flex-wrap items-center justify-center gap-[1.2cqw]">
          {fear.fears.map((f, i) => (
            <motion.span
              key={f}
              initial={{ opacity: 0, y: 14, scale: 0.92 }}
              animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
              transition={{
                opacity: { delay: 2 + i * 0.45, duration: 0.5 },
                scale: { delay: 2 + i * 0.45, duration: 0.5 },
                y: {
                  delay: 2.6 + i * 0.45,
                  duration: 3.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className="rounded-full border border-white/15 bg-white/[0.07] px-[1.8cqw] py-[0.9cqw] text-[clamp(11px,1.7cqw,22px)] text-white/85"
            >
              {f}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.6, duration: 0.8 }}
          className="mt-[3.4cqw] text-[clamp(12px,1.8cqw,24px)] text-white/55"
        >
          {fear.outro}
        </motion.p>
      </div>
    </SceneShell>
  );
}
