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
  if (!part) throw new Error(`unsupported file type for Google Gemini: ${mimeType}`);

  const result = await model.generateContent([part, { text: PROMPT }]);
  const text = result?.response?.text?.();
  if (!text) return null;
  try { return normalize(JSON.parse(text)); }
  catch (_) { return null; }
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

module.exports = { extract, DEFAULT_MODEL };
