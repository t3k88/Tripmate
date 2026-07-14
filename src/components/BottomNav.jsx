import { useApp } from '../context/AppContext'

const tabs = [
  { id: 'home', icon: '🏠', label: '홈' },
  { id: 'feed', icon: '📍', label: '장소' },
  { id: 'route', icon: '🗺️', label: '루트' },
  { id: 'journal', icon: '📔', label: '일지' },
  { id: 'group', icon: '👥', label: '그룹' },
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
