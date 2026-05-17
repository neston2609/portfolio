// Danger zone — irreversible destructive operations.

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { btn } from '../../App.jsx';
import { Panel } from './_shared.jsx';

export default function Danger() {
  const { child, destroyChild } = useOutletContext();
  const [busy, setBusy] = useState(false);

  async function destroy() {
    if (!confirm(`Permanently delete ${child.firstname}'s portfolio? This removes all content, visibility settings, and every uploaded file. Cannot be undone.`)) return;
    setBusy(true);
    try { await destroyChild(); }
    catch (e) { alert(e.message); setBusy(false); }
  }

  return (
    <Panel title="Danger zone" tone="danger" subtitle="Irreversible. Read the prompt carefully before confirming.">
      <button onClick={destroy} disabled={busy} style={btn('danger')}>
        {busy ? 'Deleting…' : `Delete ${child.firstname}'s portfolio`}
      </button>
      <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>
        Removes the child record, the portfolio content and visibility settings, and the entire <code>uploads/children/{child.id}</code> directory.
        The subdomain <code>{child.firstname_slug}.rasikawan.com</code> will start returning 404 immediately.
      </p>
    </Panel>
  );
}
