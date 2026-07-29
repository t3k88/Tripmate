import { useApp } from '../context/AppContext.js'

const month = new Date().getMonth() + 1
const getSeason = () => {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

function SpringIllust() {
  return (
    <svg viewBox="0 0 460 380" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="springSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE8F5"/>
          <stop offset="60%" stopColor="#FFC8E8"/>
          <stop offset="100%" stopColor="#FFD0EC"/>
        </linearGradient>
        <linearGradient id="springGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8E8A0"/>
          <stop offset="100%" stopColor="#A8D878"/>
        </linearGradient>
      </defs>

      {/* 하늘 */}
      <rect width="460" height="380" fill="url(#springSky)"/>

      {/* 땅 */}
      <path d="M0,310 Q115,295 230,305 Q345,315 460,298 L460,380 L0,380Z" fill="url(#springGround)"/>
      <path d="M0,328 Q115,315 230,322 Q345,330 460,315 L460,380 L0,380Z" fill="#90C860" opacity="0.6"/>

      {/* 왼쪽 벚나무 */}
      <path d="M85,340 C84,300 82,255 90,210" stroke="#8B5E3C" strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M90,210 C70,185 40,178 20,165" stroke="#8B5E3C" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M90,210 C108,182 138,174 160,162" stroke="#8B5E3C" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M90,210 C82,185 78,160 74,138" stroke="#A07040" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M90,240 C68,228 42,228 20,224" stroke="#A07040" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M90,240 C115,228 142,230 165,226" stroke="#A07040" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* 왼쪽 꽃 뭉치 */}
      {[[88,155,45],[48,168,36],[132,162,34],[68,130,30],[112,125,28],[88,108,26],[40,192,22],[148,188,20]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill={i%2===0?"#FFB8D8":"#FFC8E0"} opacity="0.92"/>
      ))}

      {/* 오른쪽 벚나무 */}
      <path d="M375,360 C374,318 372,268 380,218" stroke="#8B5E3C" strokeWidth="11" strokeLinecap="round" fill="none"/>
      <path d="M380,218 C360,192 330,185 310,172" stroke="#8B5E3C" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M380,218 C400,190 428,182 448,170" stroke="#8B5E3C" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M380,218 C372,192 368,165 364,142" stroke="#A07040" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* 오른쪽 꽃 뭉치 */}
      {[[378,162,42],[336,175,32],[420,170,30],[358,138,26],[402,132,24],[378,118,22],[320,195,18],[438,190,18]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill={i%2===0?"#FFAACF":"#FFC0DC"} opacity="0.90"/>
      ))}

      {/* 강 */}
      <path d="M140,320 Q200,308 260,318 Q310,325 360,314" fill="none" stroke="#A8D4F0" strokeWidth="14" strokeLinecap="round" opacity="0.7"/>
      <path d="M145,320 Q200,310 258,319" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>

      {/* 흩날리는 꽃잎들 */}
      {[
        [55,60,8],[130,40,6],[210,30,7],[310,50,5],[400,38,7],[30,130,5],[180,110,6],[360,95,5],
        [70,200,4],[250,180,6],[420,160,5],[100,260,4],[340,240,5],[490,220,4],
        [160,300,5],[290,285,4],
      ].map(([x,y,r],i)=>(
        <ellipse key={i} className="petal" cx={x} cy={y} rx={r} ry={r*0.6}
          fill={i%3===0?"#FFB8D8":i%3===1?"#FFCCE6":"#FF98C8"} opacity="0.8"
          transform={`rotate(${i*37} ${x} ${y})`}
          style={{ animationDelay: `${i*0.28}s` }}/>
      ))}
    </svg>
  )
}

