// Full structured editor for a child's portfolio JSON.
// Each section maps 1:1 to a key in data.js from the design.
// Multilang fields use the {en: "..."} shape so v2's Thai toggle plugs in later.

import React from 'react';
import { TextField, MultilangField, NumberField, ColorField, ArrayField, Section, Row, FileAttachField, DateField } from './fields.jsx';

export default function PortfolioForm({ data, onChange, childId, portfolioUrl, api, aiAvailable }) {
  // Helper: replace a top-level section with a patched copy.
  const setSection = (key) => (next) => onChange({ ...data, [key]: next });
  const meta = data.meta || {};
  const setMeta = (patch) => onChange({ ...data, meta: { ...meta, ...patch } });
  // Context used by per-item file-attach fields (certs/awards).
  const fileCtx = { uploadUrl: `/children/${childId}/media`, previewBase: portfolioUrl, api };
  // Extract context for AI auto-fill button.
  const extractCtx = { extractUrl: `/children/${childId}/extract-from-file`, api, available: aiAvailable };

  return (
    <div>
      {/* META — non-name fields that appear in hero/nav of the theme */}
      <Section title="Hero / meta" defaultOpen>
        <Row cols={2}>
          <MultilangField label="Role / tagline" value={meta.role} onChange={(v) => setMeta({ role: v })} placeholder="Tiny Explorer" />
          <DateField label="Date of Birth (age is calculated for the portfolio)" value={meta.dob} onChange={(v) => setMeta({ dob: v, age: undefined })} hint={meta.dob ? `currently ${ageFromDob(meta.dob)} years old` : 'YYYY-MM-DD'} />
          <MultilangField label="Grade" value={meta.grade} onChange={(v) => setMeta({ grade: v })} placeholder="Grade 6" />
          <MultilangField label="School (display)" value={meta.school} onChange={(v) => setMeta({ school: v })} />
          <MultilangField label="Location" value={meta.location} onChange={(v) => setMeta({ location: v })} placeholder="Bangkok" />
          <MultilangField label="Motto" value={meta.motto} onChange={(v) => setMeta({ motto: v })} placeholder="Curious + Brave = ME!" />
          <MultilangField label="Hello phrase" value={meta.hello} onChange={(v) => setMeta({ hello: v })} placeholder="Hi there!" />
          <MultilangField label="Catch / pow word" value={meta.catch} onChange={(v) => setMeta({ catch: v })} placeholder="POW!" />
          <MultilangField label="Availability" value={meta.available} onChange={(v) => setMeta({ available: v })} placeholder="Ready for adventure!" />
          <TextField label="Contact email" value={meta.email} onChange={(v) => setMeta({ email: v })} placeholder="kong@example.com" />
        </Row>
      </Section>

      <AboutEditor value={data.about} onChange={setSection('about')} />
      <PowersEditor value={data.powers} onChange={setSection('powers')} />
      <EducationEditor value={data.education} onChange={setSection('education')} />
      <ProjectsEditor value={data.projects} onChange={setSection('projects')} />
      <YoutubeEditor value={data.youtube} onChange={setSection('youtube')} />
      <ScratchEditor value={data.scratch} onChange={setSection('scratch')} />
      <GalleryEditor value={data.gallery} onChange={setSection('gallery')} fileCtx={fileCtx} />
      <AchievementsEditor value={data.achievements} onChange={setSection('achievements')} />
      <AwardsEditor value={data.awards} onChange={setSection('awards')} fileCtx={fileCtx} extractCtx={extractCtx} />
      <CertificatesEditor value={data.certificates} onChange={setSection('certificates')} fileCtx={fileCtx} extractCtx={extractCtx} />
      <SocialEditor value={data.social} onChange={setSection('social')} fileCtx={fileCtx} />
    </div>
  );
}

// ---- per-section editors --------------------------------------------------

