// Google Gemini provider — native vision + PDF input with structured output.
// Default model: gemini-2.5-flash (cheap, fast); gemini-2.5-pro is the
// upgrade. Google's structured output uses responseMimeType + responseSchema.
//
// Note: Gemini's schema parser doesn't accept JSON Schema's `additionalProperties`
// field, and uses single-type only (`type: 'string'` rather than `['string','null']`).
// We translate the shared schema down to Gemini's accepted subset, then mark
// fields nullable via `nullable: true`.

const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PROMPT, normalize } = require('./_shared');

const DEFAULT_MODEL = 'gemini-2.5-flash';

const GEMINI_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', nullable: true, description: 'Name of the award or certificate.' },
    year: { type: 'string', nullable: true, description: '4-digit year (YYYY).' },
    date: { type: 'string', nullable: true, description: 'Year + month (YYYY-MM) if readable.' },
    issuer: { type: 'string', nullable: true, description: 'Organization that issued the award.' },
    rank: { type: 'string', nullable: true, description: 'Position or rank (e.g. "GOLD", "1ST").' },
  },
  required: ['title', 'year', 'date', 'issuer', 'rank'],
};

async function extract(filePath, mimeType, config) {
  if (!config?.api_key) throw new Error('google api_key is required');
  const client = new GoogleGenerativeAI(config.api_key);
  const model = client.getGenerativeModel({
    model: config.model || DEFAULT_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: GEMINI_SCHEMA,
      maxOutputTokens: 1024,
    },
  });

  const part = filePart(filePath, mimeType);
  if (!part) throw geminiError(`unsupported file type for Google Gemini: ${mimeType}`);

  let result;
  try { result = await model.generateContent([part, { text: PROMPT }]); }
  catch (e) { throw geminiError(`generateContent failed: ${detailMessage(e)}`); }

  const text = result?.response?.text?.();
  if (!text) {
    const candidate = result?.response?.candidates?.[0];
    const finishReason = candidate?.finishReason || 'unknown';
    const blocked = candidate?.safetyRatings?.filter((r) => r.blocked).map((r) => r.category).join(',');
    throw geminiError(`empty response (finishReason: ${finishReason}${blocked ? `, blocked: ${blocked}` : ''})`);
  }
  try { return normalize(JSON.parse(text)); }
  catch (e) { throw geminiError(`response JSON parse failed: ${e.message} · raw: ${text.slice(0, 200)}`); }
}

// Lightweight smoke test — no file, no schema. Verifies api_key + model id +
// network reachability. Returns the model's reply text on success.
async function test(config) {
  if (!config?.api_key) throw new Error('google api_key is required');
  const client = new GoogleGenerativeAI(config.api_key);
  const model = client.getGenerativeModel({ model: config.model || DEFAULT_MODEL });
  try {
    const r = await model.generateContent('Reply with exactly the two letters: OK');
    return r?.response?.text?.()?.trim() || '(empty response)';
  } catch (e) {
    throw geminiError(`test failed: ${detailMessage(e)}`);
  }
}

function geminiError(msg) {
  const e = new Error(msg);
  e.provider = 'google';
  return e;
}

// SDK errors hide useful detail (status code, GoogleGenerativeAIFetchError
// wraps a fetch response). Surface whatever we can find.
function detailMessage(e) {
  if (!e) return 'unknown';
  const parts = [];
  if (e.status) parts.push(`status=${e.status}`);
  if (e.statusText) parts.push(`statusText=${e.statusText}`);
  if (e.errorDetails) parts.push(`details=${JSON.stringify(e.errorDetails).slice(0, 200)}`);
  parts.push(e.message || String(e));
  return parts.join(' · ');
}

function filePart(filePath, mimeType) {
  let buf;
  try { buf = fs.readFileSync(filePath); }
  catch (_) { return null; }
  if (mimeType === 'application/pdf' || (typeof mimeType === 'string' && mimeType.startsWith('image/'))) {
    return { inlineData: { mimeType, data: buf.toString('base64') } };
  }
  return null;
}

module.exports = { extract, test, DEFAULT_MODEL };
