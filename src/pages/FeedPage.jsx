import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Tag, formatDate, getCategoryInfo, getRegion, EXTRA_SECTION } from '../utils/helpers'
import AppPortal from '../components/AppPortal'
import PlaceDetailModal from '../components/PlaceDetailModal'

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
  const { places, groups, journals, myGroupIds, setShowPlaceModal, deletePlace, setEditingPlace, username, updatePlace, toggleLike, toggleDislike, addComment, deleteComment } = useApp()
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

      <div className="page-content" style={{ padding: '16px 16px 80px' }}>

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
              <div className="card-grid">
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
              </div>
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
          <PlaceDetailModal
            place={detailPlace}
            groupNames={getGroupNames(detailPlace.groupIds)}
            isOwner={detailPlace.author === username}
            username={username}
            onClose={() => setDetailPlace(null)}
            onEdit={() => handleEdit(detailPlace)}
            onDelete={() => handleDelete(detailPlace.id)}
            onLike={() => toggleLike(detailPlace.id)}
            onDislike={() => toggleDislike(detailPlace.id)}
            onComment={text => addComment(detailPlace.id, text)}
            onDeleteComment={cid => deleteComment(detailPlace.id, cid)}
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
