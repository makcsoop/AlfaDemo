import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/features/_shared/PageHeader';
import { Badge } from '@/shared/ui';
import { analyze } from '@/api/analyze';
import type { AnalyzeResult, IdeaInput } from '@/lib/schema';
import { useAppStore } from '@/store/useAppStore';
import { useProgressStore } from '@/store/useProgressStore';
import { DEFAULT_IDEA_INPUT, ideaToRequest } from './ideaInputs';
import { IdeaForm } from './IdeaForm';
import { AnalyzingState } from './AnalyzingState';
import { ResultView } from './ResultView';

type Phase = 'form' | 'analyzing' | 'result';

/** Минимальная длительность «живого» анализа, чтобы стадии успели показаться. */
const MIN_ANALYZE_MS = 2600;

export function IdeaEvalPage() {
  const navigate = useNavigate();
  const mode = useAppStore((s) => s.mode);
  const completeStep = useProgressStore((s) => s.complete);

  const [phase, setPhase] = useState<Phase>('form');
  const [input, setInput] = useState<IdeaInput>(DEFAULT_IDEA_INPUT);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  async function handleSubmit(next: IdeaInput) {
    setInput(next);
    setResult(null);
    setPhase('analyzing');

    const started = Date.now();
    // analyze() сам инкапсулирует demo/live и никогда не бросает — при сбое отдаёт фоллбэк.
    const res = await analyze(ideaToRequest(next), mode);
    const wait = MIN_ANALYZE_MS - (Date.now() - started);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    setResult(res);
    setPhase('result');
    completeStep('/idea');
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Блок 1 · Оценка идеи"
        title="Оценка идеи и кредитной нагрузки"
        description="Три сценария развития, безопасная сумма кредита и стресс-тест спроса — по вашим вводным и данным рынка."
        badge={mode === 'demo' ? 'Демо-режим' : 'DeepSeek · LIVE'}
        actions={
          phase === 'result' ? (
            <Badge tone="green" dot>
              Расчёт готов
            </Badge>
          ) : undefined
        }
      />

      {phase === 'form' && <IdeaForm initial={input} onSubmit={handleSubmit} />}
      {phase === 'analyzing' && <AnalyzingState />}
      {phase === 'result' && result && (
        <ResultView
          result={result}
          onEdit={() => setPhase('form')}
          onRegister={() => navigate('/registration')}
        />
      )}
    </div>
  );
}
