import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { getCategoryInfo, getAddressLevels } from '../utils/helpers'
import AppPortal from '../components/AppPortal'
import RouteOnboarding from '../components/RouteOnboarding'
import ManualRouteCreate from '../components/ManualRouteCreate'
import { useKakaoMaps } from '../hooks/useKakaoMaps'

export default function RoutePage() {
  const { routes, places, groups, addRoute, deleteRoute, renameRoute, saveRouteItems, addPlace, username } = useApp()
  const [view, setView] = useState('list')       // 'list' | 'detail'
  const [activeRoute, setActiveRoute] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const openRoute = (route) => {
    setActiveRoute(route)
    setView('detail')
  }

  const handleRouteUpdated = (updatedRoute) => {
    setActiveRoute(updatedRoute)
  }

  const myRoutes = routes.filter(r => r.author === username)
  const groupRoutes = routes.filter(r => r.author !== username)

  if (view === 'detail' && activeRoute) {
    return (
      <RouteDetail
        route={activeRoute}
        places={places}
        groups={groups}
        isOwner={activeRoute.author === username}
        onBack={() => setView('list')}
        onDelete={async () => { await deleteRoute(activeRoute.id); setView('list') }}
        onSave={async (items) => { await saveRouteItems(activeRoute.id, items); handleRouteUpdated({ ...activeRoute, items }) }}
        onRename={async (name) => { await renameRoute(activeRoute.id, name); handleRouteUpdated({ ...activeRoute, name }) }}
        addPlace={addPlace}
      />
    )
  }

  return (
    <>
      <div className="header">
        <span className="header-title">루트</span>
        <button className="header-action" onClick={() => setShowPicker(true)}>+</button>
      </div>

      <div style={{ padding: '16px 16px 80px' }}>
        {routes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🗺️</span>
            <p className="empty-text">아직 루트가 없어요.<br />여행 동선을 직접 짜보세요!</p>
          </div>
        ) : (
          <>
            {myRoutes.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, letterSpacing: '0.3px' }}>✏️ 내가 짠 루트</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myRoutes.map(route => (
                    <RouteCard key={route.id} route={route} places={places}
                      groupName={groups.find(g => g.id === route.groupId)?.name}
                      onClick={() => openRoute(route)} />
                  ))}
                </div>
              </div>
            )}
            {groupRoutes.length > 0 && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, letterSpacing: '0.3px' }}>👥 그룹 추천 루트</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {groupRoutes.map(route => (
                    <RouteCard key={route.id} route={route} places={places}
                      groupName={groups.find(g => g.id === route.groupId)?.name}
                      onClick={() => openRoute(route)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button className="fab" onClick={() => setShowPicker(true)}>+</button>

      {/* 자동/수동 선택 picker */}
      {showPicker && (
        <AppPortal>
          <div className="modal-overlay" onClick={() => setShowPicker(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: '24px 20px 32px' }}>
              <div className="modal-handle" />
              <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, marginTop: 8 }}>루트 만들기</p>
              <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>어떻게 만들까요?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => { setShowPicker(false); setShowManual(true) }}
                  style={{
                    padding: '20px 20px', borderRadius: 16, textAlign: 'left',
                    border: '2px solid var(--border)', background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}
                >
                  <span style={{ fontSize: 36 }}>✏️</span>
                  <span>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>직접 만들기</p>
                    <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>빈 루트를 만들고 장소를 직접 추가해요</p>
                  </span>
                </button>
                <button
                  onClick={() => { setShowPicker(false); setShowOnboarding(true) }}
                  style={{
                    padding: '20px 20px', borderRadius: 16, textAlign: 'left',
                    border: '2px solid var(--border)', background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}
                >
                  <span style={{ fontSize: 36 }}>🤖</span>
                  <span>
                    <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>자동 추천</p>
                    <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>지역·스타일 선택하면 루트를 짜줘요</p>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </AppPortal>
      )}

      {showManual && (
        <AppPortal>
          <ManualRouteCreate
            places={places}
            groups={groups}
            onClose={() => setShowManual(false)}
            onComplete={async (data) => {
              const newRoute = await addRoute({ name: data.name, groupId: data.groupId })
              setShowManual(false)
              if (newRoute) {
                if (data.items?.length > 0) await saveRouteItems(newRoute.id, data.items)
                openRoute({ ...newRoute, items: data.items || [] })
              }
            }}
          />
        </AppPortal>
      )}

      {showOnboarding && (
        <AppPortal>
          <RouteOnboarding
            places={places}
            groups={groups}
            addPlace={addPlace}
            onClose={() => setShowOnboarding(false)}
            onComplete={async (data) => {
              setShowOnboarding(false)
              const newRoute = await addRoute({ name: data.name, groupId: data.groupIds?.[0] ?? null })
              if (!newRoute) return

              let finalItems = (data.items || []).map(item => {
                if (item._aiPlace) {
                  const p = item._aiPlace
                  return {
                    ...item,
                    placeId: null,
                    placeName: p.name,
                    placeAddress: p.address || '',
                    placeCategory: p.category || 'attraction',
                    _aiPlace: undefined,
                  }
                }
                return item
              })

              if (finalItems.length > 0) await saveRouteItems(newRoute.id, finalItems)
              openRoute({ ...newRoute, items: finalItems })
            }}
          />
        </AppPortal>
      )}
    </>
  )
}

function RouteCard({ route, places, groupName, onClick }) {
  const placeCount = route.items?.length || 0
  const maxDay = route.items?.length > 0 ? Math.max(...route.items.map(i => i.dayNumber)) : 0

  return (
    <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{route.name}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {maxDay > 0 && (
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-bg)', padding: '2px 8px', borderRadius: 10 }}>
                {maxDay === 1 ? '당일치기' : `${maxDay - 1}박${maxDay}일`}
              </span>
            )}
            {groupName && <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>· {groupName}</span>}
            {route.author && <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>· by {route.author}</span>}
          </div>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{placeCount}곳 ›</span>
      </div>

      {placeCount > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflow: 'hidden' }}>
          {route.items.slice(0, 4).map(item => {
            const place = places.find(p => p.id === item.placeId)
            const name = place?.name || item.placeName
            const category = place?.category || item.placeCategory || 'attraction'
            if (!name) return null
            const info = getCategoryInfo(category)
            return (
              <div key={item.id} style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 600,
                background: 'var(--bg)', color: 'var(--text)', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span>{info.icon}</span>
                <span style={{ maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              </div>
            )
          })}
          {placeCount > 4 && (
            <span style={{ fontSize: 12, color: 'var(--text-sub)', alignSelf: 'center' }}>+{placeCount - 4}</span>
          )}
        </div>
      )}
    </div>
  )
}

