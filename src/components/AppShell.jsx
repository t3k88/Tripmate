import { useApp } from '../context/AppContext'
import BottomNav from './BottomNav'
import FeedPage from '../pages/FeedPage'
import MapPage from '../pages/MapPage'
import RoutePage from '../pages/RoutePage'
import JournalPage from '../pages/JournalPage'
import GroupPage from '../pages/GroupPage'
import PlaceRegisterModal from './PlaceRegister/PlaceRegisterModal'
import GroupModal from './Group/GroupModal'

export default function AppShell() {
  const { activeTab, showPlaceModal, showGroupModal } = useApp()

  const tabs = {
    feed: <FeedPage />,
    map: <MapPage />,
    route: <RoutePage />,
    journal: <JournalPage />,
    group: <GroupPage />,
  }

  return (
    <div className="app-shell">
      <div className="screen">
        {tabs[activeTab]}
      </div>

      <BottomNav />

      {showPlaceModal && <PlaceRegisterModal />}
      {showGroupModal && <GroupModal />}
    </div>
  )
}
