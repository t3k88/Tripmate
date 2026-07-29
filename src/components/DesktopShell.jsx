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
  if (m >= 3 && m <= 5) return { bg: '#FFF7FB', accent: '#F9B8D4' }
  if (m >= 6 && m <= 8) return { bg: '#F2FBFF', accent: '#7DD3FC' }
  if (m >= 9 && m <= 11) return { bg: '#FFF9F5', accent: '#E8956A' }
  return { bg: '#F5F8FF', accent: '#7090D8' }
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
        marginRight: 220, flex: 1, height: '100vh', overflow: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        {pages[page]}
      </main>

      {/* 사이드바 — 오른쪽 */}
      <aside style={{
        width: 220, flexShrink: 0,
        height: '100vh', position: 'fixed', right: 0, top: 0, zIndex: 100,
        background: SEASON_BG.bg,
        borderLeft: '1px solid #EBEBEB',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        boxShadow: '-2px 0 16px rgba(0,0,0,0.04)',
      }}>
        {/* 계절 포인트 — 아주 연하게 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${SEASON_BG.accent}90, ${SEASON_BG.accent}20)`,
        }}/>

        {/* 홈 버튼 */}
        <button onClick={goHome} style={{
          padding: '20px 20px 12px', textAlign: 'left',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#AAAAAA', fontSize: 12,
        }}>
          <span style={{ fontSize: 15 }}>✈️</span>
          <span style={{ fontFamily: "'Jua', sans-serif", color: 'var(--primary)', fontSize: 13 }}>홈으로</span>
        </button>

        {/* 유저 표시 */}
        {username && (
          <div style={{
            margin: '0 16px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: `var(--primary-bg)`,
              border: `1.5px solid ${SEASON_BG.accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'var(--primary)', fontWeight: 700,
            }}>
              {username[0]}
            </div>
            <span style={{ fontSize: 12, color: '#888' }}>{username}</span>
          </div>
        )}

        {/* 구분선 */}
        <div style={{ height: 1, background: '#F0F0F0', margin: '0 16px 12px' }}/>

        {/* 네비게이션 */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 12,
                fontSize: 13.5, fontWeight: page === tab.id ? 700 : 400,
                color: page === tab.id ? 'var(--primary)' : '#555',
                background: page === tab.id ? 'var(--primary-bg)' : 'transparent',
                textAlign: 'left', cursor: 'pointer',
                border: 'none', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* 하단 */}
        <div style={{ padding: '16px 16px 24px' }}>
          <div style={{ height: 1, background: '#F0F0F0', marginBottom: 14 }}/>
          {username && (
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '8px 0',
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 12, color: '#BBBBBB', textAlign: 'center',
                marginBottom: 8,
              }}
            >
              로그아웃
            </button>
          )}
          <p style={{ fontSize: 11, color: '#DDDDDD', textAlign: 'center' }}>TripMate v1.0</p>
        </div>
      </aside>

      {showPlaceModal && <PlaceRegisterModal />}
      {showGroupModal && <GroupModal />}
    </div>
  )
}