function CreateRouteModal({ groups, places, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState('')
  const [region, setRegion] = useState('')

  const regionOptions = useMemo(() => {
    const set = new Set(
      places.map(p => {
        const levels = getAddressLevels(p.address)
        return levels[1] ? `${levels[0]} ${levels[1]}` : levels[0]
      }).filter(Boolean)
    )
    return Array.from(set).sort()
  }, [places])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">새 루트 만들기</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="form-section" style={{ paddingBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">루트 이름</label>
            <input
              className="form-input"
              placeholder="예: 제주 2박3일"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          {regionOptions.length > 0 && (
            <div className="form-group">
              <label className="form-label">지역 (선택) — 장소 추가 시 필터링돼요</label>
              <select className="form-input" value={region} onChange={e => setRegion(e.target.value)}>
                <option value="">전체 지역</option>
                {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}
          {groups.length > 0 && (
            <div className="form-group">
              <label className="form-label">그룹 (선택)</label>
              <select className="form-input" value={groupId} onChange={e => setGroupId(e.target.value)}>
                <option value="">선택 안 함</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.cover} {g.name}</option>)}
              </select>
            </div>
          )}
          <button
            className="btn-primary"
            disabled={!name.trim()}
            onClick={() => onCreate({ name: name.trim(), groupId: groupId ? Number(groupId) : null, region: region || null })}
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  )
}

