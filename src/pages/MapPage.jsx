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
  const [category, setCategory] = useState('전체')
  const [sido, setSido] = useState('전체')
  const [gu, setGu] = useState('전체')
  const [dong, setDong] = useState('전체')

  const placesWithLevels = useMemo(
    () => places.map(p => ({ ...p, _levels: getAddressLevels(p.address) })),
    [places]
  )

  // 카테고리만 적용한 후보 (지역 옵션 계산용)
  const byCategory = category === '전체'
    ? placesWithLevels
    : placesWithLevels.filter(p => p.category === category)

  const sidoOptions = useMemo(() => {
    const set = new Set(byCategory.map(p => p._levels[0]))
    return ['전체', ...Array.from(set)]
  }, [byCategory])

  const guOptions = useMemo(() => {
    if (sido === '전체') return []
    const set = new Set(
      byCategory.filter(p => p._levels[0] === sido && p._levels[1]).map(p => p._levels[1])
    )
    return set.size > 0 ? ['전체', ...Array.from(set)] : []
  }, [byCategory, sido])

  const dongOptions = useMemo(() => {
    if (sido === '전체' || gu === '전체') return []
    const set = new Set(
      byCategory.filter(p => p._levels[0] === sido && p._levels[1] === gu && p._levels[2]).map(p => p._levels[2])
    )
    return set.size > 0 ? ['전체', ...Array.from(set)] : []
  }, [byCategory, sido, gu])

  const filteredPlaces = byCategory.filter(p => {
    if (sido !== '전체' && p._levels[0] !== sido) return false
    if (gu !== '전체' && p._levels[1] !== gu) return false
    if (dong !== '전체' && p._levels[2] !== dong) return false
    return true
  })

  const handleSido = (v) => { setSido(v); setGu('전체'); setDong('전체'); setSelectedPlace(null) }
  const handleGu = (v) => { setGu(v); setDong('전체'); setSelectedPlace(null) }
  const handleDong = (v) => { setDong(v); setSelectedPlace(null) }
  const handleCategory = (v) => { setCategory(v); setSido('전체'); setGu('전체'); setDong('전체'); setSelectedPlace(null) }

  useEffect(() => {
    if (!ready || !mapRef.current) return
    const center = new window.kakao.maps.LatLng(36.5, 127.8)
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 12 })
    mapInstanceRef.current = map
  }, [ready])

  // 필터 변경 시 지도 범위 맞추기
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
        background: white;
        border: 2px solid #E8734A;
        border-radius: 20px;
        padding: 5px 11px;
        font-size: 12px;
        font-weight: 700;
        color: #E8734A;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        cursor: pointer;
        user-select: none;
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

  const handleSelectPlace = (place) => {
    setSelectedPlace(place)
    panTo(place)
  }

  const filterRowsHeight = 44 + (sidoOptions.length > 1 ? 40 : 0) + (guOptions.length > 0 ? 40 : 0) + (dongOptions.length > 0 ? 40 : 0)

  return (
    <>
      <div className="header">
        <span className="header-title">지도</span>
        <button className="header-action" onClick={() => setShowPlaceModal(true)}>+</button>
      </div>

      {/* 카테고리 필터 */}
      <FilterRow>
        <Chip label="전체" active={category === '전체'} onClick={() => handleCategory('전체')} />
        {CATEGORIES.map(cat => (
          <Chip
            key={cat.id}
            label={`${cat.icon} ${cat.label}`}
            active={category === cat.id}
            onClick={() => handleCategory(cat.id)}
          />
        ))}
      </FilterRow>

      {/* 시/도 필터 */}
      {sidoOptions.length > 1 && (
        <FilterRow>
          {sidoOptions.map(opt => (
            <Chip key={opt} label={opt === '전체' ? '전체' : `📍 ${opt}`} active={sido === opt} onClick={() => handleSido(opt)} />
          ))}
        </FilterRow>
      )}

      {/* 구/시 필터 */}
      {guOptions.length > 0 && (
        <FilterRow sub>
          {guOptions.map(opt => (
            <Chip key={opt} label={opt} active={gu === opt} onClick={() => handleGu(opt)} sub />
          ))}
        </FilterRow>
      )}

      {/* 동/읍/면 필터 */}
      {dongOptions.length > 0 && (
        <FilterRow sub>
          {dongOptions.map(opt => (
            <Chip key={opt} label={opt} active={dong === opt} onClick={() => handleDong(opt)} sub />
          ))}
        </FilterRow>
      )}

      <div style={{ position: 'relative', height: `calc(100% - 57px - ${filterRowsHeight}px)` }}>
        {/* Map */}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Place list overlay (scroll) */}
        {filteredPlaces.length > 0 && !selectedPlace && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 12px 16px',
            display: 'flex', gap: 8, overflowX: 'auto',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.08))',
          }}>
            {filteredPlaces.map(place => {
              const info = getCategoryInfo(place.category)
              return (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: '8px 12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                    flexShrink: 0,
                    textAlign: 'left',
                    minWidth: 120,
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

        {/* Selected place detail panel */}
        {selectedPlace && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'white',
            borderRadius: '20px 20px 0 0',
            padding: '16px 16px 20px',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
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
                    padding: '3px 10px', borderRadius: 12,
                    fontSize: 12, fontWeight: 600,
                    background: 'var(--primary-bg)', color: 'var(--primary)',
                  }}>
                    {pt}
                  </span>
                ))}
              </div>
            )}

            {selectedPlace.comment && (
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 10 }}>
                "{selectedPlace.comment}"
              </p>
            )}

            {(selectedPlace.placeUrl || selectedPlace.lat) && (
              <button
                onClick={() => {
                  const url = selectedPlace.placeUrl || `https://map.kakao.com/link/map/${encodeURIComponent(selectedPlace.name)},${selectedPlace.lat},${selectedPlace.lng}`
                  window.open(url, '_blank')
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#FEE500',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#3A1D1D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
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
    </>
  )
}

function FilterRow({ children, sub }) {
  return (
    <div style={{
      display: 'flex', gap: 6, padding: sub ? '6px 16px' : '8px 16px',
      overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      borderBottom: '1px solid var(--border)',
      background: sub ? 'var(--bg)' : 'var(--surface)',
      scrollbarWidth: 'none', msOverflowStyle: 'none',
    }}>
      {children}
    </div>
  )
}

function Chip({ label, active, onClick, sub }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: sub ? '5px 12px' : '6px 14px',
        borderRadius: 20,
        fontSize: sub ? 12 : 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        border: active ? 'none' : '1.5px solid var(--border)',
        background: active ? 'var(--primary)' : 'var(--surface)',
        color: active ? 'white' : 'var(--text-sub)',
      }}
    >
      {label}
    </button>
  )
}
