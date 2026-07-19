import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { SceneShell } from './SceneShell';
import { useDirector } from '../director';
import type { SceneProps } from './types';

/** Сцена 6. Финал: фирменный красный кадр, слоган и CTA. */
export function S6Finale({ story }: SceneProps) {
  const navigate = useNavigate();
  const restart = useDirector((s) => s.restart);
  const { finale } = story;

  return (
    <SceneShell tone="red">
      <div className="flex-1 flex flex-col items-center justify-center px-[8cqw] text-center">
        {/* Логотип */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.2 }}
          className="mb-[2cqw] flex h-[7cqw] w-[7cqw] min-h-[56px] min-w-[56px] items-center justify-center rounded-[1.8cqw] bg-white text-alfa-red text-[clamp(24px,3.8cqw,54px)] font-black shadow-pop"
        >
          А
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-[clamp(32px,6.4cqw,96px)] font-bold tracking-tight leading-none"
        >
          {finale.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-[1cqw] text-[clamp(15px,2.6cqw,38px)] text-white/85"
        >
          {finale.line}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.9 }}
          className="mt-[3cqw] flex flex-wrap items-center justify-center gap-[1.4cqw]"
        >
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center gap-[0.8cqw] rounded-[1.1cqw] bg-white px-[2.4cqw] py-[1.1cqw] text-[clamp(13px,1.9cqw,26px)] font-semibold text-alfa-red shadow-pop transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            {finale.cta}
            <ArrowRight className="h-[1.8cqw] w-[1.8cqw] min-h-[15px] min-w-[15px]" />
          </button>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-[0.8cqw] rounded-[1.1cqw] border border-white/40 px-[2.4cqw] py-[1.1cqw] text-[clamp(13px,1.9cqw,26px)] font-medium text-white transition-colors hover:bg-white/10"
          >
            <RotateCcw className="h-[1.6cqw] w-[1.6cqw] min-h-[14px] min-w-[14px]" />
            {finale.replay}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="mt-[3cqw] text-[clamp(9px,1.2cqw,14px)] text-white/55"
        >
          {story.disclaimer} Демо-прототип, не финансовый продукт.
        </motion.p>
      </div>
    </SceneShell>
  );
}
