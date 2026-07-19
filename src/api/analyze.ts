import { AnalyzeResultSchema, type AnalyzeRequest, type AnalyzeResult } from '@/lib/schema';
import { fallbackAnalyze } from '@/lib/fallback';
import { getGoldenResult } from '@/mock/golden';
import { getMarketContext } from '@/mock/markets';
import type { AppMode } from '@/store/useAppStore';

/**
 * Подмешивает мок-контекст рынка («данные Альфа») в запрос блока «idea»,
 * если он ещё не задан. Именно этот context уходит в промпт DeepSeek.
 */
function withMarketContext(req: AnalyzeRequest): AnalyzeRequest {
  if (req.block !== 'idea' || req.context) return req;
  const input = (req.input ?? {}) as Record<string, unknown>;
  const niche = typeof input.niche === 'string' ? input.niche : 'coffee';
  const district = typeof input.district === 'string' ? input.district : 'business';
  const city = typeof input.city === 'string' ? input.city : req.business.city;
  return { ...req, context: getMarketContext(niche, district, city) };
}

/**
 * Клиент фронта к ИИ-ядру + переключатель demo/live.
 *
 *  • ДЕМО  → «золотые» данные из src/mock (офлайн, воспроизводимо).
 *  • LIVE  → POST /api/analyze (DeepSeek на сервере) + строгая zod-валидация;
 *            при любой ошибке — детерминированный фоллбэк из src/lib.
 *
 * Компоненты вызывают только analyze() и не знают деталей режимов.
 */
export async function analyze(
  req: AnalyzeRequest,
  mode: AppMode,
): Promise<AnalyzeResult> {
  if (mode === 'demo') {
    return getGoldenResult(req.block);
  }

  const enriched = withMarketContext(req);

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = (await res.json()) as { ok?: boolean; result?: unknown; reason?: string };
    if (!json?.ok) throw new Error(json?.reason || 'not_ok');

    const parsed = AnalyzeResultSchema.safeParse(json.result);
    if (!parsed.success) throw new Error('schema_mismatch');

    return parsed.data;
  } catch {
    // Сеть/ключ/схема подвели — не роняем UX, отдаём детерминированный результат.
    return fallbackAnalyze(req);
  }
}
