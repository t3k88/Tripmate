import { useEffect, useRef, useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, getCategoryInfo, getAddressLevels } from '../utils/helpers'
import { useKakaoMaps } from '../hooks/useKakaoMaps'
import AppPortal from '../components/AppPortal'

// 전체 토글 헬퍼: 전체 클릭 시 all↔none, 개별 클릭 시 단순 토글
function toggleAll(prev, allItems) {
  return prev.length === allItems.length ? [] : [...allItems]
}
function toggleOne(prev, item) {
  return prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
}

export default function MapPage() {
  const { places, groups, setShowPlaceModal } = useApp()
  const { ready } = useKakaoMaps()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const overlaysRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)

  // 임시 필터
  const [draftCategories, setDraftCategories] = useState([])
  const [draftSido, setDraftSido] = useState('')
  const [draftGu, setDraftGu] = useState('')
  const [draftDong, setDraftDong] = useState('')
  const [draftGroups, setDraftGroups] = useState([])
  const [draftAuthors, setDraftAuthors] = useState([])

  // 적용된 필터
  const [filterCategories, setFilterCategories] = useState([])
  const [sido, setSido] = useState('')
  const [gu, setGu] = useState('')
  const [dong, setDong] = useState('')
  const [filterGroups, setFilterGroups] = useState([])
  const [filterAuthors, setFilterAuthors] = useState([])

  // 지역 더보기
  const [sidoExpanded, setSidoExpanded] = useState(false)
  const [guExpanded, setGuExpanded] = useState(false)
  const REGION_LIMIT = 6

  const allCategoryIds = CATEGORIES.map(c => c.id)
  const allGroupIds = groups.map(g => g.id)

  const placesWithLevels = useMemo(
    () => places.map(p => ({ ...p, _levels: getAddressLevels(p.address) })),
    [places]
  )

  const sidoOptions = useMemo(() => {
    const set = new Set(placesWithLevels.map(p => p._levels[0]).filter(Boolean))
    return Array.from(set)
  }, [placesWithLevels])

  const guOptions = useMemo(() => {
    if (!draftSido) return []
    const set = new Set(
      placesWithLevels.filter(p => p._levels[0] === draftSido && p._levels[1]).map(p => p._levels[1])
    )
    return Array.from(set)
  }, [placesWithLevels, draftSido])

  const dongOptions = useMemo(() => {
    if (!draftSido || !draftGu) return []
    const set = new Set(
      placesWithLevels.filter(p => p._levels[0] === draftSido && p._levels[1] === draftGu && p._levels[2]).map(p => p._levels[2])
    )
    return Array.from(set)
  }, [placesWithLevels, draftSido, draftGu])

  const availableAuthors = useMemo(() => {
    const base = draftGroups.length > 0
      ? placesWithLevels.filter(p => (p.groupIds || []).some(id => draftGroups.includes(id)))
      : placesWithLevels
    return Array.from(new Set(base.map(p => p.author).filter(Boolean)))
  }, [placesWithLevels, draftGroups])

  // 전체 선택(=allGroupIds 전부) 이면 그룹 필터 없음 처리
  const activeGroupFilter = filterGroups.length > 0 && filterGroups.length < groups.length ? filterGroups : []
  const activeCategoryFilter = filterCategories.length > 0 && filterCategories.length < allCategoryIds.length ? filterCategories : []
  const activeAuthorFilter = filterAuthors.length > 0 && filterAuthors.length < availableAuthors.length ? filterAuthors : []

  const filteredPlaces = placesWithLevels.filter(p => {
    if (activeCategoryFilter.length > 0 && !activeCategoryFilter.includes(p.category)) return false
    if (sido && p._levels[0] !== sido) return false
    if (gu && p._levels[1] !== gu) return false
    if (dong && p._levels[2] !== dong) return false
    if (activeGroupFilter.length > 0 && !(p.groupIds || []).some(id => activeGroupFilter.includes(id))) return false
    if (activeAuthorFilter.length > 0 && !activeAuthorFilter.includes(p.author)) return false
    return true
  })

  const draftGroupFilter = draftGroups.length > 0 && draftGroups.length < groups.length ? draftGroups : []
  const draftCategoryFilter = draftCategories.length > 0 && draftCategories.length < allCategoryIds.length ? draftCategories : []
  const draftAuthorFilter = draftAuthors.length > 0 && draftAuthors.length < availableAuthors.length ? draftAuthors : []

  const draftFilteredCount = placesWithLevels.filter(p => {
    if (draftCategoryFilter.length > 0 && !draftCategoryFilter.includes(p.category)) return false
    if (draftSido && p._levels[0] !== draftSido) return false
    if (draftGu && p._levels[1] !== draftGu) return false
    if (draftDong && p._levels[2] !== draftDong) return false
    if (draftGroupFilter.length > 0 && !(p.groupIds || []).some(id => draftGroupFilter.includes(id))) return false
    if (draftAuthorFilter.length > 0 && !draftAuthorFilter.includes(p.author)) return false
    return true
  }).length

  const openFilter = () => {
    // 전체 선택 상태(= 필터 없음)면 빈 배열로 초기화
    setDraftCategories(filterCategories.length === allCategoryIds.length ? [] : filterCategories)
    setDraftGroups(filterGroups.length === groups.length ? [] : filterGroups)
    setDraftAuthors(filterAuthors.length > 0 && filterAuthors.length === availableAuthors.length ? [] : filterAuthors)
    setDraftSido(sido)
    setDraftGu(gu)
    setDraftDong(dong)
    setFilterOpen(true)
  }

  const applyFilter = () => {
    setFilterCategories(draftCategories)
    setSido(draftSido)
    setGu(draftGu)
    setDong(draftDong)
    setFilterGroups(draftGroups)
    setFilterAuthors(draftAuthors)
    setSelectedPlace(null)
    setFilterOpen(false)
  }

  const resetFilter = () => {
    setDraftCategories([])
    setDraftSido('')
    setDraftGu('')
    setDraftDong('')
    setDraftGroups([])
    setDraftAuthors([])
    setSidoExpanded(false)
    setGuExpanded(false)
  }

  const filterSummary = () => {
    const parts = []
    if (filterCategories.length > 0) parts.push(filterCategories.map(id => CATEGORIES.find(c => c.id === id)?.label).join(', '))
    if (sido) parts.push(sido)
    if (gu) parts.push(gu)
    if (dong) parts.push(dong)
    if (filterGroups.length > 0) parts.push(`그룹 ${filterGroups.length}개`)
    if (filterAuthors.length > 0) parts.push(filterAuthors.join(', '))
    return parts.length > 0 ? parts.join(' · ') : '전체'
  }

  const isFiltered = filterCategories.length > 0 || sido || filterGroups.length > 0 || filterAuthors.length > 0

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

  const filteredIds = filteredPlaces.map(p => p.id).join(',')
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || filteredPlaces.length === 0) return
    const map = mapInstanceRef.current
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
      map.setBounds(bounds)
    }, 50)
  }, [mapReady, filteredIds])

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
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
  }, [mapReady, filteredIds])

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

      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

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
                  <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 2 }}>{info.icon} {info.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{place.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 1 }}>by {place.author}</p>
                </button>
              )
            })}
          </div>
        )}

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
                  <span key={pt} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: 'var(--primary-bg)', color: 'var(--primary)' }}>{pt}</span>
                ))}
              </div>
            )}
            {selectedPlace.comment && (
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 10 }}>"{selectedPlace.comment}"</p>
            )}
            {selectedPlace.lat && (
              <button
                onClick={() => window.open(`https://map.kakao.com/?q=${encodeURIComponent(selectedPlace.name)}`, '_blank')}
                style={{ width: '100%', padding: '10px', background: '#FEE500', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#3A1D1D' }}
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
        <AppPortal>
          <div className="modal-overlay" onClick={() => setFilterOpen(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div style={{ padding: '4px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 17, fontWeight: 700 }}>필터</span>
                <button onClick={resetFilter} style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>초기화</button>
              </div>

              {/* 카테고리 */}
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>카테고리</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <FilterChip
                    label="전체"
                    active={draftCategories.length === allCategoryIds.length}
                    onClick={() => setDraftCategories(toggleAll(draftCategories, allCategoryIds))}
                  />
                  {CATEGORIES.map(cat => (
                    <FilterChip
                      key={cat.id}
                      label={`${cat.icon} ${cat.label}`}
                      active={draftCategories.includes(cat.id)}
                      onClick={() => setDraftCategories(toggleOne(draftCategories, cat.id))}
                    />
                  ))}
                </div>
              </div>

              {/* 그룹 */}
              {groups.length > 0 && (
                <div style={{ padding: '0 20px 20px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>그룹</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <FilterChip
                      label="전체"
                      active={draftGroups.length === allGroupIds.length}
                      onClick={() => { setDraftGroups(toggleAll(draftGroups, allGroupIds)); setDraftAuthors([]) }}
                    />
                    {groups.map(g => (
                      <FilterChip
                        key={g.id}
                        label={`${g.cover} ${g.name}`}
                        active={draftGroups.includes(g.id)}
                        onClick={() => { setDraftGroups(toggleOne(draftGroups, g.id)); setDraftAuthors([]) }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 작성자 */}
              {availableAuthors.length > 0 && (
                <div style={{ padding: '0 20px 20px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {draftGroups.length > 0 ? '멤버' : '작성자'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <FilterChip
                      label="전체"
                      active={draftAuthors.length === availableAuthors.length}
                      onClick={() => setDraftAuthors(toggleAll(draftAuthors, availableAuthors))}
                    />
                    {availableAuthors.map(name => (
                      <FilterChip
                        key={name}
                        label={name}
                        active={draftAuthors.includes(name)}
                        onClick={() => setDraftAuthors(toggleOne(draftAuthors, name))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 시/도 */}
              {sidoOptions.length > 0 && (
                <div style={{ padding: '0 20px 20px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>지역</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <FilterChip label="전체" active={false} onClick={() => { setDraftSido(''); setDraftGu(''); setDraftDong(''); setSidoExpanded(false); setGuExpanded(false) }} />
                    {(sidoExpanded ? sidoOptions : sidoOptions.slice(0, REGION_LIMIT)).map(opt => (
                      <FilterChip key={opt} label={opt} active={draftSido === opt}
                        onClick={() => { setDraftSido(opt); setDraftGu(''); setDraftDong(''); setGuExpanded(false) }} />
                    ))}
                    {sidoOptions.length > REGION_LIMIT && (
                      <button
                        onClick={() => setSidoExpanded(e => !e)}
                        style={{ padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, color: 'var(--primary)', border: '1.5px solid var(--primary)', background: 'transparent' }}
                      >
                        {sidoExpanded ? '접기' : `+${sidoOptions.length - REGION_LIMIT}개 더보기`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 구/시 */}
              {guOptions.length > 0 && (
                <div style={{ padding: '0 20px 20px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>구/시</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <FilterChip label="전체" active={false} onClick={() => { setDraftGu(''); setDraftDong(''); setGuExpanded(false) }} />
                    {(guExpanded ? guOptions : guOptions.slice(0, REGION_LIMIT)).map(opt => (
                      <FilterChip key={opt} label={opt} active={draftGu === opt}
                        onClick={() => { setDraftGu(opt); setDraftDong('') }} />
                    ))}
                    {guOptions.length > REGION_LIMIT && (
                      <button
                        onClick={() => setGuExpanded(e => !e)}
                        style={{ padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, color: 'var(--primary)', border: '1.5px solid var(--primary)', background: 'transparent' }}
                      >
                        {guExpanded ? '접기' : `+${guOptions.length - REGION_LIMIT}개 더보기`}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 동/읍/면 */}
              {dongOptions.length > 0 && (
                <div style={{ padding: '0 20px 20px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>동/읍/면</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <FilterChip label="전체" active={false} onClick={() => setDraftDong('')} />
                    {dongOptions.map(opt => (
                      <FilterChip key={opt} label={opt} active={draftDong === opt} onClick={() => setDraftDong(opt)} />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: '0 20px 8px' }}>
                <button className="btn-primary" onClick={applyFilter}>
                  필터 적용 ({draftFilteredCount}개 장소)
                </button>
              </div>
            </div>
          </div>
        </AppPortal>
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
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}
