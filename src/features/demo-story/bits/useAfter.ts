import { useEffect, useState } from 'react';

/**
 * true спустя `ms` от монтирования сцены.
 * Тайминги сцен отсчитываются от mount — сцена «проигрывается» одинаково
 * и в авто-режиме, и при ручном переходе по «Далее».
 */
export function useAfter(ms: number): boolean {
  const [ready, setReady] = useState(ms <= 0);
  useEffect(() => {
    if (ms <= 0) return;
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}