function RouteMap({ items, places }) {
  const { ready } = useKakaoMaps()
  const mapRef = useRef(null)

  useEffect(() => {
    if (!ready || !mapRef.current) return
    const coords = items
      .map(item => places.find(p => p.id === item.placeId))
      .filter(p => p?.lat)
    if (coords.length === 0) return

    const bounds = new window.kakao.maps.LatLngBounds()
    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(coords[0].lat, coords[0].lng),
      level: 5,
    })

    coords.forEach((place, i) => {
      const pos = new window.kakao.maps.LatLng(place.lat, place.lng)
      bounds.extend(pos)
      const content = `<div style="background:var(--primary,#5C6BC0);color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">${i + 1}</div>`
      new window.kakao.maps.CustomOverlay({ position: pos, content, yAnchor: 1, map })
    })

    if (coords.length > 1) {
      const path = coords.map(p => new window.kakao.maps.LatLng(p.lat, p.lng))
      new window.kakao.maps.Polyline({ path, strokeWeight: 3, strokeColor: '#5C6BC0', strokeOpacity: 0.8, strokeStyle: 'solid', map })
    }

    if (coords.length > 1) map.setBounds(bounds)
  }, [ready, items, places])

  const hasCoords = items.some(item => places.find(p => p.id === item.placeId)?.lat)
  if (!hasCoords) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8, color: 'var(--text-sub)' }}>
      <span style={{ fontSize: 36 }}>📍</span>
      <p style={{ fontSize: 14 }}>장소에 위치 정보가 없어요</p>
      <p style={{ fontSize: 12 }}>장소 등록 시 카카오맵 검색으로 추가하면 지도에 표시돼요</p>
    </div>
  )
  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}

