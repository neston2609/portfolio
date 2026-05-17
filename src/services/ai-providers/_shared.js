// Shared constants for award/certificate extraction across providers.
// Every provider returns the same shape; the dispatcher in ../ai-extract.js
// validates the result against this contract before handing it to the route.

const SCHEMA_FIELDS = ['title', 'year', 'date', 'issuer', 'rank'];

// JSON schema accepted by all three vendors. additionalProperties:false +
// every property in required[] is the strictest mode that works on
// Anthropic, OpenAI structured outputs, and Google responseSchema.
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: ['string', 'null'], description: 'Name of the award or certificate as printed on the document.' },
    year: { type: ['string', 'null'], description: '4-digit year (YYYY) the award was issued; null if not legible.' },
    date: { type: ['string', 'null'], description: 'Year + month when readable in YYYY-MM format; null if only the year is legible.' },
    issuer: { type: ['string', 'null'], description: 'Organization that issued the award. Null if not identifiable.' },
    rank: { type: ['string', 'null'], description: 'Position or rank (e.g. "GOLD", "1ST"). Null if the award has no rank.' },
  },
  required: ['title', 'year', 'date', 'issuer', 'rank'],
};

const PROMPT = `Look at the attached award certificate, trophy plaque, or competition document and extract the metadata.

Be conservative: if you can't read a field with confidence, return null. Don't guess or invent values. For rank, only fill it if the document explicitly shows a position (e.g. "1st Place", "Gold Medal"); leave null for participation certificates.`;

// Normalize/validate whatever a provider returned into our exact contract.
// Returns null if the response is unrecognizable (caller should treat as
// extraction failure and fall back to manual entry).
function normalize(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const out = {};
  for (const k of SCHEMA_FIELDS) {
    const v = raw[k];
    if (v == null) { out[k] = null; continue; }
    if (typeof v === 'string') {
      const trimmed = v.trim();
      out[k] = trimmed === '' || /^(null|n\/?a|unknown)$/i.test(trimmed) ? null : trimmed;
    } else {
      out[k] = String(v);
    }
  }
  return out;
}

module.exports = { SCHEMA, SCHEMA_FIELDS, PROMPT, normalize };
