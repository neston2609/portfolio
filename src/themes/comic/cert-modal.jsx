// Shared certificate modal — comic style
// Bold black borders, hard offset shadow, halftone backdrop, "stamp" mark.

const { useEffect: useEffectM } = React;

function CertificateModal({ cert, lang, onClose, palette }) {
  useEffectM(() => {
    if (!cert) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [cert, onClose]);

  if (!cert) return null;

  const ink = palette?.ink || '#1a1a1a';
  const paper = palette?.paper || '#fffaf0';
  const accent = palette?.accent || '#ef4444';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 12, 18, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        animation: 'cmFade .25s ease',
      }}
    >
      <style>{`
        @keyframes cmFade { from { opacity:0 } to { opacity:1 } }
        @keyframes cmPop  { 0% { opacity:0; transform: scale(.6) rotate(-6deg) } 60% { transform: scale(1.05) rotate(2deg) } 100% { opacity:1; transform: scale(1) rotate(-1.5deg) } }
        @keyframes cmStamp { 0%{transform: rotate(8deg) scale(2); opacity:0} 70%{transform: rotate(-12deg) scale(1.1); opacity:1} 100%{transform: rotate(-8deg) scale(1); opacity:.85} }
      `}</style>

      {/* Halftone backdrop bursts */}
      <div style={{position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden'}}>
        {['10%','75%','25%','85%'].map((top,i)=>(
          <div key={i} style={{
            position:'absolute',
            top: top, left: i%2 ? 'auto' : `${5 + i*8}%`, right: i%2 ? `${5 + i*8}%` : 'auto',
            width: 120, height: 120,
            background: `radial-gradient(circle, ${paper}55 18%, transparent 19%) 0 0/14px 14px`,
            transform: `rotate(${i*20}deg)`,
            opacity: .5,
          }} />
        ))}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(680px, 100%)',
          background: paper,
          color: ink,
          border: `4px solid ${ink}`,
          borderRadius: '8px',
          overflow: 'visible',
          animation: 'cmPop .45s cubic-bezier(.2,1.4,.4,1)',
          boxShadow: `12px 12px 0 ${ink}`,
          position: 'relative',
          transform: 'rotate(-1.5deg)',
        }}
      >
        {/* halftone strip top */}
        <div style={{
          height: '14px',
          background: `radial-gradient(circle, ${ink} 1.5px, transparent 1.6px) 0 0 / 10px 10px`,
          borderBottom: `4px solid ${ink}`,
        }} />

        {/* Certificate body */}
        <div style={{
          background: cert.color || '#fde047',
          padding: '40px 36px 32px',
          position: 'relative',
          borderBottom: `4px solid ${ink}`,
        }}>
          {/* Star burst — top right */}
          <Burst color={accent} ink={ink} style={{position:'absolute', top:-24, right:-24, width:90, height:90}} text={lang==='th'?'เจ๋ง!':'COOL!'} />

          <div style={{
            display:'inline-block',
            background: ink, color: paper,
            padding: '6px 14px',
            border: `3px solid ${ink}`,
            fontFamily: '"Bangers", "IBM Plex Sans Thai", system-ui, sans-serif',
            fontSize: '14px',
            letterSpacing: '.15em',
            marginBottom: '18px',
            transform: 'rotate(-2deg)',
          }}>
            {lang === 'th' ? '★ ใบรับรอง ★' : '★ CERTIFICATE ★'}
          </div>

          <div style={{
            fontFamily: '"Bangers", "IBM Plex Sans Thai", system-ui, sans-serif',
            fontSize: '40px',
            lineHeight: 1.05,
            letterSpacing: '.01em',
            marginBottom: '24px',
            textShadow: `3px 3px 0 ${paper}`,
            maxWidth: '480px',
          }}>
            {L(cert.name, lang)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px' }}>
            <div>
              <div style={kmKey(ink)}>{lang === 'th' ? 'มอบให้' : 'AWARDED TO'}</div>
              <div style={kmVal()}>{L(PORTFOLIO_DATA.meta.name, lang)}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={kmKey(ink)}>{lang === 'th' ? 'โดย' : 'FROM'}</div>
              <div style={kmVal()}>{L(cert.issuer, lang)}</div>
              <div style={{fontFamily:'"JetBrains Mono", monospace', fontSize:'12px', opacity:.7, marginTop:'2px'}}>{cert.date}</div>
            </div>
          </div>

          {/* APPROVED stamp */}
          <div style={{
            position:'absolute', bottom: 20, right: 24,
            border: `3px solid ${accent}`,
            color: accent,
            padding: '4px 12px',
            fontFamily: '"Bangers", system-ui, sans-serif',
            fontSize: '20px',
            letterSpacing: '.12em',
            transform: 'rotate(-8deg)',
            animation: 'cmStamp .8s .35s both cubic-bezier(.2,1.5,.5,1)',
            background: `${paper}aa`,
          }}>
            ✓ {lang === 'th' ? 'ของแท้!' : 'VERIFIED!'}
          </div>
        </div>

        {/* Attached scan / PDF — only renders when admin has uploaded a file */}
        {cert.file_url && (
          <AttachedFile url={cert.file_url} ink={ink} paper={paper} lang={lang} />
        )}

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '12px',
          background: paper,
        }}>
          <div>№ {cert.id.toUpperCase()}</div>
          <button
            onClick={onClose}
            style={{
              background: ink,
              color: paper,
              border: `3px solid ${ink}`,
              padding: '8px 18px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontFamily: '"Bangers", system-ui, sans-serif',
              fontSize: '16px',
              letterSpacing: '.1em',
              boxShadow: `4px 4px 0 ${accent}`,
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={(e)=>{e.currentTarget.style.transform='translate(-2px,-2px)';e.currentTarget.style.boxShadow=`6px 6px 0 ${accent}`}}
            onMouseLeave={(e)=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=`4px 4px 0 ${accent}`}}
          >
            {lang === 'th' ? 'ปิด' : 'CLOSE'} · ESC
          </button>
        </div>
      </div>
    </div>
  );
}

