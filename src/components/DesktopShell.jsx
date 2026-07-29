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
  { id: 'home', icon: '🏠', label: '홈' },
  { id: 'feed', icon: '📍', label: '장소' },
  { id: 'route', icon: '🗺️', label: '루트' },
  { id: 'journal', icon: '📔', label: '일지' },
  { id: 'group', icon: '👥', label: '그룹' },
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
  const { showPlaceModal, showGroupModal, activeTab, setActiveTab, username } = useApp()
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
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* 사이드바 */}
      <aside style={{
        width: 220, flexShrink: 0,
        height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100,
        background: `linear-gradient(180deg, ${SEASON_BG.from} 0%, ${SEASON_BG.to} 100%)`,
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '0 0 24px',
      }}>
        {/* 사이드바 상단 계절 장식 */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 80, height: 80,
          background: `radial-gradient(circle at top right, ${SEASON_BG.accent}55, transparent 70%)`,
          pointerEvents: 'none',
        }}/>

        <button
          onClick={goHome}
          style={{
            padding: '28px 22px 20px',
            textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <span style={{
            fontFamily: "'Jua', sans-serif", fontSize: 20, fontWeight: 800,
            color: 'var(--primary)', letterSpacing: '0.3px',
          }}>✈️ TripMate</span>
          {username && (
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              안녕하세요, <b style={{ color: 'var(--primary)' }}>{username}</b>님 👋
            </p>
          )}
        </button>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 14px', borderRadius: 12,
                fontSize: 14, fontWeight: page === tab.id ? 700 : 400,
                color: page === tab.id ? 'var(--primary)' : '#555',
                background: page === tab.id ? 'var(--primary-bg)' : 'transparent',
                textAlign: 'left', cursor: 'pointer',
                border: 'none', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 17 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0 16px' }}>
          <div style={{ height: 1, background: `${SEASON_BG.accent}55`, marginBottom: 14 }} />
          <p style={{ fontSize: 11, color: '#BBB', textAlign: 'center' }}>TripMate v1.0</p>
        </div>
      </aside>

      {/* 콘텐츠 */}
      <main style={{
        marginLeft: 220, flex: 1,
        height: '100vh', overflow: 'auto',
        display: 'flex', flexDirection: 'column',
        background: '#FFFFFF',
      }}>
        {pages[page]}
      </main>

      {showPlaceModal && <PlaceRegisterModal />}
      {showGroupModal && <GroupModal />}
    </div>
  )
}
