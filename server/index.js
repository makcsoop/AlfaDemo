import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeWithDeepSeek, hasApiKey, modelName } from './deepseek.js';

/**
 * Лёгкий бэкенд-прокси для «Альфа-старт».
 *
 * POST /api/analyze — единственная содержательная ручка:
 *   • ключ DeepSeek читается только на сервере (см. deepseek.js);
 *   • при отсутствии ключа/ошибке отвечаем 503 с машинно-читаемой причиной,
 *     а фронт откатывается на детерминированный фоллбэк (src/lib/fallback.ts).
 * Строгая zod-валидация ответа — на клиенте (src/api/analyze.ts).
 */

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8787;

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'alfa-start-proxy',
    hasApiKey: hasApiKey(),
    model: modelName(),
    time: new Date().toISOString(),
  });
});

app.post('/api/analyze', async (req, res) => {
  const { block, business, input, context } = req.body ?? {};

  if (!block || !business) {
    return res.status(400).json({ ok: false, reason: 'bad_request' });
  }

  try {
    const result = await analyzeWithDeepSeek({ block, business, input, context });
    return res.json({ ok: true, result });
  } catch (err) {
    const reason =
      err?.code === 'no_api_key'
        ? 'no_api_key'
        : err?.name === 'AbortError'
          ? 'timeout'
          : 'upstream_error';
    if (reason !== 'no_api_key') {
      console.error('[analyze] DeepSeek error:', err?.message || err);
    }
    return res.status(503).json({ ok: false, reason });
  }
});

app.listen(PORT, () => {
  console.log(
    `[alfa-start] proxy на http://localhost:${PORT}  (DeepSeek key: ${hasApiKey() ? 'есть' : 'нет — фоллбэк на клиенте'})`,
  );
});
