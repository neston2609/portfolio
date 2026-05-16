// Variation 1 — "COMIC STRIP"
// Classic comic book page. Thick black panels in a grid, halftone backgrounds,
// speech bubbles, sound-effect bursts (POW! BAM!), classic primary colors.

const { useState: useStateC, useMemo: useMemoC } = React;

function PortfolioComic({ lang, onLangChange }) {
  const [cert, setCert] = useStateC(null);
  const [filter, setFilter] = useStateC('all');
  const [lightbox, setLightbox] = useStateC(null); // index into galleryImages
  const data = PORTFOLIO_DATA;
  const galleryImages = useMemoC(() => (data.gallery?.items || []).filter((g) => g.file_url), [data.gallery]);

  const palette = {
    paper: '#fffaf0',
    paperWarm: '#fde047',
    ink: '#1a1a1a',
    inkSoft: '#555',
    red: '#ef4444',
    blue: '#3b82f6',
    yellow: '#fbbf24',
    green: '#10b981',
    accent: '#ef4444',
  };

  const filteredCerts = useMemoC(() => {
    if (filter === 'all') return data.certificates.items;
    return data.certificates.items.filter((c) => c.category === filter);
  }, [filter]);

  const t = (en, th) => (lang === 'th' ? th : en);

  return (
    <div style={{
      background: palette.paper,
      color: palette.ink,
      fontFamily: '"Fredoka", "IBM Plex Sans Thai", system-ui, sans-serif',
      fontSize: '15px',
      lineHeight: 1.5,
      minHeight: '100vh',
      backgroundImage: `radial-gradient(circle, ${palette.ink}10 1px, transparent 1.2px)`,
      backgroundSize: '20px 20px',
    }}>
      <style>{`
        .c-display { font-family: "Bangers", "IBM Plex Sans Thai", system-ui, sans-serif; font-weight: 400; letter-spacing: .04em; line-height: 1; }
        .c-hand    { font-family: "Patrick Hand", "IBM Plex Sans Thai", system-ui, sans-serif; }
        .c-mono    { font-family: "JetBrains Mono", monospace; }
        .c-panel   { background: ${palette.paper}; border: 4px solid ${palette.ink}; box-shadow: 8px 8px 0 ${palette.ink}; border-radius: 6px; position: relative; }
        .c-halftone-y { background: ${palette.paperWarm} radial-gradient(circle, ${palette.ink}33 1.2px, transparent 1.3px) 0 0/8px 8px; }
        .c-halftone-r { background: ${palette.red} radial-gradient(circle, ${palette.ink}44 1.2px, transparent 1.3px) 0 0/8px 8px; }
        .c-halftone-b { background: ${palette.blue} radial-gradient(circle, ${palette.ink}33 1.2px, transparent 1.3px) 0 0/8px 8px; }
        .c-halftone-g { background: ${palette.green} radial-gradient(circle, ${palette.ink}33 1.2px, transparent 1.3px) 0 0/8px 8px; }
        .c-link { color: inherit; text-decoration: none; }
        .c-btn { font-family: "Bangers", system-ui, sans-serif; font-size: 18px; letter-spacing: .08em;
                 background: ${palette.yellow}; color: ${palette.ink}; border: 4px solid ${palette.ink};
                 padding: 10px 22px; border-radius: 999px; cursor: pointer; box-shadow: 5px 5px 0 ${palette.ink};
                 transition: transform .15s, box-shadow .15s; display: inline-flex; align-items: center; gap: 8px; }
        .c-btn:hover { transform: translate(-2px,-2px); box-shadow: 7px 7px 0 ${palette.ink}; }
        .c-btn.red { background: ${palette.red}; color: ${palette.paper}; }
        .c-btn.blue { background: ${palette.blue}; color: ${palette.paper}; }
        .c-chip { font-family: "Bangers", system-ui, sans-serif; letter-spacing: .06em;
                  background: ${palette.paper}; color: ${palette.ink}; border: 3px solid ${palette.ink};
                  padding: 4px 12px; border-radius: 999px; cursor: pointer; font-size: 13px;
                  transition: transform .15s, background .15s; }
        .c-chip:hover { transform: rotate(-2deg); }
        .c-chip.active { background: ${palette.ink}; color: ${palette.paper}; }
        .c-card { transition: transform .25s cubic-bezier(.2,1.4,.4,1); }
        .c-card:hover { transform: translate(-3px,-3px) rotate(-1deg); box-shadow: 12px 12px 0 ${palette.ink}; }
        @keyframes cRise { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: none; } }
        .c-section { animation: cRise .55s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes cWiggle { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        .c-wiggle { animation: cWiggle 3s ease-in-out infinite; transform-origin: center; }
        @keyframes cFloat { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-6px) rotate(3deg)} }
        .c-float { animation: cFloat 4s ease-in-out infinite; }
        @keyframes cMarq { from {transform:translateX(0)} to {transform:translateX(-50%)} }
        .c-marq-track { animation: cMarq 22s linear infinite; }
      `}</style>

      {/* TOP BAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: palette.paper + 'f0', backdropFilter: 'blur(8px)',
        borderBottom: `4px solid ${palette.ink}`,
      }}>
        <div style={{ ...cWrap, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <a href="#top" className="c-link" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{
              background: palette.red, color: palette.paper,
              width: 36, height: 36, borderRadius: '50%',
              border: `3px solid ${palette.ink}`,
              display: 'grid', placeItems: 'center', overflow: 'hidden',
              fontFamily: '"Bangers", system-ui', fontSize: 18,
              boxShadow: `3px 3px 0 ${palette.ink}`,
            }}>{data.meta.avatar_url
              ? <img src={data.meta.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : L(data.meta.nickname, lang).charAt(0)}</span>
            <span className="c-display" style={{ fontSize: 22 }}>{L(data.meta.name, lang)}</span>
          </a>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[['about','About','รู้จัก'],['powers','Powers','พลัง'],['quests','Quests','ภารกิจ'],['youtube','YouTube','ยูทูบ'],['scratch','Scratch','สแครชต์'],['gallery','Gallery','อัลบั้ม'],['achievements','Achievements','ความสำเร็จ']].map(([id,en,th])=>(
              <a key={id} href={`#${id}`} className="c-link c-hand" style={{ fontSize: 16, padding: '4px 10px' }}>{t(en,th)}</a>
            ))}
            <LangToggleComic lang={lang} onLangChange={onLangChange} palette={palette} />
          </div>
        </div>
      </nav>

      {/* HERO PAGE - 6 panel comic layout */}
      <section id="top" style={{ ...cWrap, paddingBlock: '32px' }} className="c-section">
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gridTemplateRows:'auto auto', gap: 20 }}>
          {/* Big intro panel */}
          <div className="c-panel c-halftone-y" style={{ gridRow:'1 / span 2', padding: '40px', display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight: 540, overflow:'hidden', position:'relative' }}>
            <div className="c-mono" style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', display:'flex', justifyContent:'space-between' }}>
              <span>★ {t('ISSUE #01','ฉบับ #01')} ★</span>
              <span>{t('THE BEGINNING','จุดเริ่มต้น')}</span>
            </div>

            <div>
              <SpeechBubble palette={palette} tail="left" style={{ marginBottom: 16, maxWidth: 260, transform: 'rotate(-3deg)' }}>
                <div className="c-hand" style={{ fontSize: 22 }}>{L(data.meta.hello, lang)}</div>
                <div className="c-hand" style={{ fontSize: 16, color: palette.inkSoft }}>{t("I'm", "ฉันชื่อ")} {L(data.meta.nickname, lang)}!</div>
              </SpeechBubble>
              <h1 className="c-display" style={{
                fontSize: 'clamp(64px, 9vw, 132px)',
                margin: 0,
                color: palette.ink,
                textShadow: `5px 5px 0 ${palette.red}, 6px 6px 0 ${palette.ink}`,
              }}>
                {L(data.meta.name, lang)}
              </h1>
              <div className="c-hand" style={{ marginTop: 12, fontSize: 24, transform:'rotate(-1deg)', display:'inline-block' }}>
                ✦ {L(data.meta.role, lang)} ✦
              </div>
              <div style={{ marginTop: 18, display:'flex', gap: 12, alignItems:'center', flexWrap:'wrap' }}>
                <a href="#contact" className="c-btn red">{t("LET'S TALK!", 'ทักทาย!')} →</a>
                <a href="#" className="c-btn">CV ↓</a>
              </div>
            </div>

            {/* POW burst */}
            <div style={{ position:'absolute', bottom: -20, right: -20, width: 180, height: 180 }} className="c-wiggle">
              <ComicBurst color={palette.red} ink={palette.ink} text={L(data.meta.catch, lang)} fontSize={32} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          {/* Identity card */}
          <div className="c-panel" style={{ padding: 24, overflow:'hidden', position:'relative' }}>
            <div className="c-mono" style={{ fontSize: 11, letterSpacing: '.15em', textTransform:'uppercase', marginBottom: 12 }}>
              · {t('CHARACTER CARD','การ์ดตัวละคร')}
            </div>
            <div style={{
              aspectRatio: '1', border: `4px solid ${palette.ink}`, borderRadius: 8,
              background: `${palette.blue} radial-gradient(circle, ${palette.ink}44 1.2px, transparent 1.3px) 0 0/8px 8px`,
              display: 'grid', placeItems: 'center', position:'relative', overflow:'hidden',
            }}>
              {data.meta.avatar_url ? (
                <img src={data.meta.avatar_url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
              ) : (
                <div className="c-display" style={{ fontSize: 80, color: palette.paper, textShadow: `4px 4px 0 ${palette.ink}` }}>
                  {L(data.meta.nickname, lang).charAt(0)}
                </div>
              )}
              <div className="c-hand" style={{ position:'absolute', bottom: 8, right: 12, fontSize: 12, color: palette.paper, background: palette.ink+'88', padding: '2px 8px', borderRadius: 4 }}>[ portrait ]</div>
            </div>
            <div className="c-display" style={{ fontSize: 28, marginTop: 12, lineHeight: 1 }}>{L(data.meta.nickname, lang)}</div>
            <div className="c-hand" style={{ fontSize: 15, color: palette.inkSoft }}>{t('Age','อายุ')} {data.meta.age} · {L(data.meta.grade, lang)}</div>
          </div>

          {/* Quick stats */}
          <div className="c-panel c-halftone-b" style={{ padding: 20, color: palette.paper }}>
            <div className="c-display" style={{ fontSize: 22, letterSpacing: '.08em' }}>{t('QUICK FACTS','ข้อมูลด่วน!')}</div>
            <div style={{ marginTop: 12, display:'grid', gap: 8 }}>
              {data.about.favorites.map((f, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:`2px dashed ${palette.paper}55`, paddingBottom: 6 }}>
                  <span className="c-hand" style={{ fontSize: 14, opacity: .85 }}>{L(f.label, lang)}</span>
                  <span className="c-display" style={{ fontSize: 18 }}>{L(f.value, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOUND MARQUEE */}
      <div style={{ background: palette.ink, borderBlock: `4px solid ${palette.ink}`, padding: '14px 0', overflow:'hidden' }}>
        <div className="c-marq-track" style={{ display:'flex', gap: 36, whiteSpace:'nowrap', width:'max-content' }}>
          {Array(2).fill(0).flatMap((_,k)=>(
            ['POW!','BAM!','ZAP!','WHAM!','BOOM!','ZOOM!','KAPOW!','WOW!','★','SWOOSH!','BLAM!','SPLAT!'].map((w,i)=>(
              <span key={`${k}-${i}`} className="c-display" style={{ fontSize: 32, color: [palette.yellow, palette.red, palette.paper, palette.green, palette.blue][i % 5] }}>
                {w}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" style={{ ...cWrap, paddingBlock: 48 }} className="c-section">
        <ChapterHeader num="01" title={L(data.about.title, lang)} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          <div className="c-panel" style={{ padding: 32, position:'relative', overflow:'visible' }}>
            <div style={{ position:'absolute', top:-16, left: 24, background: palette.yellow, border:`3px solid ${palette.ink}`, padding:'4px 12px', borderRadius: 999, fontFamily:'"Bangers"', letterSpacing:'.08em' }}>
              {t('NARRATION','เล่าเรื่อง')}
            </div>
            <p className="c-hand" style={{ fontSize: 24, lineHeight: 1.5, margin: 0 }}>
              {L(data.about.intro, lang)}
            </p>
          </div>
          <div className="c-panel c-halftone-r" style={{ padding: 24, color: palette.paper, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <SpeechBubble palette={palette} tail="bottom" thought>
              <div className="c-display" style={{ fontSize: 30, color: palette.ink, lineHeight: 1, textAlign:'center' }}>
                {L(data.about.intro, lang).length > 0 && L({th:'อยากรู้ + กล้า', en: 'CURIOUS + BRAVE'}, lang)}
              </div>
              <div className="c-display" style={{ fontSize: 30, color: palette.red, textAlign:'center', marginTop: 4 }}>= {t('ME!','ฉัน!')}</div>
            </SpeechBubble>
          </div>
        </div>
      </section>

      {/* SUPERPOWERS */}
      <section id="powers" style={{ ...cWrap, paddingBlock: 48 }} className="c-section">
        <ChapterHeader num="02" title={L(data.powers.title, lang)} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 20 }}>
          {data.powers.items.map((p, i) => (
            <div key={i} className="c-panel c-card" style={{ padding: 24, display:'flex', gap: 16, alignItems:'center' }}>
              <div style={{
                width: 64, height: 64, flex: '0 0 64px',
                background: p.color, color: '#fff',
                border: `4px solid ${palette.ink}`, borderRadius: 12,
                display:'grid', placeItems:'center',
                fontFamily:'"Bangers", system-ui', fontSize: 38, letterSpacing: '.04em',
                boxShadow: `4px 4px 0 ${palette.ink}`,
                transform: `rotate(${[-3,2,-1,3,-2,1][i%6]}deg)`,
              }}>{p.letter}</div>
              <div style={{ flex: 1 }}>
                <div className="c-display" style={{ fontSize: 24 }}>{L(p.name, lang)}</div>
                <div style={{ display:'flex', gap: 2, marginTop: 4 }}>
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ fontSize: 18, color: s <= p.level ? palette.yellow : palette.ink+'22', filter: s <= p.level ? `drop-shadow(1px 1px 0 ${palette.ink})` : 'none' }}>★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" style={{ ...cWrap, paddingBlock: 48 }} className="c-section">
        <ChapterHeader num="03" title={L(data.education.title, lang)} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns: data.education.items.length > 1 ? 'repeat(2, 1fr)' : '1fr', gap: 20 }}>
          {data.education.items.map((it, i) => (
            <div key={i} className="c-panel c-card" style={{ padding: 28, position:'relative', overflow:'visible' }}>
              <div style={{
                position:'absolute', top:-16, right: 16,
                background: i===0 ? palette.green : palette.blue, color: palette.paper,
                border:`3px solid ${palette.ink}`, padding:'4px 12px', borderRadius: 999,
                fontFamily:'"Bangers"', letterSpacing:'.08em', fontSize: 14,
                boxShadow: `3px 3px 0 ${palette.ink}`,
              }}>
                {i === 0 ? t('NOW','ตอนนี้') : t('PAST','ก่อนหน้านี้')}
              </div>
              <div className="c-mono" style={{ fontSize: 12, marginBottom: 8 }}>{it.period}</div>
              <div className="c-display" style={{ fontSize: 32, lineHeight: 1, marginBottom: 10 }}>{L(it.school, lang)}</div>
              <div className="c-hand" style={{ fontSize: 18, color: palette.inkSoft, marginBottom: 6 }}>{L(it.degree, lang)}</div>
              <div className="c-hand" style={{ fontSize: 16, color: palette.inkSoft }}>{L(it.detail, lang)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS / QUESTS */}
      <section id="quests" style={{ ...cWrap, paddingBlock: 48 }} className="c-section">
        <ChapterHeader num="04" title={L(data.projects.title, lang)} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 20 }}>
          {data.projects.items.map((p, i) => (
            <a key={i} href="#" className="c-panel c-card c-link" style={{ display:'block', overflow:'hidden' }}>
              <div style={{
                aspectRatio: '4/3',
                background: `${p.bg} radial-gradient(circle, ${palette.ink}33 1.2px, transparent 1.3px) 0 0/8px 8px`,
                display:'grid', placeItems:'center', position:'relative',
                borderBottom: `4px solid ${palette.ink}`,
              }}>
                <div style={{ fontSize: 90, filter: `drop-shadow(4px 4px 0 ${palette.ink})` }}>{p.emoji}</div>
                <div style={{ position:'absolute', top: 10, left: 12, background: palette.ink, color: palette.paper, padding: '3px 10px', borderRadius: 999, fontFamily:'"Bangers"', fontSize: 12, letterSpacing: '.08em' }}>{p.year}</div>
              </div>
              <div style={{ padding: 18 }}>
                <div className="c-display" style={{ fontSize: 24, lineHeight: 1.05, marginBottom: 6 }}>{L(p.title, lang)}</div>
                <div className="c-hand" style={{ fontSize: 16, color: palette.inkSoft }}>{L(p.summary, lang)}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* YOUTUBE */}
      <section id="youtube" style={{ ...cWrap, paddingBlock: 48 }} className="c-section">
        <ChapterHeader num="05" title={L(data.youtube.title, lang)} palette={palette} />

        {/* Channel banner */}
        <div className="c-panel" style={{ padding: 28, marginBottom: 20, display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 24, alignItems:'center', background: '#ff0000', color: palette.paper, position:'relative', overflow:'hidden' }}>
          <div style={{
            width: 84, height: 84,
            background: palette.paper, color: '#ff0000',
            border: `4px solid ${palette.ink}`, borderRadius: '50%',
            display:'grid', placeItems:'center',
            boxShadow: `4px 4px 0 ${palette.ink}`,
            position:'relative', zIndex: 1,
          }}>
            <svg viewBox="0 0 24 24" width="44" height="44" fill="#ff0000"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div style={{ position:'relative', zIndex: 1 }}>
            <div className="c-display" style={{ fontSize: 32, lineHeight: 1, textShadow:`3px 3px 0 ${palette.ink}` }}>{L(data.youtube.channel.name, lang)}</div>
            <div className="c-hand" style={{ fontSize: 18, marginTop: 4 }}>{data.youtube.channel.handle} · {L(data.youtube.channel.tagline, lang)}</div>
            <div style={{ marginTop: 10, display:'flex', gap: 18, fontFamily:'"Bangers", system-ui', letterSpacing:'.06em', fontSize: 16 }}>
              <span>★ {data.youtube.channel.subs} {t('SUBS','ผู้ติดตาม')}</span>
              <span>★ {data.youtube.channel.videos} {t('VIDEOS','คลิป')}</span>
              <span>★ {data.youtube.channel.views} {t('VIEWS','วิว')}</span>
            </div>
          </div>
          <a href={data.youtube.channel.url} target="_blank" rel="noopener noreferrer" className="c-btn red c-link" style={{ position:'relative', zIndex: 1, background: palette.paper, color: '#ff0000' }}>
            {t('SUBSCRIBE','กดติดตาม')} ▶
          </a>
          {/* halftone backdrop */}
          <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle, ${palette.ink}33 1.2px, transparent 1.3px) 0 0/12px 12px`, opacity:.5 }} />
        </div>

        {/* Video thumbnails */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 20 }}>
          {data.youtube.items.map((v, i) => (
            <a key={i} href={v.url || '#'} target={v.url ? '_blank' : undefined} rel={v.url ? 'noopener noreferrer' : undefined} className="c-panel c-card c-link" style={{ display:'flex', gap: 16, padding: 16 }}>
              <div style={{
                flex: '0 0 200px', aspectRatio:'16/9',
                background: v.thumbnail ? '#000' : `${v.bg} radial-gradient(circle, ${palette.ink}33 1.2px, transparent 1.3px) 0 0/8px 8px`,
                border: `3px solid ${palette.ink}`, borderRadius: 6,
                display:'grid', placeItems:'center',
                position:'relative', overflow:'hidden',
              }}>
                {v.thumbnail
                  ? <img src={v.thumbnail} alt={L(v.title, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ fontSize: 56, filter: `drop-shadow(3px 3px 0 ${palette.ink})` }}>{v.emoji}</div>
                }
                {v.duration && <div style={{ position:'absolute', bottom: 6, right: 6, background: palette.ink, color: palette.paper, padding:'2px 8px', borderRadius: 4, fontFamily:'"JetBrains Mono", monospace', fontSize: 11 }}>{v.duration}</div>}
                <div style={{ position:'absolute', top: 8, left: 8, background: '#ff0000', color: palette.paper, padding:'2px 8px', borderRadius: 999, fontFamily:'"Bangers", system-ui', fontSize: 11, letterSpacing:'.08em', border:`2px solid ${palette.ink}` }}>▶ PLAY</div>
              </div>
              <div style={{ flex: 1, padding: '4px 4px 4px 0', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <div>
                  <div className="c-display" style={{ fontSize: 22, lineHeight: 1.1, marginBottom: 6 }}>{L(v.title, lang)}</div>
                  <div className="c-hand" style={{ fontSize: 15, color: palette.inkSoft }}>· {L(v.kind, lang)}</div>
                </div>
                <div className="c-mono" style={{ fontSize: 11, color: palette.inkSoft, display:'flex', gap: 10 }}>
                  <span>{v.views} {t('views','วิว')}</span>
                  <span>·</span>
                  <span>{v.date}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SCRATCH */}
      <section id="scratch" style={{ ...cWrap, paddingBlock: 48 }} className="c-section">
        <ChapterHeader num="06" title={L(data.scratch.title, lang)} palette={palette} />

        <div className="c-panel" style={{ padding: 24, marginBottom: 20, display:'flex', gap: 18, alignItems:'center', background: '#fb923c', position:'relative', overflow:'hidden' }}>
          <div style={{
            width: 64, height: 64, flex:'0 0 64px',
            background: palette.paper, color: '#fb923c',
            border: `4px solid ${palette.ink}`, borderRadius: 14,
            display:'grid', placeItems:'center',
            fontFamily:'"Bangers", system-ui', fontSize: 30,
            boxShadow: `4px 4px 0 ${palette.ink}`,
          }}>S</div>
          <div style={{ flex: 1 }}>
            <a href={data.scratch.profile.url} target="_blank" rel="noopener noreferrer" className="c-link c-display" style={{ fontSize: 24, color: palette.paper, textShadow:`3px 3px 0 ${palette.ink}` }}>
              scratch.mit.edu/users/{data.scratch.profile.handle}
            </a>
            <div className="c-hand" style={{ fontSize: 17, color: palette.paper, marginTop: 4 }}>{L(data.scratch.intro, lang)}</div>
          </div>
          <a href={data.scratch.profile.url} target="_blank" rel="noopener noreferrer" className="c-btn c-link" style={{ background: palette.paper, color: '#fb923c' }}>
            {t('VISIT PROFILE','ไปดูโปรไฟล์')} ↗
          </a>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 16 }}>
          {data.scratch.items.map((s, i) => (
            <a key={s.id || i} href={s.url || '#'} target={s.url ? '_blank' : undefined} rel={s.url ? 'noopener noreferrer' : undefined} className="c-panel c-card c-link" style={{ display:'block', overflow:'hidden' }}>
              <div style={{
                aspectRatio:'4/3',
                background: s.thumbnail ? '#000' : s.bg,
                borderBottom: `4px solid ${palette.ink}`,
                display:'grid', placeItems:'center',
                position:'relative', overflow:'hidden',
              }}>
                {s.thumbnail
                  ? <img src={s.thumbnail} alt={L(s.title, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ fontSize: 64, filter: `drop-shadow(3px 3px 0 ${palette.ink})` }}>{s.emoji}</div>
                }
                <div style={{ position:'absolute', top: 8, left: 8, background: '#fb923c', color: palette.paper, padding:'3px 10px', borderRadius: 999, fontFamily:'"Bangers", system-ui', fontSize: 11, letterSpacing:'.08em', border:`2px solid ${palette.ink}` }}>★ SCRATCH</div>
              </div>
              <div style={{ padding: 14 }}>
                <div className="c-display" style={{ fontSize: 18, lineHeight: 1.1, marginBottom: 6 }}>{L(s.title, lang)}</div>
                <div className="c-hand" style={{ fontSize: 14, color: palette.inkSoft, marginBottom: 8 }}>· {L(s.kind, lang)}</div>
                <div className="c-mono" style={{ fontSize: 10, color: palette.inkSoft, display:'flex', gap: 8 }}>
                  <span>▶ {s.plays}</span>
                  <span>♥ {s.loves}</span>
                  <span>▢ {s.blocks}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" style={{ ...cWrap, paddingBlock: 48 }} className="c-section">
        <ChapterHeader num="07" title={L(data.gallery.title, lang)} palette={palette} />
        <div className="c-hand" style={{ fontSize: 20, color: palette.inkSoft, marginBottom: 24, marginTop: -12 }}>· {L(data.gallery.intro, lang)}</div>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4, 1fr)',
          gridAutoRows: '180px',
          gap: 16,
        }}>
          {data.gallery.items.map((g, i) => {
            const span = g.size === 'lg' ? { gridColumn:'span 2', gridRow:'span 2' } :
                         g.size === 'md' ? { gridColumn:'span 2', gridRow:'span 1' } : {};
            const isVid = g.kind === 'video';
            const lbIdx = g.file_url ? galleryImages.indexOf(g) : -1;
            const clickable = lbIdx >= 0;
            return (
              <button
                key={i}
                type="button"
                onClick={() => clickable && setLightbox(lbIdx)}
                className="c-panel c-card"
                style={{
                  ...span,
                  background: g.file_url ? '#000' : `${g.bg} radial-gradient(circle, ${palette.ink}33 1.2px, transparent 1.3px) 0 0/10px 10px`,
                  display:'grid', placeItems:'center',
                  position:'relative', overflow:'hidden',
                  padding: 0, border: `4px solid ${palette.ink}`, fontFamily: 'inherit',
                  cursor: clickable ? 'zoom-in' : 'default',
                }}>
                {g.file_url
                  ? <img src={g.file_url} alt={L(g.label, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ fontSize: g.size === 'lg' ? 120 : g.size === 'md' ? 88 : 64, filter:`drop-shadow(4px 4px 0 ${palette.ink})` }}>{g.emoji}</div>
                }
                <div style={{
                  position:'absolute', top: 10, left: 10,
                  background: isVid ? '#ff0000' : palette.ink, color: palette.paper,
                  padding:'3px 10px', borderRadius: 999, border:`2.5px solid ${palette.ink}`,
                  fontFamily:'"Bangers", system-ui', fontSize: 11, letterSpacing:'.08em',
                }}>{isVid ? '▶ VIDEO' : '★ PHOTO'}</div>
                {isVid && g.duration && (
                  <div style={{
                    position:'absolute', bottom: 8, right: 8,
                    background: palette.ink, color: palette.paper,
                    padding:'2px 8px', borderRadius: 4,
                    fontFamily:'"JetBrains Mono", monospace', fontSize: 11,
                  }}>{g.duration}</div>
                )}
                <div style={{
                  position:'absolute', bottom: 0, left: 0, right: 0,
                  background: `linear-gradient(transparent, ${palette.ink}ee)`,
                  color: palette.paper, padding:'24px 14px 12px',
                  textAlign: 'left',
                }}>
                  <div className="c-display" style={{ fontSize: g.size === 'lg' ? 24 : 16, lineHeight: 1.05 }}>{L(g.label, lang)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ACHIEVEMENTS — trophies + certificates */}
      <section id="achievements" style={{ ...cWrap, paddingBlock: 48 }} className="c-section">
        <ChapterHeader num="08" title={L(data.achievements.title, lang)} palette={palette} />

        {/* Sub-row: TROPHIES */}
        <div style={{ display:'flex', alignItems:'baseline', gap: 12, marginBottom: 16 }}>
          <span className="c-display" style={{ fontSize: 24, color: palette.red }}>★ {L(data.awards.title, lang)}</span>
          <span className="c-hand" style={{ fontSize: 17, color: palette.inkSoft }}>· {t('big wins','รางวัลใหญ่')}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 20, marginBottom: 36 }}>
          {data.awards.items.map((a, i) => (
            <div key={i} className="c-panel c-card" style={{ padding: 24, textAlign:'center' }}>
              <div className="c-float" style={{ fontSize: 80, lineHeight: 1, marginBottom: 8, display:'inline-block' }}>{a.medal}</div>
              <div className="c-display" style={{ fontSize: 28, color: palette.red, marginBottom: 4 }}>{L(a.rank, lang)}</div>
              <div className="c-mono" style={{ fontSize: 12, marginBottom: 8 }}>{a.year}</div>
              <div className="c-hand" style={{ fontSize: 18, lineHeight: 1.3 }}>{L(a.name, lang)}</div>
              {a.file_url && (
                /\.pdf(\?|$)/i.test(a.file_url) ? (
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="c-link" style={{
                    display:'inline-block', marginTop: 12,
                    background: palette.ink, color: palette.paper, padding:'4px 14px',
                    borderRadius: 999, fontFamily:'"Bangers"', fontSize: 12, letterSpacing:'.08em',
                    border: `3px solid ${palette.ink}`, boxShadow: `3px 3px 0 ${palette.red}`,
                  }}>📄 {t('VIEW PDF','ดูเอกสาร')}</a>
                ) : (
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{ display:'block', marginTop: 12 }}>
                    <img src={a.file_url} alt="" style={{
                      width:'100%', maxHeight: 140, objectFit:'cover',
                      border:`3px solid ${palette.ink}`, borderRadius: 6,
                      boxShadow:`4px 4px 0 ${palette.red}`,
                    }} />
                  </a>
                )
              )}
            </div>
          ))}
        </div>

        {/* Sub-row: CERTIFICATES */}
        <div style={{ display:'flex', alignItems:'baseline', gap: 12, marginBottom: 16 }}>
          <span className="c-display" style={{ fontSize: 24, color: palette.blue }}>★ {L(data.certificates.title, lang)}</span>
          <span className="c-hand" style={{ fontSize: 17, color: palette.inkSoft }}>· {t('proof of skills','หลักฐานทักษะ')}</span>
        </div>
        <div className="c-panel" style={{ padding: 24 }}>
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginBottom: 24, alignItems:'center' }}>
            <span className="c-hand" style={{ fontSize: 16, marginRight: 8 }}>{t('Filter →','กรอง →')}</span>
            {data.certificates.categories.map((c) => (
              <button key={c.id} onClick={()=>setFilter(c.id)} className={'c-chip' + (filter===c.id ? ' active' : '')}>
                {L(c.label, lang)}
              </button>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 20 }}>
            {filteredCerts.map((c, i) => (
              <button key={c.id} onClick={()=>setCert(c)} className="c-card" style={{
                background: c.color,
                border: `4px solid ${palette.ink}`,
                borderRadius: 8,
                boxShadow: `6px 6px 0 ${palette.ink}`,
                padding: 20,
                textAlign:'left',
                cursor:'pointer',
                fontFamily:'inherit',
                color: palette.ink,
                position:'relative',
                minHeight: 160,
                transform: `rotate(${[-1.2, 0.8, -0.5, 1.4, -1, 0.6][i%6]}deg)`,
              }}>
                <div className="c-mono" style={{ fontSize: 10, opacity: .7, marginBottom: 8 }}>№ {String(i+1).padStart(3,'0')} · {c.date}</div>
                <div className="c-display" style={{ fontSize: 22, lineHeight: 1.05, marginBottom: 14 }}>{L(c.name, lang)}</div>
                <div className="c-hand" style={{ fontSize: 15, opacity: .8 }}>{L(c.issuer, lang)}</div>
                <div style={{ position:'absolute', bottom: 12, right: 14, fontSize: 16, fontFamily:'"Bangers"', letterSpacing:'.08em' }}>↗ {t('VIEW','ดู')}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT - final page */}
      <section id="contact" style={{ ...cWrap, paddingBlock: 64 }} className="c-section">
        <div className="c-panel c-halftone-y" style={{ padding: 56, textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, left:-30, width:140, height:140 }} className="c-wiggle">
            <ComicBurst color={palette.blue} ink={palette.ink} text={t('HEY!', 'หวัดดี!')} fontSize={22} style={{ width:'100%', height:'100%' }} />
          </div>
          <div style={{ position:'absolute', bottom:-30, right:-30, width:160, height:160, transform:'rotate(15deg)' }}>
            <ComicBurst color={palette.red} ink={palette.ink} text={t("LET'S\nTALK", 'คุย\nกัน!')} fontSize={24} style={{ width:'100%', height:'100%' }} />
          </div>
          <div className="c-mono" style={{ fontSize: 12, letterSpacing:'.2em', marginBottom: 16 }}>· {t('THE END... OR IS IT?', 'จบแล้ว... หรือยัง?')} ·</div>
          <h2 className="c-display" style={{ fontSize: 'clamp(48px, 7vw, 96px)', margin: 0, lineHeight: .95, textShadow: `5px 5px 0 ${palette.red}, 6px 6px 0 ${palette.ink}` }}>
            {t('SAY HELLO!', 'ทักทายฉันสิ!')}
          </h2>
          <div className="c-hand" style={{ marginTop: 16, fontSize: 22 }}>
            {t("I'd love to hear from you 👋", 'อยากคุยกับเพื่อนๆ นะ 👋')}
          </div>
          <div style={{ marginTop: 32, display:'flex', flexWrap:'wrap', justifyContent:'center', gap: 12 }}>
            {data.social.items.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="c-btn" title={s.label} aria-label={s.label} style={{ background: palette.paper, gap: 10 }}>
                {s._icon_resolved && (
                  <img src={s._icon_resolved} alt="" style={{ width: 22, height: 22, display: 'block' }} />
                )}
                <span>{L(s.value, lang)}</span>
              </a>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 32, display:'flex', justifyContent:'space-between', fontFamily:'"JetBrains Mono", monospace', fontSize: 11, color: palette.inkSoft }}>
          <div>© 2026 · {L(data.meta.name, lang)}</div>
          <div>{t('Made with crayons 🖍','วาดด้วยใจ ❤️')}</div>
        </div>
      </section>

      <CertificateModal cert={cert} lang={lang} onClose={()=>setCert(null)} palette={palette} />
      <GalleryLightbox items={galleryImages} index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} lang={lang} />
    </div>
  );
}

const cWrap = { maxWidth: 1240, margin: '0 auto', paddingInline: 32 };

function ChapterHeader({ num, title, palette }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', gap: 16, marginBottom: 24, transform:'rotate(-1deg)' }}>
      <span className="c-display" style={{
        fontSize: 36, background: palette.red, color: palette.paper,
        padding: '2px 18px', border: `3px solid ${palette.ink}`,
        boxShadow: `4px 4px 0 ${palette.ink}`,
      }}>CH. {num}</span>
      <span className="c-display" style={{ fontSize: 44, color: palette.ink, textShadow: `3px 3px 0 ${palette.yellow}` }}>{title}</span>
    </div>
  );
}

function SpeechBubble({ children, tail = 'bottom', thought, palette, style }) {
  const ink = palette?.ink || '#1a1a1a';
  const paper = palette?.paper || '#fffaf0';
  return (
    <div style={{
      position: 'relative',
      background: paper,
      border: `4px solid ${ink}`,
      borderRadius: thought ? '40% 60% 50% 50% / 50%' : '24px',
      padding: '18px 22px',
      boxShadow: `5px 5px 0 ${ink}`,
      display: 'inline-block',
      ...style,
    }}>
      {children}
      {!thought && (
        <svg viewBox="0 0 40 30" style={{
          position: 'absolute',
          width: 40, height: 30,
          ...(tail === 'left'   ? { left: -16, bottom: 10 } :
              tail === 'right'  ? { right: -16, bottom: 10, transform: 'scaleX(-1)' } :
                                  { bottom: -22, left: 30 }),
        }}>
          <polygon points="0,0 40,0 14,30" fill={paper} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
          <line x1="2" y1="2" x2="38" y2="2" stroke={paper} strokeWidth="5" />
        </svg>
      )}
      {thought && (
        <>
          <span style={{ position:'absolute', bottom: -16, left: 30, width: 14, height: 14, borderRadius:'50%', background: paper, border:`3px solid ${ink}` }} />
          <span style={{ position:'absolute', bottom: -30, left: 22, width: 8, height: 8, borderRadius:'50%', background: paper, border:`3px solid ${ink}` }} />
        </>
      )}
    </div>
  );
}

function LangToggleComic({ lang, onLangChange, palette }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      background: palette.paper, border: `3px solid ${palette.ink}`,
      borderRadius: 999, padding: 2, marginLeft: 8,
      boxShadow: `3px 3px 0 ${palette.ink}`,
      fontFamily: '"Bangers", system-ui, sans-serif',
    }}>
      {['en', 'th'].map((l) => (
        <button key={l} onClick={() => onLangChange(l)} style={{
          background: lang === l ? palette.ink : 'transparent',
          color: lang === l ? palette.paper : palette.ink,
          border: 'none', padding: '4px 12px', borderRadius: 999,
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, letterSpacing: '.1em',
        }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Theme-agnostic gallery lightbox. ESC closes; ←/→ cycles through items
// with file_url. Click outside the image to close.
function GalleryLightbox({ items, index, onChange, onClose, lang }) {
  React.useEffect(() => {
    if (index === null || index === undefined) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onChange((index - 1 + items.length) % items.length);
      else if (e.key === 'ArrowRight') onChange((index + 1) % items.length);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [index, items.length, onChange, onClose]);

  if (index === null || index === undefined || !items[index]) return null;
  const it = items[index];
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
      zIndex: 1001, display: 'grid', placeItems: 'center', padding: 24,
      animation: 'cmFade .2s ease',
    }}>
      <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} style={lbBtn({ top: 16, right: 16, w: 40, fs: 18 })}>✕</button>
      {items.length > 1 && (
        <React.Fragment>
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange((index - 1 + items.length) % items.length); }} style={lbBtn({ left: 16, w: 48, fs: 26 })} aria-label="Previous">‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange((index + 1) % items.length); }} style={lbBtn({ right: 16, w: 48, fs: 26 })} aria-label="Next">›</button>
        </React.Fragment>
      )}
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <img src={it.file_url} alt={typeof L === 'function' ? L(it.label, lang) : ''} style={{
          maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain',
          boxShadow: '0 20px 60px rgba(0,0,0,.5)',
        }} />
        <div style={{ color: '#fff', fontSize: 14, textAlign: 'center', maxWidth: '80vw' }}>
          {typeof L === 'function' ? L(it.label, lang) : ''}
          <span style={{ opacity: 0.55, marginLeft: 12 }}>{index + 1} / {items.length}</span>
        </div>
      </div>
    </div>
  );
}
function lbBtn({ top, left, right, w, fs }) {
  return {
    position: 'absolute', top: top != null ? top : '50%', left, right,
    transform: top != null ? undefined : 'translateY(-50%)',
    background: 'rgba(255,255,255,0.12)', color: '#fff',
    border: 'none', width: w, height: w, borderRadius: '50%',
    cursor: 'pointer', fontSize: fs, lineHeight: 1, fontFamily: 'system-ui',
  };
}

window.PortfolioComic = PortfolioComic;
window.ComicSpeechBubble = SpeechBubble;
window.ComicGalleryLightbox = GalleryLightbox;
