// Award / certificate metadata extraction — provider-agnostic dispatcher.
//
// Resolves the active provider config (DB-stored → env-var fallback), invokes
// the matching provider module, normalizes the result, and returns the same
// {title, year, date, issuer, rank} shape regardless of vendor.
//
// Returns null on any failure (missing config, network error, malformed
// response) so the caller can fall back to manual entry.

const config = require('../config');
const settings = require('./settings');

const PROVIDERS = {
  anthropic: require('./ai-providers/anthropic'),
  openai: require('./ai-providers/openai'),
  openai_compatible: require('./ai-providers/openai'), // same module, different base_url
  google: require('./ai-providers/google'),
};

const SETTING_KEY = 'ai_extract';

const PROVIDER_LABELS = {
  anthropic: 'Anthropic Claude',
  openai: 'OpenAI',
  openai_compatible: 'OpenAI-compatible endpoint',
  google: 'Google Gemini',
};

// Resolve the current effective config. DB-stored value wins; if absent or
// disabled, falls back to ANTHROPIC_API_KEY env var (the legacy default).
// Returns null if nothing is configured.
async function loadConfig() {
  const stored = await settings.get(SETTING_KEY);
  if (stored && stored.enabled) {
    if (!stored.provider || !PROVIDERS[stored.provider]) return null;
    if (!stored.api_key) return null;
    return stored;
  }
  if (config.anthropicApiKey) {
    return { provider: 'anthropic', api_key: config.anthropicApiKey, model: PROVIDERS.anthropic.DEFAULT_MODEL, source: 'env' };
  }
  return null;
}

async function isAvailable() {
  return (await loadConfig()) != null;
}

// Public view of the current config — API keys masked. Used by the admin UI
// to render the settings page without exposing secrets to the browser.
async function publicStatus() {
  const stored = await settings.get(SETTING_KEY);
  const effective = await loadConfig();
  return {
    available: effective != null,
    effective_provider: effective?.provider || null,
    effective_source: effective?.source === 'env' ? 'env' : (stored ? 'database' : null),
    effective_model: effective?.model || null,
    config: stored
      ? { ...stored, api_key: stored.api_key ? maskKey(stored.api_key) : '' }
      : null,
    providers: Object.entries(PROVIDER_LABELS).map(([id, label]) => ({
      id,
      label,
      default_model: (PROVIDERS[id] || {}).DEFAULT_MODEL || null,
    })),
  };
}

async function saveConfig(input) {
  const provider = input?.provider;
  if (!provider || !PROVIDERS[provider]) {
    throw new Error('invalid provider — choose one of: ' + Object.keys(PROVIDER_LABELS).join(', '));
  }
  // If api_key is the masked placeholder, keep the existing one.
  const current = (await settings.get(SETTING_KEY)) || {};
  const next = {
    enabled: input.enabled !== false,
    provider,
    model: (input.model || '').trim() || PROVIDERS[provider].DEFAULT_MODEL,
    api_key: (input.api_key && !isMasked(input.api_key)) ? input.api_key.trim() : (current.api_key || ''),
    base_url: provider === 'openai_compatible' ? (input.base_url || '').trim() : '',
  };
  if (next.enabled && !next.api_key) throw new Error('api_key required when enabled');
  if (provider === 'openai_compatible' && next.enabled && !next.base_url) {
    throw new Error('base_url required for openai_compatible provider');
  }
  await settings.set(SETTING_KEY, next);
  return publicStatus();
}

async function clearConfig() {
  await settings.clear(SETTING_KEY);
  return publicStatus();
}

async function extractAwardData(filePath, mimeType) {
  const cfg = await loadConfig();
  if (!cfg) return { ok: false, error: 'no provider configured' };
  const impl = PROVIDERS[cfg.provider];
  if (!impl) return { ok: false, error: `unknown provider: ${cfg.provider}` };
  try {
    const result = await impl.extract(filePath, mimeType, cfg);
    if (!result) return { ok: false, error: 'provider returned no data' };
    return { ok: true, data: result };
  } catch (e) {
    console.warn(`[ai-extract] ${cfg.provider} extract failed:`, e.message);
    return { ok: false, error: e.message || String(e) };
  }
}

// Run a tiny text-only round-trip against the configured provider to verify
// api_key + model + network. Returns { ok, reply | error, provider, model }.
async function testCurrent() {
  const cfg = await loadConfig();
  if (!cfg) return { ok: false, error: 'no provider configured' };
  const impl = PROVIDERS[cfg.provider];
  if (!impl?.test) return { ok: false, error: `provider ${cfg.provider} has no test function` };
  try {
    const reply = await impl.test(cfg);
    return { ok: true, reply, provider: cfg.provider, model: cfg.model || impl.DEFAULT_MODEL };
  } catch (e) {
    console.warn(`[ai-extract] ${cfg.provider} test failed:`, e.message);
    return { ok: false, error: e.message || String(e), provider: cfg.provider, model: cfg.model || impl.DEFAULT_MODEL };
  }
}

function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '***';
  return key.slice(0, 4) + '…' + key.slice(-4);
}
function isMasked(s) { return typeof s === 'string' && s.includes('…'); }

module.exports = { isAvailable, publicStatus, saveConfig, clearConfig, extractAwardData, testCurrent };
