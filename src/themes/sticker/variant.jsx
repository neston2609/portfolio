// Variation 2 — "STICKER SCRAPBOOK"
// Kid's scrapbook aesthetic: lined / dotted notebook paper, stickers stuck
// at slight rotations, washi tape, hand-drawn arrows, doodles.

const { useState: useStateK, useMemo: useMemoK } = React;

function PortfolioSticker({ lang, onLangChange }) {
  const [cert, setCert] = useStateK(null);
  const [filter, setFilter] = useStateK('all');
  const data = PORTFOLIO_DATA;

  const palette = {
    paper: '#fdf6e3',
    ink: '#26221c',
    inkSoft: '#6e6557',
    pink: '#f472b6',
    yellow: '#fde047',
    blue: '#60a5fa',
    green: '#86efac',
    orange: '#fb923c',
    accent: '#f472b6',
    line: '#26221c33',
    lineSoft: '#26221c11',
  };

  const filteredCerts = useMemoK(() => {
    if (filter === 'all') return data.certificates.items;
    return data.certificates.items.filter((c) => c.category === filter);
  }, [filter]);

  const t = (en, th) => (lang === 'th' ? th : en);

  // Tilt arr for variety
  const tilt = (i) => [-2.5, 1.8, -1.5, 2.2, -2.8, 1.2, -1.8, 2.5][i % 8];

  return (
    <div style={{
      background: palette.paper,
      color: palette.ink,
      fontFamily: '"Patrick Hand", "IBM Plex Sans Thai", system-ui, sans-serif',
      fontSize: 17,
      lineHeight: 1.5,
      minHeight: '100vh',
      backgroundImage: `repeating-linear-gradient(${palette.lineSoft} 0 1px, transparent 1px 28px)`,
    }}>
      <style>{`
        .k-display { font-family: "Caveat Brush", "IBM Plex Sans Thai", cursive; font-weight: 400; letter-spacing: .01em; line-height: 1; }
        .k-hand    { font-family: "Patrick Hand", "IBM Plex Sans Thai", system-ui, sans-serif; }
        .k-marker  { font-family: "Caveat", "IBM Plex Sans Thai", cursive; }
        .k-mono    { font-family: "JetBrains Mono", monospace; }
        .k-link    { color: inherit; text-decoration: none; }

        .k-tape { position: absolute; width: 90px; height: 22px; background: ${palette.yellow}; opacity: .85;
                  border: 1px dashed ${palette.ink}22; mix-blend-mode: multiply; pointer-events: none; }
        .k-tape::before, .k-tape::after { content:''; position:absolute; top:50%; width:6px; height:1px; background: ${palette.ink}33; }

        .k-sticker { background: white; border: 2px solid ${palette.ink}; border-radius: 16px;
                     box-shadow: 3px 3px 0 ${palette.ink}, 0 10px 22px -10px ${palette.ink}66;
                     transition: transform .25s cubic-bezier(.2,1.4,.4,1); position: relative; }
        .k-sticker:hover { transform: rotate(0deg) translateY(-3px) !important; box-shadow: 5px 5px 0 ${palette.ink}, 0 14px 28px -10px ${palette.ink}88; z-index: 5; }
        .k-poly { padding: 22px; }
        .k-chip { font-family: "Caveat Brush", cursive; letter-spacing:.02em;
                  background: white; color: ${palette.ink}; border: 2px solid ${palette.ink};
                  padding: 4px 14px; border-radius: 999px; cursor: pointer; font-size: 17px;
                  box-shadow: 2px 2px 0 ${palette.ink}; transition: transform .15s; }
        .k-chip:hover { transform: rotate(-2deg) translate(-1px,-1px); }
        .k-chip.active { background: ${palette.pink}; color: ${palette.ink}; }

        .k-btn { font-family: "Caveat Brush", cursive; font-size: 22px;
                 background: ${palette.yellow}; color: ${palette.ink};
                 border: 2.5px solid ${palette.ink}; padding: 8px 22px; border-radius: 999px;
                 cursor: pointer; box-shadow: 3px 3px 0 ${palette.ink};
                 transition: transform .15s, box-shadow .15s; display: inline-flex; align-items: center; gap: 8px; }
        .k-btn:hover { transform: translate(-2px,-2px) rotate(-1deg); box-shadow: 5px 5px 0 ${palette.ink}; }
        .k-btn.pink { background: ${palette.pink}; }

        @keyframes kRise { from { opacity:0; transform: translateY(20px) rotate(-1deg); } to { opacity:1; } }
        .k-section { animation: kRise .55s cubic-bezier(.2,.7,.2,1) both; }
        @keyframes kFloat { 0%,100%{transform: translateY(0)} 50%{transform: translateY(-8px)} }
        .k-float { animation: kFloat 3.5s ease-in-out infinite; }
        @keyframes kWobble { 0%,100%{transform: rotate(-3deg)} 50%{transform: rotate(3deg)} }
        .k-wobble { animation: kWobble 3s ease-in-out infinite; transform-origin: center; }
      `}</style>

      {/* Notebook spiral binding (top edge) */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: palette.paper, borderBottom: `1px dashed ${palette.line}` }}>
        <div style={{ ...kWrap, display:'flex', justifyContent:'space-between', alignItems:'center', height: 64 }}>
          <a href="#top" className="k-link" style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <span style={{
              background: palette.pink, color: palette.ink,
              width: 38, height: 38, borderRadius: '50%',
              border: `2px solid ${palette.ink}`,
              display:'grid', placeItems:'center', overflow:'hidden',
              fontFamily:'"Caveat Brush", cursive', fontSize: 22,
              boxShadow:`2px 2px 0 ${palette.ink}`, transform: 'rotate(-6deg)',
            }}>{data.meta.avatar_url
              ? <img src={data.meta.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : L(data.meta.nickname, lang).charAt(0)}</span>
            <span className="k-display" style={{ fontSize: 28, transform:'rotate(-1.5deg)' }}>{L(data.meta.name, lang)}</span>
          </a>
          <div style={{ display:'flex', gap: 4, alignItems:'center' }}>
            {[['about','About','รู้จัก'],['powers','Powers','พลัง'],['quests','Quests','ภารกิจ'],['youtube','YouTube','ยูทูบ'],['scratch','Scratch','สแครชต์'],['gallery','Gallery','อัลบั้ม'],['achievements','Achievements','ความสำเร็จ']].map(([id,en,th],i)=>(
              <a key={id} href={`#${id}`} className="k-link k-marker" style={{ fontSize: 22, padding:'2px 12px', transform: `rotate(${[-2,1.5,-1,2,-1.5][i]}deg)`, display:'inline-block' }}>{t(en,th)}</a>
            ))}
            <LangToggleSticker lang={lang} onLangChange={onLangChange} palette={palette} />
          </div>
        </div>
      </div>

      {/* HERO scrapbook page */}
      <section id="top" style={{ ...kWrap, paddingBlock: '40px 24px', position:'relative' }} className="k-section">
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 1fr) 240px', gap: 32, alignItems:'start' }}>
          <div style={{ minWidth: 0 }}>
          {/* Big hello scribble */}
          <div className="k-display k-wobble" style={{
            fontSize: 'clamp(40px, 5vw, 64px)', color: palette.pink, display:'inline-block',
          }}>
            ★ {L(data.meta.hello, lang)} ★
          </div>
          <h1 className="k-display" style={{
            fontSize: 'clamp(64px, 10vw, 150px)',
            margin: 0,
            lineHeight: .92,
            color: palette.ink,
            transform: 'rotate(-1.5deg)',
            display: 'inline-block',
            maxWidth: '100%',
            overflowWrap: 'break-word',
          }}>
            <ScribbleUnderline color={palette.yellow} ink={palette.ink}>
              <span>{L(data.meta.name, lang)}</span>
            </ScribbleUnderline>
          </h1>

          <div className="k-marker" style={{ marginTop: 18, fontSize: 28, color: palette.inkSoft, transform: 'rotate(-1deg)', display:'inline-block' }}>
            ↳ {L(data.meta.role, lang)} · {t('age', 'อายุ')} {data.meta.age}
          </div>
          </div>

          {/* Photo "polaroid" */}
          <div style={{
            width: 220, justifySelf: 'end',
            background: 'white', padding: '12px 12px 28px',
            border: `2px solid ${palette.ink}`,
            boxShadow: `3px 3px 0 ${palette.ink}, 0 16px 30px -10px ${palette.ink}55`,
            transform: 'rotate(4deg)',
            position: 'relative',
            marginTop: 12,
          }}>
            <div className="k-tape" style={{ top: -12, left: 60, transform:'rotate(-6deg)', background: palette.pink }} />
            <div style={{
              aspectRatio: '1', background: `${palette.blue} radial-gradient(circle, ${palette.ink}22 1px, transparent 1.2px) 0 0/10px 10px`,
              display:'grid', placeItems:'center', overflow:'hidden',
              border: `2px solid ${palette.ink}`,
            }}>
              {data.meta.avatar_url ? (
                <img src={data.meta.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="k-display" style={{ fontSize: 60, color: palette.ink, textShadow:`2px 2px 0 white` }}>
                  {L(data.meta.nickname, lang).charAt(0)}
                </div>
              )}
            </div>
            <div className="k-marker" style={{ textAlign:'center', marginTop: 8, fontSize: 20 }}>
              ← {t('that\'s me!', 'นี่ฉันเอง!')}
            </div>
          </div>
        </div>

        <div>

          {/* Quick favorites */}
          <div style={{ marginTop: 36, display:'flex', gap: 14, flexWrap:'wrap' }}>
            {data.about.favorites.map((f, i) => (
              <div key={i} className="k-sticker k-poly" style={{
                background: [palette.yellow, palette.green, palette.blue][i],
                transform: `rotate(${tilt(i)}deg)`,
                padding: '12px 18px',
              }}>
                <div className="k-marker" style={{ fontSize: 16, opacity: .7 }}>{L(f.label, lang)}</div>
                <div className="k-display" style={{ fontSize: 26 }}>{L(f.value, lang)}</div>
              </div>
            ))}
          </div>

          {/* Buttons row */}
          <div style={{ marginTop: 36, display:'flex', gap: 14, alignItems:'center', flexWrap:'wrap' }}>
            <a href="#contact" className="k-btn pink k-link">{t('say hi 👋', 'ทักทาย 👋')}</a>
            <a href="#" className="k-btn k-link">{t('grab my CV', 'เอา CV ไปเลย')} ↓</a>
            <SquiggleArrow color={palette.ink} />
            <div className="k-marker" style={{ fontSize: 22, transform:'rotate(-2deg)' }}>
              {t('start here!', 'เริ่มตรงนี้!')}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ ...kWrap, paddingBlock: 40 }} className="k-section">
        <PageHeader num="01" title={L(data.about.title, lang)} palette={palette} accent={palette.pink} />
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 24, alignItems:'flex-start' }}>
          <div className="k-sticker" style={{ padding: 28, transform: 'rotate(-1deg)' }}>
            <div className="k-tape" style={{ top: -10, left: 30, background: palette.pink }} />
            <div className="k-tape" style={{ top: -10, right: 40, background: palette.blue, transform: 'rotate(8deg)' }} />
            <p className="k-hand" style={{ fontSize: 22, lineHeight: 1.55, margin: 0 }}>
              {L(data.about.intro, lang)}
            </p>
            <div style={{ marginTop: 16, display:'flex', gap: 6, flexWrap:'wrap' }}>
              {['🎨','🔬','📚','🎹','🍳'].map((e,i)=>(
                <span key={i} style={{ fontSize: 26, transform:`rotate(${tilt(i+3)}deg)`, display:'inline-block' }}>{e}</span>
              ))}
            </div>
          </div>

          <div className="k-sticker k-float" style={{
            background: palette.yellow, transform: 'rotate(2deg)',
            padding: 28, textAlign:'center',
          }}>
            <div className="k-marker" style={{ fontSize: 18, marginBottom: 6 }}>{t('my motto', 'คำขวัญ')}</div>
            <div className="k-display" style={{ fontSize: 38, lineHeight: 1.05 }}>
              "{L(data.meta.motto, lang)}"
            </div>
          </div>
        </div>
      </section>

      {/* SUPERPOWERS */}
      <section id="powers" style={{ ...kWrap, paddingBlock: 40 }} className="k-section">
        <PageHeader num="02" title={L(data.powers.title, lang)} palette={palette} accent={palette.blue} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 20 }}>
          {data.powers.items.map((p, i) => (
            <div key={i} className="k-sticker" style={{
              padding: 22, display:'flex', gap: 14, alignItems:'center',
              transform: `rotate(${tilt(i)}deg)`,
            }}>
              <div className="k-tape" style={{ top: -10, left: 16, background: p.color, opacity: .9 }} />
              <div style={{
                width: 62, height: 62, flex:'0 0 62px',
                background: p.color, color: '#fff',
                border: `2px solid ${palette.ink}`, borderRadius: '50%',
                display:'grid', placeItems:'center',
                fontFamily:'"Caveat Brush", cursive', fontSize: 36,
                boxShadow:`2px 2px 0 ${palette.ink}`,
              }}>{p.letter}</div>
              <div style={{ flex: 1 }}>
                <div className="k-display" style={{ fontSize: 28 }}>{L(p.name, lang)}</div>
                <div style={{ display:'flex', gap: 3, marginTop: 4 }}>
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ fontSize: 18, color: s <= p.level ? palette.orange : palette.line }}>★</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" style={{ ...kWrap, paddingBlock: 40 }} className="k-section">
        <PageHeader num="03" title={L(data.education.title, lang)} palette={palette} accent={palette.green} />
        <div style={{ position:'relative', paddingLeft: 32 }}>
          {/* squiggly timeline line */}
          <svg width="20" height="100%" style={{ position:'absolute', left: 4, top: 0, height:'calc(100% - 30px)' }} preserveAspectRatio="none" viewBox="0 0 20 400">
            <path d="M 10 0 Q 0 50, 10 100 T 10 200 T 10 300 T 10 400" fill="none" stroke={palette.ink} strokeWidth="2.5" strokeDasharray="6 4" />
          </svg>
          {data.education.items.map((it, i) => (
            <div key={i} style={{ position:'relative', marginBottom: 24 }}>
              <span style={{
                position:'absolute', left: -34, top: 18,
                width: 18, height: 18, borderRadius:'50%',
                background: [palette.pink, palette.blue][i] || palette.green,
                border:`2.5px solid ${palette.ink}`,
                boxShadow:`2px 2px 0 ${palette.ink}`,
              }} />
              <div className="k-sticker" style={{
                padding: 24, transform: `rotate(${tilt(i)}deg)`,
                background: i === 0 ? '#fff' : palette.paper,
              }}>
                <div className="k-tape" style={{ top: -10, right: 30, background: i===0 ? palette.green : palette.blue }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', flexWrap:'wrap', gap: 6 }}>
                  <div className="k-display" style={{ fontSize: 36 }}>{L(it.school, lang)}</div>
                  <div className="k-marker" style={{ fontSize: 20, color: palette.inkSoft }}>{it.period}</div>
                </div>
                <div className="k-hand" style={{ fontSize: 18, color: palette.inkSoft, marginTop: 6 }}>{L(it.degree, lang)}</div>
                <div className="k-hand" style={{ fontSize: 16, color: palette.inkSoft, marginTop: 4 }}>· {L(it.detail, lang)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section id="quests" style={{ ...kWrap, paddingBlock: 40 }} className="k-section">
        <PageHeader num="04" title={L(data.projects.title, lang)} palette={palette} accent={palette.orange} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 24 }}>
          {data.projects.items.map((p, i) => (
            <a href="#" key={i} className="k-sticker k-link" style={{
              overflow:'hidden', transform: `rotate(${tilt(i+1)}deg)`,
            }}>
              <div style={{ position:'relative' }}>
                <div className="k-tape" style={{ top: -10, left: 30, background: [palette.pink, palette.blue, palette.green][i], opacity: .9 }} />
              </div>
              <div style={{
                aspectRatio: '4/3', background: p.bg,
                display:'grid', placeItems:'center',
                borderBottom: `2px solid ${palette.ink}`,
                margin: '8px 8px 0',
                border: `2px solid ${palette.ink}`,
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 78 }}>{p.emoji}</div>
              </div>
              <div style={{ padding: '14px 18px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
                  <div className="k-marker" style={{ fontSize: 16, color: palette.inkSoft }}>{L(p.kind, lang)}</div>
                  <div className="k-mono" style={{ fontSize: 11 }}>{p.year}</div>
                </div>
                <div className="k-display" style={{ fontSize: 24, marginBottom: 6 }}>{L(p.title, lang)}</div>
                <div className="k-hand" style={{ fontSize: 16, color: palette.inkSoft }}>{L(p.summary, lang)}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* YOUTUBE */}
      <section id="youtube" style={{ ...kWrap, paddingBlock: 40 }} className="k-section">
        <PageHeader num="05" title={L(data.youtube.title, lang)} palette={palette} accent={palette.pink} />

        {/* Channel banner — sticker style */}
        <div className="k-sticker" style={{
          padding: 24, marginBottom: 28,
          background: '#ff0000', color: '#fff',
          transform: 'rotate(-1deg)',
          display:'flex', gap: 20, alignItems:'center',
        }}>
          <div className="k-tape" style={{ top: -10, left: 30, background: palette.yellow }} />
          <div className="k-tape" style={{ top: -10, right: 80, background: '#fff', transform:'rotate(6deg)' }} />
          <div style={{
            width: 70, height: 70, flex: '0 0 70px',
            background: '#fff', borderRadius:'50%',
            border:`2.5px solid ${palette.ink}`,
            boxShadow:`2px 2px 0 ${palette.ink}`,
            display:'grid', placeItems:'center',
          }}>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="#ff0000"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="k-display" style={{ fontSize: 30, lineHeight: 1 }}>{L(data.youtube.channel.name, lang)}</div>
            <div className="k-hand" style={{ fontSize: 17, marginTop: 4, opacity: .95 }}>{data.youtube.channel.handle}</div>
            <div className="k-marker" style={{ marginTop: 8, fontSize: 22, display:'flex', gap: 20 }}>
              <span>★ {data.youtube.channel.subs} {t('subs','คนติดตาม')}</span>
              <span>★ {data.youtube.channel.videos} {t('videos','คลิป')}</span>
              <span>★ {data.youtube.channel.views} {t('views','วิว')}</span>
            </div>
          </div>
          <a href={data.youtube.channel.url} className="k-btn k-link" style={{ background: '#fff', color: '#ff0000', transform:'rotate(3deg)' }}>
            ▶ {t('subscribe!','ติดตาม!')}
          </a>
        </div>

        {/* Video stickers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap: 24 }}>
          {data.youtube.items.map((v, i) => (
            <a href="#" key={i} className="k-sticker k-link" style={{
              display:'grid', gridTemplateColumns:'auto 1fr', gap: 14, padding: 14,
              transform: `rotate(${tilt(i+5)}deg)`,
              alignItems:'stretch',
            }}>
              <div className="k-tape" style={{ top: -10, left: 16, background: '#ff0000' }} />
              <div style={{
                width: 180, aspectRatio:'16/9',
                background: v.bg,
                border: `2px solid ${palette.ink}`, borderRadius: 8,
                display:'grid', placeItems:'center',
                position:'relative',
              }}>
                <div style={{ fontSize: 50 }}>{v.emoji}</div>
                <div style={{ position:'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,.75)', color: '#fff', padding:'2px 7px', borderRadius: 4, fontFamily:'"JetBrains Mono", monospace', fontSize: 10 }}>{v.duration}</div>
                <div style={{
                  position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                  background: '#ff0000', color:'#fff',
                  width: 42, height: 42, borderRadius:'50%',
                  border:`2.5px solid ${palette.ink}`,
                  display:'grid', placeItems:'center',
                  boxShadow:`2px 2px 0 ${palette.ink}`,
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div style={{ flex: 1, padding: '4px 8px 4px 0', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <div>
                  <div className="k-display" style={{ fontSize: 22, lineHeight: 1.1, marginBottom: 4 }}>{L(v.title, lang)}</div>
                  <div className="k-marker" style={{ fontSize: 16, color: palette.inkSoft }}>{L(v.kind, lang)}</div>
                </div>
                <div className="k-mono" style={{ fontSize: 11, color: palette.inkSoft }}>
                  ★ {v.views} {t('views','วิว')} · {v.date}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SCRATCH */}
      <section id="scratch" style={{ ...kWrap, paddingBlock: 40 }} className="k-section">
        <PageHeader num="06" title={L(data.scratch.title, lang)} palette={palette} accent={palette.orange} />

        <div className="k-sticker" style={{
          padding: 24, marginBottom: 28,
          background: '#fb923c', color: '#fff',
          transform: 'rotate(1deg)',
          display:'flex', gap: 18, alignItems:'center',
        }}>
          <div className="k-tape" style={{ top: -10, right: 40, background: '#fff' }} />
          <div style={{
            width: 60, height: 60, flex:'0 0 60px',
            background: '#fff', color: '#fb923c',
            border:`2.5px solid ${palette.ink}`, borderRadius: 14,
            display:'grid', placeItems:'center',
            fontFamily:'"Caveat Brush", cursive', fontSize: 38,
            boxShadow:`2px 2px 0 ${palette.ink}`,
          }}>S</div>
          <div style={{ flex: 1 }}>
            <div className="k-display" style={{ fontSize: 26, lineHeight: 1 }}>scratch.mit.edu/users/{data.scratch.profile.handle}</div>
            <div className="k-hand" style={{ fontSize: 17, marginTop: 4 }}>{L(data.scratch.intro, lang)}</div>
          </div>
          <div className="k-marker" style={{ fontSize: 22, textAlign:'right' }}>
            <div>★ {data.scratch.profile.followers} {t('fans','แฟน')}</div>
            <div>★ {data.scratch.profile.projectsShared} {t('projects','โปรเจกต์')}</div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 22 }}>
          {data.scratch.items.map((s, i) => (
            <a href="#" key={i} className="k-sticker k-link" style={{
              overflow:'hidden',
              transform: `rotate(${tilt(i+6)}deg)`,
            }}>
              <div className="k-tape" style={{ top: -10, left: 30, background: '#fb923c' }} />
              <div style={{
                aspectRatio:'4/3',
                background: s.bg,
                margin: '8px 8px 0',
                border:`2px solid ${palette.ink}`, borderRadius: 10,
                display:'grid', placeItems:'center', position:'relative',
              }}>
                <div style={{ fontSize: 56 }}>{s.emoji}</div>
                <div style={{ position:'absolute', top: 6, left: 6, background: '#fb923c', color:'#fff', padding:'2px 8px', borderRadius: 999, fontFamily:'"Caveat Brush", cursive', fontSize: 13, border:`1.5px solid ${palette.ink}` }}>SCRATCH</div>
              </div>
              <div style={{ padding: '12px 16px 16px' }}>
                <div className="k-display" style={{ fontSize: 20, lineHeight: 1.05, marginBottom: 4 }}>{L(s.title, lang)}</div>
                <div className="k-marker" style={{ fontSize: 14, color: palette.inkSoft, marginBottom: 6 }}>· {L(s.kind, lang)}</div>
                <div className="k-mono" style={{ fontSize: 10, color: palette.inkSoft, display:'flex', gap: 8 }}>
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
      <section id="gallery" style={{ ...kWrap, paddingBlock: 40 }} className="k-section">
        <PageHeader num="07" title={L(data.gallery.title, lang)} palette={palette} accent={palette.pink} />
        <div className="k-marker" style={{ fontSize: 22, color: palette.inkSoft, marginBottom: 24, marginTop: -12, transform:'rotate(-1deg)', display:'inline-block' }}>↳ {L(data.gallery.intro, lang)}</div>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(4, 1fr)',
          gridAutoRows: '180px',
          gap: 22,
        }}>
          {data.gallery.items.map((g, i) => {
            const span = g.size === 'lg' ? { gridColumn:'span 2', gridRow:'span 2' } :
                         g.size === 'md' ? { gridColumn:'span 2', gridRow:'span 1' } : {};
            const isVid = g.kind === 'video';
            const tapeColor = [palette.pink, palette.yellow, palette.blue, palette.green][i % 4];
            return (
              <a key={i} href="#" className="k-sticker k-link" style={{
                ...span,
                background: 'white',
                padding: '10px 10px 14px',
                transform: `rotate(${tilt(i+7)}deg)`,
                overflow:'hidden',
                display:'flex', flexDirection:'column',
              }}>
                <div className="k-tape" style={{ top: -10, left: g.size==='sm' ? 18 : 40, background: tapeColor }} />
                <div style={{
                  flex: 1,
                  background: g.bg,
                  border: `2px solid ${palette.ink}`,
                  borderRadius: 8,
                  display:'grid', placeItems:'center',
                  position:'relative', overflow:'hidden',
                }}>
                  <div style={{ fontSize: g.size === 'lg' ? 110 : g.size === 'md' ? 78 : 56 }}>{g.emoji}</div>
                  <div style={{
                    position:'absolute', top: 6, left: 6,
                    background: isVid ? '#ff0000' : palette.ink, color:'#fff',
                    padding:'2px 9px', borderRadius: 999,
                    fontFamily:'"Caveat Brush", cursive', fontSize: 13,
                  }}>{isVid ? '▶ video' : '★ photo'}</div>
                  {isVid && (
                    <>
                      <div style={{ position:'absolute', bottom: 6, right: 6, background:'rgba(0,0,0,.7)', color:'#fff', padding:'2px 7px', borderRadius: 4, fontFamily:'"JetBrains Mono"', fontSize: 10 }}>{g.duration}</div>
                      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width: 40, height: 40, background:'#ff0000', borderRadius:'50%', border:`2px solid ${palette.ink}`, display:'grid', placeItems:'center', boxShadow:`2px 2px 0 ${palette.ink}` }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </>
                  )}
                </div>
                <div className="k-marker" style={{ marginTop: 6, fontSize: 15, color: palette.ink, lineHeight: 1.2, textAlign:'center', minHeight: 18 }}>
                  {L(g.label, lang)}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* ACHIEVEMENTS — trophies + certificates */}
      <section id="achievements" style={{ ...kWrap, paddingBlock: 40 }} className="k-section">
        <PageHeader num="08" title={L(data.achievements.title, lang)} palette={palette} accent={palette.yellow} />

        {/* Sub-row: TROPHIES */}
        <div className="k-display" style={{ fontSize: 32, color: palette.ink, marginBottom: 16, transform:'rotate(-1deg)', display:'inline-block' }}>
          ★ {L(data.awards.title, lang)} <span className="k-marker" style={{ fontSize: 22, color: palette.inkSoft }}>· {t('big wins','รางวัลใหญ่')}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 26, marginBottom: 44 }}>
          {data.awards.items.map((a, i) => (
            <div key={i} className="k-sticker" style={{
              padding: 24, textAlign:'center',
              background: ['#fff', palette.yellow, '#fff'][i],
              transform: `rotate(${tilt(i+4)}deg)`,
            }}>
              <div className="k-tape" style={{ top: -10, left: 60, background: palette.pink }} />
              <div className="k-float" style={{ fontSize: 76, lineHeight: 1, marginBottom: 6 }}>{a.medal}</div>
              <div className="k-display" style={{ fontSize: 30, color: palette.ink }}>{L(a.rank, lang)}</div>
              <div className="k-mono" style={{ fontSize: 11, marginBottom: 8 }}>· {a.year} ·</div>
              <div className="k-hand" style={{ fontSize: 18, lineHeight: 1.35 }}>{L(a.name, lang)}</div>
              {a.file_url && (
                /\.pdf(\?|$)/i.test(a.file_url) ? (
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="k-marker" style={{
                    display:'inline-block', marginTop: 12,
                    color: palette.ink, background: '#fff',
                    border: `2px solid ${palette.ink}`, borderRadius: 999,
                    padding: '4px 14px', fontSize: 18,
                    transform:'rotate(-2deg)',
                  }}>📄 {t('view PDF','ดูเอกสาร')}</a>
                ) : (
                  <a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{
                    display:'inline-block', marginTop: 12, padding: 6,
                    background: '#fff', border:`2px solid ${palette.ink}`,
                    transform:'rotate(-2deg)', boxShadow:`3px 3px 0 ${palette.ink}`,
                  }}>
                    <img src={a.file_url} alt="" style={{
                      display:'block', width: 120, height: 80, objectFit:'cover',
                    }} />
                  </a>
                )
              )}
            </div>
          ))}
        </div>

        {/* Sub-row: CERTIFICATES */}
        <div className="k-display" style={{ fontSize: 32, color: palette.ink, marginBottom: 16, transform:'rotate(-1deg)', display:'inline-block' }}>
          ★ {L(data.certificates.title, lang)} <span className="k-marker" style={{ fontSize: 22, color: palette.inkSoft }}>· {t('proof of skills','หลักฐานทักษะ')}</span>
        </div>
        <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginBottom: 32, alignItems:'center' }}>
          <span className="k-marker" style={{ fontSize: 20, marginRight: 8 }}>{t('show me →','โชว์ →')}</span>
          {data.certificates.categories.map((c, i) => (
            <button key={c.id} onClick={()=>setFilter(c.id)} className={'k-chip' + (filter===c.id ? ' active' : '')} style={{ transform:`rotate(${tilt(i)}deg)` }}>
              {L(c.label, lang)}
            </button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 26 }}>
          {filteredCerts.map((c, i) => (
            <button key={c.id} onClick={()=>setCert(c)} className="k-sticker" style={{
              background: c.color,
              padding: '20px 22px 24px',
              textAlign:'left',
              cursor:'pointer',
              fontFamily:'inherit',
              color: palette.ink,
              minHeight: 170,
              transform: `rotate(${tilt(i+2)}deg)`,
              display:'flex', flexDirection:'column', justifyContent:'space-between',
            }}>
              <div className="k-tape" style={{ top: -10, left: 24, background: 'white' }} />
              <div>
                <div className="k-mono" style={{ fontSize: 10, opacity:.7, marginBottom: 8 }}>★ {c.date}</div>
                <div className="k-display" style={{ fontSize: 24, lineHeight: 1.05 }}>{L(c.name, lang)}</div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div className="k-marker" style={{ fontSize: 16, opacity:.8 }}>{L(c.issuer, lang)}</div>
                <div className="k-marker" style={{ fontSize: 16 }}>open ↗</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ ...kWrap, paddingBlock: '40px 80px' }} className="k-section">
        <div className="k-sticker" style={{
          padding: 56, textAlign:'center', position:'relative',
          background: palette.pink, transform: 'rotate(-1deg)',
        }}>
          <div className="k-tape" style={{ top: -10, left: 60, background: palette.yellow }} />
          <div className="k-tape" style={{ top: -10, right: 60, background: palette.blue, transform:'rotate(6deg)' }} />
          <div className="k-marker" style={{ fontSize: 22, marginBottom: 6, transform:'rotate(-2deg)', display:'inline-block' }}>★ {t('the end!', 'จบแล้ว!')} ★</div>
          <h2 className="k-display" style={{ fontSize: 'clamp(56px, 8vw, 120px)', margin: 0, lineHeight: .95 }}>
            {t('Be my pen pal!', 'มาเป็นเพื่อนจดหมายกัน!')}
          </h2>
          <div className="k-hand" style={{ marginTop: 14, fontSize: 22 }}>
            {t("I love getting letters 💌", 'ชอบได้รับจดหมายมากๆ 💌')}
          </div>
          <div style={{ marginTop: 32, display:'flex', flexWrap:'wrap', justifyContent:'center', gap: 12 }}>
            {data.social.items.map((s, i) => (
              <a key={s.label} href={s.href} className="k-btn k-link" style={{
                background: ['#fff', palette.yellow, '#fff', palette.green][i % 4],
                transform: `rotate(${tilt(i)}deg)`,
              }}>
                <span className="k-marker" style={{ fontSize: 16, opacity: .6 }}>{s.label} →</span>
                <span style={{ fontSize: 18 }}>{L(s.value, lang)}</span>
              </a>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 24, display:'flex', justifyContent:'space-between', fontFamily:'"Patrick Hand", system-ui', fontSize: 15, color: palette.inkSoft }}>
          <div>© 2026 · {L(data.meta.name, lang)}</div>
          <div>{t('Made with stickers & love 💖', 'สร้างด้วยสติ๊กเกอร์และหัวใจ 💖')}</div>
        </div>
      </section>

      <CertificateModal cert={cert} lang={lang} onClose={()=>setCert(null)} palette={palette} />
    </div>
  );
}

const kWrap = { maxWidth: 1240, margin: '0 auto', paddingInline: 32 };

function PageHeader({ num, title, palette, accent }) {
  return (
    <div style={{ display:'flex', alignItems:'baseline', gap: 14, marginBottom: 28 }}>
      <span className="k-marker" style={{
        fontSize: 26, background: accent, color: palette.ink,
        padding: '2px 14px', borderRadius: 999,
        border: `2px solid ${palette.ink}`,
        boxShadow: `2px 2px 0 ${palette.ink}`,
        transform: 'rotate(-2deg)', display:'inline-block',
      }}>page {num}</span>
      <span className="k-display" style={{ fontSize: 50, color: palette.ink, transform:'rotate(-1deg)', display:'inline-block' }}>{title}</span>
      <SquiggleArrow color={palette.ink} small />
    </div>
  );
}

function ScribbleUnderline({ children, color, ink }) {
  return (
    <span style={{ position:'relative', display:'inline-block' }}>
      {children}
      <svg viewBox="0 0 300 30" preserveAspectRatio="none" style={{
        position:'absolute', left: 0, right: 0, bottom: -10, width: '100%', height: 18,
      }}>
        <path d="M 5 18 Q 75 5, 150 14 T 295 12" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" opacity=".7" />
        <path d="M 5 18 Q 75 5, 150 14 T 295 12" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0" />
      </svg>
    </span>
  );
}

function SquiggleArrow({ color, small }) {
  const w = small ? 70 : 110;
  const h = small ? 36 : 50;
  return (
    <svg width={w} height={h} viewBox="0 0 110 50" style={{ display:'inline-block', alignSelf:'center' }}>
      <path d="M 5 25 Q 30 5, 55 25 T 100 25" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <polyline points="92,18 102,25 92,32" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LangToggleSticker({ lang, onLangChange, palette }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center',
      background:'white', border:`2px solid ${palette.ink}`,
      borderRadius: 999, padding: 2, marginLeft: 8,
      boxShadow:`2px 2px 0 ${palette.ink}`,
      fontFamily:'"Caveat Brush", cursive',
    }}>
      {['en','th'].map((l)=>(
        <button key={l} onClick={()=>onLangChange(l)} style={{
          background: lang === l ? palette.ink : 'transparent',
          color: lang === l ? '#fff' : palette.ink,
          border:'none', padding:'3px 12px', borderRadius: 999,
          cursor:'pointer', fontFamily:'inherit',
          fontSize: 18, letterSpacing:'.05em',
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

window.PortfolioSticker = PortfolioSticker;
