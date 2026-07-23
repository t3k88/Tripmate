import { useState, useRef } from 'react'
import { getCategoryInfo } from '../utils/helpers'

const POPULAR_REGIONS = [
  { sido: '서울', gus: ['종로구', '마포구', '성동구', '강남구'] },
  { sido: '경기', gus: ['가평군', '양평군', '수원시'] },
  { sido: '강원', gus: ['강릉시', '속초시', '평창군', '춘천시'] },
  { sido: '충북', gus: ['단양군', '제천시', '청주시'] },
  { sido: '충남', gus: ['태안군', '공주시', '부여군'] },
  { sido: '전북', gus: ['전주시', '남원시', '군산시'] },
  { sido: '전남', gus: ['여수시', '순천시', '담양군'] },
  { sido: '경북', gus: ['경주시', '안동시', '포항시'] },
  { sido: '경남', gus: ['통영시', '남해군', '거제시'] },
  { sido: '부산', gus: ['해운대구', '남구', '기장군'] },
  { sido: '제주', gus: ['제주시', '서귀포시'] },
]

const DURATIONS = [
  { id: 1, label: '당일치기', days: 1 },
  { id: 2, label: '1박 2일', days: 2 },
  { id: 3, label: '2박 3일', days: 3 },
  { id: 4, label: '3박 이상', days: 4 },
]

const COMPANIONS = [
  { id: 'solo', icon: '🙋', label: '혼자' },
  { id: 'friends', icon: '👯', label: '친구들' },
  { id: 'couple', icon: '💑', label: '연인' },
  { id: 'family', icon: '👨‍👩‍👧', label: '가족' },
]

const STYLES = [
  { id: 'food', icon: '🍜', label: '맛집탐방' },
  { id: 'cafe', icon: '☕', label: '카페투어' },
  { id: 'nature', icon: '🌿', label: '자연/힐링' },
  { id: 'activity', icon: '🎯', label: '액티비티' },
  { id: 'shopping', icon: '🛍️', label: '쇼핑' },
  { id: 'drink', icon: '🍺', label: '술/바' },
]

