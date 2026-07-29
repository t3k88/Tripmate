export default function LandingPage({ onNavigate }) {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'var(--primary-bg)', top: -160, right: -140, pointerEvents: 'none', opacity: 0.6 }} />
      <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'var(--primary-bg)', bottom: 60, left: -80, pointerEvents: 'none', opacity: 0.4 }} />

      <div style={{ padding: '32px 40px 0', zIndex: 1 }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          ✈️ <span style={{ color: 'var(--primary)' }}>Trip</span>Mate
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(40px, 8vw, 80px) 40px 60px', zIndex: 1, maxWidth: 680 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--primary-bg)', borderRadius: 20, padding: '5px 14px',
          marginBottom: 24, width: 'fit-content',
        }}>
          <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.5px' }}>국내 여행 기록 앱</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 5.5vw, 64px)', fontWeight: 800,
          color: '#1a1a1a', lineHeight: 1.15, marginBottom: 20, letterSpacing: '-1.5px',
        }}>
          나만의 여행을<br />
          <span style={{ color: 'var(--primary)' }}>함께</span> 기록해요
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
              background: 'var(--primary)', color: 'white',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 6px 20px color-mix(in srgb, var(--primary) 40%, transparent)',
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

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { icon: '📍', label: '장소 저장' },
            { icon: '🗺️', label: '루트 계획' },
            { icon: '📔', label: '여행 일지' },
            { icon: '👥', label: '그룹 공유' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--primary-bg)', borderRadius: 20, padding: '6px 14px',
            }}>
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
