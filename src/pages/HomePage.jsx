import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getCategoryInfo, getRegion, formatDate } from '../utils/helpers'
import AppPortal from '../components/AppPortal'
import PlaceDetailModal from '../components/PlaceDetailModal'

export default function HomePage() {
  const { places, journals, groups, username, myGroupIds, setShowPlaceModal, toggleLike, toggleDislike, addComment, deleteComment, setActiveTab, deletePlace, setEditingPlace, goToLanding } = useApp()
  const [detailPlace, setDetailPlace] = useState(null)
  const [detailJournal, setDetailJournal] = useState(null)

  const visiblePlaces = places.filter(p => {
    if (p.author === username) return true
    if ((p.groupIds || []).length === 0) return false
    return (p.groupIds || []).some(id => myGroupIds.includes(id))
  })

  const myJournals = journals.filter(j => j.author === username)

  const hotPlaces = [...visiblePlaces]
    .filter(p => (p.likes || []).length > 0)
    .sort((a, b) => (b.likes || []).length - (a.likes || []).length)
    .slice(0, 8)

  const recentPlaces = [...visiblePlaces].slice(0, 8)

  // 일지에 연결된 placeId 빈도 계산 → 자주 간 장소
  const placeIdCounts = myJournals.reduce((acc, j) => {
    if (j.placeId) acc[j.placeId] = (acc[j.placeId] || 0) + 1
    return acc
  }, {})
  const frequentPlaces = Object.entries(placeIdCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, count]) => ({ place: visiblePlaces.find(p => p.id === Number(id) || p.id === id), count }))
    .filter(({ place }) => place)

  const today = new Date()
  const lastYear = today.getFullYear() - 1
  const thisTimeLastYear = myJournals.filter(j => {
    if (!j.date) return false
    const d = new Date(j.date)
    if (d.getFullYear() !== lastYear) return false
    const diff = Math.abs((d.getMonth() * 30 + d.getDate()) - (today.getMonth() * 30 + today.getDate()))
    return diff <= 15
  })

  const getGroupNames = (groupIds) =>
    (groupIds || []).map(id => groups.find(g => g.id === id)?.name).filter(Boolean)

  return (
    <>
      <div className="header">
        <button onClick={goToLanding} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: "'Jua', sans-serif", fontSize: 22, color: 'var(--primary)',
          letterSpacing: '0.3px',
        }}>✈️ TripMate</button>
        <button className="header-action" onClick={() => setShowPlaceModal(true)}>+</button>
      </div>

      <div style={{ padding: '16px 16px 80px' }}>

        <>
          {frequentPlaces.length > 0 && (
            <Section title="자주 가는 장소" icon="📌">
              <PlaceScrollRow
                places={frequentPlaces.map(({ place, count }) => ({ ...place, _count: count }))}
                username={username} groups={groups}
                onSelect={setDetailPlace} onLike={toggleLike}
                badge={place => `${place._count}번`}
              />
            </Section>
          )}

          <Section title="인기 장소" icon="🔥">
            {hotPlaces.length === 0 ? (
              <EmptyHint text="좋아요를 받은 장소가 없어요" action={() => setShowPlaceModal(true)} actionLabel="+ 장소 등록하기" />
            ) : (
              <PlaceScrollRow places={hotPlaces} username={username} groups={groups} onSelect={setDetailPlace} onLike={toggleLike} />
            )}
          </Section>

          <Section title="최근 등록 장소" icon="🆕">
            {recentPlaces.length === 0 ? (
              <EmptyHint text="아직 등록된 장소가 없어요" action={() => setShowPlaceModal(true)} actionLabel="+ 장소 등록하기" />
            ) : (
              <PlaceScrollRow places={recentPlaces} username={username} groups={groups} onSelect={setDetailPlace} onLike={toggleLike} />
            )}
          </Section>

          <Section title={thisTimeLastYear.length > 0 ? '작년 이맘때' : '내 일지'} icon={thisTimeLastYear.length > 0 ? '📅' : '📔'}>
            {myJournals.length === 0 ? (
              <EmptyHint text="아직 작성된 일지가 없어요" action={() => setActiveTab('journal')} actionLabel="📔 일지 쓰러가기" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(thisTimeLastYear.length > 0 ? thisTimeLastYear : myJournals.slice(0, 2)).map(j => (
                  <button key={j.id} className="card" onClick={() => setDetailJournal(j)} style={{ padding: 12, textAlign: 'left', width: '100%' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{j.mood}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.title}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{j.visitDate ? `방문 ${formatDate(j.visitDate)}` : formatDate(j.date)}</p>
                      </div>
                      {j.imageUrls?.[0] && <img src={j.imageUrls[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Section>
        </>
      </div>

      {detailPlace && (
        <AppPortal>
          <PlaceDetailModal
            place={detailPlace}
            groupNames={getGroupNames(detailPlace.groupIds)}
            isOwner={detailPlace.author === username}
            username={username}
            onClose={() => setDetailPlace(null)}
            onEdit={() => { setDetailPlace(null); setEditingPlace(detailPlace); setShowPlaceModal(true) }}
            onDelete={async () => { if (window.confirm('이 장소를 삭제할까요?')) { await deletePlace(detailPlace.id); setDetailPlace(null) } }}
            onLike={() => toggleLike(detailPlace.id)}
            onDislike={() => toggleDislike(detailPlace.id)}
            onComment={text => addComment(detailPlace.id, text)}
            onDeleteComment={cid => deleteComment(detailPlace.id, cid)}
          />
        </AppPortal>
      )}

      {detailJournal && (
        <AppPortal>
          <JournalDetailModal journal={detailJournal} places={places} onClose={() => setDetailJournal(null)} />
        </AppPortal>
      )}
    </>
  )
}

function EmptyHint({ text, action, actionLabel }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>{text}</p>
      <button onClick={action} style={{ padding: '8px 18px', background: 'var(--primary)', color: 'white', borderRadius: 20, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{actionLabel}</button>
    </div>
  )
}

function JournalDetailModal({ journal, places, onClose }) {
  const linkedPlace = places.find(p => p.id === journal.placeId)
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="modal-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', flexShrink: 0 }}>
          <button onClick={onClose} style={{ fontSize: 20, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 36 }}>{journal.mood}</span>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{journal.title}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                {journal.visitDate ? `📅 ${formatDate(journal.visitDate)}` : formatDate(journal.date)}
              </p>
            </div>
          </div>
          {linkedPlace && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 10, marginBottom: 16 }}>
              <span>📍</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>{linkedPlace.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkedPlace.address}</p>
              </div>
            </div>
          )}
          {journal.imageUrls?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, scrollbarWidth: 'none' }}>
              {journal.imageUrls.map((url, i) => (
                <img key={i} src={url} alt="" style={{ height: 180, width: 'auto', borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
              ))}
            </div>
          )}
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{journal.content}</p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      {children}
    </div>
  )
}

function PlaceScrollRow({ places, username, groups, onSelect, onLike, badge }) {
  const getGroupNames = (groupIds) =>
    (groupIds || []).map(id => groups.find(g => g.id === id)?.name).filter(Boolean)
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
      {places.map(place => {
        const liked = (place.likes || []).includes(username)
        const gNames = getGroupNames(place.groupIds)
        return (
          <button key={place.id} onClick={() => onSelect(place)}
            style={{ flexShrink: 0, width: 145, textAlign: 'left', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', padding: '12px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>{getCategoryInfo(place.category).icon}</span>
              {badge && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '2px 7px' }}>{badge(place)}</span>}
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</p>
            <p style={{ fontSize: 11, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{getRegion(place.address)}</p>
            {gNames.length > 0 && <p style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🏷️ {gNames[0]}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => { e.stopPropagation(); onLike(place.id) }}>
              <span style={{ fontSize: 14 }}>{liked ? '❤️' : '🤍'}</span>
              <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>{(place.likes || []).length}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
