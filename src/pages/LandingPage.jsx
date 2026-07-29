import { useApp } from '../context/AppContext.js'

const month = new Date().getMonth() + 1
const getSeason = () => {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

/* ── 일러스트: 배경 없이 캐릭터만 ── */

function SpringIllust() {
  return (
    <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <style>{`
        @keyframes petalFloat {
          0%   { transform: translate(0,0) rotate(0deg); opacity:.85; }
          50%  { transform: translate(14px,50px) rotate(160deg); opacity:.6; }
          100% { transform: translate(-8px,110px) rotate(300deg); opacity:0; }
        }
        .sp { animation: petalFloat 5s ease-in infinite; }
      `}</style>

      {/* 줄기 */}
      <path d="M155,370 C153,320 150,265 158,210" stroke="#8B5E3C" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M158,210 C138,180 105,170 78,155" stroke="#8B5E3C" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M158,210 C178,178 215,168 240,155" stroke="#8B5E3C" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M158,210 C150,182 146,150 142,124" stroke="#A07040" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M158,250 C132,236 102,236 75,230" stroke="#A07040" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M158,250 C185,237 218,240 244,236" stroke="#A07040" strokeWidth="6" strokeLinecap="round" fill="none"/>

      {/* 꽃 뭉치 */}
      {[[158,152,52],[108,168,40],[208,162,38],[132,124,34],[186,118,32],[158,100,30],[90,192,24],[232,186,22]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill={i%2===0?'#FFB8D8':'#FFC8E4'} opacity="0.93"/>
      ))}
      {/* 꽃잎 하이라이트 */}
      {[[158,152,52],[108,168,40],[208,162,38]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx-r*0.2} cy={cy-r*0.2} r={r*0.55} fill="#FFD0E8" opacity="0.4"/>
      ))}

      {/* 흩날리는 꽃잎 */}
      {[
        [38,40,7],[90,18,5],[188,28,6],[265,50,5],[300,30,6],
        [20,130,5],[240,100,5],[285,145,4],
        [50,220,4],[270,200,5],
        [30,300,4],[295,280,4],
      ].map(([x,y,r],i)=>(
        <ellipse key={i} className="sp" cx={x} cy={y} rx={r} ry={r*0.6}
          fill={i%3===0?'#FFB8D8':i%3===1?'#FF98C8':'#FFCCE6'} opacity="0.8"
          transform={`rotate(${i*37} ${x} ${y})`}
          style={{ animationDelay:`${i*0.32}s` }}/>
      ))}
    </svg>
  )
}

