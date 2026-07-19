import { create } from 'zustand';

/**
 * Режиссёр флагманского демо-сценария.
 *
 * Управляет последовательностью сцен и авто-проигрыванием:
 *   • `playing` — включён ли авто-режим (пауза останавливает только переходы,
 *     внутренняя жизнь сцены — анимации, пульсация — продолжается);
 *   • `elapsed` — таймлайн текущей сцены (тикает только при playing);
 *   • `runId` — растёт при «Сначала», чтобы сцены размонтировались и
 *     проиграли свои анимации заново.
 *
 * Длительности сцен приходят из реестра SCENES через init() — store сам
 * реестр не импортирует, чтобы не создавать циклических зависимостей.
 */
export interface DirectorState {
  index: number;
  playing: boolean;
  /** мс от начала текущей сцены (только в авто-режиме). */
  elapsed: number;
  runId: number;
  durations: number[];

  init: (durations: number[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  restart: () => void;
  /** Продвигает таймлайн; при достижении длительности сцены — переход дальше. */
  tick: (dt: number) => void;
}

export const useDirector = create<DirectorState>()((set, get) => ({
  index: 0,
  playing: false,
  elapsed: 0,
  runId: 0,
  durations: [],

  init: (durations) => set({ durations }),
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),

  next: () =>
    set((s) => ({
      index: Math.min(s.index + 1, Math.max(s.durations.length - 1, 0)),
      elapsed: 0,
    })),
  prev: () => set((s) => ({ index: Math.max(s.index - 1, 0), elapsed: 0 })),
  goTo: (index) =>
    set((s) => ({
      index: Math.max(0, Math.min(index, s.durations.length - 1)),
      elapsed: 0,
    })),
  restart: () => set((s) => ({ index: 0, elapsed: 0, runId: s.runId + 1, playing: true })),

  tick: (dt) => {
    const s = get();
    if (!s.playing) return;
    const duration = s.durations[s.index] ?? 0;
    const elapsed = s.elapsed + dt;
    if (duration > 0 && elapsed >= duration) {
      if (s.index >= s.durations.length - 1) {
        // Финал: остаёмся на последней сцене, авто-режим выключается.
        set({ elapsed: duration, playing: false });
      } else {
        set({ index: s.index + 1, elapsed: 0 });
      }
    } else {
      set({ elapsed });
    }
  },
}));
