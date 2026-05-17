// Anthropic provider — Claude vision + PDF input with structured outputs.
// Default model: claude-opus-4-7. Accepts a per-request override via config.model.

const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');
const { SCHEMA, PROMPT, normalize } = require('./_shared');

const DEFAULT_MODEL = 'claude-opus-4-7';

async function extract(filePath, mimeType, config) {
  if (!config?.api_key) throw new Error('anthropic api_key is required');
  const client = new Anthropic({ apiKey: config.api_key, ...(config.base_url ? { baseURL: config.base_url } : {}) });

  const block = fileToBlock(filePath, mimeType);
  if (!block) throw new Error(`unsupported file type for Anthropic: ${mimeType}`);

  const response = await client.messages.create({
    model: config.model || DEFAULT_MODEL,
    max_tokens: 1024,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: [block, { type: 'text', text: PROMPT }] }],
  });

  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  if (!text) return null;
  try { return normalize(JSON.parse(text)); }
  catch (_) { return null; }
}

function fileToBlock(filePath, mimeType) {
  let buf;
  try { buf = fs.readFileSync(filePath); }
  catch (_) { return null; }
  const data = buf.toString('base64');
  if (mimeType === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } };
  }
  if (typeof mimeType === 'string' && mimeType.startsWith('image/')) {
    return { type: 'image', source: { type: 'base64', media_type: mimeType, data } };
  }
  return null;
}

// Lightweight smoke test — verifies api_key + model + network.
async function test(config) {
  if (!config?.api_key) throw new Error('anthropic api_key is required');
  const client = new Anthropic({ apiKey: config.api_key, ...(config.base_url ? { baseURL: config.base_url } : {}) });
  const r = await client.messages.create({
    model: config.model || DEFAULT_MODEL,
    max_tokens: 32,
    messages: [{ role: 'user', content: 'Reply with exactly the two letters: OK' }],
  });
  const text = r.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return text || '(empty response)';
}

module.exports = { extract, test, DEFAULT_MODEL };