function SummerIllust() {
  return (
    <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <style>{`
        @keyframes sway { 0%,100%{transform:rotate(0deg)}50%{transform:rotate(2deg)} }
        @keyframes sparkS { 0%,100%{opacity:.6}50%{opacity:.15} }
        @keyframes birdS { 0%{transform:translateX(-60px)}100%{transform:translateX(380px)} }
        .sw { animation: sway 6s ease-in-out infinite; transform-origin: bottom center; }
        .sw2 { animation: sway 8s ease-in-out infinite reverse; transform-origin: bottom center; }
        .sp2 { animation: sparkS 2.2s ease-in-out infinite; }
        .bi { animation: birdS 16s linear infinite; }
      `}</style>

      {/* 왼쪽 야자수 */}
      <g className="sw">
        <path d="M72,370 C70,320 68,265 78,210" stroke="#5C3A1E" strokeWidth="11" strokeLinecap="round" fill="none"/>
        <path d="M78,210 C58,182 28,174 5,160" stroke="#2D7A3A" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M78,210 C98,180 128,172 150,160" stroke="#2D7A3A" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M78,210 C72,182 66,155 60,132" stroke="#3A8C48" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M78,210 C55,196 28,194 5,190" stroke="#3A8C48" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M78,210 C105,196 132,196 155,192" stroke="#3A8C48" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <circle cx="78" cy="215" r="9" fill="#8B5E3C"/>
        <circle cx="68" cy="222" r="8" fill="#7A5030"/>
      </g>

      {/* 오른쪽 야자수 */}
      <g className="sw2">
        <path d="M258,370 C256,322 254,270 262,218" stroke="#5C3A1E" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M262,218 C242,190 210,183 188,170" stroke="#2D7A3A" strokeWidth="6" strokeLinecap="round" fill="none"/>
        <path d="M262,218 C282,188 312,180 335,168" stroke="#2D7A3A" strokeWidth="6" strokeLinecap="round" fill="none"/>
        <path d="M262,218 C256,190 252,162 248,140" stroke="#3A8C48" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M262,218 C240,205 212,204 188,200" stroke="#3A8C48" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M262,218 C288,206 315,207 338,204" stroke="#3A8C48" strokeWidth="4" strokeLinecap="round" fill="none"/>
      </g>

      {/* 파라솔 */}
      <line x1="165" y1="340" x2="165" y2="295" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round"/>
      <path d="M132,298 Q165,275 198,298" fill="#0EA5C9"/>
      <path d="M137,298 Q151,288 165,298" fill="#38BDF8" opacity="0.6"/>
      <path d="M165,298 Q179,288 193,298" fill="#38BDF8" opacity="0.6"/>

      {/* 선베드 */}
      <rect x="140" y="335" width="50" height="10" rx="3" fill="#E8D5A3"/>
      <rect x="138" y="335" width="7" height="16" rx="2" fill="#C4956A"/>
      <rect x="188" y="335" width="7" height="16" rx="2" fill="#C4956A"/>

      {/* 반짝임 */}
      {[[40,310],[110,325],[230,318],[300,308],[160,340]].map(([x,y],i)=>(
        <line key={i} className="sp2" x1={x-6} y1={y} x2={x+6} y2={y}
          stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.5"
          style={{ animationDelay:`${i*0.4}s` }}/>
      ))}

      {/* 새 */}
      <g className="bi" opacity="0.55">
        <path d="M10,85 Q17,80 24,85" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M30,72 Q37,67 44,72" fill="none" stroke="#555" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M52,90 Q58,86 64,90" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

function FallIllust() {
  return (
    <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <style>{`
        @keyframes leafDrift {
          0%   { transform:translate(0,0) rotate(0deg); opacity:.85; }
          50%  { transform:translate(20px,55px) rotate(160deg); opacity:.6; }
          100% { transform:translate(-10px,110px) rotate(310deg); opacity:0; }
        }
        .lf { animation: leafDrift 5s ease-in infinite; }
      `}</style>

      {/* 줄기 */}
      <path d="M155,370 C153,318 150,260 160,205" stroke="#6B3C1A" strokeWidth="14" strokeLinecap="round" fill="none"/>
      <path d="M160,205 C138,178 105,170 78,155" stroke="#6B3C1A" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M160,205 C182,177 218,170 244,157" stroke="#6B3C1A" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M160,205 C152,177 148,148 144,122" stroke="#7A4A22" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M160,248 C135,234 105,234 78,230" stroke="#7A4A22" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M160,248 C188,235 220,238 248,234" stroke="#7A4A22" strokeWidth="6" strokeLinecap="round" fill="none"/>

      {/* 단풍 뭉치 */}
      {[[158,148,50],[108,163,38],[210,158,36],[130,118,32],[188,112,30],[158,95,27],[85,186,22],[235,182,20]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r}
          fill={['#E8734A','#D4611A','#C84A10','#E89040','#F0A060','#D05820','#E86030','#F0B070'][i]}
          opacity="0.92"/>
      ))}

      {/* 떨어지는 잎 */}
      {[
        [35,35,9],[100,18,7],[195,28,8],[272,48,6],[308,22,8],
        [18,130,6],[230,105,7],[295,138,6],
        [55,205,5],[275,185,6],
        [25,295,5],[300,275,5],
      ].map(([x,y,s],i)=>(
        <g key={i} className="lf" style={{ animationDelay:`${i*0.3}s` }}>
          <ellipse cx={x} cy={y} rx={s} ry={s*0.55}
            fill={['#E8734A','#D4611A','#F0A060','#C84A10','#E86030'][i%5]}
            opacity="0.82" transform={`rotate(${i*41} ${x} ${y})`}/>
        </g>
      ))}
    </svg>
  )
}

