// Variation 3 — "HERO TRADING CARD"
// RPG character sheet / trading card aesthetic. Bright gradient skies,
// big character card with stats, power cards in a grid, achievement medals.

const { useState: useStateH, useMemo: useMemoH } = React;

function PortfolioHero({ lang, onLangChange }) {
  const [cert, setCert] = useStateH(null);
  const [filter, setFilter] = useStateH('all');
  const [lightbox, setLightbox] = useStateH(null);
  const data = PORTFOLIO_DATA;
  const galleryImages = useMemoH(() => (data.gallery?.items || []).filter((g) => g.file_url), [data.gallery]);

  const palette = {
    bg: '#0b0f1e',
    sky1: '#312e81', // deep indigo
    sky2: '#9333ea', // purple
    sky3: '#f97316', // orange (sunset)
    paper: '#fff7e6',
    ink: '#0b0f1e',
    inkLight: '#fff7e6',
    gold: '#fbbf24',
    cyan: '#22d3ee',
    pink: '#ec4899',
    line: '#ffffff22',
    accent: '#fbbf24',
  };

  const filteredCerts = useMemoH(() => {
    if (filter === 'all') return data.certificates.items;
    return data.certificates.items.filter((c) => c.category === filter);
  }, [filter]);

  const t = (en, th) => (lang === 'th' ? th : en);

  return (
    <div style={{
      background: palette.bg,
      color: palette.inkLight,
      fontFamily: '"Fredoka", "IBM Plex Sans Thai", system-ui, sans-serif',
      fontSize: 15,
      lineHeight: 1.55,
      minHeight: '100vh',
    }}>
      <style>{`
        .h-display { font-family: "Lilita One", "Bangers", "IBM Plex Sans Thai", system-ui, sans-serif; font-weight: 400; letter-spacing: .01em; line-height: 1; }
        .h-pixel   { font-family: "Press Start 2P", "JetBrains Mono", monospace; letter-spacing: 0; }
        .h-mono    { font-family: "JetBrains Mono", monospace; }
        .h-link    { color: inherit; text-decoration: none; }

        .h-card { background: linear-gradient(180deg, #1a1f3a, #0e1226);
                  border: 2px solid ${palette.line};
                  border-radius: 18px; position: relative; overflow: hidden;
                  transition: transform .3s cubic-bezier(.2,1.4,.4,1), border-color .3s, box-shadow .3s; }
        .h-card.hover:hover { transform: translateY(-3px); border-color: ${palette.gold}; box-shadow: 0 18px 40px -10px ${palette.gold}33; }
        .h-card-paper { background: ${palette.paper}; color: ${palette.ink}; }

        .h-chip { background: rgba(255,255,255,.06); color: ${palette.inkLight};
                  border: 1.5px solid ${palette.line}; padding: 5px 14px;
                  border-radius: 999px; cursor: pointer; font-family: inherit;
                  font-size: 13px; transition: all .15s; }
        .h-chip:hover { border-color: ${palette.gold}; color: ${palette.gold}; }
        .h-chip.active { background: ${palette.gold}; color: ${palette.ink}; border-color: ${palette.gold}; font-weight: 600; }

        .h-btn { background: ${palette.gold}; color: ${palette.ink};
                 border: 2px solid ${palette.ink}; padding: 11px 22px;
                 border-radius: 999px; cursor: pointer;
                 font-family: "Lilita One", system-ui; font-size: 16px; letter-spacing:.04em;
                 box-shadow: 0 4px 0 ${palette.ink}; transition: all .15s;
                 display: inline-flex; align-items: center; gap: 8px; }
        .h-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 0 ${palette.ink}; }
        .h-btn.ghost { background: transparent; color: ${palette.inkLight}; border-color: ${palette.line}; box-shadow: none; }
        .h-btn.ghost:hover { border-color: ${palette.gold}; color: ${palette.gold}; transform: none; }

        .h-skill-bar { height: 14px; background: rgba(255,255,255,.08); border-radius: 7px; overflow: hidden; border: 1px solid ${palette.line}; position: relative; }
        .h-skill-bar > .fill { height: 100%; border-radius: 7px; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,.18) 0 8px, transparent 8px 16px); }

        @keyframes hRise { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: none; } }
        .h-section { animation: hRise .6s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes hShine { 0%{transform:translateX(-120%) rotate(20deg)} 100%{transform:translateX(120%) rotate(20deg)} }
        .h-shine::after { content:''; position:absolute; top:0; bottom:0; width:40%;
                          background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
                          animation: hShine 4.5s ease-in-out infinite; pointer-events: none; }
        @keyframes hFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .h-float { animation: hFloat 3s ease-in-out infinite; }
        @keyframes hSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .h-spin { animation: hSpin 14s linear infinite; }

        .h-grid-bg { background-image:
          linear-gradient(${palette.line} 1px, transparent 1px),
          linear-gradient(90deg, ${palette.line} 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* TOP BAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: palette.bg + 'e0', backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${palette.line}`,
      }}>
        <div style={{ ...hWrap, display:'flex', justifyContent:'space-between', alignItems:'center', height: 64 }}>
          <a href="#top" className="h-link" style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <div style={{
              width: 38, height: 38,
              background: `linear-gradient(135deg, ${palette.gold}, ${palette.pink})`,
              borderRadius: 10, border: `2px solid ${palette.gold}`,
              display:'grid', placeItems:'center', overflow:'hidden',
              fontFamily:'"Lilita One"', fontSize: 18, color: palette.ink,
              boxShadow: `0 0 0 1px ${palette.bg} inset, 0 4px 14px ${palette.gold}55`,
            }}>{data.meta.avatar_url
              ? <img src={data.meta.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : L(data.meta.nickname, lang).charAt(0)}</div>
            <div style={{ display:'flex', flexDirection:'column', lineHeight: 1 }}>
              <span className="h-display" style={{ fontSize: 20 }}>{L(data.meta.name, lang)}</span>
              <span className="h-pixel" style={{ fontSize: 9, color: palette.gold, marginTop: 4 }}>LVL.{data.meta.age} HERO</span>
            </div>
          </a>
          <div style={{ display:'flex', gap: 4, alignItems:'center' }}>
            {[['about','About','รู้จัก'],['powers','Powers','พลัง'],['quests','Quests','ภารกิจ'],['youtube','YouTube','ยูทูบ'],['scratch','Scratch','สแครชต์'],['gallery','Gallery','อัลบั้ม'],['achievements','Achievements','ความสำเร็จ']].map(([id,en,th])=>(
              <a key={id} href={`#${id}`} className="h-link" style={{ padding:'6px 12px', borderRadius: 6, fontSize: 13 }}>{t(en,th)}</a>
            ))}
            <LangToggleHero lang={lang} onLangChange={onLangChange} palette={palette} />
          </div>
        </div>
      </nav>

      {/* HERO — Big character trading card */}
      <section id="top" style={{ position:'relative', overflow:'hidden' }} className="h-section">
        <div style={{
          position:'absolute', inset:0,
          background: `radial-gradient(ellipse at 30% 0%, ${palette.sky2}66, transparent 50%),
                       radial-gradient(ellipse at 80% 30%, ${palette.sky3}44, transparent 50%),
                       linear-gradient(180deg, ${palette.sky1} 0%, ${palette.bg} 80%)`,
        }} />
        <div className="h-grid-bg" style={{ position:'absolute', inset:0, opacity: .3 }} />

        {/* floating shapes */}
        <div className="h-spin" style={{ position:'absolute', top: 80, right: 60, width: 100, height: 100, opacity: .35 }}>
          <svg viewBox="0 0 100 100"><polygon points="50,5 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38" fill={palette.gold} /></svg>
        </div>
        <div className="h-float" style={{ position:'absolute', top: 200, right: 220, width: 60, height: 60 }}>
          <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" fill="none" stroke={palette.cyan} strokeWidth="3" /><circle cx="30" cy="30" r="12" fill={palette.cyan} opacity=".5" /></svg>
        </div>

        <div style={{ ...hWrap, paddingBlock: '64px 80px', position:'relative' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 56, alignItems:'center' }}>
            <div>
              <div className="h-pixel" style={{ fontSize: 11, color: palette.gold, marginBottom: 18, letterSpacing:'.15em' }}>
                ▸ HERO PROFILE
              </div>
              <h1 className="h-display" style={{
                fontSize: 'clamp(64px, 9vw, 132px)',
                margin: 0, lineHeight: .9,
                background: `linear-gradient(180deg, ${palette.inkLight} 0%, ${palette.gold} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: `drop-shadow(0 4px 0 ${palette.ink})`,
              }}>
                {L(data.meta.name, lang)}
              </h1>
              <div className="h-display" style={{ marginTop: 18, fontSize: 28, color: palette.cyan }}>
                ★ {L(data.meta.role, lang)} ★
              </div>
              <div style={{ marginTop: 16, fontSize: 17, color: '#cbd5e1', maxWidth: 480 }}>
                {L(data.about.intro, lang)}
              </div>
              <div style={{ marginTop: 28, display:'flex', gap: 12, flexWrap:'wrap' }}>
                <a href="#contact" className="h-btn h-link">{t('START QUEST', 'เริ่มภารกิจ')} ▶</a>
                <a href="#" className="h-btn ghost h-link">{t('DOWNLOAD CV', 'ดาวน์โหลด CV')} ↓</a>
              </div>
            </div>

            {/* Trading card */}
            <div style={{ display:'grid', placeItems:'center' }}>
              <CharacterCard data={data} lang={lang} palette={palette} t={t} />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS strip */}
      <section style={{ ...hWrap, paddingBlock: 32 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: t('LEVEL','เลเวล'),       value: data.meta.age,                                   color: palette.gold },
            { label: t('GRADE','ชั้น'),         value: L(data.meta.grade, lang),                        color: palette.cyan },
            { label: t('TROPHIES','ถ้วยรางวัล'), value: data.awards.items.length,                       color: palette.pink },
            { label: t('CERTS','ใบรับรอง'),     value: data.certificates.items.length,                 color: palette.gold },
          ].map((s, i) => (
            <div key={i} className="h-card hover" style={{ padding: 24 }}>
              <div className="h-pixel" style={{ fontSize: 10, color: s.color, marginBottom: 10, letterSpacing: '.1em' }}>{s.label}</div>
              <div className="h-display" style={{ fontSize: 56, color: palette.inkLight, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ ...hWrap, paddingBlock: 40 }} className="h-section">
        <SectionTitle num="01" title={L(data.about.title, lang)} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 20 }}>
          <div className="h-card" style={{ padding: 36 }}>
            <p style={{ fontSize: 20, lineHeight: 1.55, margin: 0, color: palette.inkLight }}>
              {L(data.about.intro, lang)}
            </p>
            <div style={{ marginTop: 28, padding: '16px 20px', background: `linear-gradient(90deg, ${palette.gold}22, transparent)`, borderLeft: `3px solid ${palette.gold}`, borderRadius: 4 }}>
              <div className="h-pixel" style={{ fontSize: 10, color: palette.gold, marginBottom: 6, letterSpacing:'.12em' }}>▸ MOTTO</div>
              <div className="h-display" style={{ fontSize: 28, color: palette.inkLight }}>"{L(data.meta.motto, lang)}"</div>
            </div>
          </div>
          <div style={{ display:'grid', gap: 16 }}>
            {data.about.favorites.map((f, i) => (
              <div key={i} className="h-card hover" style={{ padding: 20, display:'flex', alignItems:'center', gap: 16 }}>
                <div style={{
                  width: 52, height: 52, flex:'0 0 52px',
                  background: [palette.gold, palette.cyan, palette.pink][i],
                  borderRadius: 12, color: palette.ink,
                  display:'grid', placeItems:'center',
                  fontFamily:'"Lilita One"', fontSize: 24,
                }}>★</div>
                <div>
                  <div className="h-pixel" style={{ fontSize: 9, color: '#94a3b8', letterSpacing: '.1em', marginBottom: 4 }}>{L(f.label, lang)}</div>
                  <div className="h-display" style={{ fontSize: 22, color: palette.inkLight }}>{L(f.value, lang)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POWERS */}
      <section id="powers" style={{ ...hWrap, paddingBlock: 40 }} className="h-section">
        <SectionTitle num="02" title={L(data.powers.title, lang)} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16 }}>
          {data.powers.items.map((p, i) => (
            <div key={i} className="h-card hover" style={{ padding: 24 }}>
              <div style={{ display:'flex', gap: 16, alignItems:'center', marginBottom: 14 }}>
                <div style={{
                  width: 56, height: 56,
                  background: `linear-gradient(135deg, ${p.color}, ${p.color}88)`,
                  borderRadius: 14, color: '#fff',
                  display:'grid', placeItems:'center',
                  fontFamily:'"Lilita One"', fontSize: 28,
                  border: `2px solid ${p.color}`,
                  boxShadow: `0 6px 16px ${p.color}55`,
                }}>{p.letter}</div>
                <div>
                  <div className="h-display" style={{ fontSize: 22, color: palette.inkLight }}>{L(p.name, lang)}</div>
                  <div className="h-pixel" style={{ fontSize: 9, color: p.color, marginTop: 4, letterSpacing:'.1em' }}>POWER · {p.level*20}/100</div>
                </div>
              </div>
              <div className="h-skill-bar"><div className="fill" style={{ width: `${p.level*20}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}aa)` }} /></div>
              <div style={{ display:'flex', gap: 3, marginTop: 10 }}>
                {[1,2,3,4,5].map((s) => (
                  <span key={s} style={{ fontSize: 16, color: s <= p.level ? palette.gold : palette.line }}>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" style={{ ...hWrap, paddingBlock: 40 }} className="h-section">
        <SectionTitle num="03" title={L(data.education.title, lang)} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 20 }}>
          {data.education.items.map((it, i) => (
            <div key={i} className="h-card hover" style={{ padding: 28, position:'relative', overflow:'hidden' }}>
              <div style={{
                position:'absolute', top: -20, right: -20,
                width: 100, height: 100, borderRadius:'50%',
                background: `radial-gradient(circle, ${[palette.cyan, palette.pink][i]}44, transparent 70%)`,
              }} />
              <div className="h-pixel" style={{ fontSize: 10, color: palette.gold, marginBottom: 12, letterSpacing:'.12em' }}>▸ CHAPTER {String(i+1).padStart(2,'0')}</div>
              <div className="h-display" style={{ fontSize: 30, color: palette.inkLight, marginBottom: 8, lineHeight: 1.05 }}>{L(it.school, lang)}</div>
              <div style={{ fontSize: 15, color: palette.cyan, marginBottom: 6 }}>{L(it.degree, lang)}</div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>{L(it.detail, lang)}</div>
              <div className="h-mono" style={{ fontSize: 12, color: '#64748b', marginTop: 16, paddingTop: 12, borderTop: `1px solid ${palette.line}` }}>{it.period}</div>
            </div>
          ))}
        </div>
      </section>

      {/* QUESTS / PROJECTS */}
      <section id="quests" style={{ ...hWrap, paddingBlock: 40 }} className="h-section">
        <SectionTitle num="04" title={L(data.projects.title, lang)} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16 }}>
          {data.projects.items.map((p, i) => (
            <a key={i} href="#" className="h-card hover h-link" style={{ overflow:'hidden' }}>
              <div style={{
                aspectRatio:'4/3',
                background: `linear-gradient(135deg, ${p.bg}, ${p.bg}99), radial-gradient(circle at 30% 30%, ${palette.gold}33, transparent 60%)`,
                display:'grid', placeItems:'center', position:'relative',
              }}>
                <div className="h-float" style={{ fontSize: 84, filter: `drop-shadow(0 8px 16px ${palette.ink}66)` }}>{p.emoji}</div>
                <div className="h-pixel" style={{ position:'absolute', top: 12, left: 14, fontSize: 9, color: '#fff', background: 'rgba(0,0,0,.4)', padding:'4px 8px', borderRadius: 4, letterSpacing:'.1em' }}>QUEST · {String(i+1).padStart(2,'0')}</div>
                <div className="h-pixel" style={{ position:'absolute', top: 12, right: 14, fontSize: 9, color: palette.gold, background: 'rgba(0,0,0,.4)', padding:'4px 8px', borderRadius: 4, letterSpacing:'.1em' }}>{p.year}</div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: palette.cyan, marginBottom: 6 }}>{L(p.kind, lang)}</div>
                <div className="h-display" style={{ fontSize: 22, color: palette.inkLight, marginBottom: 6 }}>{L(p.title, lang)}</div>
                <div style={{ fontSize: 14, color: '#94a3b8' }}>{L(p.summary, lang)}</div>
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(34,211,238,.1)', borderRadius: 6, fontSize: 12, color: palette.cyan, display:'inline-flex', alignItems:'center', gap: 6 }}>
                  <span>✓</span> {t('COMPLETED', 'สำเร็จ')}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* YOUTUBE */}
      <section id="youtube" style={{ ...hWrap, paddingBlock: 40 }} className="h-section">
        <SectionTitle num="05" title={L(data.youtube.title, lang)} palette={palette} />

        {/* Channel banner */}
        <div className="h-card" style={{
          padding: 28, marginBottom: 18,
          background: `radial-gradient(circle at 20% 50%, #ff000044, transparent 60%), linear-gradient(135deg, #b91c1c, #7f1d1d)`,
          borderColor: '#ff000066',
          display:'grid', gridTemplateColumns:'auto 1fr auto', gap: 24, alignItems:'center',
          position:'relative', overflow:'hidden',
        }}>
          <div className="h-grid-bg" style={{ position:'absolute', inset:0, opacity:.15 }} />
          <div style={{
            width: 76, height: 76, position:'relative',
            background: '#fff', color: '#ff0000',
            borderRadius: 18, border: `2px solid ${palette.gold}`,
            display:'grid', placeItems:'center',
            boxShadow: `0 8px 24px ${palette.ink}66`,
          }}>
            <svg viewBox="0 0 24 24" width="38" height="38" fill="#ff0000"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div style={{ position:'relative' }}>
            <div className="h-display" style={{ fontSize: 28, color: palette.inkLight }}>{L(data.youtube.channel.name, lang)}</div>
            <div style={{ fontSize: 13, color: '#fca5a5', marginTop: 4 }}>{data.youtube.channel.handle} · {L(data.youtube.channel.tagline, lang)}</div>
            <div style={{ marginTop: 10, display:'flex', gap: 18 }}>
              {[
                [data.youtube.channel.subs, t('SUBS','ผู้ติดตาม')],
                [data.youtube.channel.videos, t('VIDEOS','คลิป')],
                [data.youtube.channel.views, t('VIEWS','วิว')],
              ].map(([v,l],i)=>(
                <div key={i}>
                  <div className="h-display" style={{ fontSize: 22, color: palette.gold, lineHeight: 1 }}>{v}</div>
                  <div className="h-pixel" style={{ fontSize: 9, color:'#fecaca', letterSpacing:'.1em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <a href={data.youtube.channel.url} target="_blank" rel="noopener noreferrer" className="h-btn h-link" style={{ position:'relative', background:'#ff0000', color:'#fff', borderColor:'#ff0000' }}>
            ▶ {t('SUBSCRIBE','ติดตาม')}
          </a>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 16 }}>
          {data.youtube.items.map((v, i) => (
            <a key={i} href={v.url || '#'} target={v.url ? '_blank' : undefined} rel={v.url ? 'noopener noreferrer' : undefined} className="h-card hover h-link" style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap: 16, padding: 14 }}>
              <div style={{
                width: 200, aspectRatio:'16/9',
                background: v.thumbnail ? '#000' : `linear-gradient(135deg, ${v.bg}, ${v.bg}99)`,
                borderRadius: 8, position:'relative',
                display:'grid', placeItems:'center', overflow:'hidden',
                border: `1px solid ${palette.line}`,
              }}>
                {v.thumbnail
                  ? <img src={v.thumbnail} alt={L(v.title, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ fontSize: 50 }}>{v.emoji}</div>
                }
                {v.duration && <div style={{ position:'absolute', bottom: 6, right: 6, background:'rgba(0,0,0,.8)', color:'#fff', padding:'3px 7px', borderRadius: 4, fontFamily:'"JetBrains Mono"', fontSize: 10 }}>{v.duration}</div>}
                <div style={{
                  position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                  background:'rgba(0,0,0,.7)', color:'#fff', width: 44, height: 44, borderRadius:'50%',
                  display:'grid', placeItems:'center', backdropFilter:'blur(4px)',
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div style={{ padding: '6px 8px 6px 0', display:'flex', flexDirection:'column', justifyContent:'space-between', minWidth: 0 }}>
                <div>
                  <div className="h-display" style={{ fontSize: 19, lineHeight: 1.15, color: palette.inkLight, marginBottom: 4 }}>{L(v.title, lang)}</div>
                  <div style={{ fontSize: 12, color: palette.cyan }}>{L(v.kind, lang)}</div>
                </div>
                <div className="h-pixel" style={{ fontSize: 9, color: '#94a3b8', letterSpacing:'.1em' }}>★ {v.views} VIEWS · {v.date}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SCRATCH */}
      <section id="scratch" style={{ ...hWrap, paddingBlock: 40 }} className="h-section">
        <SectionTitle num="06" title={L(data.scratch.title, lang)} palette={palette} />

        <div className="h-card" style={{
          padding: 24, marginBottom: 18,
          background: `radial-gradient(circle at 80% 50%, #fb923c44, transparent 60%), linear-gradient(135deg, #c2410c, #7c2d12)`,
          borderColor: '#fb923c66',
          display:'flex', gap: 20, alignItems:'center',
          position:'relative', overflow:'hidden',
        }}>
          <div className="h-grid-bg" style={{ position:'absolute', inset:0, opacity:.15 }} />
          <div style={{
            width: 64, height: 64, flex:'0 0 64px', position:'relative',
            background:'#fb923c', color:'#fff',
            borderRadius: 14, border:`2px solid ${palette.gold}`,
            display:'grid', placeItems:'center',
            fontFamily:'"Lilita One"', fontSize: 34,
            boxShadow: `0 6px 18px ${palette.ink}66`,
          }}>S</div>
          <div style={{ flex: 1, position:'relative' }}>
            <div className="h-display" style={{ fontSize: 22, color: palette.inkLight }}>scratch.mit.edu/users/{data.scratch.profile.handle}</div>
            <div style={{ fontSize: 13, color:'#fed7aa', marginTop: 4 }}>{L(data.scratch.intro, lang)}</div>
          </div>
          <div style={{ position:'relative', display:'flex', gap: 24 }}>
            <div style={{ textAlign:'center' }}>
              <div className="h-display" style={{ fontSize: 24, color: palette.gold, lineHeight: 1 }}>{data.scratch.profile.followers}</div>
              <div className="h-pixel" style={{ fontSize: 9, color:'#fed7aa', letterSpacing:'.1em' }}>{t('FANS','แฟน')}</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div className="h-display" style={{ fontSize: 24, color: palette.gold, lineHeight: 1 }}>{data.scratch.profile.projectsShared}</div>
              <div className="h-pixel" style={{ fontSize: 9, color:'#fed7aa', letterSpacing:'.1em' }}>{t('PROJECTS','โปรเจกต์')}</div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 16 }}>
          {data.scratch.items.map((s, i) => (
            <a key={s.id || i} href={s.url || '#'} target={s.url ? '_blank' : undefined} rel={s.url ? 'noopener noreferrer' : undefined} className="h-card hover h-link" style={{ overflow:'hidden' }}>
              <div style={{
                aspectRatio:'4/3',
                background: s.thumbnail ? '#000' : `linear-gradient(135deg, ${s.bg}, ${s.bg}88)`,
                position:'relative',
                display:'grid', placeItems:'center',
                borderBottom: `1px solid ${palette.line}`,
                overflow:'hidden',
              }}>
                {s.thumbnail
                  ? <img src={s.thumbnail} alt={L(s.title, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div className="h-float" style={{ fontSize: 60 }}>{s.emoji}</div>
                }
                <div className="h-pixel" style={{ position:'absolute', top: 10, left: 10, background:'rgba(0,0,0,.6)', color:'#fb923c', padding:'3px 8px', borderRadius: 4, fontSize: 9, letterSpacing:'.1em' }}>SCRATCH</div>
              </div>
              <div style={{ padding: 16 }}>
                <div className="h-display" style={{ fontSize: 17, lineHeight: 1.1, color: palette.inkLight, marginBottom: 4 }}>{L(s.title, lang)}</div>
                <div style={{ fontSize: 11, color: palette.cyan, marginBottom: 10 }}>{L(s.kind, lang)}</div>
                <div className="h-pixel" style={{ fontSize: 9, color:'#94a3b8', display:'flex', gap: 8, letterSpacing:'.05em' }}>
                  <span>▶{s.plays}</span>
                  <span>♥{s.loves}</span>
                  <span>▢{s.blocks}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" style={{ ...hWrap, paddingBlock: 40 }} className="h-section">
        <SectionTitle num="07" title={L(data.gallery.title, lang)} palette={palette} />
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20, marginTop: -8 }}>▸ {L(data.gallery.intro, lang)}</div>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4, 1fr)',
          gridAutoRows: '180px',
          gap: 14,
        }}>
          {data.gallery.items.map((g, i) => {
            const span = g.size === 'lg' ? { gridColumn:'span 2', gridRow:'span 2' } :
                         g.size === 'md' ? { gridColumn:'span 2', gridRow:'span 1' } : {};
            const isVid = g.kind === 'video';
            const lbIdx = g.file_url ? galleryImages.indexOf(g) : -1;
            const clickable = lbIdx >= 0;
            return (
              <button key={i} type="button" onClick={() => clickable && setLightbox(lbIdx)} className="h-card hover h-shine" style={{
                ...span,
                background: g.file_url ? '#000' : `linear-gradient(135deg, ${g.bg}, ${g.bg}88), radial-gradient(circle at 30% 30%, ${palette.gold}22, transparent 60%)`,
                position:'relative', overflow:'hidden',
                display:'flex', flexDirection:'column', justifyContent:'flex-end',
                padding: 0, border: 'none', fontFamily: 'inherit',
                cursor: clickable ? 'zoom-in' : 'default',
              }}>
                {g.file_url
                  ? <img src={g.file_url} alt={L(g.label, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ position:'absolute', inset: 0, display:'grid', placeItems:'center' }}>
                      <div className={isVid ? 'h-float' : ''} style={{ fontSize: g.size === 'lg' ? 130 : g.size === 'md' ? 90 : 64, filter:`drop-shadow(0 8px 16px ${palette.ink}88)` }}>{g.emoji}</div>
                    </div>
                }
                <div className="h-pixel" style={{
                  position:'absolute', top: 12, left: 12,
                  background: isVid ? '#ff0000' : 'rgba(0,0,0,.65)',
                  color: '#fff', padding:'4px 9px', borderRadius: 4,
                  fontSize: 9, letterSpacing:'.12em',
                  backdropFilter: 'blur(6px)',
                }}>{isVid ? '▶ VIDEO' : '★ PHOTO'}</div>
                {isVid && (
                  <>
                    {g.duration && <div className="h-pixel" style={{ position:'absolute', top: 12, right: 12, background:'rgba(0,0,0,.65)', color:'#fff', padding:'4px 9px', borderRadius: 4, fontSize: 9, backdropFilter:'blur(6px)' }}>{g.duration}</div>}
                    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width: 48, height: 48, background:'rgba(0,0,0,.6)', borderRadius:'50%', display:'grid', placeItems:'center', backdropFilter:'blur(6px)', border:`1px solid ${palette.gold}` }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </>
                )}
                <div style={{
                  position:'relative', zIndex: 1,
                  background: `linear-gradient(transparent, rgba(0,0,0,.85))`,
                  color: '#fff', padding: '28px 16px 14px',
                  textAlign: 'left',
                }}>
                  <div className="h-display" style={{ fontSize: g.size === 'lg' ? 22 : 16, lineHeight: 1.1 }}>{L(g.label, lang)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ACHIEVEMENTS — trophies + certificates */}
      <section id="achievements" style={{ ...hWrap, paddingBlock: 40 }} className="h-section">
        <SectionTitle num="08" title={L(data.achievements.title, lang)} palette={palette} />

        {/* Sub-row: TROPHIES */}
        <div style={{ display:'flex', alignItems:'baseline', gap: 14, marginBottom: 18 }}>
          <span className="h-pixel" style={{ fontSize: 11, color: palette.gold, letterSpacing:'.12em' }}>▸ TROPHIES</span>
          <span className="h-display" style={{ fontSize: 22, color: palette.inkLight }}>{L(data.awards.title, lang)}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {data.awards.items.map((a, i) => (
            <div key={i} className="h-card hover" style={{ padding: 28, textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div className="h-grid-bg" style={{ position:'absolute', inset:0, opacity: .15 }} />
              <div style={{ position:'relative' }}>
                <div className="h-float" style={{ fontSize: 78, marginBottom: 6, lineHeight: 1, filter: `drop-shadow(0 6px 12px ${palette.gold}66)` }}>{a.medal}</div>
                <div style={{
                  display:'inline-block',
                  background: palette.gold, color: palette.ink,
                  padding: '4px 16px', borderRadius: 999,
                  fontFamily:'"Lilita One"', fontSize: 14, letterSpacing:'.06em',
                  border: `2px solid ${palette.ink}`,
                  marginBottom: 12,
                }}>{L(a.rank, lang)}</div>
                <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.3, color: palette.inkLight }}>{L(a.name, lang)}</div>
                <div className="h-pixel" style={{ fontSize: 10, color: '#94a3b8', marginTop: 10, letterSpacing:'.1em' }}>· {a.year} ·</div>
                {a.file_url && (
                  /\.pdf(\?|$)/i.test(a.file_url) ? (
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="h-link" style={{
                      display:'inline-block', marginTop: 12,
                      background: palette.gold, color: palette.ink,
                      padding: '4px 14px', borderRadius: 999,
                      fontFamily:'"Lilita One"', fontSize: 12, letterSpacing:'.06em',
                      border: `2px solid ${palette.ink}`,
                    }}>📄 {t('VIEW PDF','ดูเอกสาร')}</a>
                  ) : (
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{ display:'block', marginTop: 12 }}>
                      <img src={a.file_url} alt="" style={{
                        width:'100%', maxHeight: 110, objectFit:'cover',
                        border:`2px solid ${palette.gold}`, borderRadius: 6,
                      }} />
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sub-row: CERTIFICATES */}
        <div style={{ display:'flex', alignItems:'baseline', gap: 14, marginBottom: 18 }}>
          <span className="h-pixel" style={{ fontSize: 11, color: palette.gold, letterSpacing:'.12em' }}>▸ ITEMS</span>
          <span className="h-display" style={{ fontSize: 22, color: palette.inkLight }}>{L(data.certificates.title, lang)}</span>
        </div>
        <div className="h-card" style={{ padding: 28 }}>
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginBottom: 24, alignItems:'center' }}>
            <span className="h-pixel" style={{ fontSize: 10, color: palette.gold, letterSpacing:'.12em', marginRight: 8 }}>▸ FILTER ITEMS</span>
            {data.certificates.categories.map((c) => (
              <button key={c.id} onClick={()=>setFilter(c.id)} className={'h-chip' + (filter===c.id ? ' active' : '')}>
                {L(c.label, lang)}
              </button>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16 }}>
            {filteredCerts.map((c, i) => (
              <button key={c.id} onClick={()=>setCert(c)} className="h-card-paper h-shine" style={{
                padding: 20,
                borderRadius: 14,
                border: `2px solid ${palette.ink}`,
                background: `linear-gradient(180deg, ${c.color} 0%, ${c.color}cc 100%)`,
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: palette.ink,
                textAlign:'left',
                minHeight: 170,
                position:'relative',
                overflow:'hidden',
                transition: 'transform .25s, box-shadow .25s',
                display:'flex', flexDirection:'column', justifyContent:'space-between',
              }}
              onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 14px 30px -8px ${palette.ink}99`; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
              >
                <div>
                  <div className="h-pixel" style={{ fontSize: 9, color: palette.ink, opacity:.7, marginBottom: 10, letterSpacing:'.12em' }}>№ {String(i+1).padStart(3,'0')} · {c.date}</div>
                  <div className="h-display" style={{ fontSize: 21, lineHeight: 1.1 }}>{L(c.name, lang)}</div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop: 16 }}>
                  <div style={{ fontSize: 12, opacity:.8 }}>{L(c.issuer, lang)}</div>
                  <div style={{
                    background: palette.ink, color: palette.gold,
                    padding:'4px 12px', borderRadius: 999,
                    fontFamily:'"Lilita One"', fontSize: 12, letterSpacing:'.05em',
                  }}>VIEW ↗</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ ...hWrap, paddingBlock: '40px 80px' }} className="h-section">
        <div className="h-card" style={{
          padding: 60,
          textAlign:'center',
          background: `radial-gradient(ellipse at top, ${palette.sky2}66, transparent 60%),
                       radial-gradient(ellipse at bottom right, ${palette.sky3}44, transparent 60%),
                       linear-gradient(180deg, #1a1f3a, #0e1226)`,
          borderColor: palette.gold + '66',
          position:'relative',
        }}>
          <div className="h-grid-bg" style={{ position:'absolute', inset:0, opacity:.2 }} />
          <div style={{ position:'relative' }}>
            <div className="h-pixel" style={{ fontSize: 11, color: palette.gold, marginBottom: 16, letterSpacing:'.15em' }}>▸ FINAL STAGE</div>
            <h2 className="h-display" style={{
              fontSize: 'clamp(56px, 8vw, 120px)', margin: 0, lineHeight: .95,
              background: `linear-gradient(180deg, ${palette.inkLight}, ${palette.gold})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 4px 0 ${palette.ink})`,
            }}>
              {t('JOIN MY PARTY!', 'มาร่วมทีมกัน!')}
            </h2>
            <div style={{ fontSize: 18, color: '#cbd5e1', marginTop: 20, maxWidth: 540, marginInline:'auto' }}>
              {t("Send a message and let's go on an adventure together.", 'ส่งข้อความหาฉัน แล้วไปผจญภัยด้วยกันนะ')}
            </div>
            <div style={{ marginTop: 36, display:'flex', flexWrap:'wrap', justifyContent:'center', gap: 12 }}>
              {data.social.items.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="h-link" title={s.label} aria-label={s.label} style={{
                  background:'rgba(255,255,255,.06)',
                  border:`1.5px solid ${palette.line}`,
                  padding:'10px 18px', borderRadius: 999,
                  display:'inline-flex', alignItems:'center', gap: 10,
                  fontSize: 14, transition: 'all .15s',
                }}
                onMouseEnter={(e)=>{e.currentTarget.style.borderColor = palette.gold; e.currentTarget.style.color = palette.gold;}}
                onMouseLeave={(e)=>{e.currentTarget.style.borderColor = palette.line; e.currentTarget.style.color = palette.inkLight;}}
                >
                  {s._icon_resolved && (
                    <img src={s._icon_resolved} alt="" style={{ width: 20, height: 20, display: 'block', filter: 'brightness(0) invert(1)', opacity: 0.85 }} />
                  )}
                  <span>{L(s.value, lang)}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24, display:'flex', justifyContent:'space-between', fontFamily:'"JetBrains Mono", monospace', fontSize: 11, color: '#64748b' }}>
          <div>© 2026 · {L(data.meta.name, lang)} · LVL.{data.meta.age}</div>
          <div>{t('PRESS START TO CONTINUE', 'กด START เพื่อเริ่มต่อ')}</div>
        </div>
      </section>

      <CertificateModal cert={cert} lang={lang} onClose={()=>setCert(null)} palette={{ ...palette, paper: palette.paper, ink: palette.ink, accent: palette.pink }} />
      <GalleryLightbox items={galleryImages} index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} lang={lang} />
    </div>
  );
}

const hWrap = { maxWidth: 1240, margin: '0 auto', paddingInline: 32 };

function CharacterCard({ data, lang, palette, t }) {
  return (
    <div style={{
      width: 320,
      background: `linear-gradient(180deg, ${palette.gold} 0%, ${palette.pink} 50%, ${palette.sky2} 100%)`,
      padding: 5,
      borderRadius: 22,
      boxShadow: `0 30px 60px -15px ${palette.ink}cc, 0 0 0 1px ${palette.gold}aa`,
      transform: 'rotate(3deg)',
      transition: 'transform .35s cubic-bezier(.2,1.4,.4,1)',
    }}
    onMouseEnter={(e)=>e.currentTarget.style.transform='rotate(0) translateY(-4px) scale(1.02)'}
    onMouseLeave={(e)=>e.currentTarget.style.transform='rotate(3deg)'}
    >
      <div style={{
        background: palette.bg, borderRadius: 18, padding: 18,
        position:'relative', overflow:'hidden',
      }}>
        {/* Holographic sheen */}
        <div style={{
          position:'absolute', inset:0,
          background: `linear-gradient(135deg, transparent 30%, ${palette.cyan}22 50%, transparent 70%)`,
          pointerEvents:'none',
        }} />

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
          <div className="h-pixel" style={{ fontSize: 10, color: palette.gold, letterSpacing:'.12em' }}>★ HERO CARD</div>
          <div className="h-pixel" style={{ fontSize: 10, color: palette.cyan, background: palette.bg, padding:'3px 8px', borderRadius: 999, border:`1px solid ${palette.cyan}` }}>LVL.{data.meta.age}</div>
        </div>

        {/* Portrait area */}
        <div style={{
          aspectRatio: '1',
          background: `radial-gradient(circle, ${palette.sky2}, ${palette.bg}),
                       radial-gradient(circle at 30% 30%, ${palette.cyan}aa, transparent 50%)`,
          borderRadius: 12, position:'relative', overflow:'hidden',
          display:'grid', placeItems:'center',
          border: `2px solid ${palette.gold}88`,
        }}>
          {/* sparkles */}
          {[[15,20,8],[80,25,6],[20,80,5],[78,75,7],[50,15,4]].map(([l,top,sz],i)=>(
            <div key={i} style={{ position:'absolute', left: `${l}%`, top: `${top}%`, width: sz, height: sz, background: palette.gold, borderRadius:'50%', boxShadow:`0 0 ${sz*2}px ${palette.gold}` }} />
          ))}
          {data.meta.avatar_url ? (
            <img src={data.meta.avatar_url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
          ) : (
            <div className="h-display" style={{
              fontSize: 130, lineHeight: 1, color: palette.gold,
              textShadow: `0 4px 0 ${palette.ink}, 0 0 30px ${palette.gold}88`,
            }}>{L(data.meta.nickname, lang).charAt(0)}</div>
          )}
        </div>

        {/* Name */}
        <div style={{ marginTop: 12 }}>
          <div className="h-display" style={{ fontSize: 22, color: palette.inkLight, lineHeight: 1 }}>{L(data.meta.nickname, lang)}</div>
          <div className="h-pixel" style={{ fontSize: 9, color: palette.cyan, marginTop: 4, letterSpacing:'.1em' }}>· {L(data.meta.role, lang).toUpperCase()} ·</div>
        </div>

        {/* Mini stats */}
        <div style={{ marginTop: 12, display:'grid', gap: 6 }}>
          {data.powers.items.slice(0, 3).map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <div style={{ width: 22, height: 22, background: p.color, borderRadius: 5, display:'grid', placeItems:'center', fontFamily:'"Lilita One"', fontSize: 11, color:'#fff' }}>{p.letter}</div>
              <div style={{ flex: 1, fontSize: 11, color: '#cbd5e1' }}>{L(p.name, lang)}</div>
              <div className="h-pixel" style={{ fontSize: 9, color: palette.gold }}>{p.level*20}</div>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div className="h-pixel" style={{
          marginTop: 12, padding:'6px 8px',
          background: palette.gold, color: palette.ink,
          fontSize: 9, letterSpacing:'.15em',
          borderRadius: 4, textAlign:'center',
        }}>★ {L(data.meta.available, lang).toUpperCase()} ★</div>
      </div>
    </div>
  );
}

function SectionTitle({ num, title, palette }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', gap: 16, marginBottom: 24, paddingTop: 24, borderTop: `1px solid ${palette.line}` }}>
      <span className="h-pixel" style={{ fontSize: 12, color: palette.gold, letterSpacing:'.12em' }}>▸ {num}</span>
      <span className="h-display" style={{ fontSize: 38, color: palette.inkLight }}>{title}</span>
    </div>
  );
}

function LangToggleHero({ lang, onLangChange, palette }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center',
      background:'rgba(255,255,255,.06)',
      border:`1.5px solid ${palette.line}`,
      borderRadius: 999, padding: 2, marginLeft: 8,
      fontFamily:'"JetBrains Mono", monospace',
    }}>
      {['en','th'].map((l)=>(
        <button key={l} onClick={()=>onLangChange(l)} style={{
          background: lang === l ? palette.gold : 'transparent',
          color: lang === l ? palette.ink : palette.inkLight,
          border:'none', padding:'3px 10px', borderRadius: 999,
          cursor:'pointer', fontFamily:'inherit',
          fontSize: 11, fontWeight: lang === l ? 700 : 400,
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

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
  const lbBtn = ({ top, left, right, w, fs }) => ({
    position: 'absolute', top: top != null ? top : '50%', left, right,
    transform: top != null ? undefined : 'translateY(-50%)',
    background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none',
    width: w, height: w, borderRadius: '50%', cursor: 'pointer', fontSize: fs, lineHeight: 1, fontFamily: 'system-ui',
  });
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1001, display: 'grid', placeItems: 'center', padding: 24 }}>
      <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} style={lbBtn({ top: 16, right: 16, w: 40, fs: 18 })}>✕</button>
      {items.length > 1 && (
        <React.Fragment>
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange((index - 1 + items.length) % items.length); }} style={lbBtn({ left: 16, w: 48, fs: 26 })}>‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange((index + 1) % items.length); }} style={lbBtn({ right: 16, w: 48, fs: 26 })}>›</button>
        </React.Fragment>
      )}
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <img src={it.file_url} alt={typeof L === 'function' ? L(it.label, lang) : ''} style={{ maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }} />
        <div style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>
          {typeof L === 'function' ? L(it.label, lang) : ''}
          <span style={{ opacity: 0.55, marginLeft: 12 }}>{index + 1} / {items.length}</span>
        </div>
      </div>
    </div>
  );
}

window.PortfolioHero = PortfolioHero;
