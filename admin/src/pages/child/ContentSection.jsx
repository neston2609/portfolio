// One Content sub-page — renders the editor for the section named in the
// URL :section param. Each editor is rendered with `bare` so it shows
// without the collapsible card wrapper (we're already inside a Panel).

import React from 'react';
import { useParams, useOutletContext, Navigate } from 'react-router-dom';
import { api } from '../../api.js';
import {
  MetaEditor, AboutEditor, PowersEditor, EducationEditor, ProjectsEditor,
  YoutubeEditor, ScratchEditor, GalleryEditor, AchievementsEditor,
  AwardsEditor, CertificatesEditor, SocialEditor,
} from '../../components/PortfolioForm.jsx';

export default function ContentSection() {
  const { section } = useParams();
  const { dataObj, setDataObj, dataText, setDataText, childId, portfolioUrl, aiAvailable } = useOutletContext();

  const setKey = (key) => (next) => setDataObj({ ...dataObj, [key]: next });
  const fileCtx = { uploadUrl: `/children/${childId}/media`, previewBase: portfolioUrl, api };
  const galleryCtx = { zipImportUrl: `/children/${childId}/gallery/import-zip`, api };
  const extractCtx = { extractUrl: `/children/${childId}/extract-from-file`, api, available: aiAvailable };

  switch (section) {
    case 'hero':
      return <MetaEditor bare data={dataObj} onChange={setDataObj} />;
    case 'about':
      return <AboutEditor bare value={dataObj.about} onChange={setKey('about')} />;
    case 'powers':
      return <PowersEditor bare value={dataObj.powers} onChange={setKey('powers')} />;
    case 'education':
      return <EducationEditor bare value={dataObj.education} onChange={setKey('education')} />;
    case 'projects':
      return <ProjectsEditor bare value={dataObj.projects} onChange={setKey('projects')} />;
    case 'youtube':
      return <YoutubeEditor bare value={dataObj.youtube} onChange={setKey('youtube')} />;
    case 'scratch':
      return <ScratchEditor bare value={dataObj.scratch} onChange={setKey('scratch')} />;
    case 'gallery':
      return <GalleryEditor bare value={dataObj.gallery} onChange={setKey('gallery')} fileCtx={fileCtx} galleryCtx={galleryCtx} />;
    case 'achievements':
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          <AchievementsEditor bare value={dataObj.achievements} onChange={setKey('achievements')} />
          <AwardsEditor bare value={dataObj.awards} onChange={setKey('awards')} fileCtx={fileCtx} extractCtx={extractCtx} />
          <CertificatesEditor bare value={dataObj.certificates} onChange={setKey('certificates')} fileCtx={fileCtx} extractCtx={extractCtx} />
        </div>
      );
    case 'social':
      return <SocialEditor bare value={dataObj.social} onChange={setKey('social')} fileCtx={fileCtx} />;
    case 'json':
      return (
        <div style={{ display: 'grid', gap: 10 }}>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>
            Multilang fields use {`{"en": "...", "th": "..."}`}. Edit here for bulk paste / power-user changes.
            When you press Save above, this view's text is parsed (if it differs from the form's data).
          </p>
          <textarea
            value={dataText}
            onChange={(e) => setDataText(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%', minHeight: 480, padding: 14, fontSize: 12,
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              background: '#0b1220', color: '#a5f3fc',
              border: '1px solid #334155', borderRadius: 6,
            }}
          />
        </div>
      );
    default:
      return <Navigate to="hero" replace />;
  }
}