function WinterIllust() {
  return (
    <svg viewBox="0 0 320 380" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <style>{`
        @keyframes snowF { 0%{transform:translateY(0) translateX(0);opacity:.8}100%{transform:translateY(400px) translateX(12px);opacity:0} }
        @keyframes steamW { 0%{transform:translateY(0);opacity:.55}100%{transform:translateY(-30px);opacity:0} }
        @keyframes twinkW { 0%,100%{opacity:.8}50%{opacity:.2} }
        .sf { animation: snowF 7s linear infinite; }
        .stm { animation: steamW 2.8s ease-out infinite; }
        .tw { animation: twinkW 3s ease-in-out infinite; }
      `}</style>

      {/* 별 */}
      {[[30,30],[90,15],[180,40],[260,22],[305,55],[15,100],[280,88]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%2===0?2:1.5} fill="var(--primary)" className="tw"
          opacity="0.5" style={{ animationDelay:`${i*0.5}s` }}/>
      ))}

      {/* 왼쪽 전나무 */}
      <rect x="58" y="300" width="8" height="30" rx="2" fill="#5C3A1E"/>
      {[[62,215,42],[62,242,52],[62,272,62],[62,298,48]].map(([cx,cy,w],i)=>(
        <polygon key={i} points={`${cx},${cy} ${cx-w/2},${cy+35} ${cx+w/2},${cy+35}`} fill="#2A5A38" opacity="0.9"/>
      ))}
      {[[62,224,18],[62,252,23],[62,280,29]].map(([cx,cy,w],i)=>(
        <ellipse key={i} cx={cx} cy={cy} rx={w} ry={4.5} fill="white" opacity="0.85"/>
      ))}

      {/* 오른쪽 전나무 */}
      <rect x="258" y="302" width="8" height="28" rx="2" fill="#5C3A1E"/>
      {[[262,220,38],[262,246,48],[262,274,58],[262,300,44]].map(([cx,cy,w],i)=>(
        <polygon key={i} points={`${cx},${cy} ${cx-w/2},${cy+33} ${cx+w/2},${cy+33}`} fill="#2A5A38" opacity="0.9"/>
      ))}
      {[[262,228,16],[262,256,21],[262,282,27]].map(([cx,cy,w],i)=>(
        <ellipse key={i} cx={cx} cy={cy} rx={w} ry={4} fill="white" opacity="0.85"/>
      ))}

      {/* 온천 */}
      <ellipse cx="160" cy="338" rx="75" ry="28" fill="var(--primary-bg)" opacity="0.9"/>
      <ellipse cx="160" cy="332" rx="68" ry="16" fill="var(--primary)" opacity="0.25"/>
      {/* 온천 돌 */}
      {[[88,338,11,5],[105,348,9,5],[132,353,13,5],[162,356,15,5],[194,352,12,5],[218,344,10,5],[232,334,9,4]].map(([x,y,rx,ry],i)=>(
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#8A9AB8" opacity="0.6"/>
      ))}
      {/* 수증기 */}
      {[[138,302],[158,296],[178,300],[198,294]].map(([x,y],i)=>(
        <path key={i} className="stm"
          d={`M${x},${y} C${x-5},${y-12} ${x+5},${y-22} ${x},${y-36}`}
          fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"
          style={{ animationDelay:`${i*0.55}s` }}/>
      ))}
      {/* 온천 사람 */}
      <circle cx="138" cy="324" r="11" fill="var(--primary-dark,#0880A0)" opacity="0.55"/>
      <circle cx="182" cy="322" r="11" fill="var(--primary-dark,#0880A0)" opacity="0.55"/>

      {/* 눈 */}
      {[
        [25,45],[88,28],[162,52],[240,30],[308,48],
        [14,120],[115,105],[218,118],[305,130],
        [45,195],[175,180],[295,192],
        [20,265],[150,250],[290,260],
      ].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%3===0?2.2:1.6} fill="white" className="sf"
          opacity="0.8" style={{ animationDelay:`${i*0.25}s` }}/>
      ))}
    </svg>
  )
}

