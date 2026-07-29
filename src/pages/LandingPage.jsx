const month = new Date().getMonth() + 1
const getSeason = () => {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

function SpringIllust() {
  return (
    <svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 하늘 */}
      <rect width="420" height="320" fill="#FFF0F8" />
      {/* 땅 */}
      <ellipse cx="210" cy="310" rx="220" ry="40" fill="#F9D0E8" />
      {/* 나무 줄기 */}
      <rect x="195" y="180" width="30" height="120" rx="8" fill="#C4956A" />
      {/* 나뭇가지 */}
      <line x1="210" y1="220" x2="150" y2="170" stroke="#C4956A" strokeWidth="10" strokeLinecap="round"/>
      <line x1="210" y1="200" x2="270" y2="155" stroke="#C4956A" strokeWidth="10" strokeLinecap="round"/>
      {/* 벚꽃 뭉치 */}
      {[
        [210,130,70],[155,145,55],[265,135,55],
        [185,100,45],[240,105,45],[210,80,38],
      ].map(([cx,cy,r],i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#F9B8D4" opacity="0.9"/>
      ))}
      {/* 흩날리는 꽃잎 */}
      {[
        [60,80],[100,50],[340,90],[370,60],[290,40],[80,150],[350,140],[40,200],
      ].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="4" fill="#F9B8D4" opacity="0.7"
          transform={`rotate(${i*35} ${x} ${y})`}/>
      ))}
      {/* 작은 꽃잎들 */}
      {[
        [120,200],[320,180],[60,260],[380,240],[160,280],[300,260],
      ].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="3" fill="#FCB8D0" opacity="0.5"
          transform={`rotate(${i*40} ${x} ${y})`}/>
      ))}
    </svg>
  )
}

function SummerIllust() {
  return (
    <svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 하늘 */}
      <rect width="420" height="200" fill="#CCEEFF" />
      {/* 바다 */}
      <rect x="0" y="200" width="420" height="120" fill="#1A9BD7" />
      {/* 파도 */}
      <path d="M0,210 Q52,195 105,210 Q157,225 210,210 Q262,195 315,210 Q367,225 420,210 L420,230 L0,230Z" fill="#38C4E0" opacity="0.6"/>
      <path d="M0,230 Q52,218 105,230 Q157,242 210,230 Q262,218 315,230 Q367,242 420,230 L420,250 L0,250Z" fill="#0EA5C9" opacity="0.5"/>
      {/* 태양 */}
      <circle cx="340" cy="70" r="42" fill="#FFD97D" opacity="0.95"/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <line key={i}
          x1={340+55*Math.cos(a*Math.PI/180)} y1={70+55*Math.sin(a*Math.PI/180)}
          x2={340+68*Math.cos(a*Math.PI/180)} y2={70+68*Math.sin(a*Math.PI/180)}
          stroke="#FFD97D" strokeWidth="4" strokeLinecap="round"/>
      ))}
      {/* 구름 */}
      {[[80,65],[85,55],[95,50],[108,52],[115,62],[105,70],[88,70]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="18" fill="white" opacity="0.9"/>
      ))}
      {/* 모래사장 */}
      <rect x="0" y="270" width="420" height="50" fill="#F5DFA0" />
      {/* 파라솔 */}
      <line x1="130" y1="265" x2="130" y2="310" stroke="#C4956A" strokeWidth="4"/>
      <ellipse cx="130" cy="262" rx="38" ry="14" fill="#E8734A" opacity="0.9"/>
      <ellipse cx="130" cy="260" rx="30" ry="10" fill="#FFB347" opacity="0.7"/>
      {/* 물결 반짝임 */}
      {[[60,240],[180,250],[270,238],[370,248],[120,260],[310,255]].map(([x,y],i)=>(
        <line key={i} x1={x-8} y1={y} x2={x+8} y2={y} stroke="white" strokeWidth="2" opacity="0.5"/>
      ))}
    </svg>
  )
}

