// OpenAI provider — works for OpenAI itself and any OpenAI-compatible API
// (LiteLLM, Together, Groq, OpenRouter, vLLM, etc.) by overriding base_url.
// Default model: gpt-4o-mini for cost; gpt-4o is the upgrade for fidelity.
//
// Vision: native (image_url or base64 data URL).
// PDF: native via type:"file" content block on gpt-4o models. For
// OpenAI-compatible endpoints that don't accept type:"file", uploaded
// PDFs will surface a clear error and the admin can fall back to images.

const fs = require('fs');
const OpenAI = require('openai');
const { SCHEMA, PROMPT, normalize } = require('./_shared');

const DEFAULT_MODEL = 'gpt-4o-mini';

async function extract(filePath, mimeType, config) {
  if (!config?.api_key) throw new Error('openai api_key is required');
  const client = new OpenAI({
    apiKey: config.api_key,
    ...(config.base_url ? { baseURL: config.base_url } : {}),
  });

  const userContent = await buildContent(filePath, mimeType);
  if (!userContent) throw new Error(`unsupported file type for OpenAI: ${mimeType}`);

  const response = await client.chat.completions.create({
    model: config.model || DEFAULT_MODEL,
    max_completion_tokens: 1024,
    response_format: {
      type: 'json_schema',
      json_schema: { name: 'award_extraction', strict: true, schema: SCHEMA },
    },
    messages: [
      { role: 'system', content: PROMPT },
      { role: 'user', content: userContent },
    ],
  });

  const text = response.choices?.[0]?.message?.content || '';
  if (!text) return null;
  try { return normalize(JSON.parse(text)); }
  catch (_) { return null; }
}

async function buildContent(filePath, mimeType) {
  let buf;
  try { buf = fs.readFileSync(filePath); }
  catch (_) { return null; }
  const b64 = buf.toString('base64');

  if (typeof mimeType === 'string' && mimeType.startsWith('image/')) {
    return [
      { type: 'text', text: 'Extract the award metadata from this image.' },
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${b64}` } },
    ];
  }
  if (mimeType === 'application/pdf') {
    return [
      { type: 'text', text: 'Extract the award metadata from this PDF.' },
      // gpt-4o accepts inline file content via this shape. Endpoints that
      // don't support it will throw, which we surface as an extraction error.
      { type: 'file', file: { filename: 'document.pdf', file_data: `data:application/pdf;base64,${b64}` } },
    ];
  }
  return null;
}

module.exports = { extract, DEFAULT_MODEL };