function RouteDetail({ route, places, groups, isOwner, onBack, onDelete, onSave, onRename, addPlace }) {
  const [items, setItems] = useState(
    [...(route.items || [])].sort((a, b) => a.dayNumber - b.dayNumber || a.sortOrder - b.sortOrder)
  )
  const [showPicker, setShowPicker] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [mapView, setMapView] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(route.name)
  const [expandedIdx, setExpandedIdx] = useState(null)
  const expandedRef = useRef(null)

  useEffect(() => {
    if (expandedIdx !== null && expandedRef.current) {
      setTimeout(() => {
        expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }, [expandedIdx])

  const maxDay = items.length > 0 ? Math.max(...items.map(i => i.dayNumber)) : 1

  const addPlaces = (placeIds) => {
    const newItems = placeIds.map(pid => ({ placeId: pid, dayNumber: maxDay, sortOrder: items.length, visitTime: '', memo: '' }))
    setItems(prev => [...prev, ...newItems])
    setDirty(true)
  }

  const addSearchedPlace = async (placeData) => {
    const saved = await addPlace({
      name: placeData.name,
      category: placeData.category || 'attraction',
      address: placeData.address || '',
      lat: placeData.lat,
      lng: placeData.lng,
      placeUrl: placeData.placeUrl || '',
      memo: '',
      groupIds: route.groupId ? [route.groupId] : [],
    })
    if (saved?.id) addPlaces([saved.id])
  }

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
    if (expandedIdx === idx) setExpandedIdx(null)
    setDirty(true)
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    setItems(prev => {
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
    setDirty(true)
  }

  const moveDown = (idx) => {
    setItems(prev => {
      if (idx === prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
      return next
    })
    setDirty(true)
  }

  const changeDay = (idx, day) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, dayNumber: day } : item))
    setDirty(true)
  }

  const changeField = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
    setDirty(true)
  }

  const handleSave = async () => {
    await onSave(items)
    setDirty(false)
  }

  const handleRename = async () => {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== route.name) await onRename(trimmed)
    setEditingName(false)
  }

  const grouped = items.reduce((acc, item, idx) => {
    const day = item.dayNumber
    if (!acc[day]) acc[day] = []
    acc[day].push({ ...item, _idx: idx })
    return acc
  }, {})

  const days = Object.keys(grouped).map(Number).sort((a, b) => a - b)
  const groupName = groups.find(g => g.id === route.groupId)?.name

  return (
    <>
      <div className="header">
        <button onClick={onBack} style={{ fontSize: 20, color: 'var(--text)', padding: '0 4px' }}>←</button>
        <div style={{ flex: 1, paddingLeft: 8 }}>
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false) }}
              style={{ fontSize: 16, fontWeight: 700, border: 'none', borderBottom: '2px solid var(--primary)',
                outline: 'none', background: 'transparent', width: '100%', padding: '2px 0' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: 17, fontWeight: 700 }}>{route.name}</p>
              {isOwner && (
                <button onClick={() => { setNameInput(route.name); setEditingName(true) }}
                  style={{ fontSize: 13, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>✏️</button>
              )}
            </div>
          )}
          {groupName && <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>{groupName}</p>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setMapView(v => !v)}
            style={{ fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
              background: mapView ? 'var(--primary)' : 'var(--bg)',
              color: mapView ? 'white' : 'var(--text-sub)',
              border: '1px solid var(--border)' }}>
            {mapView ? '📋 목록' : '🗺️ 지도'}
          </button>
          {isOwner && (
            <button onClick={() => window.confirm('이 루트를 삭제할까요?') && onDelete()}
              style={{ fontSize: 18, color: '#E05252', padding: '0 4px' }}>🗑️</button>
          )}
        </div>
      </div>

      {mapView && (
        <div style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 64, overflow: 'hidden' }}>
          <RouteMap items={items} places={places} />
        </div>
      )}

      {!mapView && (
        <div style={{ padding: '16px 16px 160px' }}>
          {days.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📍</span>
              <p className="empty-text">장소를 추가해서 루트를 완성해보세요!</p>
            </div>
          ) : days.map(day => (
            <div key={day} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>Day {day}</div>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div style={{ position: 'relative', paddingLeft: 20 }}>
                <div style={{ position: 'absolute', left: 17, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
                {grouped[day].map(({ _idx, placeId, placeName, placeAddress, placeCategory, dayNumber, visitTime, memo }) => {
                  const place = places.find(p => p.id === placeId)
                  const displayName = place?.name || placeName
                  const displayAddress = place?.address || placeAddress
                  const displayCategory = place?.category || placeCategory || 'attraction'
                  if (!displayName) return null
                  const info = getCategoryInfo(displayCategory)
                  const isExpanded = expandedIdx === _idx
                  return (
                    <div key={_idx} style={{ display: 'flex', gap: 10, marginBottom: 10, position: 'relative' }}>
                      {/* 타임라인 노드 */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: 'white',
                          border: '2px solid var(--primary)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 14, zIndex: 1,
                        }}>{info.icon}</div>
                        {visitTime && (
                          <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap' }}>{visitTime}</span>
                        )}
                      </div>

                      <div className="card" style={{ flex: 1, padding: '10px 12px' }}>
                        {/* 카드 헤더 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <button onClick={() => setExpandedIdx(isExpanded ? null : _idx)}
                            style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 0 }}>
                            <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{info.label}</p>
                            <p style={{ fontSize: 14, fontWeight: 700 }}>{displayName}</p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                              {visitTime && <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>🕐 {visitTime}</span>}
                              {memo && <span style={{ fontSize: 11, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>📝 {memo}</span>}
                              {!visitTime && !memo && <span style={{ fontSize: 11, color: 'var(--border)' }}>탭해서 편집 +</span>}
                            </div>
                          </button>
                          <div style={{ display: 'flex', gap: 2, flexShrink: 0, marginLeft: 8 }}>
                            <button onClick={() => moveUp(_idx)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', fontSize: 12 }}>↑</button>
                            <button onClick={() => moveDown(_idx)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', fontSize: 12 }}>↓</button>
                            <button onClick={() => removeItem(_idx)} style={{ width: 24, height: 24, borderRadius: 6, background: '#fff0f0', fontSize: 12, color: '#E05252' }}>✕</button>
                          </div>
                        </div>

                        {/* 확장 영역: 시간 설정 */}
                        {isExpanded && (
                          <div ref={expandedRef} style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                            <div style={{ marginBottom: 8 }}>
                              <p style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4 }}>🕐 방문 시각</p>
                              <input type="time"
                                value={visitTime || ''}
                                onChange={e => changeField(_idx, 'visitTime', e.target.value)}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)',
                                  fontSize: 13, background: 'var(--bg)', color: 'var(--text)' }} />
                            </div>
                            <div style={{ marginBottom: 8 }}>
                              <p style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4 }}>📝 메모 (이동수단, 예약번호 등)</p>
                              <textarea
                                value={memo || ''}
                                onChange={e => changeField(_idx, 'memo', e.target.value)}
                                placeholder="예) 버스 100번 → 시청역 하차, 예약 필요"
                                rows={2}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)',
                                  fontSize: 13, background: 'var(--bg)', color: 'var(--text)', resize: 'none',
                                  fontFamily: 'inherit', lineHeight: 1.5 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>Day</span>
                              <button onClick={() => changeDay(_idx, Math.max(1, dayNumber - 1))}
                                style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--bg)', fontSize: 13 }}>-</button>
                              <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{dayNumber}</span>
                              <button onClick={() => changeDay(_idx, dayNumber + 1)}
                                style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--bg)', fontSize: 13 }}>+</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 하단 버튼 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 16px 20px', background: 'var(--surface)',
        borderTop: '1px solid var(--border)', display: 'flex', gap: 8,
      }}>
        <button
          onClick={() => setShowPicker(true)}
          style={{
            flex: 1, padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 700,
            border: '1.5px solid var(--primary)', color: 'var(--primary)', background: 'transparent',
          }}
        >
          + 장소 추가
        </button>
        {dirty && (
          <button className="btn-primary" style={{ flex: 1, borderRadius: 12 }} onClick={handleSave}>
            저장
          </button>
        )}
      </div>

      {showPicker && (
        <AppPortal>
          <PlacePicker
            places={places}
            existingIds={items.map(i => i.placeId)}
            region={route.region}
            onClose={() => setShowPicker(false)}
            onAdd={(ids) => { addPlaces(ids); setShowPicker(false) }}
            onAddNew={async (placeData) => { await addSearchedPlace(placeData); setShowPicker(false) }}
          />
        </AppPortal>
      )}
    </>
  )
}

