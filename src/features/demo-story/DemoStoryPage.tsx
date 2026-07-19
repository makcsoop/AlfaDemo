import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Maximize,
  Minimize,
} from 'lucide-react';
import { PageHeader } from '@/features/_shared/PageHeader';
import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { SCENES } from './scenes';
import { useDirector } from './director';
import { goldenAnalysis } from '@/mock/goldenAnalysis';
import { goldenData } from '@/mock/golden';
import { DEMO_BUSINESS } from '@/mock/business';

/**
 * Оркестратор флагманского демо-сценария.
 *
 * Сцена — кадр 16:9 (читаемо с проектора, есть фуллскрин), под ней пульт:
 * Сначала · Назад · Играть/Пауза · Далее + полоса прогресса по сценам.
 * Горячие клавиши: Пробел — играть/пауза, ←/→ — сцены, R — сначала, F — на весь экран.
 *
 * Полностью офлайн: сцены читают «золотые» данные (src/mock/goldenAnalysis.ts),
 * сеть и DeepSeek не используются независимо от тумблера Live/Демо.
 */
export function DemoStoryPage() {
  const index = useDirector((s) => s.index);
  const runId = useDirector((s) => s.runId);

  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);

  // Инициализация длительностей + тикер таймлайна.
  useEffect(() => {
    const d = useDirector.getState();
    d.init(SCENES.map((s) => s.duration));
    let last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      useDirector.getState().tick(now - last);
      last = now;
    }, 100);
    return () => {
      clearInterval(iv);
      useDirector.getState().pause();
    };
  }, []);

  // Фуллскрин.
  useEffect(() => {
    const onChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stageWrapRef.current?.requestFullscreen?.();
  };

  // Горячие клавиши.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(tag)) return;
      const d = useDirector.getState();
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          d.togglePlay();
          break;
        case 'ArrowRight':
          d.next();
          break;
        case 'ArrowLeft':
          d.prev();
          break;
        case 'KeyR':
          d.restart();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const scene = SCENES[index];
  const Scene = scene.Component;

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Флагманский показ"
        title="Демо-сценарий"
        description="Кинематографичная история «Кофейни Анны»: от страха до первых продаж за 2 минуты."
        actions={
          <Badge tone="red" dot>
            офлайн · золотые данные
          </Badge>
        }
      />

      {/* Обёртка сцены+пульта — она уходит в фуллскрин целиком */}
      <div
        ref={stageWrapRef}
        className={cn(isFs && 'flex h-full w-full flex-col justify-center bg-bg p-4 sm:p-6')}
      >
        {/* Кадр 16:9 */}
        <div
          className={cn(
            'relative mx-auto w-full aspect-video overflow-hidden bg-white [container-type:inline-size]',
            isFs
              ? 'max-w-[calc((100dvh-150px)*1.7778)] rounded-xl'
              : 'max-w-[calc((100dvh-320px)*1.7778)] rounded-2xl border border-line shadow-card',
          )}
        >
          <AnimatePresence initial={false}>
            <Scene
              key={`${runId}-${scene.id}`}
              story={goldenAnalysis}
              data={goldenData}
              business={DEMO_BUSINESS}
              active
            />
          </AnimatePresence>
        </div>

        <DirectorControls
          isFullscreen={isFs}
          onToggleFullscreen={toggleFullscreen}
          className={cn('mx-auto mt-4 w-full', isFs && 'max-w-[calc((100dvh-150px)*1.7778)]')}
        />
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        Пробел — играть/пауза · ←/→ — сцены · R — сначала · F — на весь экран
      </p>
    </div>
  );
}

// ── Пульт режиссёра ──────────────────────────────────────────────────

function DirectorControls({
  isFullscreen,
  onToggleFullscreen,
  className,
}: {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  className?: string;
}) {
  const index = useDirector((s) => s.index);
  const playing = useDirector((s) => s.playing);
  const play = useDirector((s) => s.play);
  const pause = useDirector((s) => s.pause);
  const next = useDirector((s) => s.next);
  const prev = useDirector((s) => s.prev);
  const restart = useDirector((s) => s.restart);

  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card', className)}>
      <IconBtn label="Сначала" onClick={restart}>
        <RotateCcw className="h-4 w-4" />
      </IconBtn>
      <IconBtn label="Назад" onClick={prev} disabled={index === 0}>
        <ChevronLeft className="h-5 w-5" />
      </IconBtn>

      {/* Играть/Пауза — главная кнопка */}
      <button
        type="button"
        onClick={playing ? pause : play}
        aria-label={playing ? 'Пауза' : 'Играть'}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-alfa-red text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
      </button>

      <IconBtn label="Далее" onClick={next} disabled={index === SCENES.length - 1}>
        <ChevronRight className="h-5 w-5" />
      </IconBtn>

      {/* Прогресс по сценам */}
      <div className="flex flex-1 items-center gap-1.5 px-1">
        {SCENES.map((s, i) => (
          <ProgressSegment key={s.id} sceneIndex={i} title={s.title} duration={s.duration} />
        ))}
      </div>

      <div className="hidden md:block whitespace-nowrap text-xs font-medium text-muted">
        {index + 1}/{SCENES.length} · {SCENES[index].title}
      </div>

      <IconBtn label={isFullscreen ? 'Выйти из полноэкранного' : 'На весь экран'} onClick={onToggleFullscreen}>
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </IconBtn>
    </div>
  );
}

function ProgressSegment({
  sceneIndex,
  title,
  duration,
}: {
  sceneIndex: number;
  title: string;
  duration: number;
}) {
  const index = useDirector((s) => s.index);
  const elapsed = useDirector((s) => s.elapsed);
  const goTo = useDirector((s) => s.goTo);

  const fill = sceneIndex < index ? 1 : sceneIndex > index ? 0 : Math.min(elapsed / duration, 1);

  return (
    <button
      type="button"
      title={title}
      aria-label={`Сцена: ${title}`}
      onClick={() => goTo(sceneIndex)}
      className="group h-4 flex-1 min-w-6 flex items-center"
    >
      <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-line transition-colors group-hover:bg-line/70">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-alfa-red"
          style={{ width: `${fill * 100}%` }}
        />
      </span>
    </button>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-alfa-graphite transition-colors hover:bg-bg disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
