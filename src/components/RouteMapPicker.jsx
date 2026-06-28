import { useEffect, useRef, useState, useMemo } from 'react'
import { getCategoryInfo, getAddressLevels } from '../utils/helpers'
import { useKakaoMaps } from '../hooks/useKakaoMaps'

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return +(R * 2 * Math.asin(Math.sqrt(a))).toFixed(1)
}

export default function RouteMapPicker({ places, onBack, onComplete }) {
  const { ready } = useKakaoMaps()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const overlaysRef = useRef([])
  const polylinesRef = useRef([])
  const [mapReady, setMapReady] = useState(false)

  const [selectedSido, setSelectedSido] = useState(null)
  const [selectedGu, setSelectedGu] = useState(null)
  const [selected, setSelected] = useState([])
  const [sheetExpanded, setSheetExpanded] = useState(false)

  const placesWithLevels = useMemo(
    () => places.map(p => ({ ...p, _levels: getAddressLevels(p.address) })),
    [places]
  )

  const sidoOptions = useMemo(() => {
    const set = new Set(placesWithLevels.map(p => p._levels[0]).filter(Boolean))
    return Array.from(set).sort()
  }, [placesWithLevels])

  const guOptions = useMemo(() => {
    if (!selectedSido) return []
    const set = new Set(
      placesWithLevels.filter(p => p._levels[0] === selectedSido && p._levels[1]).map(p => p._levels[1])
    )
    return Array.from(set).sort()
  }, [placesWithLevels, selectedSido])

  const filteredPlaces = useMemo(() => {
    return placesWithLevels.filter(p => {
      if (selectedSido && p._levels[0] !== selectedSido) return false
      if (selectedGu && p._levels[1] !== selectedGu) return false
      return true
    })
  }, [placesWithLevels, selectedSido, selectedGu])

  // Map init
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const init = () => {
      const el = mapRef.current
      if (!el || el.clientWidth === 0 || el.clientHeight === 0) { requestAnimationFrame(init); return }
      const center = new window.kakao.maps.LatLng(36.5, 127.8)
      const map = new window.kakao.maps.Map(el, { center, level: 12 })
      mapInstanceRef.current = map
      map.relayout()
      setMapReady(true)
    }
    requestAnimationFrame(init)
  }, [ready])

  // Fit bounds when filtered places change
  const filteredIds = filteredPlaces.map(p => p.id).join(',')
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || filteredPlaces.length === 0) return
    setTimeout(() => {
      const bounds = new window.kakao.maps.LatLngBounds()
      if (filteredPlaces.length === 1) {
        const { lat, lng } = filteredPlaces[0]
        const d = 0.008
        bounds.extend(new window.kakao.maps.LatLng(lat - d, lng - d))
        bounds.extend(new window.kakao.maps.LatLng(lat + d, lng + d))
      } else {
        filteredPlaces.forEach(p => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)))
      }
      mapInstanceRef.current.setBounds(bounds)
    }, 50)
  }, [mapReady, filteredIds])

  // Draw overlays + polylines
  const selectedIds = selected.map(p => p.id).join(',')
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    overlaysRef.current.forEach(o => o.setMap(null))
    overlaysRef.current = []
    polylinesRef.current.forEach(l => l.setMap(null))
    polylinesRef.current = []

    filteredPlaces.forEach(place => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng)
      const selIdx = selected.findIndex(s => s.id === place.id)
      const isSelected = selIdx >= 0

      const div = document.createElement('div')
      if (isSelected) {
        div.style.cssText = `
          width: 30px; height: 30px; border-radius: 50%;
          background: #E8734A; color: white;
          font-size: 13px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(232,115,74,0.55);
          cursor: pointer; user-select: none;
          border: 2px solid white;
        `
        div.textContent = selIdx + 1
      } else {
        const info = getCategoryInfo(place.category)
        div.style.cssText = `
          background: white; border: 2px solid #E8734A; border-radius: 20px;
          padding: 5px 11px; font-size: 12px; font-weight: 700; color: #E8734A;
          white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer; user-select: none;
        `
        div.textContent = `${info.icon} ${place.name}`
      }

      div.addEventListener('click', () => {
        setSelected(prev => {
          const exists = prev.find(s => s.id === place.id)
          return exists ? prev.filter(s => s.id !== place.id) : [...prev, place]
        })
      })

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: div,
        yAnchor: isSelected ? 0.5 : 1.3,
      })
      overlay.setMap(mapInstanceRef.current)
      overlaysRef.current.push(overlay)
    })

    // Polylines between consecutive selected places
    if (selected.length >= 2) {
      for (let i = 0; i < selected.length - 1; i++) {
        const p1 = selected[i]
        const p2 = selected[i + 1]
        const polyline = new window.kakao.maps.Polyline({
          path: [
            new window.kakao.maps.LatLng(p1.lat, p1.lng),
            new window.kakao.maps.LatLng(p2.lat, p2.lng),
          ],
          strokeWeight: 2,
          strokeColor: '#E8734A',
          strokeOpacity: 0.6,
          strokeStyle: 'dashed',
        })
        polyline.setMap(mapInstanceRef.current)
        polylinesRef.current.push(polyline)
      }
    }
  }, [mapReady, filteredIds, selectedIds])

  const totalDistance = useMemo(() => {
    if (selected.length < 2) return 0
    let d = 0
    for (let i = 0; i < selected.length - 1; i++) {
      d += haversine(selected[i].lat, selected[i].lng, selected[i + 1].lat, selected[i + 1].lng)
    }
    return +d.toFixed(1)
  }, [selectedIds])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* 상단 바 */}
      <div style={{ flexShrink: 0, background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px 8px' }}>
          <button onClick={onBack} style={{ fontSize: 20, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>←</button>
          <span style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>장소 선택</span>
          <button
            onClick={() => selected.length > 0 && onComplete(selected)}
            disabled={selected.length === 0}
            style={{
              padding: '8px 18px', borderRadius: 20,
              background: selected.length > 0 ? 'var(--primary)' : 'var(--border)',
              color: selected.length > 0 ? 'white' : 'var(--text-sub)',
              fontSize: 14, fontWeight: 700, border: 'none',
              cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            다음 {selected.length > 0 ? `(${selected.length})` : ''}
          </button>
        </div>

        {/* 시/도 필터 */}
        <div style={{ overflowX: 'auto', padding: '0 16px 8px', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
          <button
            onClick={() => { setSelectedSido(null); setSelectedGu(null) }}
            style={chipStyle(!selectedSido)}
          >전체</button>
          {sidoOptions.map(sido => (
            <button key={sido}
              onClick={() => { setSelectedSido(selectedSido === sido ? null : sido); setSelectedGu(null) }}
              style={chipStyle(selectedSido === sido)}
            >{sido}</button>
          ))}
        </div>

        {/* 구/군 필터 */}
        {guOptions.length > 0 && (
          <div style={{ overflowX: 'auto', padding: '0 16px 8px', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
            {guOptions.map(gu => (
              <button key={gu}
                onClick={() => setSelectedGu(selectedGu === gu ? null : gu)}
                style={chipStyle(selectedGu === gu, true)}
              >{gu}</button>
            ))}
          </div>
        )}
      </div>

      {/* 지도 */}
      <div ref={mapRef} style={{ flex: 1 }} />

      {/* 선택 장소 바텀시트 */}
      {selected.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'white', borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          <div
            onClick={() => setSheetExpanded(e => !e)}
            style={{ padding: '14px 20px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span style={{ fontSize: 14, fontWeight: 700 }}>선택한 장소 {selected.length}개</span>
            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>
              {totalDistance > 0 ? `총 ${totalDistance}km · ` : ''}{sheetExpanded ? '▼' : '▲'}
            </span>
          </div>

          {sheetExpanded && (
            <div style={{ overflowY: 'auto', maxHeight: '40vh', padding: '0 16px 20px' }}>
              {selected.map((place, i) => (
                <div key={place.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={numBadge}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{place.name}</span>
                  {i < selected.length - 1 && (
                    <span style={{ fontSize: 11, color: 'var(--text-sub)', flexShrink: 0 }}>
                      {haversine(place.lat, place.lng, selected[i + 1].lat, selected[i + 1].lng)}km →
                    </span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(prev => prev.filter(s => s.id !== place.id)) }}
                    style={{ color: 'var(--text-sub)', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const chipStyle = (active, small = false) => ({
  padding: small ? '5px 12px' : '6px 14px',
  borderRadius: 20,
  fontSize: small ? 12 : 13,
  fontWeight: 600,
  flexShrink: 0,
  border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
  background: active ? 'var(--primary)' : 'var(--surface)',
  color: active ? 'white' : small ? 'var(--text-sub)' : 'var(--text)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})

const numBadge = {
  width: 24, height: 24, borderRadius: '50%',
  background: 'var(--primary)', color: 'white',
  fontSize: 12, fontWeight: 800, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