function FallIllust() {
  return (
    <svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 하늘 */}
      <rect width="420" height="320" fill="#FFF5EC" />
      {/* 땅 */}
      <ellipse cx="210" cy="310" rx="230" ry="42" fill="#D4A060" opacity="0.5"/>
      {/* 나무 줄기 왼쪽 */}
      <rect x="90" y="170" width="22" height="130" rx="7" fill="#8B5E3C"/>
      {/* 나무 줄기 오른쪽 */}
      <rect x="308" y="185" width="20" height="115" rx="6" fill="#8B5E3C"/>
      {/* 가지 */}
      <line x1="101" y1="210" x2="50" y2="170" stroke="#8B5E3C" strokeWidth="8" strokeLinecap="round"/>
      <line x1="101" y1="195" x2="155" y2="160" stroke="#8B5E3C" strokeWidth="8" strokeLinecap="round"/>
      <line x1="318" y1="210" x2="370" y2="168" stroke="#8B5E3C" strokeWidth="7" strokeLinecap="round"/>
      <line x1="318" y1="200" x2="265" y2="165" stroke="#8B5E3C" strokeWidth="7" strokeLinecap="round"/>
      {/* 단풍 뭉치 왼쪽 */}
      {[[100,130,55],[55,150,42],[155,140,42],[80,105,36],[125,98,32]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill={['#E8734A','#D4611A','#E8956A','#C84A10','#F0A060'][i]} opacity="0.9"/>
      ))}
      {/* 단풍 뭉치 오른쪽 */}
      {[[318,170,50],[270,158,38],[368,155,38],[300,135,32],[340,128,30]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill={['#D4611A','#E8734A','#C84A10','#E8956A','#D48040'][i]} opacity="0.9"/>
      ))}
      {/* 떨어지는 잎 */}
      {[
        [190,80,20],[230,60,15],[160,130,18],[260,110,16],[200,170,14],[310,90,17],[140,200,13],[350,200,15],
      ].map(([x,y,s],i)=>(
        <ellipse key={i} cx={x} cy={y} rx={s*0.7} ry={s*0.4}
          fill={['#E8734A','#D4611A','#F0A060','#C84A10'][i%4]} opacity="0.75"
          transform={`rotate(${i*37} ${x} ${y})`}/>
      ))}
    </svg>
  )
}

