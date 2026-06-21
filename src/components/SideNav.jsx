import { useApp } from '../context/AppContext'

const tabs = [
  { id: 'feed', icon: '🏠', label: '피드' },
  { id: 'map', icon: '🗺️', label: '지도' },
  { id: 'route', icon: '📍', label: '루트' },
  { id: 'group', icon: '👥', label: '그룹' },
]

export default function SideNav() {
  const { activeTab, setActiveTab } = useApp()

  return (
    <nav className="side-nav">
      <div className="side-nav-logo">Trip<span>Mate</span></div>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`side-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="side-nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
