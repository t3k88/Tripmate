import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Tag, formatDate, getCategoryInfo, getRegion } from '../utils/helpers'

function RegionSection({ region, places, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: open ? 10 : 0, cursor: 'pointer' }}
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
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  const { places, groups, setShowPlaceModal, setPlaces, setEditingPlace } = useApp()
  const [detailPlace, setDetailPlace] = useState(null)

  const getGroupNames = (groupIds) => (groupIds || []).map(id => groups.find(g => g.id === id)?.name).filter(Boolean)

  const handleEdit = (place) => {
    setDetailPlace(null)
    setEditingPlace(place)
    setShowPlaceModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('이 장소를 삭제할까요?')) {
      setPlaces(ps => ps.filter(p => p.id !== id))
      setDetailPlace(null)
    }
  }

  // 지역별 묶음
  const grouped = [...places].reverse().reduce((acc, place) => {
    const region = getRegion(place.address)
    if (!acc[region]) acc[region] = []
    acc[region].push(place)
    return acc
  }, {})

  return (
    <>
      <div className="header">
        <span className="header-logo">✈️ TripMate</span>
        <button className="header-action" onClick={() => setShowPlaceModal(true)}>+</button>
      </div>

      <div style={{ padding: '16px 16px 80px' }}>
        {places.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🗺️</span>
            <p className="empty-text">아직 등록된 장소가 없어요.<br />첫 번째 장소를 추가해보세요!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([region, regionPlaces]) => (
            <RegionSection key={region} region={region} places={regionPlaces}>
              {regionPlaces.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  groupNames={getGroupNames(place.groupIds)}
                  onClick={() => setDetailPlace(place)}
                  onEdit={() => handleEdit(place)}
                  onDelete={() => handleDelete(place.id)}
                />
              ))}
            </RegionSection>
          ))
        )}
      </div>

      <button className="fab" onClick={() => setShowPlaceModal(true)}>+</button>

      {/* 상세보기 바텀시트 */}
      {detailPlace && (
        <PlaceDetail
          place={detailPlace}
          groupNames={getGroupNames(detailPlace.groupIds)}
          onClose={() => setDetailPlace(null)}
          onEdit={() => handleEdit(detailPlace)}
          onDelete={() => handleDelete(detailPlace.id)}
        />
      )}
    </>
  )
}

function PlaceCard({ place, groupNames, onClick, onEdit, onDelete }) {
  return (
    <div
      className="card"
      style={{ padding: 14, cursor: 'pointer' }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>👤 {place.author}</span>
          {groupNames.map(name => (
            <span key={name} style={{
              fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-bg)',
              padding: '1px 7px', borderRadius: 10,
            }}>
              {name}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>{formatDate(place.date)}</span>
          <button onClick={onEdit} style={{ fontSize: 11, color: 'var(--text-sub)', padding: '2px 6px', borderRadius: 6, background: 'var(--bg)' }}>수정</button>
          <button onClick={onDelete} style={{ fontSize: 11, color: '#E05252', padding: '2px 6px', borderRadius: 6, background: '#fff0f0' }}>삭제</button>
        </div>
      </div>
    </div>
  )
}

function PlaceDetail({ place, groupNames, onClose, onEdit, onDelete }) {
  const info = getCategoryInfo(place.category)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-handle" />

        {/* 헤더 */}
        <div style={{ padding: '12px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tag category={place.category} />
          <button onClick={onClose} style={{ fontSize: 18, color: 'var(--text-sub)' }}>✕</button>
        </div>

        <div style={{ padding: '10px 16px 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{place.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 16 }}>{place.address}</p>

          {place.points && place.points.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
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

          {place.comment && (
            <div style={{
              padding: '12px 14px', borderRadius: 10, background: 'var(--bg)',
              borderLeft: '3px solid var(--primary)', marginBottom: 14,
            }}>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>"{place.comment}"</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, color: 'var(--text-sub)', fontSize: 12 }}>
            <span>👤 {place.author}</span>
            {groupNames.map(name => <span key={name}>· {name}</span>)}
            <span>· {formatDate(place.date)}</span>
          </div>

          {/* 액션 버튼들 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(place.placeUrl || place.lat) && (
              <button
                onClick={() => {
                  const url = place.placeUrl || `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`
                  window.open(url, '_blank')
                }}
                style={{
                  flex: 1, padding: '11px', background: '#FEE500',
                  borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#3A1D1D',
                }}
              >
                🗺️ 지도에서 보기
              </button>
            )}
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
          </div>
        </div>
      </div>
    </div>
  )
}
