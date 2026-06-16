import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getCategoryInfo } from '../utils/helpers'

export default function RoutePage() {
  const { places, groups } = useApp()
  const [selectedGroupId, setSelectedGroupId] = useState('all')

  const filtered = selectedGroupId === 'all'
    ? places
    : places.filter(p => p.groupIds?.includes(Number(selectedGroupId)))

  const byDate = filtered.reduce((acc, p) => {
    acc[p.date] = acc[p.date] || []
    acc[p.date].push(p)
    return acc
  }, {})

  const sortedDates = Object.keys(byDate).sort()

  return (
    <>
      <div className="header">
        <span className="header-title">루트</span>
        <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{filtered.length}개 장소</span>
      </div>

      {/* Group filter chips */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <FilterChip label="전체" active={selectedGroupId === 'all'} onClick={() => setSelectedGroupId('all')} />
        {groups.map(g => (
          <FilterChip
            key={g.id}
            label={`${g.cover} ${g.name}`}
            active={selectedGroupId === String(g.id)}
            onClick={() => setSelectedGroupId(String(g.id))}
          />
        ))}
      </div>

      <div style={{ padding: '0 16px 80px' }}>
        {sortedDates.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📍</span>
            <p className="empty-text">루트가 없어요.<br />장소를 등록하면 여기에 쌓여요!</p>
          </div>
        ) : (
          sortedDates.map((date, di) => (
            <div key={date} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {di + 1}일
                </div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  {new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </span>
              </div>

              <div style={{ position: 'relative', paddingLeft: 18 }}>
                <div style={{
                  position: 'absolute', left: 17, top: 0, bottom: 0,
                  width: 2, background: 'var(--border)',
                }} />
                {byDate[date].map((place) => {
                  const info = getCategoryInfo(place.category)
                  return (
                    <div key={place.id} style={{ display: 'flex', gap: 12, marginBottom: 12, position: 'relative' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'white', border: '2px solid var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, flexShrink: 0, zIndex: 1,
                      }}>
                        {info.icon}
                      </div>
                      <div className="card" style={{ flex: 1, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 2 }}>{info.label}</p>
                            <p style={{ fontSize: 14, fontWeight: 700 }}>{place.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 1 }}>{place.address}</p>
                          </div>
                          {place.placeUrl && (
                            <button
                              onClick={() => window.open(place.placeUrl, '_blank')}
                              style={{
                                padding: '3px 8px',
                                background: '#FEE500',
                                borderRadius: 6,
                                fontSize: 10,
                                fontWeight: 700,
                                color: '#3A1D1D',
                                flexShrink: 0,
                                marginLeft: 6,
                              }}
                            >
                              지도
                            </button>
                          )}
                        </div>
                        {place.points && place.points.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {place.points.map(pt => (
                              <span key={pt} style={{
                                padding: '2px 8px', borderRadius: 12,
                                fontSize: 11, fontWeight: 600,
                                background: 'var(--primary-bg)', color: 'var(--primary)',
                              }}>
                                {pt}
                              </span>
                            ))}
                          </div>
                        )}
                        {place.comment && (
                          <p style={{ marginTop: 6, fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.4 }}>
                            "{place.comment}"
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 20,
        fontSize: 13, fontWeight: 600,
        background: active ? 'var(--primary)' : 'var(--surface)',
        color: active ? 'white' : 'var(--text-sub)',
        border: active ? 'none' : '1.5px solid var(--border)',
        whiteSpace: 'nowrap', flexShrink: 0,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}
