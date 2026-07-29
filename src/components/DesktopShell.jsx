import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import LandingPage from '../pages/LandingPage'
import HomePage from '../pages/HomePage'
import FeedPage from '../pages/FeedPage'
import MapPage from '../pages/MapPage'
import RoutePage from '../pages/RoutePage'
import GroupPage from '../pages/GroupPage'
import JournalPage from '../pages/JournalPage'
import PlaceRegisterModal from './PlaceRegister/PlaceRegisterModal'
import GroupModal from './Group/GroupModal'

const tabs = [
  { id: 'home', icon: '🏡', label: '둘러보기' },
  { id: 'feed', icon: '📍', label: '내 장소들' },
  { id: 'route', icon: '🗺️', label: '여행 루트' },
  { id: 'journal', icon: '📔', label: '여행 일지' },
  { id: 'group', icon: '👥', label: '같이 가요' },
]

const pages = {
  home: <HomePage />,
  feed: <FeedPage />,
  route: <RoutePage />,
  journal: <JournalPage />,
  group: <GroupPage />,
}

const SEASON_BG = (() => {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5) return { from: '#FFF0F8', to: '#FFE0F0', accent: '#F9B8D4' }
  if (m >= 6 && m <= 8) return { from: '#E8F8FF', to: '#C8EEFF', accent: '#7DD3FC' }
  if (m >= 9 && m <= 11) return { from: '#FFF5EC', to: '#FFE8D0', accent: '#E8956A' }
  return { from: '#EEF4FF', to: '#D8E8FF', accent: '#7090D8' }
})()

export default function DesktopShell() {
  const { showPlaceModal, showGroupModal, activeTab, setActiveTab, username, handleLogout } = useApp()
  const [page, setPage] = useState(() => username ? 'home' : null)

  useEffect(() => {
    if (activeTab && activeTab !== page) {
      setPage(activeTab)
    }
  }, [activeTab])

  const navigate = (id) => {
    setPage(id)
    setActiveTab(id)
  }

  const goHome = () => {
    setPage(null)
    setActiveTab('home')
  }

  if (!page) {
    return <LandingPage onNavigate={navigate} />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: '#FFFFFF' }}>
      {/* 콘텐츠 */}
      <main style={{
        marginRight: 240, flex: 1, height: '100vh', overflow: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {pages[page]}
      </main>

      {/* 사이드바 — 오른쪽 */}
      <aside style={{
        width: 240, flexShrink: 0,
        height: '100vh', position: 'fixed', right: 0, top: 0, zIndex: 100,
        background: `linear-gradient(160deg, ${SEASON_BG.from} 0%, ${SEASON_BG.to} 100%)`,
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '0 0 28px',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.05)',
      }}>
        {/* 계절 장식 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 120, height: 120,
          background: `radial-gradient(circle at top left, ${SEASON_BG.accent}40, transparent 70%)`,
          pointerEvents: 'none', borderRadius: '0 0 100% 0',
        }}/>
        <div style={{
          position: 'absolute', bottom: 60, right: 0, width: 90, height: 90,
          background: `radial-gradient(circle at bottom right, ${SEASON_BG.accent}30, transparent 70%)`,
          pointerEvents: 'none',
        }}/>

        {/* 로고 */}
        <button onClick={goHome} style={{
          padding: '32px 24px 20px', textAlign: 'left',
          background: 'none', border: 'none', cursor: 'pointer', position: 'relative', zIndex: 1,
        }}>
          <div style={{
            fontFamily: "'Jua', sans-serif", fontSize: 22, color: 'var(--primary)',
            marginBottom: 4,
          }}>✈️ TripMate</div>
          <div style={{ fontSize: 12, color: '#999' }}>나만의 여행 기록장</div>
        </button>

        {/* 유저 카드 */}
        {username && (
          <div style={{
            margin: '0 16px 20px',
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
            borderRadius: 14, padding: '12px 14px',
            border: `1px solid ${SEASON_BG.accent}55`,
            position: 'relative', zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, var(--primary), ${SEASON_BG.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: 'white', fontWeight: 700,
              }}>
                {username[0]}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{username}</div>
                <div style={{ fontSize: 11, color: '#999' }}>여행자</div>
              </div>
            </div>
          </div>
        )}

        {/* 네비게이션 */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, padding: '0 12px', position: 'relative', zIndex: 1 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 14,
                fontSize: 14, fontWeight: page === tab.id ? 700 : 500,
                color: page === tab.id ? 'var(--primary)' : '#666',
                background: page === tab.id
                  ? 'rgba(255,255,255,0.85)'
                  : 'transparent',
                boxShadow: page === tab.id ? `0 2px 12px ${SEASON_BG.accent}40` : 'none',
                textAlign: 'left', cursor: 'pointer',
                border: page === tab.id ? `1px solid ${SEASON_BG.accent}60` : '1px solid transparent',
                transition: 'all 0.18s',
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 하단 — 로그아웃 + 버전 */}
        <div style={{ padding: '0 16px', position: 'relative', zIndex: 1 }}>
          <div style={{ height: 1, background: `${SEASON_BG.accent}40`, marginBottom: 16 }} />
          {username && (
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10,
                background: 'rgba(255,255,255,0.6)', border: '1px solid #E0E0E0',
                fontSize: 13, color: '#888', cursor: 'pointer',
                marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              🚪 로그아웃
            </button>
          )}
          <p style={{ fontSize: 11, color: '#C0C0C0', textAlign: 'center' }}>TripMate v1.0</p>
        </div>
      </aside>

      {showPlaceModal && <PlaceRegisterModal />}
      {showGroupModal && <GroupModal />}
    </div>
  )
}
