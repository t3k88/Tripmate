export default function LandingPage({ onNavigate }) {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: '#FAFAF8',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 장식 원 */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(232,115,74,0.06)', top: -200, right: -180, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(232,115,74,0.04)', bottom: 80, left: -100, pointerEvents: 'none' }} />

      {/* 상단 로고 */}
      <div style={{ padding: '32px 40px 0', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          ✈️ <span style={{ color: '#E8734A' }}>Trip</span>Mate
        </p>
        <button
          onClick={() => onNavigate('home')}
          style={{ fontSize: 13, fontWeight: 600, color: '#E8734A', padding: '7px 16px', border: '1.5px solid #E8734A', borderRadius: 20, background: 'transparent', cursor: 'pointer' }}
        >
          로그인
        </button>
      </div>

      {/* 히어로 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(40px, 8vw, 80px) 40px 0', zIndex: 1, maxWidth: 680 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#FFF0E8', borderRadius: 20, padding: '5px 14px',
          marginBottom: 24, width: 'fit-content',
        }}>
          <span style={{ fontSize: 12, color: '#E8734A', fontWeight: 700, letterSpacing: '0.5px' }}>국내 여행 기록 앱</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 800,
          color: '#1a1a1a', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-1.5px',
        }}>
          나만의 여행을<br />
          <span style={{ color: '#E8734A' }}>함께</span> 기록해요
        </h1>

        <p style={{ fontSize: 'clamp(14px, 1.8vw, 17px)', color: '#888', lineHeight: 1.8, marginBottom: 40, maxWidth: 420 }}>
          다녀온 장소를 저장하고, 여행 루트를 계획하고,<br />
          친구들과 일지를 나눠요
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              padding: '16px 32px', borderRadius: 14,
              background: '#E8734A', color: 'white',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(232,115,74,0.35)',
              letterSpacing: '-0.3px',
            }}
          >
            시작하기 →
          </button>
          <button
            onClick={() => onNavigate('map')}
            style={{
              padding: '16px 28px', borderRadius: 14,
              background: 'white', color: '#555',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              border: '1.5px solid #E8E8E8',
            }}
          >
            🗺️ 지도 둘러보기
          </button>
        </div>

        {/* 기능 칩 */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { icon: '📍', label: '장소 저장', bg: '#FFF0E8', color: '#C45A25' },
            { icon: '🗺️', label: '루트 계획', bg: '#EEF5FF', color: '#3563C9' },
            { icon: '📔', label: '여행 일지', bg: '#F0FAF4', color: '#2E7D52' },
            { icon: '👥', label: '그룹 공유', bg: '#F5F0FF', color: '#6B3DB5' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: item.bg, borderRadius: 20, padding: '6px 14px',
            }}>
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: item.color, fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 장식 카드들 */}
      <div style={{ padding: '48px 40px 40px', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { name: '코코까페', region: '충북 단양', cat: '카페', icon: '☕', color: '#FFF0E8' },
            { name: '만천하스카이워크', region: '충북 단양', cat: '관광지', icon: '🏔', color: '#EEF5FF' },
            { name: '제주 협재해수욕장', region: '제주', cat: '관광지', icon: '🏖', color: '#F0FAF4' },
            { name: '광장시장', region: '서울 종로', cat: '쇼핑', icon: '🛍', color: '#F5F0FF' },
          ].map(c => (
            <div key={c.name} style={{
              flexShrink: 0, background: 'white',
              borderRadius: 16, border: '1px solid #EBEBEB',
              padding: '14px 16px', minWidth: 150,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>
                {c.icon}
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{c.name}</p>
              <p style={{ fontSize: 11, color: '#999' }}>{c.region}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
