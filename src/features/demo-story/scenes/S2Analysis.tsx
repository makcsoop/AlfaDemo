import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { SceneShell } from './SceneShell';
import { Kicker } from '../bits/Kicker';
import { TypeWriter } from '../bits/TypeWriter';
import { DistrictMap } from '../bits/DistrictMap';
import { useAfter } from '../bits/useAfter';
import type { SceneProps } from './types';
import type { AnalysisStep } from '@/mock/goldenAnalysis';

/**
 * Сцена 2. Анна вводит идею → запускается «живой» ИИ-анализ:
 * печатается текст, нажимается кнопка, бегут статусы, оживает карта района.
 * Под капотом — «золотой» слепок, но выглядит как расчёт DeepSeek.
 */
export function S2Analysis({ story }: SceneProps) {
  const pressed = useAfter(6300);

  return (
    <SceneShell tone="light">
      <div className="flex-1 grid grid-cols-[5fr_6fr] gap-[3cqw] px-[4cqw] pt-[3cqw] pb-[2cqw] min-h-0">
        {/* ── Левая колонка: «форма» идеи ── */}
        <div className="flex flex-col min-h-0">
          <Kicker>Шаг 1 · Анна вводит идею</Kicker>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-[1.4cqw] rounded-[1.4cqw] border border-line bg-white shadow-card p-[2cqw]"
          >
            <div className="text-[clamp(10px,1.3cqw,16px)] font-medium text-muted">Ваша идея</div>
            <div className="mt-[0.8cqw] min-h-[9cqw] rounded-[1cqw] border border-line bg-bg/60 p-[1.4cqw] text-[clamp(13px,1.9cqw,26px)] leading-relaxed text-alfa-ink">
              <TypeWriter text={story.idea.text} delay={800} cps={26} />
            </div>

            <div className="mt-[1.2cqw] flex flex-wrap gap-[0.8cqw]">
              {story.idea.chips.map((chip, i) => (
                <motion.span
                  key={chip}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 4.6 + i * 0.35, duration: 0.35 }}
                  className="rounded-full bg-alfa-red-50 px-[1.3cqw] py-[0.6cqw] text-[clamp(10px,1.4cqw,18px)] font-medium text-alfa-red"
                >
                  {chip}
                </motion.span>
              ))}
            </div>

            {/* Кнопка «нажимается сама» */}
            <motion.div
              animate={pressed ? {} : { scale: [1, 1, 0.96, 1] }}
              transition={{ delay: 5.9, duration: 0.45, times: [0, 0.6, 0.8, 1] }}
              className="mt-[1.6cqw]"
            >
              <div
                className={`inline-flex items-center gap-[0.8cqw] rounded-[1cqw] px-[2cqw] py-[1cqw] text-[clamp(12px,1.7cqw,22px)] font-medium text-white transition-colors ${
                  pressed ? 'bg-alfa-red-700' : 'bg-alfa-red'
                }`}
              >
                {pressed ? (
                  <>
                    <Loader2 className="h-[1.8cqw] w-[1.8cqw] min-h-[14px] min-w-[14px] animate-spin" />
                    Анализируем…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-[1.8cqw] w-[1.8cqw] min-h-[14px] min-w-[14px]" />
                    Оценить идею
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 7.5 }}
            className="mt-auto pt-[1cqw] text-[clamp(9px,1.2cqw,14px)] text-muted"
          >
            В live-режиме здесь считает DeepSeek · сейчас — демо-слепок
          </motion.p>
        </div>

        {/* ── Правая колонка: живой анализ ── */}
        <div className="flex flex-col min-h-0">
          <Kicker delay={6.5}>ИИ-анализ Альфа-старта</Kicker>

          {/* Карта района */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 7.6, duration: 0.55 }}
            className="mt-[1.4cqw] flex-1 min-h-0 overflow-hidden rounded-[1.4cqw] border border-line shadow-card"
          >
            <DistrictMap startDelay={8.2} />
          </motion.div>

          {/* Пайплайн статусов */}
          <ul className="mt-[1.4cqw] grid grid-cols-2 gap-x-[1.6cqw] gap-y-[0.9cqw]">
            {story.steps.map((step) => (
              <PipelineStep key={step.id} step={step} />
            ))}
          </ul>
        </div>
      </div>
    </SceneShell>
  );
}

function PipelineStep({ step }: { step: AnalysisStep }) {
  const on = useAfter(step.at);
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={on ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-[0.9cqw]"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={on ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        className="mt-[0.15cqw] flex h-[1.9cqw] w-[1.9cqw] min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-risk-low text-white"
      >
        <Check className="h-[1.2cqw] w-[1.2cqw] min-h-[10px] min-w-[10px]" strokeWidth={3} />
      </motion.span>
      <span className="min-w-0">
        <span className="block text-[clamp(11px,1.5cqw,19px)] font-medium leading-tight text-alfa-ink">
          {step.label}
        </span>
        <span className="block text-[clamp(9px,1.2cqw,15px)] text-muted leading-tight">
          {step.sub}
        </span>
      </span>
    </motion.li>
  );
}
