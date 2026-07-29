import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import BottomNav from './BottomNav'
import DesktopShell from './DesktopShell'
import LandingPage from '../pages/LandingPage'
import HomePage from '../pages/HomePage'
import FeedPage from '../pages/FeedPage'
import MapPage from '../pages/MapPage'
import RoutePage from '../pages/RoutePage'
import GroupPage from '../pages/GroupPage'
import JournalPage from '../pages/JournalPage'
import PlaceRegisterModal from './PlaceRegister/PlaceRegisterModal'
import GroupModal from './Group/GroupModal'

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

export default function AppShell() {
  const { activeTab, setActiveTab, showPlaceModal, showGroupModal } = useApp()
  const isDesktop = useIsDesktop()
  const [entered, setEntered] = useState(() => !!sessionStorage.getItem('tripmate_page'))

  if (isDesktop) return <DesktopShell />

  const navigate = (tab) => {
    sessionStorage.setItem('tripmate_page', tab)
    setActiveTab(tab)
    setEntered(true)
  }

  if (!entered) {
    return <LandingPage onNavigate={navigate} />
  }

  const tabs = {
    home: <HomePage />,
    feed: <FeedPage />,
    map: <MapPage />,
    route: <RoutePage />,
    journal: <JournalPage />,
    group: <GroupPage />,
  }

  return (
    <div className="app-shell">
      <div className="screen">
        {tabs[activeTab] || <HomePage />}
      </div>

      <BottomNav />

      {showPlaceModal && <PlaceRegisterModal />}
      {showGroupModal && <GroupModal />}
    </div>
  )
}
