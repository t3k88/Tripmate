import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getCategoryInfo, getAddressLevels } from '../utils/helpers'
import AppPortal from '../components/AppPortal'

export default function RoutePage() {
  const { routes, places, groups, addRoute, deleteRoute, saveRouteItems } = useApp()
  const [view, setView] = useState('list')       // 'list' | 'detail'
  const [activeRoute, setActiveRoute] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  const openRoute = (route) => {
    setActiveRoute(route)
    setView('detail')
  }

  const handleRouteUpdated = (updatedRoute) => {
    setActiveRoute(updatedRoute)
  }

  if (view === 'detail' && activeRoute) {
    return (
      <RouteDetail
        route={activeRoute}
        places={places}
        groups={groups}
        onBack={() => setView('list')}
        onDelete={async () => { await deleteRoute(activeRoute.id); setView('list') }}
        onSave={async (items) => { await saveRouteItems(activeRoute.id, items); handleRouteUpdated({ ...activeRoute, items }) }}
      />
    )
  }

  return (
    <>
      <div className="header">
        <span className="header-title">루트</span>
        <button className="header-action" onClick={() => setShowCreate(true)}>+</button>
      </div>

      <div style={{ padding: '16px 16px 80px' }}>
        {routes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🗺️</span>
            <p className="empty-text">아직 루트가 없어요.<br />여행 동선을 직접 짜보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {routes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                places={places}
                groupName={groups.find(g => g.id === route.groupId)?.name}
                onClick={() => openRoute(route)}
              />
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => setShowCreate(true)}>+</button>

      {showCreate && (
        <AppPortal>
          <CreateRouteModal
            groups={groups}
            places={places}
            onClose={() => setShowCreate(false)}
            onCreate={async (data) => {
              const newRoute = await addRoute(data)
              setShowCreate(false)
              if (newRoute) openRoute({ ...newRoute, region: data.region })
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {maxDay > 0 && (
              <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-bg)', padding: '2px 8px', borderRadius: 10 }}>
                {maxDay}박{maxDay + 1}일
              </span>
            )}
            {groupName && (
              <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>· {groupName}</span>
            )}
          </div>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{placeCount}곳 ›</span>
      </div>

      {placeCount > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflow: 'hidden' }}>
          {route.items.slice(0, 4).map(item => {
            const place = places.find(p => p.id === item.placeId)
            if (!place) return null
            const info = getCategoryInfo(place.category)
            return (
              <div key={item.id} style={{
                padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 600,
                background: 'var(--bg)', color: 'var(--text)', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span>{info.icon}</span>
                <span style={{ maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</span>
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

function RouteDetail({ route, places, groups, onBack, onDelete, onSave }) {
  const [items, setItems] = useState(
    [...(route.items || [])].sort((a, b) => a.dayNumber - b.dayNumber || a.sortOrder - b.sortOrder)
  )
  const [showPicker, setShowPicker] = useState(false)
  const [dirty, setDirty] = useState(false)

  const maxDay = items.length > 0 ? Math.max(...items.map(i => i.dayNumber)) : 1

  const addPlaces = (placeIds) => {
    const newItems = placeIds.map(pid => ({ placeId: pid, dayNumber: maxDay, sortOrder: items.length }))
    setItems(prev => [...prev, ...newItems])
    setDirty(true)
  }

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
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

  const handleSave = async () => {
    await onSave(items)
    setDirty(false)
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
          <p style={{ fontSize: 17, fontWeight: 700 }}>{route.name}</p>
          {groupName && <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>{groupName}</p>}
        </div>
        <button onClick={() => window.confirm('이 루트를 삭제할까요?') && onDelete()}
          style={{ fontSize: 18, color: '#E05252', padding: '0 4px' }}>🗑️</button>
      </div>

      <div style={{ padding: '16px 16px 100px' }}>
        {days.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📍</span>
            <p className="empty-text">장소를 추가해서 루트를 완성해보세요!</p>
          </div>
        ) : (
          days.map(day => (
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
                {grouped[day].map(({ _idx, placeId, dayNumber }) => {
                  const place = places.find(p => p.id === placeId)
                  if (!place) return null
                  const info = getCategoryInfo(place.category)
                  return (
                    <div key={_idx} style={{ display: 'flex', gap: 10, marginBottom: 10, position: 'relative' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'white',
                        border: '2px solid var(--primary)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 14, flexShrink: 0, zIndex: 1,
                      }}>{info.icon}</div>

                      <div className="card" style={{ flex: 1, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{info.label}</p>
                            <p style={{ fontSize: 14, fontWeight: 700 }}>{place.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 1,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                              {place.address}
                            </p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                              <button onClick={() => moveUp(_idx)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', fontSize: 12 }}>↑</button>
                              <button onClick={() => moveDown(_idx)} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', fontSize: 12 }}>↓</button>
                              <button onClick={() => removeItem(_idx)} style={{ width: 24, height: 24, borderRadius: 6, background: '#fff0f0', fontSize: 12, color: '#E05252' }}>✕</button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontSize: 10, color: 'var(--text-sub)' }}>Day</span>
                              <button onClick={() => changeDay(_idx, Math.max(1, dayNumber - 1))}
                                style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--bg)', fontSize: 11, lineHeight: 1 }}>-</button>
                              <span style={{ fontSize: 12, fontWeight: 700, minWidth: 14, textAlign: 'center' }}>{dayNumber}</span>
                              <button onClick={() => changeDay(_idx, dayNumber + 1)}
                                style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--bg)', fontSize: 11, lineHeight: 1 }}>+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

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
          />
        </AppPortal>
      )}
    </>
  )
}

function PlacePicker({ places, existingIds, region, onClose, onAdd }) {
  const [selected, setSelected] = useState([])
  const [filterRegion, setFilterRegion] = useState(region || '')

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

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="modal-handle" />
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <span className="modal-title">장소 선택</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {regionOptions.length > 1 && (
          <div style={{ padding: '0 16px 12px', flexShrink: 0, display: 'flex', gap: 8, overflowX: 'auto' }}>
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
          <button
            className="btn-primary"
            disabled={selected.length === 0}
            onClick={() => onAdd(selected)}
          >
            {selected.length > 0 ? `${selected.length}개 추가` : '장소를 선택하세요'}
          </button>
        </div>
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
