import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AppShell from './components/AppShell'
import { AppContext } from './context/AppContext'
import './App.css'

// DB ↔ App 변환
const placeFromDb = (p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  address: p.address,
  lat: p.lat,
  lng: p.lng,
  placeUrl: p.place_url || '',
  points: p.points || [],
  menus: p.menus || [],
  comment: p.comment || '',
  author: p.author || '알 수 없음',
  groupIds: p.group_ids || [],
  date: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
})

const placeToDb = (p) => ({
  name: p.name,
  category: p.category,
  address: p.address,
  lat: p.lat,
  lng: p.lng,
  place_url: p.placeUrl,
  points: p.points || [],
  menus: p.menus || [],
  comment: p.comment || '',
  author: p.author,
  group_ids: p.groupIds || [],
})

const groupFromDb = (g, members = []) => ({
  id: g.id,
  name: g.name,
  cover: g.cover,
  inviteCode: g.invite_code,
  members,
})

const journalFromDb = (j) => ({
  id: j.id,
  title: j.title,
  content: j.content,
  groupId: j.group_id,
  author: j.author || '알 수 없음',
  mood: j.mood,
  date: j.created_at ? j.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
})

export default function App() {
  const [activeTab, setActiveTab] = useState('feed')
  const [groups, setGroups] = useState([])
  const [places, setPlaces] = useState([])
  const [journals, setJournals] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlaceModal, setShowPlaceModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [editingPlace, setEditingPlace] = useState(null)
  const [username, setUsername] = useState(() => localStorage.getItem('tripmate_username') || '')
  const [showUsernameModal, setShowUsernameModal] = useState(!localStorage.getItem('tripmate_username'))

  useEffect(() => {
    loadAll().then(() => handleJoinFromUrl())
  }, [])

  const handleJoinFromUrl = async () => {
    const params = new URLSearchParams(window.location.search)
    const joinParam = params.get('join')
    if (!joinParam) return

    const groupId = parseInt(joinParam, 36)
    const uname = localStorage.getItem('tripmate_username') || '나'

    const { data: existing } = await supabase
      .from('group_members').select('id')
      .eq('group_id', groupId).eq('user_name', uname).maybeSingle()

    if (!existing) {
      await supabase.from('group_members').insert([{ group_id: groupId, user_name: uname, user_avatar: '👤' }])
    }

    window.history.replaceState({}, '', '/')
    await loadAll()
    alert('그룹에 참여했어요! 🎉')
  }

  const loadAll = async () => {
    setLoading(true)
    const [placesRes, groupsRes, membersRes, journalsRes, routesRes, routePlacesRes] = await Promise.all([
      supabase.from('places').select('*').order('created_at', { ascending: false }),
      supabase.from('groups').select('*'),
      supabase.from('group_members').select('*'),
      supabase.from('journals').select('*').order('created_at', { ascending: false }),
      supabase.from('routes').select('*').order('created_at', { ascending: false }),
      supabase.from('route_places').select('*').order('sort_order'),
    ])
    if (placesRes.data) setPlaces(placesRes.data.map(placeFromDb))
    if (groupsRes.data) {
      const members = membersRes.data || []
      setGroups(groupsRes.data.map(g =>
        groupFromDb(g, members.filter(m => m.group_id === g.id).map(m => ({
          id: m.id, name: m.user_name, avatar: m.user_avatar || '👤', role: 'member',
        })))
      ))
    }
    if (journalsRes.data) setJournals(journalsRes.data.map(journalFromDb))
    if (routesRes.data) {
      const rp = routePlacesRes.data || []
      setRoutes(routesRes.data.map(r => ({
        id: r.id, name: r.name, groupId: r.group_id, author: r.author,
        date: r.created_at?.split('T')[0],
        items: rp.filter(p => p.route_id === r.id).map(p => ({
          id: p.id, placeId: p.place_id, dayNumber: p.day_number, sortOrder: p.sort_order,
        })),
      })))
    }
    setLoading(false)
  }

  // Place CRUD
  const addPlace = async (placeData) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const { data } = await supabase.from('places').insert([placeToDb({ ...placeData, author: uname })]).select().single()
    if (data) setPlaces(ps => [placeFromDb(data), ...ps])
  }

  const updatePlace = async (id, updates) => {
    const existing = places.find(p => p.id === id)
    const merged = { ...existing, ...updates }
    const { data } = await supabase.from('places').update(placeToDb(merged)).eq('id', id).select().single()
    if (data) setPlaces(ps => ps.map(p => p.id === id ? placeFromDb(data) : p))
  }

  const deletePlace = async (id) => {
    await supabase.from('places').delete().eq('id', id)
    setPlaces(ps => ps.filter(p => p.id !== id))
  }

  // Group CRUD
  const addGroup = async (groupData) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase()
    const { data, error } = await supabase.from('groups').insert([{ name: groupData.name, cover: groupData.cover, invite_code: inviteCode }]).select().single()
    if (error) { alert('그룹 생성 오류: ' + error.message); return null }
    if (data) {
      const { error: memberError } = await supabase.from('group_members').insert([{ group_id: data.id, user_name: uname, user_avatar: '🧡' }])
      if (memberError) console.error('멤버 추가 오류:', memberError.message)
      const newGroup = groupFromDb(data, [{ id: Date.now(), name: uname, avatar: '🧡', role: 'owner' }])
      setGroups(gs => [...gs, newGroup])
      return newGroup
    }
  }

  const deleteGroup = async (id) => {
    await supabase.from('groups').delete().eq('id', id)
    setGroups(gs => gs.filter(g => g.id !== id))
  }

  const removeMember = async (groupId, memberId) => {
    await supabase.from('group_members').delete().eq('id', memberId)
    setGroups(gs => gs.map(g =>
      g.id === groupId ? { ...g, members: g.members.filter(m => m.id !== memberId) } : g
    ))
  }

  // Journal CRUD
  const addJournal = async (journalData) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const { data } = await supabase.from('journals').insert([{
      title: journalData.title,
      content: journalData.content,
      group_id: journalData.groupId || null,
      author: uname,
      mood: journalData.mood,
    }]).select().single()
    if (data) setJournals(js => [journalFromDb(data), ...js])
  }

  const updateJournal = async (id, updates) => {
    const { data } = await supabase.from('journals').update({
      title: updates.title,
      content: updates.content,
      group_id: updates.groupId || null,
      mood: updates.mood,
    }).eq('id', id).select().single()
    if (data) setJournals(js => js.map(j => j.id === id ? journalFromDb(data) : j))
  }

  const deleteJournal = async (id) => {
    await supabase.from('journals').delete().eq('id', id)
    setJournals(js => js.filter(j => j.id !== id))
  }

  // Route CRUD
  const addRoute = async ({ name, groupId }) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const { data } = await supabase.from('routes').insert([{ name, group_id: groupId || null, author: uname }]).select().single()
    if (data) {
      const newRoute = { id: data.id, name: data.name, groupId: data.group_id, author: data.author, date: data.created_at?.split('T')[0], items: [] }
      setRoutes(rs => [newRoute, ...rs])
      return newRoute
    }
  }

  const deleteRoute = async (id) => {
    await supabase.from('routes').delete().eq('id', id)
    setRoutes(rs => rs.filter(r => r.id !== id))
  }

  const saveRouteItems = async (routeId, items) => {
    await supabase.from('route_places').delete().eq('route_id', routeId)
    if (items.length > 0) {
      await supabase.from('route_places').insert(
        items.map((item, i) => ({ route_id: routeId, place_id: item.placeId, day_number: item.dayNumber, sort_order: i }))
      )
    }
    setRoutes(rs => rs.map(r => r.id === routeId ? { ...r, items } : r))
  }

  const handleSetUsername = (name) => {
    localStorage.setItem('tripmate_username', name)
    setUsername(name)
    setShowUsernameModal(false)
  }

  const ctx = {
    activeTab, setActiveTab,
    groups, setGroups, addGroup, deleteGroup, removeMember,
    places, setPlaces, addPlace, updatePlace, deletePlace,
    journals, setJournals, addJournal, updateJournal, deleteJournal,
    routes, addRoute, deleteRoute, saveRouteItems,
    loading,
    showPlaceModal, setShowPlaceModal,
    showGroupModal, setShowGroupModal,
    selectedGroup, setSelectedGroup,
    editingPlace, setEditingPlace,
    username,
  }

  return (
    <AppContext.Provider value={ctx}>
      {showUsernameModal && <UsernameModal onSubmit={handleSetUsername} />}
      <AppShell />
    </AppContext.Provider>
  )
}

function UsernameModal({ onSubmit }) {
  const [name, setName] = useState('')
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24,
    }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '32px 24px', width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>✈️</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>TripMate에 오신 걸 환영해요!</h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>
          친구들에게 보여질 닉네임을 입력해주세요
        </p>
        <input
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: '1.5px solid #E8E4DE', fontSize: 15, marginBottom: 16, boxSizing: 'border-box',
          }}
          placeholder="닉네임 입력 (예: 태은)"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
          autoFocus
        />
        <button
          onClick={() => name.trim() && onSubmit(name.trim())}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: 13, background: '#E8734A', color: 'white',
            borderRadius: 10, fontSize: 15, fontWeight: 700, border: 'none',
            opacity: name.trim() ? 1 : 0.4, cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          시작하기 🚀
        </button>
      </div>
    </div>
  )
}
