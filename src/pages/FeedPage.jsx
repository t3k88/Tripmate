import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Tag, formatDate, getCategoryInfo, getRegion, EXTRA_SECTION } from '../utils/helpers'
import { useKakaoMaps } from '../hooks/useKakaoMaps'
import AppPortal from '../components/AppPortal'

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
  const { places, groups, setShowPlaceModal, deletePlace, setEditingPlace } = useApp()
  const [detailPlace, setDetailPlace] = useState(null)

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
        <AppPortal>
          <PlaceDetail
            place={detailPlace}
            onClose={() => setDetailPlace(null)}
            onEdit={() => handleEdit(detailPlace)}
            onDelete={() => handleDelete(detailPlace.id)}
          />
        </AppPortal>
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0, flexWrap: 'nowrap', overflow: 'hidden' }}>
          <span style={{ fontSize: 12, color: 'var(--text-sub)', flexShrink: 0 }}>👤 {place.author}</span>
          {groupNames.slice(0, 2).map(name => (
            <span key={name} style={{
              fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-bg)',
              padding: '1px 7px', borderRadius: 10, flexShrink: 0,
              maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {name}
            </span>
          ))}
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
          <button onClick={onEdit} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✏️</button>
          <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: 8, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🗑️</button>
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

function PlaceDetail({ place, onClose, onEdit, onDelete }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh', overflowY: 'auto' }}>
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

          {/* 작성자 + 날짜 */}
          <p style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 16 }}>
            👤 {place.author} · {formatDate(place.date)}
          </p>

          {/* 액션 버튼들 */}
          <div style={{ display: 'flex', gap: 8 }}>
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