function PlacePicker({ places, existingIds, region, onClose, onAdd, onAddNew }) {
  const [tab, setTab] = useState('saved') // 'saved' | 'search'
  const [selected, setSelected] = useState([])
  const [filterRegion, setFilterRegion] = useState(region || '')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [adding, setAdding] = useState(false)

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  )

  const getPlaceRegion = (p) => {
    const levels = getAddressLevels(p.address)
    return levels[1] ? `${levels[0]} ${levels[1]}` : levels[0]
  }

  const available = places.filter(p => {
    if (existingIds.includes(p.id)) return false
    if (filterRegion && getPlaceRegion(p) !== filterRegion) return false
    return true
  })

  const regionOptions = useMemo(() => {
    const set = new Set(places.map(p => getPlaceRegion(p)).filter(Boolean))
    return Array.from(set).sort()
  }, [places])

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearchResults([])
    setSearchError('')
    try {
      const res = await fetch(`/api/naver-search?query=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('검색 실패')
      const data = await res.json()
      if (data.items?.length > 0) setSearchResults(data.items)
      else setSearchError('검색 결과가 없어요.')
    } catch {
      setSearchError('검색 중 오류가 발생했어요.')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectSearchResult = async (r) => {
    setAdding(true)
    const lat = parseFloat(r.mapy) / 1e7
    const lng = parseFloat(r.mapx) / 1e7
    const name = r.title.replace(/<[^>]*>/g, '')
    await onAddNew({
      name,
      address: r.roadAddress || r.address || '',
      lat,
      lng,
      placeUrl: `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`,
      category: 'attraction',
    })
    setAdding(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="modal-handle" />
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <span className="modal-title">장소 추가</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', padding: '0 16px 12px', gap: 8, flexShrink: 0 }}>
          <button onClick={() => setTab('saved')} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: tab === 'saved' ? 'var(--primary)' : 'var(--bg)',
            color: tab === 'saved' ? 'white' : 'var(--text-sub)',
            border: 'none', cursor: 'pointer',
          }}>내 저장 장소</button>
          <button onClick={() => setTab('search')} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: tab === 'search' ? 'var(--primary)' : 'var(--bg)',
            color: tab === 'search' ? 'white' : 'var(--text-sub)',
            border: 'none', cursor: 'pointer',
          }}>장소 검색</button>
        </div>

        {tab === 'saved' ? (
          <>
            {regionOptions.length > 1 && (
              <div style={{ padding: '0 16px 12px', flexShrink: 0, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                <FilterChip label="전체" active={!filterRegion} onClick={() => setFilterRegion('')} />
                {regionOptions.map(r => (
                  <FilterChip key={r} label={r} active={filterRegion === r} onClick={() => setFilterRegion(r)} />
                ))}
              </div>
            )}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
              {available.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '40px 0', fontSize: 14 }}>
                  추가할 장소가 없어요
                </p>
              )}
              {available.map(place => {
                const info = getCategoryInfo(place.category)
                const isSelected = selected.includes(place.id)
                return (
                  <div key={place.id} onClick={() => toggle(place.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                    borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: isSelected ? 'var(--primary)' : 'var(--bg)',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0, transition: 'all 0.15s',
                    }}>
                      {isSelected ? '✓' : info.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{place.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {info.label} · {place.address}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ padding: '12px 16px 16px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
              <button className="btn-primary" disabled={selected.length === 0} onClick={() => onAdd(selected)}>
                {selected.length > 0 ? `${selected.length}개 추가` : '장소를 선택하세요'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '0 16px 12px', flexShrink: 0, display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="장소 이름으로 검색 (예: 성산일출봉)"
                value={query}
                onChange={e => { setQuery(e.target.value); setSearchResults([]) }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                style={{
                  padding: '0 16px', background: 'var(--primary)', color: 'white',
                  borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700,
                  flexShrink: 0, border: 'none', cursor: 'pointer',
                }}
              >{searching ? '···' : '검색'}</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
              {searchError && (
                <p style={{ fontSize: 13, color: '#E05252', textAlign: 'center', padding: '20px 0' }}>{searchError}</p>
              )}
              {!searchError && searchResults.length === 0 && !searching && (
                <p style={{ fontSize: 13, color: 'var(--text-sub)', textAlign: 'center', padding: '40px 0' }}>
                  장소 이름을 검색해보세요
                </p>
              )}
              {searchResults.map((r, i) => {
                const name = r.title.replace(/<[^>]*>/g, '')
                return (
                  <button key={i} onClick={() => !adding && handleSelectSearchResult(r)} style={{
                    width: '100%', padding: '12px 0', textAlign: 'left', background: 'none', border: 'none',
                    borderBottom: '1px solid var(--border)', cursor: adding ? 'wait' : 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>{r.roadAddress || r.address}</p>
                    {r.category && <p style={{ fontSize: 11, color: 'var(--primary)' }}>{r.category}</p>}
                  </button>
                )
              })}
              {adding && (
                <p style={{ fontSize: 13, color: 'var(--primary)', textAlign: 'center', padding: '12px 0' }}>추가 중...</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
      background: active ? 'var(--primary)' : 'var(--surface)',
      color: active ? 'white' : 'var(--text-sub)',
      border: active ? 'none' : '1.5px solid var(--border)',
      whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
    }}>
      {label}
    </button>
  )
}
