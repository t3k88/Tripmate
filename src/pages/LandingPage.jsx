export default function LandingPage({ onNavigate }) {
  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 원형 장식 */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        borderRadius: '50%', background: 'rgba(232,115,74,0.12)',
        top: -200, right: -100, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', background: 'rgba(232,115,74,0.07)',
        bottom: -100, left: -100, pointerEvents: 'none',
      }} />

      {/* 히어로 섹션 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px 80px',
        maxWidth: 720, zIndex: 1,
      }}>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 16, letterSpacing: '0.5px' }}>
          국내 여행, 함께 기록해요
        </p>
        <h1 style={{
          fontSize: 56, fontWeight: 800, color: 'white', lineHeight: 1.2,
          marginBottom: 28, letterSpacing: '-1px',
        }}>
          나만의 여행을<br />
          <span style={{ color: '#E8734A' }}>TripMate</span>와 함께
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 48 }}>
          친구들과 장소를 공유하고, 루트를 계획하고<br />
          잊지 못할 여행을 만들어보세요.
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={() => onNavigate('feed')}
            style={{
              padding: '16px 36px', borderRadius: 14,
              background: '#E8734A', color: 'white',
              fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(232,115,74,0.4)',
            }}
          >
            피드 보기 →
          </button>
          <button
            onClick={() => onNavigate('route')}
            style={{
              padding: '16px 36px', borderRadius: 14,
              background: 'rgba(255,255,255,0.1)', color: 'white',
              fontSize: 16, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            루트 만들기
          </button>
        </div>
      </div>

      {/* 하단 통계 */}
      <div style={{
        display: 'flex', gap: 60, padding: '40px 80px',
        borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 1,
      }}>
        {[
          { label: '등록된 장소', desc: '전국 맛집 · 관광지' },
          { label: '여행 루트', desc: '친구들과 함께' },
          { label: '그룹', desc: '여행 멤버 모집' },
        ].map(item => (
          <div key={item.label}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{item.desc}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
