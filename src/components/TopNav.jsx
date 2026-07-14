import { useApp } from '../context/AppContext'

const tabs = [
  { id: 'home', label: '홈' },
  { id: 'feed', label: '장소' },
  { id: 'route', label: '루트' },
  { id: 'journal', label: '일지' },
  { id: 'group', label: '그룹' },
]

export default function TopNav() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <header className="top-nav">
      <div className="top-nav-logo">✈️ TripMate</div>
      <nav className="top-nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`top-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
