import { useState, useEffect } from 'react'

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue]
}
import AppShell from './components/AppShell'
import { AppContext } from './context/AppContext'
import './App.css'

const initialGroups = [
  {
    id: 1,
    name: '제주도 여행단',
    cover: '🏝️',
    members: [
      { id: 1, name: '나', email: 'taeeun.kang88@gmail.com', role: 'owner', avatar: '🧡' },
      { id: 2, name: '김지수', email: 'jisu@example.com', role: 'member', avatar: '💙' },
      { id: 3, name: '이민준', email: 'minjun@example.com', role: 'member', avatar: '💚' },
    ],
  },
  {
    id: 2,
    name: '부산 맛집 투어',
    cover: '🍜',
    members: [
      { id: 1, name: '나', email: 'taeeun.kang88@gmail.com', role: 'owner', avatar: '🧡' },
      { id: 4, name: '박소연', email: 'soyeon@example.com', role: 'member', avatar: '💜' },
    ],
  },
]

const initialPlaces = [
  {
    id: 1,
    name: '성산일출봉',
    category: 'attraction',
    address: '제주 서귀포시 성산읍 일출로 284-12',
    lat: 33.4587,
    lng: 126.9425,
    placeUrl: 'https://place.map.kakao.com/8174346',
    points: ['#포토스팟', '#자연경관', '#숨은명소'],
    comment: '일출이 정말 장관이에요! 이른 아침에 방문하는 것을 추천합니다.',
    groupId: 1,
    author: '나',
    date: '2026-06-10',
  },
  {
    id: 2,
    name: '흑돼지 거리 맛집',
    category: 'restaurant',
    address: '제주 제주시 연동 291-3',
    lat: 33.4996,
    lng: 126.5312,
    placeUrl: 'https://place.map.kakao.com/27290989',
    points: ['#맛집', '#단체모임', '#주차편함'],
    comment: '흑돼지가 정말 맛있어요. 줄이 길지만 기다릴 가치 있어요.',
    groupId: 1,
    author: '김지수',
    date: '2026-06-11',
  },
  {
    id: 3,
    name: '광안리 해수욕장',
    category: 'attraction',
    address: '부산 수영구 광안해변로 219',
    lat: 35.1531,
    lng: 129.1186,
    placeUrl: 'https://place.map.kakao.com/8143891',
    points: ['#포토스팟', '#야경맛집', '#무료입장'],
    comment: '야경이 너무 예뻐요. 광안대교 불빛이 환상적입니다.',
    groupId: 2,
    author: '나',
    date: '2026-06-12',
  },
]

const initialJournals = [
  {
    id: 1,
    title: '제주 첫날 기록',
    content: '오늘은 성산일출봉에 올라갔다. 새벽 5시에 일어났지만 그 값어치를 충분히 했다. 구름 사이로 보이는 일출은 정말 잊을 수 없는 광경이었다.',
    groupId: 1,
    author: '나',
    date: '2026-06-10',
    mood: '😍',
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('feed')
  const [groups, setGroups] = useLocalStorage('tripmate_groups', initialGroups)
  const [places, setPlaces] = useLocalStorage('tripmate_places', initialPlaces)
  const [journals, setJournals] = useLocalStorage('tripmate_journals', initialJournals)
  const [showPlaceModal, setShowPlaceModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [editingPlace, setEditingPlace] = useState(null)

  const ctx = {
    activeTab, setActiveTab,
    groups, setGroups,
    places, setPlaces,
    journals, setJournals,
    showPlaceModal, setShowPlaceModal,
    showGroupModal, setShowGroupModal,
    selectedGroup, setSelectedGroup,
    editingPlace, setEditingPlace,
  }

  return (
    <AppContext.Provider value={ctx}>
      <AppShell />
    </AppContext.Provider>
  )
}
