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
  likes: p.likes || [],
  dislikes: p.dislikes || [],
  comments: p.comments || [],
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
  createdBy: g.created_by,
  members,
})

const journalFromDb = (j) => ({
  id: j.id,
  title: j.title,
  content: j.content,
  author: j.author || '알 수 없음',
  mood: j.mood,
  imageUrls: j.image_urls || [],
  isPublic: j.is_public || false,
  placeId: j.place_id || null,
  visitDate: j.visit_date || null,
  date: j.created_at ? j.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
})

// UUID 생성 또는 기존 것 반환
function getOrCreateUserId() {
  let uid = localStorage.getItem('tripmate_user_id')
  if (!uid) {
    uid = crypto.randomUUID()
    localStorage.setItem('tripmate_user_id', uid)
  }
  return uid
}

export default function App() {
  const [activeTab, setActiveTab] = useState('feed')
  const setActiveTabPersist = setActiveTab
  const [groups, setGroups] = useState([])
  const [places, setPlaces] = useState([])
  const [journals, setJournals] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlaceModal, setShowPlaceModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [editingPlace, setEditingPlace] = useState(null)
  const [userId] = useState(() => getOrCreateUserId())
  const [username, setUsername] = useState(() => localStorage.getItem('tripmate_username') || '')
  const [showUsernameModal, setShowUsernameModal] = useState(!localStorage.getItem('tripmate_username'))
  const [showRecoveryCode, setShowRecoveryCode] = useState(false)
  const [restoreCodeFromUrl, setRestoreCodeFromUrl] = useState('')

  useEffect(() => {
    loadAll().then(() => handleJoinFromUrl())
    // URL에 ?restore=UUID 파라미터가 있으면 복원 탭으로 자동 전환
    const params = new URLSearchParams(window.location.search)
    if (params.get('restore') && !localStorage.getItem('tripmate_username')) {
      setRestoreCodeFromUrl(params.get('restore'))
    }
  }, [])

  const handleJoinFromUrl = async () => {
    const params = new URLSearchParams(window.location.search)
    // ?restore= 파라미터는 UsernameModal에서 처리, 여기서 URL만 정리
    if (params.get('restore')) {
      window.history.replaceState({}, '', '/')
      return
    }
    const joinParam = params.get('join')
    if (!joinParam) return
    const groupId = parseInt(joinParam, 36)
    const uname = localStorage.getItem('tripmate_username') || '나'
    const uid = localStorage.getItem('tripmate_user_id') || userId
    const { data: existing } = await supabase.from('group_members').select('id').eq('group_id', groupId).eq('user_id', uid).maybeSingle()
    if (!existing) {
      await supabase.from('group_members').insert([{ group_id: groupId, user_name: uname, user_id: uid, user_avatar: '👤' }])
    }
    window.history.replaceState({}, '', '/')
    await loadAll()
  }

  const joinGroupByCode = async (code) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const uid = localStorage.getItem('tripmate_user_id') || userId
    const { data: group } = await supabase.from('groups').select('*').eq('invite_code', code.toUpperCase()).maybeSingle()
    if (!group) return { error: '존재하지 않는 코드예요.' }
    const { data: existing } = await supabase.from('group_members').select('id').eq('group_id', group.id).eq('user_id', uid).maybeSingle()
    if (existing) return { error: '이미 참여 중인 그룹이에요.' }
    await supabase.from('group_members').insert([{ group_id: group.id, user_name: uname, user_id: uid, user_avatar: '👤' }])
    await loadAll()
    return { success: true, groupName: group.name }
  }

  const loadAll = async () => {
    setLoading(true)
    const uid = localStorage.getItem('tripmate_user_id') || userId
    const uname = localStorage.getItem('tripmate_username') || ''
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
      // user_id 기준으로 찾고, 없으면 username fallback (기존 데이터)
      const myGroupIds = new Set(members.filter(m =>
        m.user_id === uid || (!m.user_id && m.user_name === uname)
      ).map(m => m.group_id))
      setGroups(groupsRes.data
        .filter(g => myGroupIds.has(g.id))
        .map(g =>
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
          visitTime: p.visit_time || '', memo: p.memo || '',
          placeName: p.place_name || null, placeAddress: p.place_address || null, placeCategory: p.place_category || null,
        })),
      })))
    }
    setLoading(false)
  }

  // Place CRUD
  const addPlace = async (placeData) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const uid = localStorage.getItem('tripmate_user_id') || userId
    const dbData = placeToDb({ ...placeData, author: uname })
    if (dbData.lat == null) dbData.lat = 0
    if (dbData.lng == null) dbData.lng = 0
    const { data, error } = await supabase.from('places').insert([{ ...dbData, user_id: uid }]).select().single()
    if (error) console.error('addPlace error:', error)
    if (data) {
      const place = placeFromDb(data)
      setPlaces(ps => [place, ...ps])
      return place
    }
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

  const toggleLike = async (id) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const place = places.find(p => p.id === id)
    if (!place) return
    const liked = (place.likes || []).includes(uname)
    const newLikes = liked ? place.likes.filter(u => u !== uname) : [...(place.likes || []), uname]
    // 좋아요 누르면 싫어요 취소
    const newDislikes = (place.dislikes || []).filter(u => u !== uname)
    setPlaces(ps => ps.map(p => p.id === id ? { ...p, likes: newLikes, dislikes: newDislikes } : p))
    await supabase.from('places').update({ likes: newLikes, dislikes: newDislikes }).eq('id', id)
  }

  const toggleDislike = async (id) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const place = places.find(p => p.id === id)
    if (!place) return
    const disliked = (place.dislikes || []).includes(uname)
    const newDislikes = disliked ? place.dislikes.filter(u => u !== uname) : [...(place.dislikes || []), uname]
    // 싫어요 누르면 좋아요 취소
    const newLikes = (place.likes || []).filter(u => u !== uname)
    setPlaces(ps => ps.map(p => p.id === id ? { ...p, dislikes: newDislikes, likes: newLikes } : p))
    await supabase.from('places').update({ dislikes: newDislikes, likes: newLikes }).eq('id', id)
  }

  const addComment = async (id, text) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const place = places.find(p => p.id === id)
    if (!place || !text.trim()) return
    const newComment = { id: Date.now(), author: uname, text: text.trim(), createdAt: new Date().toISOString() }
    const newComments = [...(place.comments || []), newComment]
    setPlaces(ps => ps.map(p => p.id === id ? { ...p, comments: newComments } : p))
    await supabase.from('places').update({ comments: newComments }).eq('id', id)
  }

  const deleteComment = async (placeId, commentId) => {
    const place = places.find(p => p.id === placeId)
    if (!place) return
    const newComments = (place.comments || []).filter(c => c.id !== commentId)
    setPlaces(ps => ps.map(p => p.id === placeId ? { ...p, comments: newComments } : p))
    await supabase.from('places').update({ comments: newComments }).eq('id', placeId)
  }

  // Group CRUD
  const addGroup = async (groupData) => {
    const uname = localStorage.getItem('tripmate_username') || '나'
    const uid = localStorage.getItem('tripmate_user_id') || userId
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase()
    const { data, error } = await supabase.from('groups').insert([{ name: groupData.name, cover: groupData.cover, invite_code: inviteCode, created_by: uname }]).select().single()
    if (error) { alert('그룹 생성 오류: ' + error.message); return null }
    if (data) {
      const { error: memberError } = await supabase.from('group_members').insert([{ group_id: data.id, user_name: uname, user_id: uid, user_avatar: '🧡' }])
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
    const uid = localStorage.getItem('tripmate_user_id') || userId
    const { data } = await supabase.from('journals').insert([{
      title: journalData.title,
      content: journalData.content,
      author: uname,
      user_id: uid,
      mood: journalData.mood,
      image_urls: journalData.imageUrls || [],
      is_public: journalData.isPublic || false,
      place_id: journalData.placeId || null,
      visit_date: journalData.visitDate || null,
    }]).select().single()
    if (data) setJournals(js => [journalFromDb(data), ...js])
  }

  const updateJournal = async (id, updates) => {
    const { data } = await supabase.from('journals').update({
      title: updates.title,
      content: updates.content,
      mood: updates.mood,
      image_urls: updates.imageUrls || [],
      is_public: updates.isPublic || false,
      place_id: updates.placeId || null,
      visit_date: updates.visitDate || null,
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
    const uid = localStorage.getItem('tripmate_user_id') || userId
    const { data } = await supabase.from('routes').insert([{ name, group_id: groupId || null, author: uname, user_id: uid }]).select().single()
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

  const renameRoute = async (id, name) => {
    await supabase.from('routes').update({ name }).eq('id', id)
    setRoutes(rs => rs.map(r => r.id === id ? { ...r, name } : r))
  }

  const saveRouteItems = async (routeId, items) => {
    await supabase.from('route_places').delete().eq('route_id', routeId)
    if (items.length > 0) {
      await supabase.from('route_places').insert(
        items.map((item, i) => ({
          route_id: routeId,
          place_id: item.placeId || null,
          day_number: item.dayNumber,
          sort_order: i,
          visit_time: item.visitTime || null,
          memo: item.memo || null,
          place_name: item.placeName || null,
          place_address: item.placeAddress || null,
          place_category: item.placeCategory || null,
        }))
      )
    }
    setRoutes(rs => rs.map(r => r.id === routeId ? { ...r, items } : r))
  }

  const handleSetUsername = async (name) => {
    const uid = localStorage.getItem('tripmate_user_id') || userId
    localStorage.setItem('tripmate_username', name)
    setUsername(name)
    // Supabase에 유저 등록 (이미 있으면 무시)
    await supabase.from('users').upsert([{ id: uid, username: name }], { onConflict: 'id' })
    setShowUsernameModal(false)
    setShowRecoveryCode(true) // 복구코드 안내
  }

  const handleRestore = async (code) => {
    const uid = code.trim()
    const { data: user } = await supabase.from('users').select('*').eq('id', uid).maybeSingle()
    if (!user) return { error: '코드를 찾을 수 없어요.' }
    localStorage.setItem('tripmate_user_id', uid)
    localStorage.setItem('tripmate_username', user.username)
    window.location.reload()
    return { success: true }
  }

  const myGroupIds = groups.filter(g => g.members.some(m => m.name === username)).map(g => g.id)

  const ctx = {
    activeTab, setActiveTab: setActiveTabPersist,
    groups, setGroups, addGroup, deleteGroup, removeMember, joinGroupByCode,
    myGroupIds,
    places, setPlaces, addPlace, updatePlace, deletePlace, toggleLike, toggleDislike, addComment, deleteComment,
    journals, setJournals, addJournal, updateJournal, deleteJournal,
    routes, addRoute, deleteRoute, renameRoute, saveRouteItems,
    loading,
    showPlaceModal, setShowPlaceModal,
    showGroupModal, setShowGroupModal,
    selectedGroup, setSelectedGroup,
    editingPlace, setEditingPlace,
    username, userId,
    handleRestore,
  }

  return (
    <AppContext.Provider value={ctx}>
      {showUsernameModal && <UsernameModal onSubmit={handleSetUsername} onRestore={handleRestore} initialCode={restoreCodeFromUrl} />}
      {showRecoveryCode && <RecoveryCodeModal userId={userId} onClose={() => setShowRecoveryCode(false)} />}
      <AppShell />
    </AppContext.Provider>
  )
}

function UsernameModal({ onSubmit, onRestore, initialCode = '' }) {
  const [name, setName] = useState('')
  const [tab, setTab] = useState(initialCode ? 'restore' : 'new')
  const [code, setCode] = useState(initialCode)
  const [restoreError, setRestoreError] = useState('')
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    if (!code.trim()) return
    setRestoring(true)
    setRestoreError('')
    const result = await onRestore(code.trim())
    if (result?.error) { setRestoreError(result.error); setRestoring(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24,
    }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '32px 24px', width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>✈️</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>TripMate에 오신 걸 환영해요!</h2>

        {/* 탭 */}
        <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 10, padding: 3, marginBottom: 20 }}>
          {[['new', '새로 시작'], ['restore', '기존 계정 복원']].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#E8734A' : '#888',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              border: 'none', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>

        {tab === 'new' ? (
          <>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>친구들에게 보여질 닉네임을 입력해주세요</p>
            <input
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E4DE', fontSize: 15, marginBottom: 16, boxSizing: 'border-box' }}
              placeholder="닉네임 입력 (예: 여행왕)"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
              autoFocus
            />
            <button
              onClick={() => name.trim() && onSubmit(name.trim())}
              disabled={!name.trim()}
              style={{ width: '100%', padding: 13, background: '#E8734A', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 700, border: 'none', opacity: name.trim() ? 1 : 0.4, cursor: name.trim() ? 'pointer' : 'not-allowed' }}
            >시작하기 🚀</button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>이전에 저장한 복구코드를 입력해주세요</p>
            <input
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #E8E4DE', fontSize: 13, marginBottom: 8, boxSizing: 'border-box', fontFamily: 'monospace' }}
              placeholder="복구코드 입력"
              value={code}
              onChange={e => { setCode(e.target.value); setRestoreError('') }}
              onKeyDown={e => e.key === 'Enter' && handleRestore()}
              autoFocus
            />
            {restoreError && <p style={{ fontSize: 13, color: '#E05252', marginBottom: 8 }}>{restoreError}</p>}
            <button
              onClick={handleRestore}
              disabled={!code.trim() || restoring}
              style={{ width: '100%', padding: 13, background: '#E8734A', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 700, border: 'none', opacity: code.trim() ? 1 : 0.4, cursor: code.trim() ? 'pointer' : 'not-allowed' }}
            >{restoring ? '복원 중...' : '복원하기 🔑'}</button>
          </>
        )}
      </div>
    </div>
  )
}

function RecoveryCodeModal({ userId, onClose }) {
  const [copied, setCopied] = useState(null)
  const restoreUrl = `${window.location.origin}/?restore=${userId}`

  const copyCode = () => {
    navigator.clipboard.writeText(userId).then(() => { setCopied('code'); setTimeout(() => setCopied(null), 2000) })
  }
  const copyLink = () => {
    const text = `📱 TripMate 복원 링크\n아래 링크를 열면 내 여행 데이터가 자동으로 연결돼요!\n\n${restoreUrl}`
    navigator.clipboard.writeText(text).then(() => { setCopied('link'); setTimeout(() => setCopied(null), 2000) })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '32px 24px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>🔑</p>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>복구코드를 저장해두세요!</h2>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.6 }}>
          다른 기기나 브라우저에서 내 데이터를<br />복원할 때 필요해요
        </p>

        <div style={{ background: '#F5F5F5', borderRadius: 10, padding: '14px 12px', marginBottom: 12, fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', color: '#333', userSelect: 'all', textAlign: 'left' }}>
          {userId}
        </div>
        <button onClick={copyCode} style={{ width: '100%', padding: 12, background: copied === 'code' ? '#4CAF50' : '#F5F5F5', color: copied === 'code' ? 'white' : '#555', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', marginBottom: 10, cursor: 'pointer' }}>
          {copied === 'code' ? '✓ 복사됨!' : '📋 복구코드 복사'}
        </button>

        <div style={{ borderTop: '1px solid #EEE', margin: '4px 0 16px', paddingTop: 16 }}>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>더 간편하게 — 링크로 공유하기</p>
          <button onClick={copyLink} style={{ width: '100%', padding: 13, background: copied === 'link' ? '#4CAF50' : '#FEE500', color: copied === 'link' ? 'white' : '#3A1D1D', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            {copied === 'link' ? '✓ 복사됨! 카카오톡에 붙여넣기 하세요' : '📤 복원 링크 복사 (카카오톡 공유)'}
          </button>
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 8, lineHeight: 1.5 }}>링크를 받은 기기에서 열면<br />자동으로 내 계정이 연결돼요</p>
        </div>

        <button onClick={onClose} style={{ width: '100%', padding: 12, background: '#E8734A', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          저장했어요, 시작하기
        </button>
      </div>
    </div>
  )
}