function SummerIllust() {
  return (
    <svg viewBox="0 0 460 380" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}
      preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB"/>
          <stop offset="60%" stopColor="#B8E4F5"/>
          <stop offset="100%" stopColor="#E0F4FF"/>
        </linearGradient>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0EA5C9"/>
          <stop offset="100%" stopColor="#0369A1"/>
        </linearGradient>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE566"/>
          <stop offset="100%" stopColor="#FFB800"/>
        </linearGradient>
      </defs>

      {/* 하늘 */}
      <rect width="460" height="380" fill="url(#skyGrad)"/>

      {/* 태양 글로우 */}
      <circle className="sun-glow" cx="360" cy="88" r="65" fill="#FFE566" opacity="0.15"/>
      <circle className="sun-ray" cx="360" cy="88" r="48" fill="url(#sunGrad)" opacity="0.95"/>

      {/* 구름 1 (크고 포실포실) */}
      <g className="cloud1" opacity="0.95">
        <ellipse cx="95" cy="75" rx="48" ry="22" fill="white"/>
        <ellipse cx="68" cy="82" rx="28" ry="18" fill="white"/>
        <ellipse cx="122" cy="80" rx="32" ry="18" fill="white"/>
        <ellipse cx="95" cy="88" rx="46" ry="14" fill="white"/>
      </g>

      {/* 구름 2 (작은) */}
      <g className="cloud2" opacity="0.85">
        <ellipse cx="255" cy="55" rx="32" ry="15" fill="white"/>
        <ellipse cx="236" cy="62" rx="18" ry="12" fill="white"/>
        <ellipse cx="272" cy="60" rx="20" ry="12" fill="white"/>
      </g>

      {/* 날아가는 새 */}
      <g className="bird-group" opacity="0.7">
        <path d="M20,100 Q27,95 34,100" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M40,88 Q47,83 54,88" fill="none" stroke="#444" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M60,104 Q66,100 72,104" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* 바다 */}
      <rect x="0" y="235" width="460" height="145" fill="url(#seaGrad)"/>

      {/* 파도 레이어 1 */}
      <path className="wave1-path"
        d="M0,242 C38,232 76,252 115,242 C153,232 191,252 230,242 C268,232 306,252 345,242 C383,232 421,252 460,242 L460,260 L0,260Z"
        fill="#38BDF8" opacity="0.7"/>

      {/* 파도 레이어 2 */}
      <path className="wave2-path"
        d="M0,262 C46,252 92,272 138,262 C184,252 230,272 276,262 C322,252 368,272 414,262 L460,262 L460,278 L0,278Z"
        fill="#7DD3FC" opacity="0.45"/>

      {/* 파도 하이라이트 */}
      <path d="M0,244 C30,240 60,248 90,244 C120,240 150,248 180,244 C210,240 240,248 270,244"
        fill="none" stroke="white" strokeWidth="2.5" opacity="0.4" strokeLinecap="round"/>

      {/* 모래 */}
      <path d="M0,330 Q115,310 230,320 Q345,330 460,308 L460,380 L0,380Z" fill="#F5DFA0"/>
      <path d="M0,345 Q115,325 230,335 Q345,345 460,323 L460,380 L0,380Z" fill="#EDD080"/>

      {/* 야자수 왼쪽 */}
      <path d="M72,340 C70,290 68,240 80,195" stroke="#5C3A1E" strokeWidth="10" strokeLinecap="round" fill="none"/>
      {/* 야자수 잎 */}
      <path d="M80,195 C60,168 20,160 5,148" stroke="#2D7A3A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M80,195 C100,165 130,158 148,145" stroke="#2D7A3A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M80,195 C75,165 68,140 62,122" stroke="#3A8C48" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M80,195 C58,178 30,175 12,170" stroke="#3A8C48" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M80,195 C108,178 138,178 158,172" stroke="#3A8C48" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* 야자나무 코코넛 */}
      <circle cx="80" cy="200" r="8" fill="#8B5E3C"/>
      <circle cx="70" cy="207" r="7" fill="#7A5030"/>

      {/* 야자수 오른쪽 */}
      <path d="M395,370 C392,320 388,268 398,220" stroke="#5C3A1E" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M398,220 C378,193 345,185 325,172" stroke="#2D7A3A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M398,220 C418,190 448,182 462,170" stroke="#2D7A3A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M398,220 C393,192 386,166 380,148" stroke="#3A8C48" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M398,220 C375,203 348,200 330,196" stroke="#3A8C48" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M398,220 C422,205 448,205 462,202" stroke="#3A8C48" strokeWidth="4" strokeLinecap="round" fill="none"/>

      {/* 파라솔 */}
      <line x1="215" y1="348" x2="215" y2="310" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round"/>
      {/* 파라솔 줄무늬 */}
      <path d="M180,312 Q215,290 250,312" fill="#0EA5C9" stroke="none"/>
      <path d="M185,312 Q200,302 215,312" fill="#38BDF8" stroke="none" opacity="0.7"/>
      <path d="M215,312 Q230,302 245,312" fill="#38BDF8" stroke="none" opacity="0.7"/>
      <path d="M178,313 Q215,292 252,313" fill="none" stroke="#0EA5C9" strokeWidth="1.5" opacity="0.5"/>

      {/* 선베드 */}
      <rect x="188" y="342" width="55" height="12" rx="4" fill="#E8D5A3"/>
      <rect x="186" y="342" width="8" height="18" rx="3" fill="#C4956A"/>
      <rect x="241" y="342" width="8" height="18" rx="3" fill="#C4956A"/>

      {/* 물 반짝임 */}
      {[[55,258],[140,270],[300,255],[380,265],[220,275],[170,262]].map(([x,y],i)=>(
        <line key={i} className="sparkle-line" x1={x-7} y1={y} x2={x+7} y2={y}
          stroke="white" strokeWidth="2.5" opacity="0.55" strokeLinecap="round"
          style={{ animationDelay: `${i * 0.35}s` }}/>
      ))}

      {/* 갈매기 */}
      <path d="M130,130 Q138,124 146,130" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
      <path d="M155,118 Q163,112 171,118" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
      <path d="M175,138 Q181,133 187,138" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function FallIllust() {
  return (
    <svg viewBox="0 0 460 380" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fallSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD4A0"/>
          <stop offset="45%" stopColor="#FFB870"/>
          <stop offset="100%" stopColor="#E8956A"/>
        </linearGradient>
        <linearGradient id="fallGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C87830"/>
          <stop offset="100%" stopColor="#A05820"/>
        </linearGradient>
      </defs>

      {/* 하늘 */}
      <rect width="460" height="380" fill="url(#fallSky)"/>

      {/* 석양 */}
      <circle cx="370" cy="80" r="55" fill="#FFE070" opacity="0.7"/>
      <circle cx="370" cy="80" r="38" fill="#FFD040" opacity="0.9"/>

      {/* 산 실루엣 */}
      <path d="M0,230 L80,140 L160,200 L230,110 L310,185 L390,120 L460,175 L460,300 L0,300Z" fill="#C86030" opacity="0.35"/>
      <path d="M0,260 L60,190 L130,240 L200,155 L280,220 L360,160 L430,210 L460,190 L460,320 L0,320Z" fill="#B05020" opacity="0.25"/>

      {/* 땅 */}
      <path d="M0,315 Q115,300 230,310 Q345,320 460,304 L460,380 L0,380Z" fill="url(#fallGround)"/>
      <path d="M0,332 Q115,318 230,326 Q345,335 460,320 L460,380 L0,380Z" fill="#904818" opacity="0.5"/>

      {/* 낙엽 바닥 */}
      {[[30,345,18],[90,350,14],[160,342,16],[240,348,15],[320,344,17],[400,350,13],[450,346,12]].map(([x,y,r],i)=>(
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r*0.5}
          fill={['#E8734A','#D4611A','#F0A060','#C84A10','#E89040'][i%5]} opacity="0.7"/>
      ))}

      {/* 왼쪽 단풍나무 */}
      <path d="M88,355 C86,310 84,258 92,208" stroke="#6B3C1A" strokeWidth="13" strokeLinecap="round" fill="none"/>
      <path d="M92,208 C72,182 42,175 18,162" stroke="#6B3C1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M92,208 C112,180 145,172 168,160" stroke="#6B3C1A" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M92,208 C84,180 80,152 76,128" stroke="#7A4A22" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M92,245 C68,232 40,232 15,228" stroke="#7A4A22" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M92,245 C118,234 148,236 172,232" stroke="#7A4A22" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* 왼쪽 단풍 뭉치 */}
      {[[90,148,48],[44,162,36],[138,158,34],[68,122,30],[116,116,28],[90,96,25],[35,185,20],[155,180,18]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r}
          fill={['#E8734A','#D4611A','#C84A10','#E89040','#F0A060','#D05820','#E86030','#F0B070'][i]}
          opacity="0.92"/>
      ))}

      {/* 오른쪽 단풍나무 */}
      <path d="M378,368 C376,322 374,270 382,218" stroke="#6B3C1A" strokeWidth="11" strokeLinecap="round" fill="none"/>
      <path d="M382,218 C362,192 330,185 308,172" stroke="#6B3C1A" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M382,218 C402,190 432,182 452,170" stroke="#6B3C1A" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M382,218 C374,190 370,162 366,138" stroke="#7A4A22" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* 오른쪽 단풍 뭉치 */}
      {[[380,160,44],[336,172,34],[424,168,32],[358,134,28],[404,128,25],[380,112,22]].map(([cx,cy,r],i)=>(
        <circle key={i} cx={cx} cy={cy} r={r}
          fill={['#D4611A','#E8734A','#C84A10','#E89040','#F0A060','#D05820'][i]}
          opacity="0.90"/>
      ))}

      {/* 떨어지는 잎 */}
      {[
        [55,55,10],[140,38,8],[215,25,9],[300,45,7],[415,35,9],
        [30,135,7],[188,105,8],[355,92,7],[440,115,6],
        [75,195,6],[250,175,7],[400,160,6],
        [120,258,5],[310,242,6],[430,250,5],
      ].map(([x,y,s],i)=>(
        <g key={i} className="fall-leaf" style={{ animationDelay: `${i*0.3}s` }}>
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
    <svg viewBox="0 0 460 380" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="winterSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A2A4A"/>
          <stop offset="55%" stopColor="#2E4A7A"/>
          <stop offset="100%" stopColor="#4A6FA8"/>
        </linearGradient>
        <linearGradient id="winterGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8EFF8"/>
          <stop offset="100%" stopColor="#C8D8EE"/>
        </linearGradient>
        <radialGradient id="hotspring" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6EC8E0"/>
          <stop offset="100%" stopColor="#4AA8C8"/>
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFDE0" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#FFFDE0" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* 밤하늘 */}
      <rect width="460" height="380" fill="url(#winterSky)"/>

      {/* 달 */}
      <circle cx="360" cy="72" r="50" fill="url(#moonGlow)"/>
      <circle cx="360" cy="72" r="32" fill="#FFFDE0" opacity="0.95"/>
      <circle cx="372" cy="64" r="28" fill="#2E4A7A"/>

      {/* 별들 */}
      {[[30,35],[80,20],[145,45],[220,18],[290,38],[410,25],[50,90],[175,75],[340,55],[430,80],
        [20,140],[110,125],[260,110],[400,130],[440,155]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%3===0?2.2:1.5}
          fill="white" opacity={0.5+Math.sin(i)*0.3}
          className="star-twinkle" style={{ animationDelay: `${i*0.4}s` }}/>
      ))}

      {/* 산 실루엣 */}
      <path d="M0,240 L70,150 L140,210 L210,120 L280,195 L360,130 L430,185 L460,165 L460,290 L0,290Z"
        fill="#1A3060" opacity="0.6"/>
      {/* 산 위 눈 */}
      <path d="M190,120 L210,105 L230,120 L220,128 L200,128Z" fill="white" opacity="0.8"/>
      <path d="M340,130 L360,115 L380,132 L368,140 L352,140Z" fill="white" opacity="0.7"/>

      {/* 눈 쌓인 땅 */}
      <path d="M0,308 Q115,295 230,302 Q345,310 460,296 L460,380 L0,380Z" fill="url(#winterGround)"/>
      <path d="M0,322 Q115,310 230,316 Q345,322 460,310 L460,380 L0,380Z" fill="white" opacity="0.5"/>

      {/* 전나무 왼쪽 */}
      <g>
        <rect x="83" y="295" width="10" height="30" rx="3" fill="#5C3A1E"/>
        {[[88,195,50],[88,225,62],[88,258,72],[88,288,56]].map(([cx,cy,w],i)=>(
          <polygon key={i} points={`${cx},${cy} ${cx-w/2},${cy+38} ${cx+w/2},${cy+38}`}
            fill="#2A5A38" opacity="0.9"/>
        ))}
        {/* 눈 얹힘 */}
        {[[88,205,22],[88,238,28],[88,270,34]].map(([cx,cy,w],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={w} ry={5} fill="white" opacity="0.85"/>
        ))}
      </g>

      {/* 전나무 오른쪽 */}
      <g>
        <rect x="373" y="300" width="9" height="28" rx="3" fill="#5C3A1E"/>
        {[[377,205,46],[377,232,58],[377,262,68],[377,292,52]].map(([cx,cy,w],i)=>(
          <polygon key={i} points={`${cx},${cy} ${cx-w/2},${cy+36} ${cx+w/2},${cy+36}`}
            fill="#2A5A38" opacity="0.9"/>
        ))}
        {[[377,214,20],[377,245,26],[377,275,32]].map(([cx,cy,w],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={w} ry={5} fill="white" opacity="0.85"/>
        ))}
      </g>

      {/* 온천 */}
      <ellipse cx="230" cy="330" rx="78" ry="30" fill="url(#hotspring)" opacity="0.88"/>
      <ellipse cx="230" cy="325" rx="72" ry="18" fill="#7DD8EC" opacity="0.5"/>
      {/* 온천 테두리 (돌) */}
      {[[155,332,12,6],[168,344,10,5],[190,350,14,6],[220,354,16,5],[255,352,14,6],[282,346,12,5],[300,336,10,5],[308,325,9,5]].map(([x,y,rx,ry],i)=>(
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#8A9AB8" opacity="0.75"/>
      ))}
      {/* 수증기 */}
      {[[205,300],[225,295],[245,298],[265,294]].map(([x,y],i)=>(
        <path key={i} className="steam"
          d={`M${x},${y} C${x-5},${y-12} ${x+5},${y-22} ${x},${y-35}`}
          fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"
          style={{ animationDelay: `${i*0.5}s` }}/>
      ))}
      {/* 온천 속 사람 실루엣 */}
      <circle cx="210" cy="320" r="10" fill="#2E4A7A" opacity="0.7"/>
      <circle cx="250" cy="318" r="10" fill="#2E4A7A" opacity="0.7"/>
      <path d="M195,328 Q210,340 225,328" stroke="#2E4A7A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M237,326 Q250,338 263,326" stroke="#2E4A7A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* 눈 내리기 */}
      {[
        [40,30],[95,15],[160,42],[235,22],[305,38],[405,20],[455,50],
        [25,100],[110,88],[200,75],[330,92],[448,108],
        [55,165],[175,148],[300,155],[420,170],
        [30,228],[145,215],[275,222],[395,235],[450,210],
      ].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%4===0?2.5:1.8}
          fill="white" opacity="0.75" className="snowfall"
          style={{ animationDelay: `${i*0.22}s` }}/>
      ))}
    </svg>
  )
}

