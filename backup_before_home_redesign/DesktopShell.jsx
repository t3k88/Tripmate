import { useState } from 'react'
import { useApp } from '../context/AppContext'
import LandingPage from '../pages/LandingPage'
import FeedPage from '../pages/FeedPage'
import MapPage from '../pages/MapPage'
import RoutePage from '../pages/RoutePage'
import GroupPage from '../pages/GroupPage'
import JournalPage from '../pages/JournalPage'
import PlaceRegisterModal from './PlaceRegister/PlaceRegisterModal'
import GroupModal from './Group/GroupModal'

const tabs = [
  { id: 'feed', icon: '🗺️', label: '피드' },
  { id: 'map', icon: '📍', label: '지도' },
  { id: 'route', icon: '🛣️', label: '루트' },
  { id: 'journal', icon: '📔', label: '일지' },
  { id: 'group', icon: '👥', label: '그룹' },
]

const pages = {
  feed: <FeedPage />,
  map: <MapPage />,
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
    setActiveTab('feed')
  }

  if (!page) {
    return <LandingPage onNavigate={navigate} />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* 사이드바 */}
      <aside style={{
        width: 200, flexShrink: 0,
        height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '0 0 24px',
      }}>
        <button
          onClick={goHome}
          style={{
            padding: '24px 20px 20px',
            fontSize: 17, fontWeight: 800,
            color: 'var(--primary)', textAlign: 'left',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          ✈️ TripMate
        </button>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 12px', borderRadius: 10,
                fontSize: 14, fontWeight: page === tab.id ? 700 : 500,
                color: page === tab.id ? 'var(--primary)' : 'var(--text)',
                background: page === tab.id ? 'var(--primary-bg)' : 'transparent',
                textAlign: 'left', cursor: 'pointer',
                border: 'none', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 콘텐츠 */}
      <main style={{
        marginLeft: 200, flex: 1,
        height: '100vh', overflow: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {pages[page]}
      </main>

      {showPlaceModal && <PlaceRegisterModal />}
      {showGroupModal && <GroupModal />}
    </div>
  )
}
