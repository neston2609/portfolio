// Variation 4 — "CAPY" 🦫
// Capybara theme: chill, warm, zen vibes. Hot-spring browns + yuzu yellow +
// moss green. SVG capybara illustrations, water ripples, floating yuzu fruit.

const { useState: useStateP, useMemo: useMemoP } = React;

function PortfolioCapy({ lang, onLangChange }) {
  const [cert, setCert] = useStateP(null);
  const [filter, setFilter] = useStateP('all');
  const [lightbox, setLightbox] = useStateP(null);
  const data = PORTFOLIO_DATA;
  const galleryImages = useMemoP(() => (data.gallery?.items || []).filter((g) => g.file_url), [data.gallery]);

  const palette = {
    paper: '#f5ead4',          // warm cream
    paperDeep: '#e8d9b8',
    ink: '#3d2818',            // chocolate brown
    inkSoft: '#7a5c42',
    brown: '#8b5a3c',          // capybara fur
    brownDark: '#5e3a24',
    yuzu: '#fbbf24',           // citrus yellow
    moss: '#84a259',           // soft green
    sky: '#a8d8e8',            // bath water
    pink: '#f9a8a8',           // blush
    accent: '#fbbf24',
    line: '#3d281833',
  };

  const filteredCerts = useMemoP(() => {
    if (filter === 'all') return data.certificates.items;
    return data.certificates.items.filter((c) => c.category === filter);
  }, [filter]);

  const t = (en, th) => (lang === 'th' ? th : en);

  return (
    <div style={{
      background: palette.paper,
      color: palette.ink,
      fontFamily: '"Nunito", "IBM Plex Sans Thai", system-ui, sans-serif',
      fontSize: 16,
      lineHeight: 1.55,
      minHeight: '100vh',
      backgroundImage: `
        radial-gradient(ellipse at 12% 14%, ${palette.moss}22 0%, transparent 30%),
        radial-gradient(ellipse at 88% 10%, ${palette.sky}33 0%, transparent 28%),
        radial-gradient(ellipse at 50% 92%, ${palette.yuzu}22 0%, transparent 32%)
      `,
    }}>
      <style>{`
        .p-display { font-family: "Fredoka", "IBM Plex Sans Thai", system-ui, sans-serif; font-weight: 600; letter-spacing: -0.01em; line-height: 1.05; }
        .p-round   { font-family: "Fredoka", "IBM Plex Sans Thai", system-ui, sans-serif; }
        .p-hand    { font-family: "Caveat", "IBM Plex Sans Thai", cursive; font-weight: 600; }
        .p-mono    { font-family: "JetBrains Mono", monospace; }
        .p-link    { color: inherit; text-decoration: none; transition: color .2s; }
        .p-link:hover { color: ${palette.brown}; }

        .p-card { background: #fff8e8; border: 2px solid ${palette.ink};
                  border-radius: 24px; padding: 24px; position: relative;
                  box-shadow: 4px 4px 0 ${palette.ink};
                  transition: transform .3s cubic-bezier(.2,1.4,.4,1), box-shadow .3s; }
        .p-card.hover:hover { transform: translateY(-3px); box-shadow: 6px 6px 0 ${palette.ink}; }

        .p-chip { background: #fff8e8; color: ${palette.ink}; border: 2px solid ${palette.ink};
                  padding: 5px 14px; border-radius: 999px; cursor: pointer;
                  font-family: inherit; font-size: 13px; font-weight: 600;
                  box-shadow: 2px 2px 0 ${palette.ink};
                  transition: transform .15s; }
        .p-chip:hover { transform: translate(-1px,-1px); }
        .p-chip.active { background: ${palette.yuzu}; }

        .p-btn { background: ${palette.brown}; color: #fff8e8;
                 border: 2px solid ${palette.ink}; padding: 11px 22px;
                 border-radius: 999px; cursor: pointer;
                 font-family: "Fredoka", system-ui; font-size: 15px; font-weight: 600;
                 box-shadow: 3px 3px 0 ${palette.ink};
                 transition: transform .15s, box-shadow .15s;
                 display: inline-flex; align-items: center; gap: 8px; }
        .p-btn:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 ${palette.ink}; }
        .p-btn.yuzu { background: ${palette.yuzu}; color: ${palette.ink}; }
        .p-btn.ghost { background: transparent; box-shadow: none; color: ${palette.ink}; }
        .p-btn.ghost:hover { background: #fff8e8; box-shadow: none; }

        @keyframes pRise { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: none; } }
        .p-section { animation: pRise .6s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes pBob { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
        .p-bob { animation: pBob 4s ease-in-out infinite; transform-origin: center; }
        @keyframes pFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .p-float { animation: pFloat 3s ease-in-out infinite; }
        @keyframes pRipple { 0% { transform: scale(0.5); opacity: 0.7; } 100% { transform: scale(2.5); opacity: 0; } }
        .p-ripple { animation: pRipple 3s ease-out infinite; }
        @keyframes pZzz { 0%,100%{opacity:.3; transform:translate(0,0) scale(.8)} 50%{opacity:1; transform:translate(4px,-6px) scale(1.1)} }
        .p-zzz { animation: pZzz 2.5s ease-in-out infinite; }

        /* Subtle paper texture */
        .p-texture::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(${palette.ink}06 1px, transparent 1.2px);
          background-size: 16px 16px;
          border-radius: inherit;
        }
      `}</style>

      {/* TOP BAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: palette.paper + 'ee', backdropFilter: 'blur(10px)',
        borderBottom: `2px solid ${palette.ink}`,
      }}>
        <div style={{ ...pWrap, display:'flex', justifyContent:'space-between', alignItems:'center', height: 64 }}>
          <a href="#top" className="p-link" style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <div style={{ width: 42, height: 42, position:'relative', borderRadius:'50%', overflow:'hidden', border: data.meta.avatar_url ? `2px solid ${palette.brown}` : 'none' }}>
              {data.meta.avatar_url
                ? <img src={data.meta.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <CapybaraIcon palette={palette} size={42} />}
            </div>
            <div style={{ display:'flex', flexDirection:'column', lineHeight: 1.1 }}>
              <span className="p-display" style={{ fontSize: 20 }}>{L(data.meta.name, lang)}</span>
              <span className="p-hand" style={{ fontSize: 14, color: palette.brown }}>{t('chill student','นักเรียนน่ารัก')} 🍊</span>
            </div>
          </a>
          <div style={{ display:'flex', gap: 4, alignItems:'center' }}>
            {[['about','About','รู้จัก'],['powers','Powers','พลัง'],['quests','Quests','ภารกิจ'],['youtube','YouTube','ยูทูบ'],['scratch','Scratch','สแครชต์'],['gallery','Gallery','อัลบั้ม'],['achievements','Achievements','ความสำเร็จ']].map(([id,en,th])=>(
              <a key={id} href={`#${id}`} className="p-link" style={{ padding:'6px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}>{t(en,th)}</a>
            ))}
            <LangToggleCapy lang={lang} onLangChange={onLangChange} palette={palette} />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="top" style={{ ...pWrap, paddingBlock: '48px 64px', position:'relative' }} className="p-section">
        {/* floating yuzu in background */}
        <div className="p-float" style={{ position:'absolute', top: 24, left: '8%', fontSize: 36, opacity: .8 }}>🍊</div>
        <div className="p-bob" style={{ position:'absolute', top: 120, right: '12%', fontSize: 28, animationDelay:'1s' }}>🌿</div>
        <div className="p-float" style={{ position:'absolute', bottom: 80, right: 60, fontSize: 32, animationDelay:'.5s' }}>🍃</div>

        <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap: 56, alignItems:'center' }}>
          <div>
            {data.meta.avatar_url && (
              <div style={{
                display:'inline-block', position:'relative', marginBottom: 22,
                transform:'rotate(-3deg)',
              }}>
                <div style={{
                  width: 140, height: 140, borderRadius:'50%', overflow:'hidden',
                  border: `4px solid ${palette.ink}`, background: palette.paper,
                  boxShadow:`6px 6px 0 ${palette.ink}`,
                }}>
                  <img src={data.meta.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                {/* tiny yuzu sticker on the side */}
                <div style={{
                  position:'absolute', top: -8, right: -6, fontSize: 26,
                  transform:'rotate(12deg)',
                }}>🍊</div>
              </div>
            )}
            <div className="p-hand" style={{ fontSize: 28, color: palette.brown, marginBottom: 8 }}>
              ✿ {L(data.meta.hello, lang)} ({t('no worries!','สบายๆ!')}) ✿
            </div>
            <h1 className="p-display" style={{
              fontSize: 'clamp(64px, 8.5vw, 124px)',
              margin: 0, lineHeight: .95,
              color: palette.brownDark,
            }}>
              {L(data.meta.name, lang)}
            </h1>
            <div className="p-hand" style={{ marginTop: 16, fontSize: 30, color: palette.moss, transform:'rotate(-1deg)', display:'inline-block' }}>
              ↳ {L(data.meta.role, lang)}
            </div>
            <div className="p-round" style={{ marginTop: 20, fontSize: 18, color: palette.inkSoft, maxWidth: 480 }}>
              {L(data.about.intro, lang)}
            </div>
            <div style={{ marginTop: 28, display:'flex', gap: 12, flexWrap:'wrap', alignItems:'center' }}>
              <a href="#contact" className="p-btn yuzu p-link">{t('say hi','ทักทาย')} 🍊</a>
              <a href="#" className="p-btn p-link">{t('download CV','ดาวน์โหลด CV')} ↓</a>
            </div>
          </div>

          {/* Hot spring scene */}
          <HotSpringScene palette={palette} data={data} lang={lang} />
        </div>
      </section>

      {/* QUICK FACTS — wide strip */}
      <section style={{ ...pWrap, paddingBlock: 16 }}>
        <div className="p-card" style={{ padding: '20px 28px', display:'flex', gap: 32, alignItems:'center', flexWrap:'wrap', background: palette.yuzu }}>
          <div className="p-hand" style={{ fontSize: 26, transform:'rotate(-3deg)' }}>★ {t('quick facts','รู้จักด่วน')} ★</div>
          {[
            [t('age','อายุ'), data.meta.age],
            [t('grade','ชั้น'), L(data.meta.grade, lang)],
            [t('school','โรงเรียน'), L(data.meta.school, lang)],
            [t('vibe','โหมด'), t('chill 🦫','สบายๆ 🦫')],
          ].map(([k,v], i) => (
            <div key={i} style={{ flex: 1, minWidth: 120, paddingLeft: i === 0 ? 0 : 20, borderLeft: i === 0 ? 'none' : `2px dashed ${palette.ink}55` }}>
              <div className="p-mono" style={{ fontSize: 11, color: palette.brownDark, letterSpacing:'.1em', textTransform:'uppercase' }}>{k}</div>
              <div className="p-display" style={{ fontSize: 18, color: palette.ink, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ ...pWrap, paddingBlock: 40 }} className="p-section">
        <CapyHeader num="01" title={L(data.about.title, lang)} subtitle={t('a chill little intro','เรื่องเล่าสบายๆ')} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 20 }}>
          <div className="p-card" style={{ padding: 36, position:'relative', overflow:'hidden' }}>
            <p className="p-round" style={{ fontSize: 20, lineHeight: 1.6, margin: 0 }}>
              {L(data.about.intro, lang)}
            </p>
            <div style={{ marginTop: 22, padding: '14px 18px', background: palette.sky + '55', borderRadius: 14, border: `2px solid ${palette.ink}`, display:'inline-flex', gap: 12, alignItems:'center' }}>
              <span style={{ fontSize: 22 }}>🦫</span>
              <span className="p-hand" style={{ fontSize: 22, color: palette.brownDark }}>
                {t("motto:", "คำขวัญ:")} "{L(data.meta.motto, lang)}"
              </span>
            </div>
            {/* zzz */}
            <span className="p-zzz" style={{ position:'absolute', top: 22, right: 36, fontSize: 18, color: palette.brown }}>z</span>
            <span className="p-zzz" style={{ position:'absolute', top: 14, right: 24, fontSize: 22, color: palette.brown, animationDelay:'.5s' }}>z</span>
          </div>
          <div style={{ display:'grid', gap: 14 }}>
            {data.about.favorites.map((f, i) => (
              <div key={i} className="p-card hover" style={{
                padding: 18, display:'flex', alignItems:'center', gap: 14,
                background: [palette.moss + '33', palette.yuzu + '55', palette.pink + '55'][i],
              }}>
                <div style={{ fontSize: 36 }}>{['🌱','⭐','💡'][i]}</div>
                <div>
                  <div className="p-mono" style={{ fontSize: 10, color: palette.brownDark, letterSpacing:'.1em', textTransform:'uppercase' }}>{L(f.label, lang)}</div>
                  <div className="p-display" style={{ fontSize: 22, marginTop: 2 }}>{L(f.value, lang)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POWERS */}
      <section id="powers" style={{ ...pWrap, paddingBlock: 40 }} className="p-section">
        <CapyHeader num="02" title={L(data.powers.title, lang)} subtitle={t('things I can do','สิ่งที่ทำได้')} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16 }}>
          {data.powers.items.map((p, i) => (
            <div key={i} className="p-card hover" style={{ padding: 22, display:'flex', gap: 14, alignItems:'center' }}>
              <div style={{
                width: 58, height: 58, flex:'0 0 58px',
                background: p.color, color:'#fff',
                border: `2.5px solid ${palette.ink}`,
                borderRadius: '50%',
                display:'grid', placeItems:'center',
                fontFamily:'"Fredoka", system-ui', fontWeight: 700, fontSize: 28,
                boxShadow: `2px 2px 0 ${palette.ink}`,
              }}>{p.letter}</div>
              <div style={{ flex: 1 }}>
                <div className="p-display" style={{ fontSize: 22 }}>{L(p.name, lang)}</div>
                <div style={{ display:'flex', gap: 4, marginTop: 6, alignItems:'center' }}>
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ fontSize: 16 }}>{s <= p.level ? '🍊' : '○'}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" style={{ ...pWrap, paddingBlock: 40 }} className="p-section">
        <CapyHeader num="03" title={L(data.education.title, lang)} subtitle={t('where I learned','สถานที่เรียน')} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 20 }}>
          {data.education.items.map((it, i) => (
            <div key={i} className="p-card hover" style={{ padding: 28, position:'relative', overflow:'hidden' }}>
              <div style={{
                position:'absolute', top:-30, right:-30, fontSize: 90, opacity: .15,
              }}>{i === 0 ? '🌳' : '🌿'}</div>
              <div style={{
                display:'inline-block',
                background: i === 0 ? palette.yuzu : palette.sky,
                border: `2px solid ${palette.ink}`,
                padding:'3px 12px', borderRadius: 999,
                fontFamily:'"Fredoka", system-ui', fontWeight: 600,
                fontSize: 12, letterSpacing:'.05em',
                marginBottom: 12,
              }}>
                {i === 0 ? t('NOW','ตอนนี้') : t('BEFORE','ก่อนหน้า')}
              </div>
              <div className="p-display" style={{ fontSize: 28, marginBottom: 8 }}>{L(it.school, lang)}</div>
              <div className="p-round" style={{ fontSize: 16, color: palette.inkSoft, marginBottom: 6 }}>{L(it.degree, lang)}</div>
              <div className="p-round" style={{ fontSize: 14, color: palette.inkSoft }}>{L(it.detail, lang)}</div>
              <div className="p-mono" style={{ fontSize: 12, color: palette.brown, marginTop: 14, paddingTop: 12, borderTop: `1.5px dashed ${palette.line}` }}>{it.period}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS / QUESTS */}
      <section id="quests" style={{ ...pWrap, paddingBlock: 40 }} className="p-section">
        <CapyHeader num="04" title={L(data.projects.title, lang)} subtitle={t('cool stuff I made','ของเจ๋งๆ ที่ทำ')} palette={palette} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16 }}>
          {data.projects.items.map((p, i) => (
            <a key={i} href="#" className="p-card hover p-link" style={{ padding: 0, overflow:'hidden' }}>
              <div style={{
                aspectRatio:'4/3', background: p.bg,
                display:'grid', placeItems:'center', position:'relative',
                borderBottom: `2px solid ${palette.ink}`,
              }}>
                <div className="p-float" style={{ fontSize: 84 }}>{p.emoji}</div>
                <div style={{ position:'absolute', top: 10, left: 12, background:'#fff8e8', color: palette.ink, padding:'3px 10px', borderRadius: 999, fontFamily:'"Fredoka"', fontWeight: 600, fontSize: 11, border:`2px solid ${palette.ink}` }}>{p.year}</div>
              </div>
              <div style={{ padding: 18 }}>
                <div className="p-mono" style={{ fontSize: 11, color: palette.brown, textTransform:'uppercase', letterSpacing:'.1em', marginBottom: 6 }}>{L(p.kind, lang)}</div>
                <div className="p-display" style={{ fontSize: 22, marginBottom: 6 }}>{L(p.title, lang)}</div>
                <div className="p-round" style={{ fontSize: 14, color: palette.inkSoft }}>{L(p.summary, lang)}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* YOUTUBE */}
      <section id="youtube" style={{ ...pWrap, paddingBlock: 40 }} className="p-section">
        <CapyHeader num="05" title={L(data.youtube.title, lang)} subtitle={t('come watch!','มาดูกัน!')} palette={palette} />
        <div className="p-card" style={{ padding: 24, marginBottom: 20, background: '#fff8e8', display:'flex', gap: 18, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{
            width: 70, height: 70,
            background: '#ff0000', borderRadius:'50%',
            border:`2.5px solid ${palette.ink}`,
            boxShadow:`3px 3px 0 ${palette.ink}`,
            display:'grid', placeItems:'center',
          }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="p-display" style={{ fontSize: 24 }}>{L(data.youtube.channel.name, lang)}</div>
            <div className="p-hand" style={{ fontSize: 18, color: palette.brown }}>{data.youtube.channel.handle} · {L(data.youtube.channel.tagline, lang)}</div>
          </div>
          <div style={{ display:'flex', gap: 18 }}>
            {[
              [data.youtube.channel.subs, t('subs','ติดตาม')],
              [data.youtube.channel.videos, t('clips','คลิป')],
              [data.youtube.channel.views, t('views','วิว')],
            ].map(([v,l],i)=>(
              <div key={i} style={{ textAlign:'center' }}>
                <div className="p-display" style={{ fontSize: 22 }}>{v}</div>
                <div className="p-mono" style={{ fontSize: 10, color: palette.brown, textTransform:'uppercase', letterSpacing:'.1em' }}>{l}</div>
              </div>
            ))}
          </div>
          <a href={data.youtube.channel.url} target="_blank" rel="noopener noreferrer" className="p-btn yuzu p-link">▶ {t('subscribe','ติดตาม')}</a>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 16 }}>
          {data.youtube.items.map((v, i) => (
            <a key={i} href={v.url || '#'} target={v.url ? '_blank' : undefined} rel={v.url ? 'noopener noreferrer' : undefined} className="p-card hover p-link" style={{ padding: 14, display:'grid', gridTemplateColumns:'auto 1fr', gap: 16 }}>
              <div style={{
                width: 180, aspectRatio:'16/9', background: v.thumbnail ? '#000' : v.bg,
                border:`2px solid ${palette.ink}`, borderRadius: 12,
                display:'grid', placeItems:'center', position:'relative', overflow:'hidden',
              }}>
                {v.thumbnail
                  ? <img src={v.thumbnail} alt={L(v.title, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ fontSize: 50 }}>{v.emoji}</div>
                }
                {v.duration && <div className="p-mono" style={{ position:'absolute', bottom: 6, right: 6, background:'rgba(0,0,0,.75)', color:'#fff', padding:'2px 7px', borderRadius: 4, fontSize: 10 }}>{v.duration}</div>}
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width: 42, height: 42, background:'#ff0000', borderRadius:'50%', border:`2px solid ${palette.ink}`, display:'grid', placeItems:'center', boxShadow:`2px 2px 0 ${palette.ink}` }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div style={{ padding:'6px 8px 6px 0', display:'flex', flexDirection:'column', justifyContent:'space-between', minWidth: 0 }}>
                <div>
                  <div className="p-display" style={{ fontSize: 18, lineHeight: 1.2, marginBottom: 4 }}>{L(v.title, lang)}</div>
                  <div className="p-hand" style={{ fontSize: 16, color: palette.brown }}>· {L(v.kind, lang)}</div>
                </div>
                <div className="p-mono" style={{ fontSize: 11, color: palette.inkSoft }}>★ {v.views} · {v.date}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SCRATCH */}
      <section id="scratch" style={{ ...pWrap, paddingBlock: 40 }} className="p-section">
        <CapyHeader num="06" title={L(data.scratch.title, lang)} subtitle={t('coding adventures','ผจญภัยกับโค้ด')} palette={palette} />
        <div className="p-card" style={{ padding: 22, marginBottom: 20, background: '#fb923c', color:'#fff8e8', display:'flex', gap: 16, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{
            width: 56, height: 56, flex:'0 0 56px',
            background: '#fff8e8', color: '#fb923c',
            border:`2.5px solid ${palette.ink}`, borderRadius: 14,
            display:'grid', placeItems:'center',
            fontFamily:'"Fredoka"', fontWeight: 700, fontSize: 28,
            boxShadow:`2px 2px 0 ${palette.ink}`,
          }}>S</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <a href={data.scratch.profile.url} target="_blank" rel="noopener noreferrer" className="p-link p-display" style={{ fontSize: 20 }}>
              scratch.mit.edu/users/{data.scratch.profile.handle}
            </a>
            <div className="p-hand" style={{ fontSize: 18, marginTop: 2 }}>{L(data.scratch.intro, lang)}</div>
          </div>
          <a href={data.scratch.profile.url} target="_blank" rel="noopener noreferrer" className="p-btn p-link" style={{ background:'#fff8e8', color:'#fb923c' }}>
            {t('visit profile','ไปโปรไฟล์')} ↗
          </a>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 16 }}>
          {data.scratch.items.map((s, i) => (
            <a key={s.id || i} href={s.url || '#'} target={s.url ? '_blank' : undefined} rel={s.url ? 'noopener noreferrer' : undefined} className="p-card hover p-link" style={{ padding: 0, overflow:'hidden' }}>
              <div style={{
                aspectRatio:'4/3', background: s.thumbnail ? '#000' : s.bg,
                display:'grid', placeItems:'center', position:'relative',
                borderBottom:`2px solid ${palette.ink}`,
                overflow:'hidden',
              }}>
                {s.thumbnail
                  ? <img src={s.thumbnail} alt={L(s.title, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div className="p-float" style={{ fontSize: 56 }}>{s.emoji}</div>
                }
                <div style={{ position:'absolute', top: 8, left: 8, background:'#fb923c', color:'#fff', padding:'2px 9px', borderRadius: 999, fontFamily:'"Fredoka"', fontWeight: 600, fontSize: 11, border:`2px solid ${palette.ink}` }}>★ SCRATCH</div>
              </div>
              <div style={{ padding: 14 }}>
                <div className="p-display" style={{ fontSize: 17, marginBottom: 4, lineHeight: 1.15 }}>{L(s.title, lang)}</div>
                <div className="p-hand" style={{ fontSize: 16, color: palette.brown, marginBottom: 8 }}>{L(s.kind, lang)}</div>
                <div className="p-mono" style={{ fontSize: 10, color: palette.inkSoft, display:'flex', gap: 8 }}>
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
      <section id="gallery" style={{ ...pWrap, paddingBlock: 40 }} className="p-section">
        <CapyHeader num="07" title={L(data.gallery.title, lang)} subtitle={t('snapshots','ภาพความทรงจำ')} palette={palette} />
        <div className="p-hand" style={{ fontSize: 22, color: palette.brown, marginTop: -12, marginBottom: 24, transform:'rotate(-1deg)', display:'inline-block' }}>
          ↳ {L(data.gallery.intro, lang)}
        </div>
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
              <button key={i} type="button" onClick={() => clickable && setLightbox(lbIdx)} className="p-card hover" style={{
                ...span, padding: 0, overflow:'hidden',
                background: g.bg,
                display:'flex', flexDirection:'column', justifyContent:'flex-end',
                position:'relative', border: 'none', fontFamily: 'inherit',
                cursor: clickable ? 'zoom-in' : 'default',
              }}>
                {g.file_url
                  ? <img src={g.file_url} alt={L(g.label, lang)} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ position:'absolute', inset: 0, display:'grid', placeItems:'center' }}>
                      <div className={isVid ? 'p-float' : ''} style={{ fontSize: g.size === 'lg' ? 120 : g.size === 'md' ? 84 : 60 }}>{g.emoji}</div>
                    </div>
                }
                <div style={{
                  position:'absolute', top: 10, left: 10,
                  background: isVid ? '#ff0000' : '#fff8e8',
                  color: isVid ? '#fff' : palette.ink,
                  border:`2px solid ${palette.ink}`,
                  padding:'3px 10px', borderRadius: 999,
                  fontFamily:'"Fredoka", system-ui', fontWeight: 600,
                  fontSize: 11, letterSpacing:'.05em',
                }}>{isVid ? '▶ VIDEO' : '★ PHOTO'}</div>
                {isVid && (
                  <>
                    {g.duration && <div className="p-mono" style={{ position:'absolute', top: 10, right: 10, background:'rgba(0,0,0,.7)', color:'#fff', padding:'3px 8px', borderRadius: 4, fontSize: 10 }}>{g.duration}</div>}
                    <div style={{
                      position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                      width: 46, height: 46, background:'#ff0000', borderRadius:'50%',
                      border:`2.5px solid ${palette.ink}`, display:'grid', placeItems:'center',
                      boxShadow:`3px 3px 0 ${palette.ink}`,
                    }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </>
                )}
                <div style={{
                  position:'relative', zIndex: 1,
                  background: `linear-gradient(transparent, ${palette.ink}ee)`,
                  color:'#fff8e8', padding:'28px 14px 12px',
                  textAlign: 'left',
                }}>
                  <div className="p-display" style={{ fontSize: g.size === 'lg' ? 22 : 14, lineHeight: 1.15 }}>{L(g.label, lang)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ACHIEVEMENTS — trophies + certificates */}
      <section id="achievements" style={{ ...pWrap, paddingBlock: 40 }} className="p-section">
        <CapyHeader num="08" title={L(data.achievements.title, lang)} subtitle={t('proud moments','ช่วงเวลาภาคภูมิใจ')} palette={palette} />

        {/* Sub-row: TROPHIES — hidden when admin unchecks Awards */}
        {!data.awards.__hidden && (<>
        <div style={{ display:'flex', alignItems:'baseline', gap: 12, marginBottom: 18 }}>
          <span className="p-display" style={{ fontSize: 24, color: palette.brownDark }}>★ {L(data.awards.title, lang)}</span>
          <span className="p-hand" style={{ fontSize: 22, color: palette.brown }}>· {t('big wins','รางวัลใหญ่')}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
          {data.awards.items.map((a, i) => {
            const r = rankMeta(a.rank);
            const emoji = r ? r.emoji : (a.medal || '🏅');
            const label = r ? (r[lang] || r.en) : L(a.rank, lang);
            return (
            <div key={i} className="p-card hover" style={{ padding: 26, textAlign:'center', background:['#fff8e8', palette.yuzu + '88', '#fff8e8'][i] }}>
              <div className="p-bob" style={{ fontSize: 76, lineHeight: 1, marginBottom: 4 }}>{emoji}</div>
              <div className="p-display" style={{ fontSize: 26, color: palette.brownDark }}>{label}</div>
              <div className="p-mono" style={{ fontSize: 11, marginBlock: 8, color: palette.brown }}>· {a.year} ·</div>
              <div className="p-round" style={{ fontSize: 16, lineHeight: 1.4 }}>{L(a.name, lang)}</div>
              {a.file_url && (
                /\.pdf(\?|$)/i.test(a.file_url) ? (
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="p-link" style={{
                    display:'inline-block', marginTop: 12,
                    background: '#fff8e8', color: palette.brownDark,
                    padding: '4px 14px', borderRadius: 999,
                    fontFamily:'"Caveat Brush"', fontSize: 18,
                    border: `2px solid ${palette.ink}`,
                  }}>📄 {t('view PDF','ดูเอกสาร')}</a>
                ) : (
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{ display:'block', marginTop: 12 }}>
                    <img src={a.file_url} alt="" style={{
                      width:'100%', maxHeight: 120, objectFit:'cover',
                      borderRadius: 14, border:`2px solid ${palette.ink}`,
                    }} />
                  </a>
                )
              )}
            </div>);
          })}
        </div>
        </>)}

        {/* Sub-row: CERTIFICATES — hidden when admin unchecks Certificates */}
        {!data.certificates.__hidden && (<>
        <div style={{ display:'flex', alignItems:'baseline', gap: 12, marginBottom: 18 }}>
          <span className="p-display" style={{ fontSize: 24, color: palette.brownDark }}>★ {L(data.certificates.title, lang)}</span>
          <span className="p-hand" style={{ fontSize: 22, color: palette.brown }}>· {t('proof of skills','หลักฐานทักษะ')}</span>
        </div>
        <div className="p-card" style={{ padding: 24 }}>
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginBottom: 24, alignItems:'center' }}>
            <span className="p-hand" style={{ fontSize: 20, marginRight: 8, color: palette.brown }}>↳ {t('filter','กรอง')}:</span>
            {data.certificates.categories.map((c) => (
              <button key={c.id} onClick={()=>setFilter(c.id)} className={'p-chip' + (filter===c.id ? ' active' : '')}>
                {L(c.label, lang)}
              </button>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16 }}>
            {filteredCerts.map((c, i) => (
              <button key={c.id} onClick={()=>setCert(c)} className="p-card hover" style={{
                background: c.color, padding: 22, textAlign:'left',
                cursor:'pointer', fontFamily:'inherit', color: palette.ink,
                minHeight: 170, display:'flex', flexDirection:'column', justifyContent:'space-between',
                border:`2px solid ${palette.ink}`,
              }}>
                <div>
                  <div className="p-mono" style={{ fontSize: 10, opacity:.7, marginBottom: 10, letterSpacing:'.1em' }}>№ {String(i+1).padStart(3,'0')} · {c.date}</div>
                  <div className="p-display" style={{ fontSize: 20, lineHeight: 1.15 }}>{L(c.name, lang)}</div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div className="p-hand" style={{ fontSize: 17 }}>{L(c.issuer, lang)}</div>
                  <div className="p-hand" style={{ fontSize: 17 }}>open ↗</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        </>)}
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ ...pWrap, paddingBlock: '40px 80px' }} className="p-section">
        <div className="p-card" style={{
          padding: 56, textAlign:'center', position:'relative',
          background: `radial-gradient(ellipse at top, ${palette.sky}88, ${palette.paper}) `,
          overflow:'hidden',
        }}>
          <div className="p-bob" style={{ position:'absolute', top: 20, left: 40, fontSize: 32 }}>🍊</div>
          <div className="p-float" style={{ position:'absolute', bottom: 30, right: 50, fontSize: 36, animationDelay:'.7s' }}>🌿</div>
          <div className="p-bob" style={{ position:'absolute', top: 40, right: 70, fontSize: 24, animationDelay:'1.2s' }}>🍃</div>

          <div style={{ position:'relative', margin:'0 auto 16px', width: 100, height: 100 }}>
            {data.meta.avatar_url ? (
              <div style={{
                width: '100%', height: '100%', borderRadius:'50%', overflow:'hidden',
                border: `3px solid ${palette.ink}`, background: palette.paper,
                boxShadow:`4px 4px 0 ${palette.ink}`,
              }}>
                <img src={data.meta.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
            ) : (
              <CapybaraIcon palette={palette} size={100} />
            )}
          </div>
          <div className="p-hand" style={{ fontSize: 30, color: palette.brown, marginBottom: 6, transform:'rotate(-2deg)', display:'inline-block' }}>
            ✿ {t('let\'s be friends!','มาเป็นเพื่อนกัน!')} ✿
          </div>
          <h2 className="p-display" style={{ fontSize: 'clamp(56px, 8vw, 110px)', margin: 0, lineHeight: .95, color: palette.brownDark }}>
            {t('say hi!','ทักทายฉันสิ!')}
          </h2>
          <div className="p-round" style={{ marginTop: 18, fontSize: 18, color: palette.inkSoft, maxWidth: 520, marginInline:'auto' }}>
            {t("Send a message and let's hang out by the hot spring!", 'ส่งข้อความหาฉัน แล้วมานั่งแช่บ่อน้ำร้อนด้วยกันนะ!')}
          </div>
          <div style={{ marginTop: 32, display:'flex', flexWrap:'wrap', justifyContent:'center', gap: 12 }}>
            {data.social.items.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="p-btn p-link" title={s.label} aria-label={s.label} style={{ background:'#fff8e8', color: palette.ink, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                {s._icon_resolved && (
                  <img src={s._icon_resolved} alt="" style={{ width: 22, height: 22, display: 'block' }} />
                )}
                <span>{L(s.value, lang)}</span>
              </a>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 24, display:'flex', justifyContent:'space-between', fontFamily:'"JetBrains Mono"', fontSize: 11, color: palette.brown }}>
          <div>© 2026 · {L(data.meta.name, lang)}</div>
          <div>{t('made with chill vibes 🦫','ทำด้วยใจสบายๆ 🦫')}</div>
        </div>
      </section>

      <CertificateModal cert={cert} lang={lang} onClose={()=>setCert(null)} palette={{ ...palette, paper: '#fff8e8', accent: palette.brown }} />
      <GalleryLightbox items={galleryImages} index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} lang={lang} />
    </div>
  );
}

const pWrap = { maxWidth: 1240, margin: '0 auto', paddingInline: 32 };

function CapyHeader({ num, title, subtitle, palette }) {
  return (
    <div style={{ marginBottom: 24, paddingTop: 16, borderTop: `2px dashed ${palette.line}` }}>
      <div style={{ display:'flex', alignItems:'baseline', gap: 16, flexWrap:'wrap' }}>
        <span style={{
          background: palette.yuzu, color: palette.ink,
          border:`2px solid ${palette.ink}`, padding:'3px 14px', borderRadius: 999,
          fontFamily:'"Fredoka", system-ui', fontWeight: 600, fontSize: 14, letterSpacing:'.05em',
          boxShadow:`2px 2px 0 ${palette.ink}`,
        }}>{num}</span>
        <span className="p-display" style={{ fontSize: 38, color: palette.brownDark }}>{title}</span>
        <span className="p-hand" style={{ fontSize: 22, color: palette.brown, transform:'rotate(-1deg)', display:'inline-block' }}>↳ {subtitle}</span>
      </div>
    </div>
  );
}

// Cute SVG capybara icon
function CapybaraIcon({ palette, size = 80 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {/* body */}
      <ellipse cx="50" cy="62" rx="32" ry="22" fill={palette.brown} stroke={palette.ink} strokeWidth="2.5" />
      {/* head */}
      <ellipse cx="50" cy="42" rx="24" ry="20" fill={palette.brown} stroke={palette.ink} strokeWidth="2.5" />
      {/* ears */}
      <ellipse cx="34" cy="28" rx="5" ry="4" fill={palette.brownDark} stroke={palette.ink} strokeWidth="2" />
      <ellipse cx="66" cy="28" rx="5" ry="4" fill={palette.brownDark} stroke={palette.ink} strokeWidth="2" />
      {/* snout */}
      <ellipse cx="50" cy="48" rx="14" ry="9" fill={palette.brown} stroke={palette.ink} strokeWidth="2" />
      <ellipse cx="50" cy="50" rx="3" ry="2" fill={palette.ink} />
      {/* eyes */}
      <circle cx="42" cy="38" r="2.5" fill={palette.ink} />
      <circle cx="58" cy="38" r="2.5" fill={palette.ink} />
      <circle cx="42.8" cy="37.2" r=".9" fill="#fff" />
      <circle cx="58.8" cy="37.2" r=".9" fill="#fff" />
      {/* blush */}
      <circle cx="34" cy="44" r="3" fill={palette.pink} opacity=".6" />
      <circle cx="66" cy="44" r="3" fill={palette.pink} opacity=".6" />
      {/* yuzu on top */}
      <circle cx="50" cy="20" r="6" fill={palette.yuzu} stroke={palette.ink} strokeWidth="2" />
      <path d="M 50 14 L 50 11 L 53 9" fill="none" stroke={palette.moss} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="53" cy="11" rx="3" ry="1.5" fill={palette.moss} stroke={palette.ink} strokeWidth="1.5" />
    </svg>
  );
}

function HotSpringScene({ palette, data, lang }) {
  return (
    <div style={{
      aspectRatio: '1',
      background: `radial-gradient(ellipse at 50% 60%, ${palette.sky} 0%, ${palette.sky} 35%, ${palette.moss}44 70%)`,
      border: `2.5px solid ${palette.ink}`,
      borderRadius: 28,
      boxShadow: `5px 5px 0 ${palette.ink}`,
      position:'relative',
      overflow:'hidden',
    }}>
      {/* sky */}
      <div style={{
        position:'absolute', top: 0, left: 0, right: 0, height:'40%',
        background: `linear-gradient(180deg, ${palette.paper}, ${palette.sky}55)`,
      }} />
      {/* sun */}
      <div style={{
        position:'absolute', top: 30, right: 36,
        width: 44, height: 44, borderRadius:'50%',
        background: palette.yuzu, border:`2px solid ${palette.ink}`,
        boxShadow:`3px 3px 0 ${palette.ink}`,
      }} />
      {/* mountains */}
      <svg viewBox="0 0 300 120" preserveAspectRatio="none" style={{ position:'absolute', top:'30%', left: 0, right: 0, width:'100%', height:'25%' }}>
        <polygon points="0,120 60,40 110,100 170,30 240,90 300,50 300,120" fill={palette.moss} stroke={palette.ink} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {/* water surface */}
      <div style={{
        position:'absolute', bottom: 0, left: 0, right: 0, height:'55%',
        background: `linear-gradient(180deg, ${palette.sky}, ${palette.sky}cc)`,
        borderTop:`2px solid ${palette.ink}`,
      }} />
      {/* ripples */}
      <div className="p-ripple" style={{
        position:'absolute', bottom: '20%', left: '20%',
        width: 60, height: 12, border:`2px solid ${palette.ink}`,
        borderRadius:'50%', opacity:.4,
      }} />
      <div className="p-ripple" style={{
        position:'absolute', bottom: '15%', right: '25%',
        width: 70, height: 14, border:`2px solid ${palette.ink}`,
        borderRadius:'50%', opacity:.4, animationDelay:'1s',
      }} />

      {/* capybara floating */}
      <div className="p-bob" style={{ position:'absolute', bottom:'28%', left:'50%', transform:'translateX(-50%)', width: 130 }}>
        <CapybaraIcon palette={palette} size={130} />
      </div>

      {/* child polaroid — pinned in the sky corner, only when avatar is set */}
      {data.meta.avatar_url && (
        <div className="p-bob" style={{
          position:'absolute', top: 18, left: 18,
          background: palette.paper, padding: 6, paddingBottom: 22,
          border: `2px solid ${palette.ink}`, borderRadius: 4,
          boxShadow: `3px 3px 0 ${palette.ink}`,
          transform: 'rotate(-5deg)', width: 78, animationDelay:'.8s',
        }}>
          <div style={{ width: '100%', aspectRatio: '1', overflow:'hidden', background: palette.sky }}>
            <img src={data.meta.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <div className="p-hand" style={{
            position:'absolute', bottom: 4, left: 0, right: 0,
            textAlign:'center', fontSize: 11, color: palette.brownDark,
          }}>{L(data.meta.nickname, lang)} 🦫</div>
        </div>
      )}

      {/* floating yuzu around */}
      <div style={{ position:'absolute', bottom:'35%', left:'18%', fontSize: 24 }}>🍊</div>
      <div style={{ position:'absolute', bottom:'25%', right:'14%', fontSize: 22 }}>🍊</div>
      <div style={{ position:'absolute', bottom:'18%', left:'30%', fontSize: 18 }}>🌿</div>

      {/* label */}
      <div className="p-hand" style={{
        position:'absolute', bottom: 10, left:'50%', transform:'translateX(-50%)',
        background: '#fff8e8', border:`2px solid ${palette.ink}`,
        padding:'2px 12px', borderRadius: 999,
        fontSize: 16, color: palette.brownDark,
        boxShadow:`2px 2px 0 ${palette.ink}`,
        whiteSpace:'nowrap',
      }}>
        ♨ {L(data.meta.available, lang)} 🍊
      </div>
    </div>
  );
}

function LangToggleCapy({ lang, onLangChange, palette }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center',
      background:'#fff8e8', border:`2px solid ${palette.ink}`,
      borderRadius: 999, padding: 2, marginLeft: 8,
      boxShadow:`2px 2px 0 ${palette.ink}`,
    }}>
      {['en','th'].map((l)=>(
        <button key={l} onClick={()=>onLangChange(l)} style={{
          background: lang === l ? palette.brown : 'transparent',
          color: lang === l ? '#fff8e8' : palette.ink,
          border:'none', padding:'3px 12px', borderRadius: 999,
          cursor:'pointer', fontFamily:'"Fredoka", system-ui',
          fontWeight: 600, fontSize: 12, letterSpacing:'.05em',
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

// Maps a rank enum to label + medal emoji. Returns null for legacy values
// (multilang objects or free text), so the caller falls back to L() + a.medal.
function rankMeta(rank) {
  if (typeof rank !== 'string') return null;
  const map = {
    gold:        { en: 'GOLD',        th: 'ทอง',       emoji: '🥇' },
    silver:      { en: 'SILVER',      th: 'เงิน',      emoji: '🥈' },
    bronze:      { en: 'BRONZE',      th: 'ทองแดง',    emoji: '🥉' },
    participant: { en: 'PARTICIPANT', th: 'เข้าร่วม', emoji: '🎖️' },
  };
  return map[rank.toLowerCase()] || null;
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

window.PortfolioCapy = PortfolioCapy;
