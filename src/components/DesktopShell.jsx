import { useState } from 'react'
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

export default function DesktopShell() {
  const { showPlaceModal, showGroupModal, setActiveTab } = useApp()
  const [page, setPage] = useState(() => sessionStorage.getItem('tripmate_page') || null)

  const navigate = (id) => {
    sessionStorage.setItem('tripmate_page', id)
    setPage(id)
    setActiveTab(id)
  }

  const goHome = () => {
    sessionStorage.removeItem('tripmate_page')
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
        background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '0 0 24px',
      }}>
        <button
          onClick={goHome}
          style={{
            padding: '28px 22px 22px',
            fontSize: 18, fontWeight: 800,
            color: '#1a1a1a', textAlign: 'left',
            background: 'none', border: 'none', cursor: 'pointer',
            letterSpacing: '-0.5px',
          }}
        >
          ✈️ <span style={{ color: 'var(--primary)' }}>Trip</span>Mate
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
          <div style={{ height: 1, background: '#EBEBEB', marginBottom: 16 }} />
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
