import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';

export interface TypeWriterProps {
  text: string;
  /** Задержка до начала печати, мс. */
  delay?: number;
  /** Символов в секунду. */
  cps?: number;
  className?: string;
}

/** «Анна печатает свою идею»: посимвольный набор текста с мигающей кареткой. */
export function TypeWriter({ text, delay = 0, cps = 30, className }: TypeWriterProps) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setN((v) => {
          if (v >= text.length) {
            if (interval) clearInterval(interval);
            return v;
          }
          return v + 1;
        });
      }, 1000 / cps);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, delay, cps]);

  const done = n >= text.length;

  return (
    <span className={className}>
      {text.slice(0, n)}
      <span
        aria-hidden
        className={cn('text-alfa-red', done ? 'opacity-0' : 'animate-pulse')}
      >
        ▍
      </span>
    </span>
  );
}