const SEASON_ILLUSTS = { spring: SpringIllust, summer: SummerIllust, fall: FallIllust, winter: WinterIllust }

export default function LandingPage({ onNavigate }) {
  const season = getSeason()
  const Illust = SEASON_ILLUSTS[season]
  const { handleGoogleLogin, username } = useApp()

  return (
    <div style={{
      width: '100%', height: '100vh',
      position: 'relative', overflow: 'hidden',
    }}>
    <style>{`
      @keyframes wave1 {
        0%,100% { d: path("M0,242 C38,232 76,252 115,242 C153,232 191,252 230,242 C268,232 306,252 345,242 C383,232 421,252 460,242 L460,260 L0,260Z"); }
        50% { d: path("M0,248 C38,238 76,258 115,248 C153,238 191,258 230,248 C268,238 306,258 345,248 C383,238 421,258 460,248 L460,266 L0,266Z"); }
      }
      @keyframes wave2 {
        0%,100% { d: path("M0,262 C46,252 92,272 138,262 C184,252 230,272 276,262 C322,252 368,272 414,262 L460,262 L460,278 L0,278Z"); }
        50% { d: path("M0,256 C46,246 92,266 138,256 C184,246 230,266 276,256 C322,246 368,266 414,256 L460,256 L460,272 L0,272Z"); }
      }
      @keyframes floatCloud1 {
        0%,100% { transform: translateX(0px); }
        50% { transform: translateX(18px); }
      }
      @keyframes floatCloud2 {
        0%,100% { transform: translateX(0px); }
        50% { transform: translateX(-12px); }
      }
      @keyframes sunPulse {
        0%,100% { opacity: 0.15; r: 65; }
        50% { opacity: 0.28; r: 75; }
      }
      @keyframes sunRay {
        0%,100% { opacity: 0.9; }
        50% { opacity: 0.7; }
      }
      @keyframes sparkle {
        0%,100% { opacity: 0.55; }
        50% { opacity: 0.15; }
      }
      @keyframes birdFly {
        0% { transform: translateX(-80px); }
        100% { transform: translateX(520px); }
      }
      @keyframes palmSway {
        0%,100% { transform-origin: bottom center; transform: rotate(0deg); }
        50% { transform-origin: bottom center; transform: rotate(1.5deg); }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(28px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .wave1-path { animation: wave1 4s ease-in-out infinite; }
      .wave2-path { animation: wave2 5s ease-in-out infinite; }
      .cloud1 { animation: floatCloud1 7s ease-in-out infinite; }
      .cloud2 { animation: floatCloud2 9s ease-in-out infinite; }
      .sun-glow { animation: sunPulse 4s ease-in-out infinite; }
      .sun-ray { animation: sunRay 3s ease-in-out infinite; }
      .sparkle-line { animation: sparkle 2s ease-in-out infinite; }
      @keyframes petalDrift {
        0% { transform: translate(0,0) rotate(0deg); opacity: 0.8; }
        50% { transform: translate(18px, 40px) rotate(180deg); opacity: 0.6; }
        100% { transform: translate(-10px, 85px) rotate(340deg); opacity: 0; }
      }
      @keyframes leafDrift {
        0% { transform: translate(0,0) rotate(0deg); opacity: 0.82; }
        50% { transform: translate(22px, 45px) rotate(160deg); opacity: 0.6; }
        100% { transform: translate(-8px, 90px) rotate(310deg); opacity: 0; }
      }
      @keyframes snowFall {
        0% { transform: translateY(0px) translateX(0px); opacity: 0.75; }
        100% { transform: translateY(400px) translateX(15px); opacity: 0; }
      }
      @keyframes steamRise {
        0% { transform: translateY(0px); opacity: 0.5; }
        100% { transform: translateY(-28px); opacity: 0; }
      }
      @keyframes starTwinkle {
        0%,100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 0.2; transform: scale(0.6); }
      }
      .bird-group { animation: birdFly 18s linear infinite; }
      .palm-left { animation: palmSway 6s ease-in-out infinite; }
      .palm-right { animation: palmSway 8s ease-in-out infinite reverse; }
      .petal { animation: petalDrift 6s ease-in infinite; }
      .fall-leaf { animation: leafDrift 5s ease-in infinite; }
      .snowfall { animation: snowFall 7s linear infinite; }
      .steam { animation: steamRise 3s ease-out infinite; }
      .star-twinkle { animation: starTwinkle 3s ease-in-out infinite; }
      .landing-panel { animation: fadeUp 0.8s cubic-bezier(.22,1,.36,1) both; }
      .landing-logo { animation: fadeIn 0.6s ease both; }
    `}</style>
      {/* 배경 일러스트: 전체 화면 */}
      <div style={{
        position: 'absolute', inset: 0,
        zIndex: 0,
      }}>
        <Illust />
      </div>

      {/* 상단 로고 */}
      <div className="landing-logo" style={{ position: 'absolute', top: 28, left: 36, zIndex: 10 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)',
          borderRadius: 18, padding: '10px 20px',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}>
          <span style={{ fontSize: 26 }}>✈️</span>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'white', fontFamily: "'Jua', sans-serif",
            textShadow: '0 2px 6px rgba(0,0,0,0.2)', letterSpacing: '0.5px' }}>
            TripMate
          </p>
        </div>
      </div>

      {/* 하단 콘텐츠 패널 */}
      <div className="landing-panel" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        zIndex: 10,
        background: 'linear-gradient(to top, rgba(255,255,255,0.97) 70%, rgba(255,255,255,0) 100%)',
        padding: 'clamp(60px, 10vh, 100px) clamp(28px, 6vw, 80px) clamp(36px, 5vh, 60px)',
        display: 'flex', flexDirection: 'row', alignItems: 'flex-end',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
      }}>
        {/* 텍스트 */}
        <div style={{ flex: '1 1 300px', maxWidth: 520 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'var(--primary-bg)', borderRadius: 20, padding: '5px 14px',
            marginBottom: 16, width: 'fit-content',
          }}>
            <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.5px' }}>국내 여행 기록 앱</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800,
            fontFamily: "'Jua', sans-serif",
            color: '#1a1a1a', lineHeight: 1.25, marginBottom: 12,
          }}>
            나만의 여행을<br />
            <span style={{ color: 'var(--primary)' }}>함께</span> 기록해요
          </h1>

          <p style={{ fontSize: 'clamp(13px, 1.4vw, 15px)', color: '#666', lineHeight: 1.8, marginBottom: 0 }}>
            다녀온 장소를 저장하고, 루트를 계획하고, 친구들과 일지를 나눠요
          </p>
        </div>

        {/* 버튼 영역 */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', marginBottom: 4 }}>
            {['📍 장소 저장','🗺️ 루트 계획','📔 여행 일지','👥 그룹 공유'].map(label => (
              <div key={label} style={{
                background: 'var(--primary-bg)', borderRadius: 20, padding: '5px 12px',
                fontSize: 11, color: 'var(--primary)', fontWeight: 600,
              }}>
                {label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {!username && (
              <button
                onClick={handleGoogleLogin}
                style={{
                  padding: '13px 20px', borderRadius: 13,
                  background: 'white', color: '#333',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid #E0E0E0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Google 로그인
              </button>
            )}
            <button
              onClick={() => onNavigate('map')}
              style={{
                padding: '13px 20px', borderRadius: 13,
                background: 'rgba(255,255,255,0.85)', color: '#555',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid rgba(255,255,255,0.5)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              🗺️ 지도 보기
            </button>
            <button
              onClick={() => onNavigate('home')}
              style={{
                padding: '13px 28px', borderRadius: 13,
                background: 'var(--primary)', color: 'white',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 40%, transparent)',
                fontFamily: "'Jua', sans-serif", letterSpacing: '0.3px',
              }}
            >
              시작하기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
