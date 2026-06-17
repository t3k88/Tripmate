import { useEffect, useRef, useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, getCategoryInfo, getAddressLevels } from '../utils/helpers'
import { useKakaoMaps } from '../hooks/useKakaoMaps'

export default function MapPage() {
  const { places, setShowPlaceModal } = useApp()
  const { ready } = useKakaoMaps()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const overlaysRef = useRef([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)

  // 임시 필터 (바텀시트 안에서 조작)
  const [draftCategory, setDraftCategory] = useState('전체')
  const [draftSido, setDraftSido] = useState('전체')
  const [draftGu, setDraftGu] = useState('전체')
  const [draftDong, setDraftDong] = useState('전체')

  // 적용된 필터
  const [category, setCategory] = useState('전체')
  const [sido, setSido] = useState('전체')
  const [gu, setGu] = useState('전체')
  const [dong, setDong] = useState('전체')

  const placesWithLevels = useMemo(
    () => places.map(p => ({ ...p, _levels: getAddressLevels(p.address) })),
    [places]
  )

  const byDraftCategory = draftCategory === '전체'
    ? placesWithLevels
    : placesWithLevels.filter(p => p.category === draftCategory)

  const sidoOptions = useMemo(() => {
    const set = new Set(byDraftCategory.map(p => p._levels[0]))
    return ['전체', ...Array.from(set)]
  }, [byDraftCategory])

  const guOptions = useMemo(() => {
    if (draftSido === '전체') return []
    const set = new Set(
      byDraftCategory.filter(p => p._levels[0] === draftSido && p._levels[1]).map(p => p._levels[1])
    )
    return set.size > 0 ? ['전체', ...Array.from(set)] : []
  }, [byDraftCategory, draftSido])

  const dongOptions = useMemo(() => {
    if (draftSido === '전체' || draftGu === '전체') return []
    const set = new Set(
      byDraftCategory.filter(p => p._levels[0] === draftSido && p._levels[1] === draftGu && p._levels[2]).map(p => p._levels[2])
    )
    return set.size > 0 ? ['전체', ...Array.from(set)] : []
  }, [byDraftCategory, draftSido, draftGu])

  const filteredPlaces = placesWithLevels.filter(p => {
    if (category !== '전체' && p.category !== category) return false
    if (sido !== '전체' && p._levels[0] !== sido) return false
    if (gu !== '전체' && p._levels[1] !== gu) return false
    if (dong !== '전체' && p._levels[2] !== dong) return false
    return true
  })

  const openFilter = () => {
    setDraftCategory(category)
    setDraftSido(sido)
    setDraftGu(gu)
    setDraftDong(dong)
    setFilterOpen(true)
  }

  const applyFilter = () => {
    setCategory(draftCategory)
    setSido(draftSido)
    setGu(draftGu)
    setDong(draftDong)
    setSelectedPlace(null)
    setFilterOpen(false)
  }

  const resetFilter = () => {
    setDraftCategory('전체')
    setDraftSido('전체')
    setDraftGu('전체')
    setDraftDong('전체')
  }

  // 적용된 필터 요약 텍스트
  const filterSummary = () => {
    const parts = []
    if (category !== '전체') parts.push(CATEGORIES.find(c => c.id === category)?.label)
    if (sido !== '전체') parts.push(sido)
    if (gu !== '전체') parts.push(gu)
    if (dong !== '전체') parts.push(dong)
    return parts.length > 0 ? parts.join(' · ') : '전체'
  }

  const isFiltered = category !== '전체' || sido !== '전체'

  useEffect(() => {
    if (!ready || !mapRef.current) return
    const center = new window.kakao.maps.LatLng(36.5, 127.8)
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 12 })
    mapInstanceRef.current = map
  }, [ready])

  useEffect(() => {
    if (!ready || !mapInstanceRef.current) return
    if (filteredPlaces.length === 0) return
    if (filteredPlaces.length === 1) {
      const p = filteredPlaces[0]
      mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(p.lat, p.lng))
      mapInstanceRef.current.setLevel(5)
    } else {
      const bounds = new window.kakao.maps.LatLngBounds()
      filteredPlaces.forEach(p => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)))
      mapInstanceRef.current.setBounds(bounds)
    }
  }, [ready, category, sido, gu, dong])

  useEffect(() => {
    if (!ready || !mapInstanceRef.current) return
    overlaysRef.current.forEach(o => o.setMap(null))
    overlaysRef.current = []

    filteredPlaces.forEach(place => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng)
      const info = getCategoryInfo(place.category)
      const div = document.createElement('div')
      div.style.cssText = `
        background: white; border: 2px solid #E8734A; border-radius: 20px;
        padding: 5px 11px; font-size: 12px; font-weight: 700; color: #E8734A;
        white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        cursor: pointer; user-select: none;
      `
      div.textContent = `${info.icon} ${place.name}`
      div.addEventListener('click', () => setSelectedPlace(place))
      const overlay = new window.kakao.maps.CustomOverlay({ position, content: div, yAnchor: 1.3 })
      overlay.setMap(mapInstanceRef.current)
      overlaysRef.current.push(overlay)
    })
  }, [ready, filteredPlaces])

  const panTo = (place) => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setCenter(new window.kakao.maps.LatLng(place.lat, place.lng))
    mapInstanceRef.current.setLevel(4)
  }

  return (
    <>
      <div className="header">
        <span className="header-title">지도</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={openFilter}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 20,
              background: isFiltered ? 'var(--primary)' : 'var(--bg)',
              color: isFiltered ? 'white' : 'var(--text)',
              border: isFiltered ? 'none' : '1.5px solid var(--border)',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <span>🔍</span>
            <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {filterSummary()}
            </span>
            <span style={{ fontSize: 10 }}>▼</span>
          </button>
          <button className="header-action" onClick={() => setShowPlaceModal(true)}>+</button>
        </div>
      </div>

      {/* 지도 */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* 장소 카드 리스트 */}
        {filteredPlaces.length > 0 && !selectedPlace && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 12px 16px',
            display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.08))',
          }}>
            {filteredPlaces.map(place => {
              const info = getCategoryInfo(place.category)
              return (
                <button
                  key={place.id}
                  onClick={() => { setSelectedPlace(place); panTo(place) }}
                  style={{
                    background: 'white', borderRadius: 12, padding: '8px 12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.12)', flexShrink: 0,
                    textAlign: 'left', minWidth: 120,
                  }}
                >
                  <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 2 }}>
                    {info.icon} {info.label}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{place.name}</p>
                </button>
              )
            })}
          </div>
        )}

        {/* 선택된 장소 패널 */}
        {selectedPlace && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'white', borderRadius: '20px 20px 0 0',
            padding: '16px 16px 20px', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 3 }}>
                  {getCategoryInfo(selectedPlace.category).icon} {getCategoryInfo(selectedPlace.category).label}
                </p>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{selectedPlace.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{selectedPlace.address}</p>
              </div>
              <button onClick={() => setSelectedPlace(null)} style={{ fontSize: 20, color: 'var(--text-sub)', marginLeft: 8 }}>✕</button>
            </div>
            {selectedPlace.points && selectedPlace.points.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {selectedPlace.points.map(pt => (
                  <span key={pt} style={{
                    padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    background: 'var(--primary-bg)', color: 'var(--primary)',
                  }}>{pt}</span>
                ))}
              </div>
            )}
            {selectedPlace.comment && (
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 10 }}>
                "{selectedPlace.comment}"
              </p>
            )}
            {selectedPlace.lat && (
              <button
                onClick={() => window.open(`https://map.kakao.com/?q=${encodeURIComponent(selectedPlace.name)}`, '_blank')}
                style={{
                  width: '100%', padding: '10px', background: '#FEE500',
                  borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#3A1D1D',
                }}
              >
                🗺️ 카카오맵에서 보기
              </button>
            )}
          </div>
        )}

        {filteredPlaces.length === 0 && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'white', borderRadius: 12, padding: '10px 16px',
            fontSize: 13, color: 'var(--text-sub)', boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap',
          }}>
            조건에 맞는 장소가 없어요
          </div>
        )}
      </div>

      {/* 필터 바텀시트 */}
      {filterOpen && (
        <div className="modal-overlay" onClick={() => setFilterOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-handle" />
            <div style={{ padding: '4px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 17, fontWeight: 700 }}>필터</span>
              <button onClick={resetFilter} style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>초기화</button>
            </div>

            {/* 카테고리 */}
            <div style={{ padding: '0 20px 20px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>카테고리</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <FilterChip label="전체" active={draftCategory === '전체'} onClick={() => setDraftCategory('전체')} />
                {CATEGORIES.map(cat => (
                  <FilterChip
                    key={cat.id}
                    label={`${cat.icon} ${cat.label}`}
                    active={draftCategory === cat.id}
                    onClick={() => setDraftCategory(cat.id)}
                  />
                ))}
              </div>
            </div>

            {/* 시/도 */}
            {sidoOptions.length > 1 && (
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>지역</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sidoOptions.map(opt => (
                    <FilterChip
                      key={opt}
                      label={opt === '전체' ? '전체' : opt}
                      active={draftSido === opt}
                      onClick={() => { setDraftSido(opt); setDraftGu('전체'); setDraftDong('전체') }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 구/시 */}
            {guOptions.length > 0 && (
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>구/시</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {guOptions.map(opt => (
                    <FilterChip key={opt} label={opt} active={draftGu === opt}
                      onClick={() => { setDraftGu(opt); setDraftDong('전체') }} />
                  ))}
                </div>
              </div>
            )}

            {/* 동/읍/면 */}
            {dongOptions.length > 0 && (
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>동/읍/면</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {dongOptions.map(opt => (
                    <FilterChip key={opt} label={opt} active={draftDong === opt} onClick={() => setDraftDong(opt)} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: '0 20px 8px' }}>
              <button className="btn-primary" onClick={applyFilter}>
                필터 적용 ({filteredPlaces.length}개 장소)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
        border: active ? 'none' : '1.5px solid var(--border)',
        background: active ? 'var(--primary)' : 'var(--surface)',
        color: active ? 'white' : 'var(--text-sub)',
      }}
    >
      {label}
    </button>
  )
}
