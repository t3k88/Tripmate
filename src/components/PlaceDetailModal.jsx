import { useEffect, useRef, useState } from 'react'
import { Tag, EXTRA_SECTION, formatDate } from '../utils/helpers'
import { useKakaoMaps } from '../hooks/useKakaoMaps'

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

export default function PlaceDetailModal({ place, groupNames, isOwner, username, onClose, onEdit, onDelete, onLike, onDislike, onComment, onDeleteComment }) {
  const [commentText, setCommentText] = useState('')
  const liked = (place.likes || []).includes(username)
  const disliked = (place.dislikes || []).includes(username)

  const handleComment = () => {
    if (!commentText.trim()) return
    onComment?.(commentText)
    setCommentText('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh', overflowY: 'auto', height: 'auto' }}>
        <div className="modal-handle" />

        <div style={{ padding: '8px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 4 }}><Tag category={place.category} /></div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{place.name}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{place.address}</p>
          </div>
          <button onClick={onClose} style={{ fontSize: 18, color: 'var(--text-sub)', marginLeft: 12, marginTop: 2, flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: '12px 16px 24px' }}>
          <MiniMap place={place} />

          {place.comment && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg)', borderLeft: '3px solid var(--primary)', marginBottom: 12 }}>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>"{place.comment}"</p>
            </div>
          )}

          {place.menus && place.menus.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {EXTRA_SECTION[place.category]?.icon} {EXTRA_SECTION[place.category]?.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {place.menus.map(item => (
                  <span key={item} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#FFF3E0', color: '#E67E22' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {place.points && place.points.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {place.points.map(pt => (
                <span key={pt} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                  {pt}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {groupNames && groupNames.length > 0 ? groupNames.map(name => (
              <span key={name} style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-bg)', padding: '2px 8px', borderRadius: 10 }}>🏷️ {name}</span>
            )) : (
              <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>👤 {place.author}</span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>· {formatDate(place.date)}</span>
          </div>

          {/* 좋아요/싫어요 + 지도 버튼 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={onLike}
              style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: liked ? '#fff0f5' : 'var(--bg)',
                color: liked ? '#E05252' : 'var(--text-sub)',
                border: `1.5px solid ${liked ? '#E05252' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {liked ? '❤️' : '🤍'} {(place.likes || []).length > 0 ? (place.likes || []).length : ''}
            </button>
            <button
              onClick={onDislike}
              style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: disliked ? '#fff5f0' : 'var(--bg)',
                color: disliked ? '#E87A00' : 'var(--text-sub)',
                border: `1.5px solid ${disliked ? '#E87A00' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {disliked ? '👎' : '👎🏻'} {(place.dislikes || []).length > 0 ? (place.dislikes || []).length : ''}
            </button>
            {place.placeUrl ? (
              <button
                onClick={() => window.open(place.placeUrl, '_blank')}
                style={{ flex: 1, padding: '10px', background: '#FEE500', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#3A1D1D' }}
              >🗺️ 카카오맵</button>
            ) : place.lat ? (
              <button
                onClick={() => window.open(`https://map.kakao.com/?q=${encodeURIComponent(place.name)}`, '_blank')}
                style={{ flex: 1, padding: '10px', background: '#FEE500', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#3A1D1D' }}
              >🗺️ 카카오맵</button>
            ) : null}
            <button
              onClick={() => window.open(`https://map.naver.com/v5/search/${encodeURIComponent(place.name)}`, '_blank', 'noopener')}
              style={{ flex: 1, padding: '10px', background: '#03C75A', borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'white' }}
            >🗺️ 네이버</button>
            {isOwner && <>
              <button onClick={onEdit} style={{ padding: '10px 12px', background: 'var(--bg)', borderRadius: 10, fontSize: 13, fontWeight: 700, color: 'var(--text)', border: '1.5px solid var(--border)' }}>✏️</button>
              <button onClick={onDelete} style={{ padding: '10px 12px', background: '#fff0f0', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#E05252' }}>🗑️</button>
            </>}
          </div>

          {/* 댓글 섹션 */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-sub)' }}>
              💬 한줄평 {(place.comments || []).length > 0 ? `${(place.comments || []).length}개` : ''}
            </p>

            {(place.comments || []).length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 10 }}>아직 한줄평이 없어요. 첫 번째로 남겨보세요!</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {(place.comments || []).map(c => (
                <div key={c.id} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{c.author}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>{formatDate(c.createdAt?.split('T')[0])}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                  {c.author === username && (
                    <button onClick={() => onDeleteComment?.(c.id)} style={{ fontSize: 14, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                style={{ flex: 1, fontSize: 13 }}
                placeholder="한줄평 남기기..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                style={{ padding: '0 16px', background: commentText.trim() ? 'var(--primary)' : 'var(--border)', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 700, flexShrink: 0 }}
              >등록</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
