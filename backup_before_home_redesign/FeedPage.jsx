import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Tag, formatDate, getCategoryInfo, getRegion, EXTRA_SECTION } from '../utils/helpers'
import { useKakaoMaps } from '../hooks/useKakaoMaps'
import AppPortal from '../components/AppPortal'

function RegionSection({ region, places, children, selectMode, selectedIds, onToggleRegion }) {
  const [open, setOpen] = useState(true)
  const allSelected = places.every(p => selectedIds.includes(p.id))
  const someSelected = places.some(p => selectedIds.includes(p.id))

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: open ? 10 : 0 }}>
        {selectMode && (
          <button
            onClick={() => onToggleRegion(places, allSelected)}
            style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              border: allSelected ? 'none' : someSelected ? '2px solid var(--primary)' : '2px solid var(--border)',
              background: allSelected ? 'var(--primary)' : someSelected ? 'var(--primary-bg)' : 'white',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}
          >{allSelected ? '✓' : someSelected ? '—' : ''}</button>
        )}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, cursor: 'pointer' }}
          onClick={() => setOpen(o => !o)}
        >
          <span style={{ fontSize: 16 }}>📍</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{region}</span>
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: 'var(--primary)', background: 'var(--primary-bg)',
            padding: '2px 8px', borderRadius: 10,
          }}>
            {places.length}곳
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-sub)', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
        </div>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  const { places, groups, journals, myGroupIds, setShowPlaceModal, deletePlace, setEditingPlace, username, updatePlace, toggleLike } = useApp()
  const [detailPlace, setDetailPlace] = useState(null)
  const [detailJournal, setDetailJournal] = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [showGroupPicker, setShowGroupPicker] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)

  const toggleSelect = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds([]) }

  const handleBulkAddToGroup = async (groupId) => {
    setBulkSaving(true)
    await Promise.all(selectedIds.map(id => {
      const place = places.find(p => p.id === id)
      const newGroupIds = [...new Set([...(place.groupIds || []), groupId])]
      return updatePlace(id, { groupIds: newGroupIds })
    }))
    setBulkSaving(false)
    setShowGroupPicker(false)
    exitSelectMode()
  }

  // 내가 올린 것 + 내 그룹 장소만
  const visiblePlaces = places.filter(p => {
    if (p.author === username) return true
    if ((p.groupIds || []).length === 0) return false
    return (p.groupIds || []).some(id => myGroupIds.includes(id))
  })

  const publicJournals = (journals || []).filter(j => j.isPublic)
  const myJournals = (journals || []).filter(j => j.author === username)

  // 작년 이맘때 일지 (±15일)
  const today = new Date()
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
  const thisTimeLastYear = myJournals.filter(j => {
    const d = new Date(j.date)
    return Math.abs(d - lastYear) < 15 * 24 * 60 * 60 * 1000
  })

  // 인기 장소 (좋아요 1개 이상, 내림차순)
  const hotPlaces = [...visiblePlaces]
    .filter(p => (p.likes || []).length > 0)
    .sort((a, b) => (b.likes || []).length - (a.likes || []).length)
    .slice(0, 5)

  // 최근 장소 (좋아요 없을 때 fallback)
  const recentPlaces = [...visiblePlaces].slice(0, 5)

  const myPlaces = visiblePlaces.filter(p => p.author === username)
  const getGroupNames = (groupIds) => (groupIds || []).map(id => groups.find(g => g.id === id)?.name).filter(Boolean)

  const handleEdit = (place) => {
    setDetailPlace(null)
    setEditingPlace(place)
    setShowPlaceModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('이 장소를 삭제할까요?')) {
      await deletePlace(id)
      setDetailPlace(null)
    }
  }

  // 지역별 묶음
  const grouped = [...visiblePlaces].reverse().reduce((acc, place) => {
    const region = getRegion(place.address)
    if (!acc[region]) acc[region] = []
    acc[region].push(place)
    return acc
  }, {})

  return (
    <>
      <div className="header">
        {selectMode ? (
          <>
            <button onClick={exitSelectMode} style={{ fontSize: 14, color: 'var(--text-sub)', fontWeight: 600 }}>취소</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{selectedIds.length}개 선택됨</span>
              <button
                onClick={() => selectedIds.length === myPlaces.length ? setSelectedIds([]) : setSelectedIds(myPlaces.map(p => p.id))}
                style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}
              >{selectedIds.length === myPlaces.length ? '전체 해제' : '전체 선택'}</button>
            </div>
            <button
              onClick={() => setShowGroupPicker(true)}
              disabled={selectedIds.length === 0}
              style={{ fontSize: 13, fontWeight: 700, color: selectedIds.length > 0 ? 'var(--primary)' : 'var(--text-sub)' }}
            >그룹 추가</button>
          </>
        ) : (
          <>
            <span className="header-logo">✈️ TripMate</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setSelectMode(true)} style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 600, padding: '4px 8px' }}>선택</button>
              <button className="header-action" onClick={() => setShowPlaceModal(true)}>+</button>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '16px 16px 80px' }}>

        {/* 인기 장소 */}
        {!selectMode && hotPlaces.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>인기 장소</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <PlaceScrollRow places={hotPlaces} username={username} onSelect={setDetailPlace} onLike={toggleLike} />
          </div>
        )}

        {/* 최근 등록 장소 */}
        {!selectMode && recentPlaces.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🆕</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>최근 등록 장소</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <PlaceScrollRow places={recentPlaces} username={username} onSelect={setDetailPlace} onLike={toggleLike} />
          </div>
        )}

        {/* 작년 이맘때 or 최근 일지 */}
        {!selectMode && (thisTimeLastYear.length > 0 || myJournals.length > 0) && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{thisTimeLastYear.length > 0 ? '📅' : '📔'}</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{thisTimeLastYear.length > 0 ? '작년 이맘때' : '최근 일지'}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(thisTimeLastYear.length > 0 ? thisTimeLastYear : myJournals.slice(0, 2)).map(j => (
                <button key={j.id} className="card" onClick={() => setDetailJournal(j)}
                  style={{ padding: 12, textAlign: 'left', width: '100%' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{j.mood}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{formatDate(j.date)}</p>
                    </div>
                    {j.imageUrls?.[0] && (
                      <img src={j.imageUrls[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 공개 일지 섹션 */}
        {publicJournals.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>📔</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>여행 일지</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {publicJournals.map(j => (
                <button key={j.id} className="card" onClick={() => setDetailJournal(j)}
                  style={{ padding: 14, textAlign: 'left', width: '100%', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {j.imageUrls?.[0] && (
                      <img src={j.imageUrls[0]} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 16 }}>{j.mood}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{j.content}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 4 }}>{j.author} · {formatDate(j.date)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {visiblePlaces.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🗺️</span>
            <p className="empty-text">아직 등록된 장소가 없어요.<br />첫 번째 장소를 추가해보세요!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([region, regionPlaces]) => (
            <RegionSection
              key={region} region={region} places={regionPlaces}
              selectMode={selectMode} selectedIds={selectedIds}
              onToggleRegion={(ps, allSelected) => {
                const ids = ps.map(p => p.id)
                setSelectedIds(prev => allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])])
              }}
            >
              {regionPlaces.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  groupNames={getGroupNames(place.groupIds)}
                  isOwner={place.author === username}
                  selectMode={selectMode}
                  selected={selectedIds.includes(place.id)}
                  username={username}
                  onClick={() => selectMode ? toggleSelect(place.id) : setDetailPlace(place)}
                  onEdit={() => handleEdit(place)}
                  onDelete={() => handleDelete(place.id)}
                  onLike={e => { e.stopPropagation(); toggleLike(place.id) }}
                />
              ))}
            </RegionSection>
          ))
        )}
      </div>

      {!selectMode && <button className="fab" onClick={() => setShowPlaceModal(true)}>+</button>}

      {showGroupPicker && (
        <div className="modal-overlay" onClick={() => setShowGroupPicker(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <button className="modal-close" onClick={() => setShowGroupPicker(false)}>✕</button>
              <span className="modal-title">그룹 선택</span>
              <div style={{ width: 28 }} />
            </div>
            <div className="form-section" style={{ paddingBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 12 }}>선택한 장소 {selectedIds.length}개를 추가할 그룹을 고르세요</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleBulkAddToGroup(g.id)}
                    disabled={bulkSaving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12,
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{g.cover}</span>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700 }}>{g.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>멤버 {g.members.length}명</p>
                    </div>
                  </button>
                ))}
                {groups.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>참여 중인 그룹이 없어요</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 장소 상세보기 */}
      {detailPlace && (
        <AppPortal>
          <PlaceDetail
            place={detailPlace}
            groupNames={getGroupNames(detailPlace.groupIds)}
            isOwner={detailPlace.author === username}
            username={username}
            onClose={() => setDetailPlace(null)}
            onEdit={() => handleEdit(detailPlace)}
            onDelete={() => handleDelete(detailPlace.id)}
            onLike={() => toggleLike(detailPlace.id)}
          />
        </AppPortal>
      )}

      {/* 일지 상세보기 */}
      {detailJournal && (
        <AppPortal>
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailJournal(null)}>
            <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-handle" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', flexShrink: 0 }}>
                <button onClick={() => setDetailJournal(null)} style={{ fontSize: 20, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>🌍 공개 일지</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 36 }}>{detailJournal.mood}</span>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800 }}>{detailJournal.title}</h2>
                    <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{detailJournal.author} · {formatDate(detailJournal.date)}</p>
                  </div>
                </div>
                {detailJournal.imageUrls?.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: detailJournal.imageUrls.length === 1 ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {detailJournal.imageUrls.map((url, i) => (
                      <img key={i} src={url} alt="" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: detailJournal.imageUrls.length === 1 ? '16/9' : '1/1' }} />
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{detailJournal.content}</p>
              </div>
            </div>
          </div>
        </AppPortal>
      )}
    </>
  )
}

function PlaceCard({ place, groupNames, isOwner, selectMode, selected, onClick, onEdit, onDelete, onLike, username }) {
  return (
    <div
      className="card"
      style={{ padding: 14, cursor: 'pointer', border: selected ? '2px solid var(--primary)' : undefined, background: selected ? 'var(--primary-bg)' : undefined }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        {selectMode && (
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginRight: 10, marginTop: 2,
            border: selected ? 'none' : '2px solid var(--border)',
            background: selected ? 'var(--primary)' : 'white',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>{selected && '✓'}</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 4 }}>
            <Tag category={place.category} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{place.name}</h3>
          <p style={{ fontSize: 12, color: 'var(--text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {place.address}
          </p>
        </div>
      </div>

      {place.points && place.points.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {place.points.map(pt => (
            <span key={pt} style={{
              padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: 'var(--primary-bg)', color: 'var(--primary)',
            }}>
              {pt}
            </span>
          ))}
        </div>
      )}

      {place.comment && (
        <p style={{
          fontSize: 12, color: 'var(--text)', lineHeight: 1.5, marginBottom: 8,
          paddingLeft: 8, borderLeft: '2px solid var(--primary-light)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {place.comment}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0, flexWrap: 'nowrap', overflow: 'hidden' }}>
          {groupNames.length > 0 ? groupNames.slice(0, 2).map(name => (
            <span key={name} style={{
              fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-bg)',
              padding: '2px 8px', borderRadius: 10, flexShrink: 0,
              maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              🏷️ {name}
            </span>
          )) : (
            <span style={{ fontSize: 12, color: 'var(--text-sub)', flexShrink: 0 }}>👤 {place.author}</span>
          )}
          {groupNames.length > 2 && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', background: 'var(--border)',
              padding: '1px 7px', borderRadius: 10, flexShrink: 0,
            }}>
              +{groupNames.length - 2}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>{formatDate(place.date)}</span>
          <button onClick={onLike} style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 8, background: 'none' }}>
            <span style={{ fontSize: 14 }}>{(place.likes || []).includes(username) ? '❤️' : '🤍'}</span>
            {(place.likes || []).length > 0 && <span style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>{(place.likes || []).length}</span>}
          </button>
          {isOwner && <>
            <button onClick={onEdit} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✏️</button>
            <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: 8, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🗑️</button>
          </>}
        </div>
      </div>
    </div>
  )
}

function MiniMap({ place }) {
  const { ready } = useKakaoMaps()
  const mapRef = useRef(null)

  useEffect(() => {
    if (!ready || !mapRef.current || !place.lat) return
    const pos = new window.kakao.maps.LatLng(place.lat, place.lng)
    const map = new window.kakao.maps.Map(mapRef.current, { center: pos, level: 4 })
    new window.kakao.maps.Marker({ position: pos, map })
  }, [ready, place.lat, place.lng])

  if (!place.lat) return null
  return (
    <div ref={mapRef} style={{
      width: '100%', height: 160,
      borderRadius: 12, overflow: 'hidden',
      marginBottom: 14, background: '#e8e8e8',
    }} />
  )
}

function PlaceDetail({ place, groupNames, isOwner, username, onClose, onEdit, onDelete, onLike }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh', overflowY: 'auto', height: 'auto' }}>
        <div className="modal-handle" />

        {/* 헤더: 카테고리 + 이름 + 닫기 */}
        <div style={{ padding: '8px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 4 }}>
              <Tag category={place.category} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{place.name}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{place.address}</p>
          </div>
          <button onClick={onClose} style={{ fontSize: 18, color: 'var(--text-sub)', marginLeft: 12, marginTop: 2, flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: '12px 16px 24px' }}>
          {/* 미니 지도 */}
          <MiniMap place={place} />

          {/* 코멘트 */}
          {place.comment && (
            <div style={{
              padding: '12px 14px', borderRadius: 10, background: 'var(--bg)',
              borderLeft: '3px solid var(--primary)', marginBottom: 12,
            }}>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>"{place.comment}"</p>
            </div>
          )}

          {/* 추천 메뉴 / 액티비티 */}
          {place.menus && place.menus.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {EXTRA_SECTION[place.category]?.icon} {EXTRA_SECTION[place.category]?.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {place.menus.map(item => (
                  <span key={item} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: '#FFF3E0', color: '#E67E22',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 추천 태그 */}
          {place.points && place.points.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {place.points.map(pt => (
                <span key={pt} style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: 'var(--primary-bg)', color: 'var(--primary)',
                }}>
                  {pt}
                </span>
              ))}
            </div>
          )}

          {/* 그룹 or 작성자 + 날짜 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {groupNames && groupNames.length > 0 ? groupNames.map(name => (
              <span key={name} style={{
                fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-bg)',
                padding: '2px 8px', borderRadius: 10,
              }}>🏷️ {name}</span>
            )) : (
              <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>👤 {place.author}</span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>· {formatDate(place.date)}</span>
          </div>

          {/* 액션 버튼들 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onLike}
              style={{
                padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: (place.likes || []).includes(username) ? '#fff0f5' : 'var(--bg)',
                color: (place.likes || []).includes(username) ? '#E05252' : 'var(--text-sub)',
                border: '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {(place.likes || []).includes(username) ? '❤️' : '🤍'}
              {(place.likes || []).length > 0 && (place.likes || []).length}
            </button>
            {place.lat && (
              <button
                onClick={() => window.open(`https://map.kakao.com/?q=${encodeURIComponent(place.name)}`, '_blank')}
                style={{
                  flex: 1, padding: '11px', background: '#FEE500',
                  borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#3A1D1D',
                }}
              >
                🗺️ 카카오맵에서 보기
              </button>
            )}
            {isOwner && <>
              <button
                onClick={onEdit}
                style={{
                  flex: 1, padding: '11px', background: 'var(--bg)',
                  borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'var(--text)',
                  border: '1.5px solid var(--border)',
                }}
              >
                ✏️ 수정
              </button>
              <button
                onClick={onDelete}
                style={{
                  padding: '11px 16px', background: '#fff0f0',
                  borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#E05252',
                }}
              >
                🗑️
              </button>
            </>}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlaceScrollRow({ places, username, onSelect, onLike }) {
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
      {places.map(place => (
        <button
          key={place.id}
          onClick={() => onSelect(place)}
          style={{
            flexShrink: 0, width: 140, textAlign: 'left',
            background: 'var(--surface)', borderRadius: 14,
            border: '1px solid var(--border)', padding: '12px',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>{getCategoryInfo(place.category).icon}</div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>{getRegion(place.address)}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={e => { e.stopPropagation(); onLike(place.id) }}>
            <span style={{ fontSize: 14 }}>{(place.likes || []).includes(username) ? '❤️' : '🤍'}</span>
            <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>{(place.likes || []).length}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
