import { useEffect, useRef, useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getCategoryInfo, getRegion } from '../utils/helpers'
import { useKakaoMaps } from '../hooks/useKakaoMaps'

export default function MapPage() {
  const { places, setShowPlaceModal } = useApp()
  const { ready } = useKakaoMaps()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const overlaysRef = useRef([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState('전체')

  const regions = useMemo(() => {
    const set = new Set(places.map(p => getRegion(p.address)))
    return ['전체', ...Array.from(set)]
  }, [places])

  const filteredPlaces = selectedRegion === '전체'
    ? places
    : places.filter(p => getRegion(p.address) === selectedRegion)

  useEffect(() => {
    if (!ready || !mapRef.current) return
    const center = new window.kakao.maps.LatLng(36.5, 127.8)
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 12 })
    mapInstanceRef.current = map
  }, [ready])

  // 지역 변경 시 지도 범위 맞추기
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
  }, [ready, selectedRegion])

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

  return (
    <>
      <div className="header">
        <span className="header-title">지도</span>
        <button className="header-action" onClick={() => setShowPlaceModal(true)}>+</button>
      </div>

      {/* 지역 선택 칩 */}
      {regions.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, padding: '10px 16px',
          overflowX: 'auto', borderBottom: '1px solid var(--border)',
        }}>
          {regions.map(region => (
            <button
              key={region}
              onClick={() => { setSelectedRegion(region); setSelectedPlace(null) }}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                border: selectedRegion === region ? 'none' : '1.5px solid var(--border)',
                background: selectedRegion === region ? 'var(--primary)' : 'var(--surface)',
                color: selectedRegion === region ? 'white' : 'var(--text-sub)',
              }}
            >
              {region !== '전체' && '📍 '}{region}
            </button>
          ))}
        </div>
      )}

      <div style={{ position: 'relative', height: regions.length > 1 ? 'calc(100% - 105px)' : 'calc(100% - 57px)' }}>
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

            {selectedPlace.placeUrl && (
              <button
                onClick={() => window.open(selectedPlace.placeUrl, '_blank')}
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
            장소를 등록하면 지도에 표시돼요
          </div>
        )}
      </div>
    </>
  )
}
