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
  { id: 'feed', label: '피드' },
  { id: 'map', label: '지도' },
  { id: 'route', label: '루트' },
  { id: 'journal', label: '일지' },
  { id: 'group', label: '그룹' },
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(() => sessionStorage.getItem('tripmate_page') || null)

  const navigate = (id) => {
    sessionStorage.setItem('tripmate_page', id)
    setPage(id)
    setActiveTab(id)
    setDrawerOpen(false)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* 헤더 */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        background: page ? 'var(--surface)' : 'rgba(15, 28, 64, 0.85)',
        borderBottom: page ? '1px solid var(--border)' : 'none',
        backdropFilter: !page ? 'blur(8px)' : 'none',
        transition: 'background 0.3s, border 0.3s',
      }}>
        <button
          onClick={() => { sessionStorage.removeItem('tripmate_page'); setPage(null); setActiveTab('feed') }}
          style={{
            fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
            color: page ? 'var(--primary)' : 'white',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          ✈️ TripMate
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            fontSize: 22, color: page ? 'var(--text)' : 'white',
            background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1,
            padding: '8px',
          }}
        >
          ≡
        </button>
      </header>

      {/* 컨텐츠 */}
      <div style={{ flex: 1, paddingTop: 64, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {page ? (
          <div style={{
            flex: 1, maxWidth: 860, width: '100%', margin: '0 auto',
            overflowY: 'auto', display: 'flex', flexDirection: 'column',
          }}>
            {pages[page]}
          </div>
        ) : (
          <LandingPage onNavigate={navigate} />
        )}
      </div>

      {/* 햄버거 드로어 */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200 }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 320,
              background: 'white', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
              display: 'flex', flexDirection: 'column', padding: '24px 32px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
              <button onClick={() => setDrawerOpen(false)} style={{ fontSize: 24, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.id)}
                  style={{
                    textAlign: 'left', padding: '16px 12px',
                    fontSize: 18, fontWeight: 600,
                    color: page === tab.id ? 'var(--primary)' : 'var(--text)',
                    borderBottom: '1px solid var(--border)',
                    background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {showPlaceModal && <PlaceRegisterModal />}
      {showGroupModal && <GroupModal />}
    </div>
  )
}