function kmKey(ink) {
  return {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '10px',
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    opacity: .65,
    marginBottom: '4px',
  };
}
function kmVal() {
  return {
    fontFamily: '"Bangers", "IBM Plex Sans Thai", system-ui, sans-serif',
    fontSize: '18px',
    letterSpacing: '.02em',
  };
}

// Reusable starburst with text inside
function Burst({ color, ink, style, text, fontSize = 14 }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{filter: `drop-shadow(3px 3px 0 ${ink})`}}>
        <polygon
          points="50,2 58,28 84,12 72,38 98,46 72,56 86,80 60,72 56,98 42,74 18,90 26,62 2,52 28,42 14,18 40,30"
          fill={color}
          stroke={ink}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
      {text && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: '"Bangers", system-ui, sans-serif',
          fontSize: `${fontSize}px`,
          color: ink,
          letterSpacing: '.05em',
          transform: 'rotate(-8deg)',
          textAlign: 'center',
          lineHeight: 1,
        }}>{text}</div>
      )}
    </div>
  );
}

// Renders a cert.file_url uploaded via the admin. Detects PDF vs image
// from the URL extension. Image is shown inline; PDF gets a button to
// open in a new tab (browsers handle the rendering).
function AttachedFile({ url, ink, paper, lang }) {
  const isPdf = /\.pdf(\?|$)/i.test(url);
  const isImg = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
  return (
    <div style={{
      padding: '20px 24px',
      borderBottom: `4px solid ${ink}`,
      background: paper,
    }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace', fontSize: 10,
        letterSpacing: '.18em', textTransform: 'uppercase',
        opacity: .65, marginBottom: 10,
      }}>{lang === 'th' ? 'ใบจริง' : 'ORIGINAL DOCUMENT'}</div>
      {isImg && (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
          <img src={url} alt="" style={{
            display: 'block', width: '100%', maxHeight: 420, objectFit: 'contain',
            border: `3px solid ${ink}`, borderRadius: 4, background: '#fff',
          }} />
        </a>
      )}
      {!isImg && (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: ink, color: paper, textDecoration: 'none',
          padding: '10px 18px', borderRadius: 6,
          fontFamily: '"Bangers", system-ui, sans-serif', fontSize: 16, letterSpacing: '.08em',
          border: `3px solid ${ink}`, boxShadow: `4px 4px 0 ${paper}, 4px 4px 0 1px ${ink}`,
        }}>
          {isPdf ? '📄' : '↗'} {lang === 'th' ? 'เปิดเอกสาร' : 'OPEN DOCUMENT'}
        </a>
      )}
    </div>
  );
}

window.CertificateModal = CertificateModal;
window.ComicBurst = Burst;
