export default function LandingPage({ onNavigate }) {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f1b35 0%, #1a2f5a 50%, #0f3460 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 장식 */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(232,115,74,0.1)', top: -150, right: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(232,115,74,0.06)', bottom: 50, left: -80, pointerEvents: 'none' }} />

      {/* 상단 로고 */}
      <div style={{ padding: '52px 32px 0', zIndex: 1 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
          ✈️ <span style={{ color: '#E8734A' }}>Trip</span>Mate
        </p>
      </div>

      {/* 히어로 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px', zIndex: 1 }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>
          국내 여행, 함께 기록해요
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-1px' }}>
          나만의 여행을<br />
          <span style={{ color: '#E8734A' }}>TripMate</span>와<br />
          함께
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 48 }}>
          친구들과 장소를 공유하고<br />루트를 계획하고 일지를 남겨요
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
          <button
            onClick={() => onNavigate('home')}
            style={{
              padding: '18px 36px', borderRadius: 16,
              background: '#E8734A', color: 'white',
              fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(232,115,74,0.45)',
              letterSpacing: '-0.3px',
            }}
          >
            시작하기 →
          </button>
          <button
            onClick={() => onNavigate('map')}
            style={{
              padding: '16px 36px', borderRadius: 16,
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)',
              fontSize: 15, fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            🗺️ 지도로 둘러보기
          </button>
        </div>
      </div>

      {/* 하단 탭 힌트 */}
      <div style={{ padding: '32px', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { icon: '📍', label: '장소 저장' },
            { icon: '🗺️', label: '루트 계획' },
            { icon: '📔', label: '여행 일지' },
            { icon: '👥', label: '그룹 공유' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