export default function RouteOnboarding({ places, groups, onClose, onComplete }) {
  const [step, setStep] = useState(1)
  const [regions, setRegions] = useState([])
  const [companion, setCompanion] = useState('')
  const [styles, setStyles] = useState([])
  const [duration, setDuration] = useState(null)
  const [routeName, setRouteName] = useState('')
  const [groupIds, setGroupIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [selectedPlaceIdxs, setSelectedPlaceIdxs] = useState([])
  const [error, setError] = useState('')
  const regionInputRef = useRef(null)

  const toggleStyle = (id) =>
    setStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const toggleRegion = (r) =>
    setRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])

  const canNext = () => {
    if (step === 1) return regions.length > 0
    if (step === 2) return !!duration
    if (step === 3) return !!companion
    if (step === 4) return styles.length > 0
    return false
  }

  const handleAiRequest = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regions, duration, companion, styles }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '오류 발생')
      setAiResult(data)
      setRouteName(data.routeName || '')
      setSelectedPlaceIdxs(data.places.map((_, i) => i))
      setStep(5)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    if (!aiResult) return
    const selected = aiResult.places.filter((_, i) => selectedPlaceIdxs.includes(i))
    const items = selected.map((p, i) => ({
      placeId: null,
      _aiPlace: p,
      dayNumber: p.dayNumber || 1,
      sortOrder: i,
      visitTime: p.visitTime || '',
      memo: p.memo || '',
    }))
    const name = routeName.trim() || aiResult.routeName || `${regions.join('·')} ${duration.label}`
    onComplete({ name, groupIds, regions, companion, styles, duration, items, aiPlaces: selected })
  }

  const totalSteps = 4

  const DAY_COLORS = ['#5C6BC0', '#42A5F5', '#66BB6A', '#FFA726']

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="modal-handle" />

        {/* 헤더 */}
        <div style={{ padding: '8px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button
              onClick={step > 1 ? () => { setStep(s => s - 1); setError('') } : onClose}
              style={{ fontSize: 20, color: 'var(--text-sub)', padding: '4px' }}>
              {step > 1 ? '←' : '✕'}
            </button>
            {step <= totalSteps && (
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} style={{
                    height: 4, borderRadius: 2, transition: 'all 0.3s',
                    width: i < step ? 24 : 8,
                    background: i < step ? 'var(--primary)' : 'var(--border)',
                  }} />
                ))}
              </div>
            )}
            {step === 5 && <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>🤖 AI 추천 결과</span>}
            <div style={{ width: 28 }} />
          </div>
        </div>

        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Step 1: 지역 */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>어디로 떠나요? 🗺️</p>
              <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 20 }}>복수 선택 가능해요</p>

              {/* 직접 입력 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  ref={regionInputRef}
                  className="form-input"
                  placeholder="예: 단양군, 강릉시, 제주 서귀포"
                  style={{ flex: 1 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      toggleRegion(e.target.value.trim())
                      e.target.value = ''
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const val = regionInputRef.current?.value.trim()
                    if (val) { toggleRegion(val); regionInputRef.current.value = '' }
                  }}
                  style={{ padding: '10px 16px', borderRadius: 12, background: 'var(--primary)', color: 'white', fontWeight: 700, border: 'none', fontSize: 13, flexShrink: 0, cursor: 'pointer' }}>
                  추가
                </button>
              </div>

              {/* 선택된 지역 태그 */}
              {regions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {regions.map(r => (
                    <span key={r} onClick={() => toggleRegion(r)} style={{
                      padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                      background: 'var(--primary)', color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>{r} <span style={{ fontSize: 11 }}>✕</span></span>
                  ))}
                </div>
              )}

              {/* 인기 지역 */}
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 12 }}>인기 여행지</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {POPULAR_REGIONS.map(({ sido, gus }) => (
                  <div key={sido}>
                    <p style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 8, fontWeight: 600 }}>{sido}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {gus.map(gu => (
                        <button key={gu} onClick={() => toggleRegion(gu)} style={{
                          padding: '8px 14px', borderRadius: 14, fontSize: 13, fontWeight: 600,
                          border: `2px solid ${regions.includes(gu) ? 'var(--primary)' : 'var(--border)'}`,
                          background: regions.includes(gu) ? 'var(--primary)' : 'var(--surface)',
                          color: regions.includes(gu) ? 'white' : 'var(--text)',
                          transition: 'all 0.15s', cursor: 'pointer',
                        }}>{gu}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 기간 */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>며칠 동안 가요? 📅</p>
              <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>여행 기간을 선택해주세요</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {DURATIONS.map(d => (
                  <button key={d.id} onClick={() => setDuration(d)} style={{
                    padding: '24px 16px', borderRadius: 16, fontSize: 14, fontWeight: 700,
                    border: `2px solid ${duration?.id === d.id ? 'var(--primary)' : 'var(--border)'}`,
                    background: duration?.id === d.id ? 'var(--primary-bg)' : 'var(--surface)',
                    color: duration?.id === d.id ? 'var(--primary)' : 'var(--text)',
                    transition: 'all 0.15s',
                  }}>{d.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 동행 */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>누구랑 가요? 👥</p>
              <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>여행 동반자를 알려주세요</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {COMPANIONS.map(c => (
                  <button key={c.id} onClick={() => setCompanion(c.id)} style={{
                    padding: '20px 16px', borderRadius: 16, fontSize: 13, fontWeight: 700,
                    border: `2px solid ${companion === c.id ? 'var(--primary)' : 'var(--border)'}`,
                    background: companion === c.id ? 'var(--primary-bg)' : 'var(--surface)',
                    color: companion === c.id ? 'var(--primary)' : 'var(--text)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 32 }}>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: 스타일 + 루트명 */}
          {step === 4 && (
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>여행 스타일은요? ✨</p>
              <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>복수 선택 가능해요</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                {STYLES.map(s => {
                  const active = styles.includes(s.id)
                  return (
                    <button key={s.id} onClick={() => toggleStyle(s.id)} style={{
                      padding: '20px 16px', borderRadius: 16, fontSize: 13, fontWeight: 700,
                      border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                      background: active ? 'var(--primary-bg)' : 'var(--surface)',
                      color: active ? 'var(--primary)' : 'var(--text)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: 32 }}>{s.icon}</span>
                      {s.label}
                    </button>
                  )
                })}
              </div>

              {error && (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fff0f0', color: '#E05252', fontSize: 13, marginTop: 12 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* Step 5: AI 결과 */}
          {step === 5 && aiResult && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 6 }}>루트 이름</p>
                <input
                  className="form-input"
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  style={{ fontWeight: 700, fontSize: 16 }}
                />
              </div>

              {groups.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8 }}>그룹 공유 (선택)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {groups.map(g => (
                      <button key={g.id}
                        onClick={() => setGroupIds(prev => prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id])}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                          border: `1.5px solid ${groupIds.includes(g.id) ? 'var(--primary)' : 'var(--border)'}`,
                          background: groupIds.includes(g.id) ? 'var(--primary-bg)' : 'var(--surface)',
                          cursor: 'pointer',
                        }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{g.cover}</span>
                          <span>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{g.name}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>멤버 {g.members.length}명</p>
                          </span>
                        </span>
                        {groupIds.includes(g.id) && <span style={{ color: 'var(--primary)', fontSize: 16 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {Array.from({ length: duration?.days || 1 }, (_, i) => i + 1).map(day => {
                const dayPlaces = aiResult.places.filter(p => p.dayNumber === day)
                if (dayPlaces.length === 0) return null
                return (
                  <div key={day} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: DAY_COLORS[(day - 1) % DAY_COLORS.length],
                        color: 'white', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0,
                      }}>Day {day}</div>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {dayPlaces.map((place) => {
                        const globalIdx = aiResult.places.indexOf(place)
                        const isSelected = selectedPlaceIdxs.includes(globalIdx)
                        const info = getCategoryInfo(place.category)
                        return (
                          <div key={globalIdx} style={{ display: 'flex', gap: 10, opacity: isSelected ? 1 : 0.4, transition: 'opacity 0.15s' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: 'white', border: `2px solid ${DAY_COLORS[(day - 1) % DAY_COLORS.length]}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                              }}>{info.icon}</div>
                              {place.visitTime && (
                                <span style={{ fontSize: 10, color: DAY_COLORS[(day - 1) % DAY_COLORS.length], fontWeight: 700, marginTop: 2 }}>
                                  {place.visitTime}
                                </span>
                              )}
                            </div>
                            <div
                              onClick={() => setSelectedPlaceIdxs(prev =>
                                prev.includes(globalIdx) ? prev.filter(x => x !== globalIdx) : [...prev, globalIdx]
                              )}
                              style={{ flex: 1, background: 'var(--surface)', borderRadius: 12, padding: '10px 12px', border: `1.5px solid ${isSelected ? DAY_COLORS[(day - 1) % DAY_COLORS.length] : 'var(--border)'}`, cursor: 'pointer' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{info.label}</p>
                                  <p style={{ fontSize: 14, fontWeight: 700 }}>{place.name}</p>
                                  <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.address}</p>
                                </div>
                                <span style={{
                                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginLeft: 8,
                                  background: isSelected ? DAY_COLORS[(day - 1) % DAY_COLORS.length] : 'var(--bg)',
                                  border: `2px solid ${isSelected ? DAY_COLORS[(day - 1) % DAY_COLORS.length] : 'var(--border)'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 11, color: 'white', fontWeight: 700,
                                }}>{isSelected ? '✓' : ''}</span>
                              </div>
                              {place.description && (
                                <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 6, lineHeight: 1.5 }}>{place.description}</p>
                              )}
                              {place.memo && (
                                <div style={{ marginTop: 6, padding: '5px 8px', background: '#FFF8E7', borderRadius: 6, borderLeft: '3px solid #FFB300' }}>
                                  <p style={{ fontSize: 11, color: '#7a5800' }}>📝 {place.memo}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div style={{ padding: '12px 20px 20px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          {step < totalSteps ? (
            <button className="btn-primary" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
              다음 →
            </button>
          ) : step === totalSteps ? (
            <button
              className="btn-primary"
              disabled={!canNext() || loading}
              onClick={handleAiRequest}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  AI가 루트를 짜고 있어요...
                </>
              ) : '🤖 AI 루트 추천받기'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setStep(4); setAiResult(null) }}
                style={{ flex: 1, padding: 13, borderRadius: 12, fontSize: 14, fontWeight: 700, border: '1.5px solid var(--border)', color: 'var(--text-sub)', background: 'transparent' }}>
                다시 추천
              </button>
              <button className="btn-primary" style={{ flex: 2, borderRadius: 12 }} onClick={handleComplete} disabled={selectedPlaceIdxs.length === 0}>
                {selectedPlaceIdxs.length}곳으로 루트 시작 →
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
