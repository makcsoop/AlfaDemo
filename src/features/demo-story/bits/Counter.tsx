import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export interface CounterProps {
  /** Целевое значение. */
  value: number;
  /** Форматирование (по умолчанию — просто число с пробелами). */
  format?: (v: number) => string;
  duration?: number;
  delay?: number;
  from?: number;
  className?: string;
}

const defaultFormat = (v: number) => new Intl.NumberFormat('ru-RU').format(v);

/**
 * Роллап-счётчик: цифра «докручивается» до значения с кинематографичным замедлением.
 * Рендерится через MotionValue — без ре-рендеров React на каждый кадр.
 */
export function Counter({
  value,
  format = defaultFormat,
  duration = 1.4,
  delay = 0,
  from = 0,
  className,
}: CounterProps) {
  const mv = useMotionValue(from);
  const display = useTransform(mv, (v) => format(Math.round(v)));

  useEffect(() => {
    const controls = animate(mv, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, duration, delay, mv]);

  return <motion.span className={className}>{display}</motion.span>;
}
