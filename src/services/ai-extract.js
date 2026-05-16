// Award / certificate metadata extraction via Claude vision + PDF input.
//
// Sends an uploaded image or PDF to Claude with a JSON-schema-constrained
// output_config so the response is already-valid structured JSON — no need
// to chase JSON out of free-form text. Used by the admin's "Auto-fill from
// file" button on the Awards and Certificates editors.
//
// Model: claude-opus-4-7 (per skill defaults). No sampling params — those
// 400 on Opus 4.7. No streaming needed — output is tiny (~200 tokens).
// Returns null on missing API key, unsupported MIME type, or any API
// failure so the caller can fall back to manual entry.

const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

let _client = null;
function client() {
  if (!config.anthropicApiKey) return null;
  if (!_client) _client = new Anthropic({ apiKey: config.anthropicApiKey });
  return _client;
}

// Each field is union-typed with null so the model can confess uncertainty
// rather than guessing. additionalProperties:false is required by Claude's
// structured outputs; every property must be in required[].
const EXTRACTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: ['string', 'null'],
      description: 'Name of the award or certificate as printed on the document, e.g. "National Mental Math Contest" or "Gold Medal Science Fair".',
    },
    year: {
      type: ['string', 'null'],
      description: '4-digit year the award was issued (YYYY). Null if not legible.',
    },
    date: {
      type: ['string', 'null'],
      description: 'Year + month when readable, in YYYY-MM format. Null if only the year is legible.',
    },
    issuer: {
      type: ['string', 'null'],
      description: 'Organization that issued the award, e.g. "BACC Bangkok", "ETS", "IPST". Null if not identifiable.',
    },
    rank: {
      type: ['string', 'null'],
      description: 'Position or rank if applicable, e.g. "GOLD", "SILVER", "1ST", "2ND". Null if the award has no rank.',
    },
  },
  required: ['title', 'year', 'date', 'issuer', 'rank'],
};

const PROMPT = `Look at the attached award certificate, trophy plaque, or competition document and extract the metadata.

Be conservative: if you can't read a field with confidence, return null. Don't guess or invent values. For rank, only fill it if the document explicitly shows a position (e.g. "1st Place", "Gold Medal"); leave null for participation certificates.`;

function isAvailable() {
  return Boolean(config.anthropicApiKey);
}

async function extractAwardData(filePath, mimeType) {
  const c = client();
  if (!c) return null;

  const block = fileToBlock(filePath, mimeType);
  if (!block) return null;

  try {
    const response = await c.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema: EXTRACTION_SCHEMA } },
      messages: [
        { role: 'user', content: [block, { type: 'text', text: PROMPT }] },
      ],
    });

    // With output_config.format, the response is a single text block whose
    // body is the schema-validated JSON. Find it and parse.
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    // Use the SDK's typed exceptions per claude-api skill — no string matching.
    if (e instanceof Anthropic.BadRequestError) {
      console.warn('[ai-extract] bad request:', e.message);
    } else if (e instanceof Anthropic.AuthenticationError) {
      console.warn('[ai-extract] auth error — check ANTHROPIC_API_KEY');
    } else if (e instanceof Anthropic.RateLimitError) {
      console.warn('[ai-extract] rate limited');
    } else if (e instanceof Anthropic.APIError) {
      console.warn('[ai-extract] api error', e.status, e.message);
    } else {
      console.warn('[ai-extract] unexpected error:', e.message);
    }
    return null;
  }
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

module.exports = { extractAwardData, isAvailable };
