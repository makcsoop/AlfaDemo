/**
 * Клиент DeepSeek + шаблоны промптов для «Альфа-старт».
 *
 * Ключ DEEPSEEK_API_KEY читается только здесь (сервер). Модель просят вернуть
 * строго JSON по контракту AnalyzeResult (см. src/lib/schema.ts на клиенте).
 * Авторитетная zod-валидация и фоллбэк — на клиенте; здесь минимальный разбор.
 *
 * Мок-интеграции (банк, БКИ, маркетплейсы, госзакупки) не подключаются по-настоящему —
 * реалистичный мок-контекст подаётся в промпт как поле `context` (см. buildMessages).
 */

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export function hasApiKey() {
  return Boolean(DEEPSEEK_API_KEY);
}

export function modelName() {
  return DEEPSEEK_MODEL;
}

const SYSTEM_PROMPT = [
  'Ты — аналитик малого бизнеса в России для сервиса «Альфа-старт для предпринимателей».',
  'Тебе дают вводные предпринимателя (input) и мок-контекст рынка (context) —',
  'обезличенные данные по клиентам Альфа-Банка в похожей нише и районе:',
  'средние обороты похожих бизнесов, средний чек, конверсию трафика, сезонность',
  'по месяцам, структуру расходов и уровень конкуренции. Опирайся на context как',
  'на факты рынка; input — как на планы предпринимателя.',
  '',
  'Отвечай СТРОГО одним JSON-объектом без markdown-обёртки и комментариев.',
  'Все суммы — в рублях, числами (без пробелов и валютных знаков).',
  'Для блока "idea" верни ПОЛНЫЙ контракт:',
  '{',
  '  "verdict": "go" | "caution" | "stop",',
  '  "score": число 0..100,',
  '  "summary": строка,',
  '  "strengths": [строка, ...],',
  '  "risks": [{ "title": строка, "level": "low"|"medium"|"high", "note": строка }],',
  '  "scenarios": [ три сценария c id "negative" | "base" | "optimistic", каждый:',
  '     { "id": строка, "name": строка, "probability": 0..1,',
  '       "points": [12 месяцев: { "month": "1".."12", "revenue": число, "costs": число, "profit": число }],',
  '       "metrics": { "turnover": среднемесячный оборот, "margin": маржа 0..1,',
  '         "breakEvenMonth": месяц выхода прибыли в плюс|null,',
  '         "paybackMonth": месяц окупаемости вложений|null, "cashGap": максимальный кассовый разрыв },',
  '       "assumptions": [строка «при каких условиях», ...] } ],',
  '  "credit": { "requested": желаемая сумма, "safeAmount": безопасная сумма ≤ желаемой,',
  '     "comfortablePayment": комфортный платёж/мес, "termMonths": срок, "rate": годовая ставка 0..1,',
  '     "light": "green" | "yellow" | "red", "paybackMonth": месяц окупаемости кредита|null,',
  '     "verdict": строка, "stressTest": { "label": "спрос −30%", "survives": bool,',
  '        "paybackMonth": число|null, "note": строка } },',
  '  "market": { "city": строка, "district": строка, "niche": строка, "demand": строка,',
  '     "seasonality": [12 чисел], "seasonalityNote": строка, "competition": "low"|"medium"|"high",',
  '     "competitionNote": строка, "peers": [{ "label": строка, "monthlyTurnover": число }],',
  '     "peerAvgTurnover": число, "avgCheck": число, "source": строка },',
  '  "disclaimer": строка',
  '}',
  'Требования согласованности: profit = revenue − costs; базовый сценарий — середина,',
  'негативный ≈ базовый со спросом −30%, оптимистичный ≈ базовый +25..35%;',
  'safeAmount ≤ requested, а платёж должен покрываться прибылью базового сценария.',
  'Прогнозы — это аналитические сценарии, а не финансовая рекомендация.',
].join('\n');

/**
 * Формирует сообщения для DeepSeek. `context` — реалистичный мок-контекст рынка
 * («данные Альфа»: средние обороты, сезонность, конкуренция района), который
 * блоки подмешивают из src/mock/markets.ts.
 */
function buildMessages({ block, business, input, context }) {
  const user = JSON.stringify({ block, business, input: input ?? {}, context: context ?? {} });
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: user },
  ];
}

/**
 * Вызывает DeepSeek и возвращает распарсенный объект результата (с meta.source=live).
 * Бросает ошибку при недоступности/таймауте/пустом ответе — обработчик решает, что делать.
 */
export async function analyzeWithDeepSeek({ block, business, input, context } = {}) {
  if (!DEEPSEEK_API_KEY) {
    const err = new Error('no_api_key');
    err.code = 'no_api_key';
    throw err;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  const resp = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: buildMessages({ block, business, input, context }),
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }),
  }).finally(() => clearTimeout(timeout));

  if (!resp.ok) {
    throw new Error(`DeepSeek HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('empty_completion');

  const parsed = JSON.parse(content);
  return {
    ...parsed,
    meta: {
      source: 'live',
      model: DEEPSEEK_MODEL,
      generatedAt: new Date().toISOString(),
    },
  };
}