function AboutEditor({ value, onChange }) {
  const v = value || {};
  return (
    <Section title="About" badge={(v.favorites || []).length + ' favorites'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="About Me" />
      <MultilangField label="Intro paragraph" value={v.intro} onChange={(x) => onChange({ ...v, intro: x })} multiline />
      <ArrayField
        label="Favorites"
        items={v.favorites}
        onChange={(x) => onChange({ ...v, favorites: x })}
        itemLabel="favorite"
        defaultItem={() => ({ label: { en: '' }, value: { en: '' } })}
        renderItem={(it, update) => (
          <Row cols={2}>
            <MultilangField label="Label" value={it.label} onChange={(x) => update({ label: x })} placeholder="Fave subject" />
            <MultilangField label="Value" value={it.value} onChange={(x) => update({ value: x })} placeholder="Science" />
          </Row>
        )}
      />
    </Section>
  );
}

function PowersEditor({ value, onChange }) {
  const v = value || {};
  return (
    <Section title="Powers / skills" badge={(v.items || []).length + ' items'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="Superpowers" />
      <ArrayField
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="power"
        defaultItem={() => ({ letter: 'X', name: { en: '' }, level: 3, color: '#3b82f6' })}
        renderItem={(it, update) => (
          <Row cols={4}>
            <TextField label="Badge letter" value={it.letter} onChange={(x) => update({ letter: (x || '').slice(0, 2).toUpperCase() })} />
            <MultilangField label="Name" value={it.name} onChange={(x) => update({ name: x })} placeholder="Math" />
            <NumberField label="Level (0–5)" value={it.level} onChange={(x) => update({ level: Math.max(0, Math.min(5, x ?? 0)) })} min={0} max={5} />
            <ColorField label="Color" value={it.color} onChange={(x) => update({ color: x })} />
          </Row>
        )}
      />
    </Section>
  );
}

function EducationEditor({ value, onChange }) {
  const v = value || {};
  return (
    <Section title="Education" badge={(v.items || []).length + ' entries'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="School" />
      <ArrayField
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="school entry"
        defaultItem={() => ({ period: '', school: { en: '' }, degree: { en: '' }, detail: { en: '' } })}
        renderItem={(it, update) => (
          <>
            <Row cols={2}>
              <TextField label="Period (e.g. 2023 — 2026)" value={it.period} onChange={(x) => update({ period: x })} />
              <MultilangField label="School" value={it.school} onChange={(x) => update({ school: x })} />
            </Row>
            <MultilangField label="Degree / grade" value={it.degree} onChange={(x) => update({ degree: x })} />
            <MultilangField label="Detail" value={it.detail} onChange={(x) => update({ detail: x })} placeholder="GPA 3.95 · Science club lead" />
          </>
        )}
      />
    </Section>
  );
}

function ProjectsEditor({ value, onChange }) {
  const v = value || {};
  return (
    <Section title="Projects / quests" badge={(v.items || []).length + ' projects'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="My Quests" />
      <ArrayField
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="project"
        defaultItem={() => ({ title: { en: '' }, kind: { en: '' }, year: String(new Date().getFullYear()), summary: { en: '' }, emoji: '🚀', bg: '#3b82f6' })}
        renderItem={(it, update) => (
          <>
            <Row cols={2}>
              <MultilangField label="Title" value={it.title} onChange={(x) => update({ title: x })} />
              <MultilangField label="Kind" value={it.kind} onChange={(x) => update({ kind: x })} placeholder="Science project" />
            </Row>
            <Row cols={3}>
              <TextField label="Year" value={it.year} onChange={(x) => update({ year: x })} />
              <TextField label="Emoji" value={it.emoji} onChange={(x) => update({ emoji: x })} />
              <ColorField label="Card color" value={it.bg} onChange={(x) => update({ bg: x })} />
            </Row>
            <MultilangField label="Summary" value={it.summary} onChange={(x) => update({ summary: x })} multiline />
          </>
        )}
      />
    </Section>
  );
}

function YoutubeEditor({ value, onChange }) {
  const v = value || {};
  const channel = v.channel || {};
  const setChannel = (patch) => onChange({ ...v, channel: { ...channel, ...patch } });
  return (
    <Section title="YouTube" badge={(v.items || []).length + ' videos (manual fallback)'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="My YouTube Channel" />

      <div style={{ padding: 12, border: '1px solid #14532d', borderRadius: 8, background: '#052e16', color: '#bbf7d0', fontSize: 13 }}>
        <strong>Live mode:</strong> when <code>YOUTUBE_API_KEY</code> is set in <code>.env</code> and the channel <em>handle</em> below is filled,
        the portfolio renders the channel's <strong>live subscriber count, total views, and the most recent videos</strong> (with thumbnails) — refreshed every 10 minutes.
        The manual stats and video list below are only used as a fallback (or when no API key is configured).
      </div>

      <div style={{ padding: 12, border: '1px dashed #334155', borderRadius: 8, background: '#0b1220', display: 'grid', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#cbd5e1' }}>Channel · only Handle + Max videos are needed for live mode</div>
        <Row cols={2}>
          <TextField label="Handle (e.g. @kong-adventures) — required for live mode" value={channel.handle} onChange={(x) => setChannel({ handle: x })} placeholder="@kong-adventures" />
          <NumberField label="Max videos to show" value={v.max_videos} onChange={(x) => onChange({ ...v, max_videos: x })} min={1} max={20} />
        </Row>
        <Row cols={2}>
          <MultilangField label="Name (override live)" value={channel.name} onChange={(x) => setChannel({ name: x })} placeholder="Kong Adventures" />
          <TextField label="URL (override live)" value={channel.url} onChange={(x) => setChannel({ url: x })} placeholder="https://youtube.com/@..." />
        </Row>
        <MultilangField label="Tagline (override live)" value={channel.tagline} onChange={(x) => setChannel({ tagline: x })} />
        <Row cols={3}>
          <TextField label="Subs (fallback only)" value={channel.subs} onChange={(x) => setChannel({ subs: x })} placeholder="1.2K" />
          <NumberField label="Videos (fallback only)" value={channel.videos} onChange={(x) => setChannel({ videos: x })} />
          <TextField label="Views (fallback only)" value={channel.views} onChange={(x) => setChannel({ views: x })} placeholder="38K" />
        </Row>
      </div>
      <ArrayField
        label="Videos (fallback list — used only when live fetch is disabled or fails)"
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="video"
        defaultItem={() => ({ title: { en: '' }, kind: { en: '' }, duration: '0:00', views: '0', date: '', emoji: '🎬', bg: '#3b82f6', url: '' })}
        renderItem={(it, update) => (
          <>
            <MultilangField label="Title" value={it.title} onChange={(x) => update({ title: x })} />
            <Row cols={2}>
              <MultilangField label="Kind" value={it.kind} onChange={(x) => update({ kind: x })} placeholder="Fun science" />
              <TextField label="Date (YYYY-MM)" value={it.date} onChange={(x) => update({ date: x })} placeholder="2025-11" />
            </Row>
            <Row cols={4}>
              <TextField label="Duration" value={it.duration} onChange={(x) => update({ duration: x })} placeholder="8:24" />
              <TextField label="Views" value={it.views} onChange={(x) => update({ views: x })} placeholder="12K" />
              <TextField label="Emoji" value={it.emoji} onChange={(x) => update({ emoji: x })} />
              <ColorField label="Card color" value={it.bg} onChange={(x) => update({ bg: x })} />
            </Row>
            <TextField label="Video URL" value={it.url} onChange={(x) => update({ url: x })} placeholder="https://youtube.com/watch?v=..." />
          </>
        )}
      />
    </Section>
  );
}

function ScratchEditor({ value, onChange }) {
  const v = value || {};
  const profile = v.profile || {};
  const setProfile = (patch) => onChange({ ...v, profile: { ...profile, ...patch } });
  return (
    <Section title="Scratch" badge={(v.items || []).length + ' projects (manual fallback)'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="My Scratch Projects" />
      <MultilangField label="Intro paragraph" value={v.intro} onChange={(x) => onChange({ ...v, intro: x })} multiline />

      <div style={{ padding: 12, border: '1px solid #14532d', borderRadius: 8, background: '#052e16', color: '#bbf7d0', fontSize: 13 }}>
        <strong>Live mode:</strong> just set the Scratch <em>username</em> below and how many projects to show. The portfolio
        pulls each project's <strong>title, thumbnail, views, loves, favorites, remixes</strong> live from <code>api.scratch.mit.edu</code>
        (no API key needed) and links every card to the real Scratch project page. Refreshes every 10 minutes.
      </div>

      <div style={{ padding: 12, border: '1px dashed #334155', borderRadius: 8, background: '#0b1220', display: 'grid', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#cbd5e1' }}>Profile · only Handle + Max projects are needed for live mode</div>
        <Row cols={2}>
          <TextField label="Handle (Scratch username) — required for live mode" value={profile.handle} onChange={(x) => setProfile({ handle: x })} placeholder="kong-coder" />
          <NumberField label="Max projects to show" value={v.max_projects} onChange={(x) => onChange({ ...v, max_projects: x })} min={1} max={40} />
        </Row>
        <Row cols={2}>
          <NumberField label="Followers (fallback only — Scratch's public API doesn't expose this)" value={profile.followers} onChange={(x) => setProfile({ followers: x })} />
          <TextField label="URL (overrides live)" value={profile.url} onChange={(x) => setProfile({ url: x })} />
        </Row>
      </div>
      <ArrayField
        label="Projects (fallback list — used only when live fetch is disabled or fails)"
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="scratch project"
        defaultItem={() => ({ title: { en: '' }, kind: { en: '' }, plays: '0', loves: 0, blocks: 0, emoji: '🎮', bg: '#312e81', url: '' })}
        renderItem={(it, update) => (
          <>
            <MultilangField label="Title" value={it.title} onChange={(x) => update({ title: x })} />
            <Row cols={2}>
              <MultilangField label="Kind" value={it.kind} onChange={(x) => update({ kind: x })} placeholder="Game" />
              <TextField label="Plays" value={it.plays} onChange={(x) => update({ plays: x })} />
            </Row>
            <Row cols={4}>
              <NumberField label="Loves" value={it.loves} onChange={(x) => update({ loves: x })} />
              <NumberField label="Blocks" value={it.blocks} onChange={(x) => update({ blocks: x })} />
              <TextField label="Emoji" value={it.emoji} onChange={(x) => update({ emoji: x })} />
              <ColorField label="Card color" value={it.bg} onChange={(x) => update({ bg: x })} />
            </Row>
            <TextField label="Project URL" value={it.url} onChange={(x) => update({ url: x })} placeholder="https://scratch.mit.edu/projects/..." />
          </>
        )}
      />
    </Section>
  );
}

function GalleryEditor({ value, onChange, fileCtx }) {
  const v = value || {};
  return (
    <Section title="Gallery" badge={(v.items || []).length + ' tiles'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="Gallery" />
      <MultilangField label="Intro" value={v.intro} onChange={(x) => onChange({ ...v, intro: x })} />
      <ArrayField
        label="Gallery tiles"
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="tile"
        defaultItem={() => ({ kind: 'photo', size: 'sm', label: { en: '' }, emoji: '📷', bg: '#3b82f6', file_url: '' })}
        renderItem={(it, update) => (
          <>
            <MultilangField label="Label" value={it.label} onChange={(x) => update({ label: x })} />
            <Row cols={4}>
              <Select label="Kind" value={it.kind} onChange={(x) => update({ kind: x })} options={[['photo', 'Photo'], ['video', 'Video']]} />
              <Select label="Size" value={it.size} onChange={(x) => update({ size: x })} options={[['sm', 'Small'], ['md', 'Medium (2×1)'], ['lg', 'Large (2×2)']]} />
              <TextField label="Emoji (fallback when no image)" value={it.emoji} onChange={(x) => update({ emoji: x })} />
              <ColorField label="Tile color" value={it.bg} onChange={(x) => update({ bg: x })} />
            </Row>
            {it.kind === 'video' &&
              <TextField label="Video duration (mm:ss)" value={it.duration} onChange={(x) => update({ duration: x })} placeholder="0:48" />}
            <FileAttachField
              label="Tile image (shown on the tile + in the lightbox when clicked)"
              value={it.file_url}
              onChange={(url) => update({ file_url: url })}
              accept="image/*"
              {...fileCtx}
            />
          </>
        )}
      />
    </Section>
  );
}

function AchievementsEditor({ value, onChange }) {
  const v = value || {};
  return (
    <Section title="Achievements (header only — Awards + Certificates render inside)">
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="Achievements" />
    </Section>
  );
}

function AwardsEditor({ value, onChange, fileCtx, extractCtx }) {
  const v = value || {};
  return (
    <Section title="Awards / Trophies" badge={(v.items || []).length + ' awards'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="Trophies" />
      <ArrayField
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="award"
        defaultItem={() => ({ year: String(new Date().getFullYear()), rank: { en: 'GOLD' }, medal: '🥇', name: { en: '' }, file_url: '' })}
        renderItem={(it, update) => (
          <>
            <Row cols={3}>
              <TextField label="Year" value={it.year} onChange={(x) => update({ year: x })} />
              <MultilangField label="Rank" value={it.rank} onChange={(x) => update({ rank: x })} placeholder="GOLD" />
              <TextField label="Medal emoji" value={it.medal} onChange={(x) => update({ medal: x })} placeholder="🥇" />
            </Row>
            <MultilangField label="Award name" value={it.name} onChange={(x) => update({ name: x })} />
            <FileAttachField
              label="Trophy photo / certificate (image or PDF)"
              value={it.file_url}
              onChange={(url) => update({ file_url: url })}
              {...fileCtx}
            />
            <ExtractButton
              fileUrl={it.file_url}
              ctx={extractCtx}
              apply={(d) => update({
                name: d.title ? { en: d.title } : it.name,
                year: d.year || it.year,
                rank: d.rank ? { en: d.rank } : it.rank,
              })}
            />
          </>
        )}
      />
    </Section>
  );
}

function CertificatesEditor({ value, onChange, fileCtx, extractCtx }) {
  const v = value || {};
  return (
    <Section title="Certificates" badge={(v.items || []).length + ' certificates'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="Certificates" />

      <div style={{ padding: 12, border: '1px dashed #334155', borderRadius: 8, background: '#0b1220' }}>
        <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 8 }}>Filter categories</div>
        <ArrayField
          items={v.categories}
          onChange={(x) => onChange({ ...v, categories: x })}
          itemLabel="category"
          defaultItem={() => ({ id: '', label: { en: '' } })}
          renderItem={(it, update) => (
            <Row cols={2}>
              <TextField label="ID (lowercase, no spaces)" value={it.id} onChange={(x) => update({ id: x.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
              <MultilangField label="Label" value={it.label} onChange={(x) => update({ label: x })} />
            </Row>
          )}
        />
      </div>

      <ArrayField
        label="Certificates"
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="certificate"
        defaultItem={() => ({ id: 'cert-' + Math.random().toString(36).slice(2, 8), name: { en: '' }, issuer: { en: '' }, date: '', category: 'all', color: '#fde047', file_url: '' })}
        renderItem={(it, update, i) => {
          const categories = v.categories || [];
          return (
            <>
              <MultilangField label="Certificate name" value={it.name} onChange={(x) => update({ name: x })} />
              <Row cols={2}>
                <MultilangField label="Issuer" value={it.issuer} onChange={(x) => update({ issuer: x })} />
                <TextField label="Date (YYYY-MM)" value={it.date} onChange={(x) => update({ date: x })} placeholder="2025-12" />
              </Row>
              <Row cols={3}>
                <TextField label="ID (unique)" value={it.id} onChange={(x) => update({ id: x })} />
                <Select label="Category" value={it.category} onChange={(x) => update({ category: x })}
                        options={categories.map((c) => [c.id, (c.label?.en || c.id)])} />
                <ColorField label="Background color" value={it.color} onChange={(x) => update({ color: x })} />
              </Row>
              <FileAttachField
                label="Certificate scan / PDF (shown in the certificate modal)"
                value={it.file_url}
                onChange={(url) => update({ file_url: url })}
                {...fileCtx}
              />
              <ExtractButton
                fileUrl={it.file_url}
                ctx={extractCtx}
                apply={(d) => update({
                  name: d.title ? { en: d.title } : it.name,
                  issuer: d.issuer ? { en: d.issuer } : it.issuer,
                  date: d.date || (d.year ? d.year : it.date),
                })}
              />
            </>
          );
        }}
      />
    </Section>
  );
}

function SocialEditor({ value, onChange, fileCtx }) {
  const v = value || {};
  return (
    <Section title="Social / Contact" badge={(v.items || []).length + ' links'}>
      <MultilangField label="Section title" value={v.title} onChange={(x) => onChange({ ...v, title: x })} placeholder="Send me a message" />
      <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
        Themes show an icon instead of the label. Built-in icons are auto-picked for YouTube, Facebook, Instagram,
        X/Twitter, TikTok, Discord, Email, Phone, GitHub, LinkedIn, School. Set <strong>Platform</strong> to override
        the detection, or upload a custom icon.
      </p>
      <ArrayField
        items={v.items}
        onChange={(x) => onChange({ ...v, items: x })}
        itemLabel="link"
        defaultItem={() => ({ label: '', value: '', href: '', platform: '', icon_url: '' })}
        renderItem={(it, update) => (
          <>
            <Row cols={3}>
              <TextField label="Label (tooltip)" value={it.label} onChange={(x) => update({ label: x })} placeholder="Email" />
              <TextField label="Display value" value={typeof it.value === 'string' ? it.value : (it.value?.en || '')}
                         onChange={(x) => update({ value: x })} placeholder="me@example.com" />
              <TextField label="URL (href)" value={it.href} onChange={(x) => update({ href: x })} placeholder="mailto:..." />
            </Row>
            <Row cols={2}>
              <Select label="Platform (auto if blank)" value={it.platform || ''} onChange={(x) => update({ platform: x })}
                      options={[['', 'Auto-detect'], ['youtube','YouTube'], ['facebook','Facebook'], ['instagram','Instagram'], ['twitter','X / Twitter'], ['tiktok','TikTok'], ['discord','Discord'], ['email','Email'], ['phone','Phone'], ['github','GitHub'], ['linkedin','LinkedIn'], ['school','School'], ['link','Generic link']]} />
              <FileAttachField
                label="Custom icon (overrides platform default)"
                value={it.icon_url}
                onChange={(url) => update({ icon_url: url })}
                accept="image/svg+xml,image/png,image/webp"
                {...fileCtx}
              />
            </Row>
          </>
        )}
      />
    </Section>
  );
}

// ---- helpers --------------------------------------------------------------

import { lbl, inp } from './fields.jsx';

// Mirror of the server-side calculator (src/routes/portfolio.js).
function ageFromDob(dob) {
  if (!dob) return null;
  const m = String(dob).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const birth = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (isNaN(birth)) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

// "Auto-fill from file" button shown under each award/certificate's
// FileAttachField. Hidden when no file is attached, when the AI key isn't
// configured, or when a request is already in flight.
function ExtractButton({ fileUrl, ctx, apply }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(null);
  const [okMsg, setOkMsg] = React.useState(null);
  if (!fileUrl || !ctx?.available) return null;

  async function run() {
    setBusy(true); setErr(null); setOkMsg(null);
    try {
      const data = await ctx.api.post(ctx.extractUrl, { file_url: fileUrl });
      apply(data);
      const filled = ['title', 'year', 'date', 'issuer', 'rank'].filter((k) => data[k] != null);
      setOkMsg(filled.length ? `Filled: ${filled.join(', ')}` : 'No fields could be read with confidence');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <button type="button" onClick={run} disabled={busy} style={{
        background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6,
        padding: '6px 14px', fontSize: 12, cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.6 : 1, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        {busy ? 'Reading…' : '✨ Auto-fill from file (Claude)'}
      </button>
      {okMsg && <span style={{ color: '#86efac', fontSize: 12 }}>{okMsg}</span>}
      {err && <span style={{ color: '#fca5a5', fontSize: 12 }}>{err}</span>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={lbl}>
      {label && <span>{label}</span>}
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={inp}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}
