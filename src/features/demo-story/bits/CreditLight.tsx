import { motion } from 'framer-motion';

/**
 * Большой «светофор кредита» для кульминации: красный и жёлтый коротко
 * вспыхивают (перебор небезопасных сумм), зелёный загорается и остаётся —
 * безопасная сумма найдена.
 */
export function CreditLight({ delay = 0 }: { delay?: number }) {
  const lamp = 'h-[3.2cqw] w-[3.2cqw] min-h-[18px] min-w-[18px] rounded-full';

  return (
    <div className="inline-flex items-center gap-[1cqw] rounded-full bg-alfa-ink/90 px-[1.4cqw] py-[1cqw]">
      {/* Красный: вспыхнул — погас */}
      <motion.span
        className={`${lamp} bg-risk-high`}
        initial={{ opacity: 0.18 }}
        animate={{ opacity: [0.18, 1, 1, 0.18] }}
        transition={{ delay, duration: 0.9, times: [0, 0.25, 0.7, 1] }}
      />
      {/* Жёлтый: вспыхнул — погас */}
      <motion.span
        className={`${lamp} bg-risk-medium`}
        initial={{ opacity: 0.18 }}
        animate={{ opacity: [0.18, 1, 1, 0.18] }}
        transition={{ delay: delay + 0.7, duration: 0.9, times: [0, 0.25, 0.7, 1] }}
      />
      {/* Зелёный: загорается и остаётся, с мягким свечением */}
      <motion.span
        className={`${lamp} bg-risk-low`}
        initial={{ opacity: 0.18, scale: 1 }}
        animate={{
          opacity: 1,
          scale: [1, 1.25, 1],
          boxShadow: [
            '0 0 0px rgba(18,161,80,0)',
            '0 0 24px rgba(18,161,80,0.9)',
            '0 0 14px rgba(18,161,80,0.65)',
          ],
        }}
        transition={{ delay: delay + 1.5, duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}