const SEASON_ILLUSTS = { spring: SpringIllust, summer: SummerIllust, fall: FallIllust, winter: WinterIllust }

const SEASON_STYLE = {
  spring: { bg: 'linear-gradient(135deg, #FFF5FA 0%, #FFE8F4 60%, #FFD0EC 100%)', badge: '#F9B8D4' },
  summer: { bg: 'linear-gradient(135deg, #F0FBFF 0%, #E0F6FF 60%, #C8EEFF 100%)', badge: '#7DD3FC' },
  fall:   { bg: 'linear-gradient(135deg, #FFF8F0 0%, #FFF0E0 60%, #FFE4CC 100%)', badge: '#E8956A' },
  winter: { bg: 'linear-gradient(135deg, #F2F6FF 0%, #E8EEFF 60%, #D8E8FF 100%)', badge: '#7090D8' },
}

export default function LandingPage({ onNavigate }) {
  const season = getSeason()
  const Illust = SEASON_ILLUSTS[season]
  const style = SEASON_STYLE[season]
  const { handleGoogleLogin, username } = useApp()

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: style.bg,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .land-in { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* 상단 로고 */}
      <div style={{ position: 'absolute', top: 32, left: 40, zIndex: 10 }}>
        <span style={{
          fontFamily: "'Jua', sans-serif", fontSize: 24, color: 'var(--primary)',
          letterSpacing: '0.3px',
        }}>✈️ TripMate</span>
      </div>

      {/* 오른쪽 하단 일러스트 */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 'clamp(260px, 38vw, 480px)',
        height: 'clamp(320px, 55vh, 560px)',
        zIndex: 1, pointerEvents: 'none',
      }}>
        <Illust />
      </div>

      {/* 왼쪽 텍스트 콘텐츠 */}
      <div className="land-in" style={{
        position: 'absolute', top: '50%', left: 0,
        transform: 'translateY(-50%)',
        padding: 'clamp(24px, 6vw, 80px)',
        maxWidth: 'min(580px, 58vw)',
        zIndex: 5,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'var(--primary-bg)', borderRadius: 20, padding: '5px 14px',
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.5px' }}>국내 여행 기록 앱</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 800,
          fontFamily: "'Jua', sans-serif",
          color: '#1a1a1a', lineHeight: 1.3, marginBottom: 14,
        }}>
          나만의 여행을<br />
          <span style={{ color: 'var(--primary)' }}>함께</span> 기록해요
        </h1>

        <p style={{ fontSize: 'clamp(13px, 1.4vw, 15px)', color: '#777', lineHeight: 1.9, marginBottom: 36 }}>
          다녀온 장소를 저장하고, 루트를 계획하고,<br />
          친구들과 일지를 나눠요
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {!username && (
            <button onClick={handleGoogleLogin} style={{
              padding: '13px 20px', borderRadius: 13,
              background: 'white', color: '#333',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid #E0E0E0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Google 로그인
            </button>
          )}
          <button onClick={() => onNavigate('home')} style={{
            padding: '13px 28px', borderRadius: 13,
            background: 'var(--primary)', color: 'white',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Jua', sans-serif",
            boxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 35%, transparent)',
          }}>
            시작하기 →
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['📍 장소 저장','🗺️ 루트 계획','📔 여행 일지','👥 같이 가요'].map(label => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '5px 12px',
              fontSize: 11, color: 'var(--primary)', fontWeight: 600,
              border: '1px solid var(--primary-bg)',
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
