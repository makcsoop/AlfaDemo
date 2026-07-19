import type { ReactNode } from 'react';
import { useActivationStore } from '@/store/useActivationStore';
import { LockedState } from './LockedState';

/**
 * Роут-гард: пропускает к блоку, только если раздел активирован в стартовом
 * пакете. Иначе показывает LockedState с быстрой активацией.
 */
export function GatedRoute({ route, children }: { route: string; children: ReactNode }) {
  const unlocked = useActivationStore((s) => s.isRouteUnlocked(route));
  return unlocked ? <>{children}</> : <LockedState route={route} />;
}
