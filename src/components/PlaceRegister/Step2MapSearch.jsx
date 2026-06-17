import { useEffect, useRef, useState } from 'react'
import { useKakaoMaps } from '../../hooks/useKakaoMaps'

export default function Step2MapSearch({ data, onNext }) {
  const { ready, loading, error: kakaoError } = useKakaoMaps()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [query, setQuery] = useState(data.name || '')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(
    data.lat ? { name: data.name, address: data.address, lat: data.lat, lng: data.lng, placeUrl: data.placeUrl } : null
  )
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  // 카카오 SDK 준비되면 지도 초기화
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const center = new window.kakao.maps.LatLng(data.lat || 37.5665, data.lng || 126.9780)
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 5 })
    mapInstanceRef.current = map

    if (data.lat) {
      const marker = new window.kakao.maps.Marker({ position: center })
      marker.setMap(map)
      markerRef.current = marker
    }
  }, [ready])

  const handleSearch = async () => {
    setSearchError('')
    if (!query.trim()) return
    setSearching(true)
    setResults([])

    try {
      const res = await fetch(`/api/naver-search?query=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('검색 실패')
      const data = await res.json()
      if (data.items?.length > 0) {
        setResults(data.items)
      } else {
        setSearchError('검색 결과가 없어요. 다른 키워드로 시도해보세요.')
      }
    } catch {
      setSearchError('검색 중 오류가 발생했어요.')
    } finally {
      setSearching(false)
    }
  }

  const handleSelect = (place) => {
    const lat = parseFloat(place.mapy) / 1e7
    const lng = parseFloat(place.mapx) / 1e7
    const name = place.title.replace(/<[^>]*>/g, '')
    const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`
    const info = { name, address: place.roadAddress || place.address, lat, lng, placeUrl: kakaoMapUrl }
    setSelected(info)
    setResults([])
    setQuery(name)

    if (mapInstanceRef.current) {
      const pos = new window.kakao.maps.LatLng(lat, lng)
      mapInstanceRef.current.setCenter(pos)
      mapInstanceRef.current.setLevel(3)
      if (markerRef.current) markerRef.current.setMap(null)
      const marker = new window.kakao.maps.Marker({ position: pos })
      marker.setMap(mapInstanceRef.current)
      markerRef.current = marker
    }
  }

  // 카카오 SDK 로드 실패
  if (kakaoError) {
    return (
      <div style={{ padding: '24px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
        <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>카카오 지도를 불러올 수 없어요</p>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 20 }}>
          카카오 개발자 콘솔에서 앱 키 확인이 필요해요.<br />
          <b>JavaScript 키</b>가 맞는지, 플랫폼에<br />
          <b>http://localhost:5173</b> 이 등록됐는지 확인해 주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 700 }}
        >
          새로고침
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '0 20px', marginBottom: 12 }}>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>어디인가요?</p>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', textAlign: 'center', marginBottom: 16 }}>
          장소 이름으로 검색해 주세요
        </p>

        {/* 검색바 */}
        {true && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="예) 성산일출봉, 스타벅스 홍대점"
                value={query}
                onChange={e => { setQuery(e.target.value); setResults([]) }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                style={{
                  padding: '0 16px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {searching ? '···' : '검색'}
              </button>
            </div>

            {searchError && (
              <p style={{ fontSize: 12, color: '#E05252', marginBottom: 8, padding: '6px 10px', background: '#fff0f0', borderRadius: 6 }}>
                ⚠️ {searchError}
              </p>
            )}

            {results.length > 0 && (
              <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 10, background: 'var(--surface)' }}>
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(r)}
                    style={{
                      width: '100%', padding: '11px 14px', textAlign: 'left',
                      borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                      background: 'transparent', display: 'flex', flexDirection: 'column', gap: 2,
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}
                      dangerouslySetInnerHTML={{ __html: r.title }} />
                    <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{r.roadAddress || r.address}</p>
                    {r.category && (
                      <p style={{ fontSize: 11, color: 'var(--primary)' }}>{r.category}</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <div style={{
                padding: '10px 14px', background: 'var(--primary-bg)', border: '1.5px solid var(--primary)',
                borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
              }}>
                <span style={{ fontSize: 20 }}>📍</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{selected.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected.address}</p>
                </div>
                <button onClick={() => { setSelected(null); setQuery('') }} style={{ fontSize: 16, color: 'var(--text-sub)', flexShrink: 0 }}>✕</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 지도 */}
      <div ref={mapRef} style={{ width: '100%', height: 200, background: loading ? '#f0f0f0' : '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && <span style={{ fontSize: 13, color: '#aaa' }}>지도 로딩 중...</span>}
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <button
          className="btn-primary"
          disabled={!selected}
          onClick={() => onNext({ name: selected.name, address: selected.address, lat: selected.lat, lng: selected.lng, placeUrl: selected.placeUrl || '' })}
        >
          이 장소로 등록할게요
        </button>
      </div>
    </div>
  )
}
