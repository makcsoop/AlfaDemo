import { motion } from 'framer-motion';
import { SceneShell } from './SceneShell';
import { Kicker } from '../bits/Kicker';
import { MiniPaybackChart } from '../bits/MiniPaybackChart';
import { CreditLight } from '../bits/CreditLight';
import { Counter } from '../bits/Counter';
import { useAfter } from '../bits/useAfter';
import { formatRub } from '@/lib/format';
import { cn } from '@/shared/lib/cn';
import type { SceneProps } from './types';

/**
 * Сцена 3. КУЛЬМИНАЦИЯ: из «тумана» выезжают три сценария, графики рисуются
 * линией до точки окупаемости, светофор кредита загорается зелёным
 * на безопасной сумме. Главный вау-момент показа.
 */
export function S3Scenarios({ story }: SceneProps) {
  const showStrip = useAfter(12_500);

  return (
    <SceneShell tone="light" disclaimer>
      <div className="flex-1 flex flex-col px-[4cqw] pt-[2.6cqw] min-h-0">
        <div className="text-center">
          <Kicker>Шаг 2 · Расчёт готов</Kicker>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-[0.6cqw] text-[clamp(20px,3.4cqw,48px)] font-bold tracking-tight"
          >
            Три сценария для «Кофейни Анны»
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[clamp(11px,1.6cqw,20px)] text-muted"
          >
            Пунктир — кредит 450 000 ₽. Зелёная точка — месяц, когда он окупается.
          </motion.p>
        </div>

        {/* Три карты сценариев */}
        <div className="mt-[1.8cqw] grid flex-1 min-h-0 grid-cols-3 items-stretch gap-[1.8cqw]">
          {story.scenarios.map((sc, i) => {
            const isBase = sc.id === 'base';
            return (
              <motion.div
                key={sc.id}
                initial={{ opacity: 0, y: 44, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.5 + i * 0.55, duration: 0.7, ease: 'easeOut' }}
                className={cn(
                  'flex flex-col rounded-[1.4cqw] border bg-white p-[1.6cqw] shadow-card min-h-0',
                  isBase ? 'border-alfa-red/40 ring-1 ring-alfa-red/25' : 'border-line',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[clamp(12px,1.8cqw,24px)] font-semibold" style={{ color: sc.color }}>
                    {sc.name}
                  </span>
                  <span className="rounded-full bg-bg px-[1cqw] py-[0.4cqw] text-[clamp(9px,1.2cqw,15px)] font-medium text-alfa-graphite">
                    {Math.round(sc.probability * 100)}%
                  </span>
                </div>

                <div className="mt-[0.8cqw] flex-1 min-h-[9cqw]">
                  <MiniPaybackChart scenario={sc} begin={1300 + i * 600} />
                </div>

                <PaybackBadge
                  month={sc.paybackMonth}
                  at={1300 + i * 600 + 2100}
                  highlight={isBase}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Светофор кредита — нижняя полоса кульминации */}
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={showStrip ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="my-[1.8cqw] flex items-center justify-center gap-[2.6cqw] rounded-[1.4cqw] border border-line bg-bg/70 px-[2.6cqw] py-[1.4cqw]"
        >
          {showStrip && (
            <>
              <CreditLight delay={0.3} />
              <div className="text-left">
                <div className="text-[clamp(10px,1.3cqw,16px)] text-muted">
                  Запрошено: <s>{formatRub(story.credit.requested)}</s> · безопасный кредит
                </div>
                <div className="text-[clamp(22px,3.6cqw,52px)] font-bold leading-tight text-risk-low">
                  <Counter value={story.credit.safe} format={formatRub} duration={1.6} delay={1.7} />
                </div>
              </div>
              <div className="hidden sm:block text-left text-[clamp(10px,1.4cqw,18px)] text-alfa-graphite">
                платёж ~{formatRub(story.credit.monthlyPayment)}/мес
                <br />
                срок {story.credit.termMonths} мес
              </div>
            </>
          )}
        </motion.div>
      </div>
    </SceneShell>
  );
}

function PaybackBadge({ month, at, highlight }: { month: number; at: number; highlight?: boolean }) {
  const on = useAfter(at);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={on ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className={cn(
        'mt-[0.8cqw] inline-flex items-center gap-[0.6cqw] self-start rounded-full px-[1.1cqw] py-[0.5cqw] text-[clamp(10px,1.35cqw,17px)] font-medium',
        highlight ? 'bg-emerald-50 text-risk-low' : 'bg-bg text-alfa-graphite',
      )}
    >
      <span className="h-[0.9cqw] w-[0.9cqw] min-h-[7px] min-w-[7px] rounded-full bg-risk-low" />
      окупаемость кредита — {month} мес
    </motion.div>
  );
}
