import { useApp } from '../context/AppContext'
import BottomNav from './BottomNav'
import DesktopShell from './DesktopShell'
import FeedPage from '../pages/FeedPage'
import MapPage from '../pages/MapPage'
import RoutePage from '../pages/RoutePage'
import GroupPage from '../pages/GroupPage'
import PlaceRegisterModal from './PlaceRegister/PlaceRegisterModal'
import GroupModal from './Group/GroupModal'

const useIsDesktop = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 768
}

export default function AppShell() {
  const { activeTab, showPlaceModal, showGroupModal } = useApp()
  const isDesktop = useIsDesktop()

  if (isDesktop) return <DesktopShell />

  const tabs = {
    feed: <FeedPage />,
    map: <MapPage />,
    route: <RoutePage />,
    group: <GroupPage />,
  }

  return (
    <div className="app-shell">
      <div className={`screen${activeTab === 'map' ? ' screen-map' : ''}`}>
        {tabs[activeTab]}
      </div>

      <BottomNav />

      {showPlaceModal && <PlaceRegisterModal />}
      {showGroupModal && <GroupModal />}
    </div>
  )
}