function WinterIllust() {
  return (
    <svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 하늘 */}
      <rect width="420" height="320" fill="#EEF4FF" />
      {/* 눈 쌓인 땅 */}
      <ellipse cx="210" cy="315" rx="230" ry="38" fill="white"/>
      <rect x="0" y="290" width="420" height="30" fill="white"/>
      {/* 전나무 왼쪽 */}
      <polygon points="90,280 60,220 90,235 65,180 90,195 70,145 90,155 75,110 90,120 90,280" fill="#2E5E3E" opacity="0.85"/>
      <polygon points="90,280 120,220 90,235 115,180 90,195 110,145 90,155 105,110 90,120 90,280" fill="#2E5E3E" opacity="0.85"/>
      {/* 전나무 오른쪽 */}
      <polygon points="330,280 305,225 330,238 308,188 330,200 312,155 330,165 315,122 330,132 330,280" fill="#2E5E3E" opacity="0.85"/>
      <polygon points="330,280 355,225 330,238 352,188 330,200 348,155 330,165 345,122 330,132 330,280" fill="#2E5E3E" opacity="0.85"/>
      {/* 눈 얹힘 */}
      <ellipse cx="90" cy="120" rx="18" ry="6" fill="white" opacity="0.9"/>
      <ellipse cx="90" cy="155" rx="24" ry="7" fill="white" opacity="0.85"/>
      <ellipse cx="330" cy="132" rx="18" ry="6" fill="white" opacity="0.9"/>
      <ellipse cx="330" cy="165" rx="22" ry="7" fill="white" opacity="0.85"/>
      {/* 눈송이 */}
      {[
        [50,40],[130,25],[200,50],[280,30],[370,45],[80,100],[160,80],[340,90],[410,70],
        [30,160],[100,140],[230,120],[360,150],[420,130],[60,220],[200,200],[310,210],[400,190],
      ].map(([x,y],i)=>(
        <g key={i} transform={`translate(${x},${y})`}>
          <circle r="3" fill="white" opacity="0.8"/>
          {[0,60,120].map(a=>(
            <line key={a} x1={0} y1={0}
              x2={6*Math.cos(a*Math.PI/180)} y2={6*Math.sin(a*Math.PI/180)}
              stroke="white" strokeWidth="1.5" opacity="0.7"/>
          ))}
          {[0,60,120].map(a=>(
            <line key={a+3} x1={0} y1={0}
              x2={-6*Math.cos(a*Math.PI/180)} y2={-6*Math.sin(a*Math.PI/180)}
              stroke="white" strokeWidth="1.5" opacity="0.7"/>
          ))}
        </g>
      ))}
      {/* 눈사람 */}
      <circle cx="210" cy="265" r="28" fill="white" stroke="#C8D8EE" strokeWidth="1.5"/>
      <circle cx="210" cy="228" r="20" fill="white" stroke="#C8D8EE" strokeWidth="1.5"/>
      <circle cx="205" cy="224" r="2.5" fill="#4A6FBF"/>
      <circle cx="215" cy="224" r="2.5" fill="#4A6FBF"/>
      <path d="M205,232 Q210,237 215,232" stroke="#4A6FBF" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="192" y1="250" x2="175" y2="240" stroke="#C4956A" strokeWidth="3" strokeLinecap="round"/>
      <line x1="228" y1="250" x2="245" y2="240" stroke="#C4956A" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

const SEASON_ILLUSTS = { spring: SpringIllust, summer: SummerIllust, fall: FallIllust, winter: WinterIllust }

export default function LandingPage({ onNavigate }) {
  const season = getSeason()
  const Illust = SEASON_ILLUSTS[season]

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ padding: '32px 40px 0', zIndex: 1, position: 'relative' }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          ✈️ <span style={{ color: 'var(--primary)' }}>Trip</span>Mate
        </p>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'stretch',
        flexDirection: 'row', position: 'relative', zIndex: 1,
        flexWrap: 'wrap',
      }}>
        {/* 텍스트 영역 */}
        <div style={{
          flex: '1 1 380px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(32px, 6vw, 72px) 40px 60px',
          minWidth: 300,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--primary-bg)', borderRadius: 20, padding: '5px 14px',
            marginBottom: 24, width: 'fit-content',
          }}>
            <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.5px' }}>국내 여행 기록 앱</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 4.5vw, 58px)', fontWeight: 800,
            color: '#1a1a1a', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-1.5px',
          }}>
            나만의 여행을<br />
            <span style={{ color: 'var(--primary)' }}>함께</span> 기록해요
          </h1>

          <p style={{ fontSize: 'clamp(13px, 1.6vw, 16px)', color: '#888', lineHeight: 1.8, marginBottom: 36, maxWidth: 400 }}>
            다녀온 장소를 저장하고, 여행 루트를 계획하고,<br />
            친구들과 일지를 나눠요
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                padding: '15px 30px', borderRadius: 14,
                background: 'var(--primary)', color: 'white',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 35%, transparent)',
                letterSpacing: '-0.3px',
              }}
            >
              시작하기 →
            </button>
            <button
              onClick={() => onNavigate('map')}
              style={{
                padding: '15px 24px', borderRadius: 14,
                background: 'white', color: '#555',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid #E8E8E8',
              }}
            >
              🗺️ 지도 둘러보기
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['📍 장소 저장','🗺️ 루트 계획','📔 여행 일지','👥 그룹 공유'].map(label => (
              <div key={label} style={{
                background: 'var(--primary-bg)', borderRadius: 20, padding: '5px 12px',
                fontSize: 12, color: 'var(--primary)', fontWeight: 600,
              }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* 일러스트 영역 */}
        <div style={{
          flex: '1 1 320px', minWidth: 280,
          display: 'flex', alignItems: 'flex-end',
          padding: '0 0 0 0', overflow: 'hidden',
          maxHeight: 400,
        }}>
          <Illust />
        </div>
      </div>
    </div>
  )
}
