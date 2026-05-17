// GenAI provider settings — choose Anthropic / OpenAI / Google / a custom
// OpenAI-compatible endpoint, set the API key + model, and save. Used by the
// admin's "Auto-fill from file" button on Awards and Certificates.
//
// The current API key is shown masked (first 4 + last 4). Leaving the masked
// value in place when saving keeps the existing secret; entering a fresh
// string replaces it.

import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { btn } from '../App.jsx';

export default function GenAI() {
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);
  const [loadErr, setLoadErr] = useState(null);

  async function refresh() {
    setLoadErr(null);
    try {
      const s = await api.get('/ai/status');
      setStatus(s);
      setForm({
        enabled: s.config?.enabled !== false,
        provider: s.config?.provider || s.effective_provider || 'anthropic',
        model: s.config?.model || s.effective_model || '',
        api_key: s.config?.api_key || '', // masked, or empty
        base_url: s.config?.base_url || '',
      });
    } catch (e) {
      setLoadErr(e.message || 'Failed to load GenAI status');
    }
  }
  useEffect(() => { refresh(); }, []);

  if (loadErr) return (
    <div>
      <h1 style={{ margin: 0 }}>GenAI</h1>
      <div style={{ marginTop: 18, padding: 18, background: '#7f1d1d33', border: '1px solid #7f1d1d', borderRadius: 8, color: '#fca5a5' }}>
        <strong>Couldn't load settings:</strong> {loadErr}
        <p style={{ margin: '10px 0 0', fontSize: 13, color: '#fca5a5' }}>
          If you just deployed, run <code>npm run migrate</code> on the server to create the <code>app_settings</code> table, then reload.
        </p>
        <button onClick={refresh} style={{ ...btn('ghost'), marginTop: 10 }}>Retry</button>
      </div>
    </div>
  );
  if (!status || !form) return <p>Loading…</p>;

  const providerMeta = status.providers.find((p) => p.id === form.provider);
  const isCompatible = form.provider === 'openai_compatible';

  async function save(e) {
    e?.preventDefault();
    setBusy(true); setErr(null); setOk(null);
    try {
      const updated = await api.put('/ai/settings', form);
      setStatus(updated);
      setOk('Saved.');
      // Re-read so masked key + effective_* fields refresh
      await refresh();
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function disable() {
    if (!confirm('Disable GenAI extraction? The "Auto-fill from file" button will disappear from Awards and Certificates editors.')) return;
    setBusy(true); setErr(null); setOk(null);
    try {
      await api.put('/ai/settings', { ...form, enabled: false });
      await refresh();
      setOk('Disabled.');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function destroy() {
    if (!confirm('Delete the saved configuration entirely? Falls back to the ANTHROPIC_API_KEY env var if set.')) return;
    setBusy(true); setErr(null); setOk(null);
    try {
      const s = await api.delete('/ai/settings');
      setStatus(s);
      await refresh();
      setOk('Configuration deleted.');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <h1 style={{ margin: 0 }}>GenAI</h1>
      <p style={{ color: '#94a3b8' }}>
        Pick the AI provider used by the <strong>Auto-fill from file</strong> button on Awards and Certificates.
        Uploads (image or PDF) are sent to the selected provider to extract title, year, issuer, and rank.
      </p>

      <section style={panel}>
        <h2 style={h2}>Current status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '6px 16px', fontSize: 14 }}>
          <span style={k}>Auto-fill available</span>
          <span>{status.available
            ? <span style={pill('#10b981')}>Yes</span>
            : <span style={pill('#475569')}>No</span>}</span>
          <span style={k}>Provider in use</span>
          <span>{status.effective_provider
            ? <>{labelFor(status, status.effective_provider)} <span style={{ color: '#64748b' }}>(from {status.effective_source})</span></>
            : '—'}</span>
          <span style={k}>Model in use</span>
          <span><code>{status.effective_model || '—'}</code></span>
        </div>
      </section>

      <form onSubmit={save} style={panel}>
        <h2 style={h2}>Configuration</h2>

        <Field label="Provider">
          <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value, model: '' })} style={inp}>
            {status.providers.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </Field>

        <Field label={`Model${providerMeta?.default_model ? ` (default: ${providerMeta.default_model})` : ''}`}>
          <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}
                 placeholder={providerMeta?.default_model || ''} style={inp} />
        </Field>

        {isCompatible && (
          <Field label="Base URL (OpenAI-compatible endpoint — required)">
            <input value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                   placeholder="https://api.example.com/v1" style={inp} />
            <span style={{ color: '#64748b', fontSize: 11 }}>
              For LiteLLM, Together, Groq, OpenRouter, vLLM, etc. Must implement OpenAI's <code>/chat/completions</code> with structured outputs.
            </span>
          </Field>
        )}

        <Field label="API key">
          <input type="password" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                 placeholder={status.config?.api_key ? 'leave unchanged to keep current key' : 'paste API key'} style={inp}
                 autoComplete="off" />
          <span style={{ color: '#64748b', fontSize: 11 }}>
            Stored in <code>app_settings</code>. The current value is shown masked above. Replace it by typing a new key; leave the masked value to keep the existing one.
          </span>
        </Field>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={form.enabled !== false} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          <span>Enable extraction (uncheck to hide the Auto-fill button without losing the config)</span>
        </label>

        {err && <div style={{ color: '#fca5a5', fontSize: 13 }}>{err}</div>}
        {ok && <div style={{ color: '#86efac', fontSize: 13 }}>{ok}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
          <button type="submit" disabled={busy} style={btn('primary')}>{busy ? 'Saving…' : 'Save configuration'}</button>
          {status.config && form.enabled && <button type="button" onClick={disable} disabled={busy} style={btn('ghost')}>Disable</button>}
          {status.config && <button type="button" onClick={destroy} disabled={busy} style={{ ...btn('ghost'), color: '#fca5a5' }}>Delete saved config</button>}
        </div>
      </form>

      <section style={panel}>
        <h2 style={h2}>Provider notes</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: 13, color: '#cbd5e1' }}>
          <dt style={{ fontWeight: 600 }}>Anthropic Claude</dt>
          <dd style={dd}>Native image + PDF input. Default <code>claude-opus-4-7</code>. Best fidelity on handwritten / noisy certificates. Get a key at <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>.</dd>
          <dt style={{ fontWeight: 600 }}>OpenAI</dt>
          <dd style={dd}>Native image + PDF input on <code>gpt-4o</code> / <code>gpt-4o-mini</code>. Default <code>gpt-4o-mini</code> for cost. Get a key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com</a>.</dd>
          <dt style={{ fontWeight: 600 }}>Google Gemini</dt>
          <dd style={dd}>Native image + PDF input. Default <code>gemini-2.5-flash</code> for cost. Get a key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com</a>.</dd>
          <dt style={{ fontWeight: 600 }}>OpenAI-compatible</dt>
          <dd style={dd}>Any endpoint exposing OpenAI's <code>/chat/completions</code> with JSON-schema structured outputs and vision: LiteLLM, OpenRouter, Together, Groq, vLLM, etc. PDF support depends on the host.</dd>
        </dl>
      </section>
    </div>
  );
}

function labelFor(status, id) {
  return status.providers.find((p) => p.id === id)?.label || id;
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#cbd5e1' }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const panel = { marginTop: 18, padding: 20, background: '#111827', border: '1px solid #1f2937', borderRadius: 10, display: 'grid', gap: 14 };
const h2 = { margin: '0 0 4px', fontSize: 16 };
const k = { color: '#94a3b8' };
const dd = { margin: 0 };
const inp = { background: '#0b1220', color: '#fffaf0', border: '1px solid #334155', borderRadius: 6, padding: '8px 10px', fontSize: 14, fontFamily: 'inherit', width: '100%' };
const pill = (bg) => ({ display: 'inline-block', background: bg, color: '#0b0f1e', padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 });
