import { useState, useMemo } from 'react'
import { getCategoryInfo, getAddressLevels } from '../utils/helpers'

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
  { id: 'food', icon: '🍜', label: '맛집탐방', categories: ['restaurant'] },
  { id: 'cafe', icon: '☕', label: '카페투어', categories: ['cafe'] },
  { id: 'nature', icon: '🌿', label: '자연/힐링', categories: ['attraction'] },
  { id: 'activity', icon: '🎯', label: '액티비티', categories: ['attraction'] },
  { id: 'shopping', icon: '🛍️', label: '쇼핑', categories: ['shopping'] },
  { id: 'drink', icon: '🍺', label: '술/바', categories: ['bar'] },
]

export default function RouteOnboarding({ places, groups, onClose, onComplete }) {
  const [step, setStep] = useState(1)
  const [regions, setRegions] = useState([])
  const [companion, setCompanion] = useState('')
  const [styles, setStyles] = useState([])
  const [duration, setDuration] = useState(null)
  const [routeName, setRouteName] = useState('')
  const [groupId, setGroupId] = useState('')

  // sido → [gu, ...] 구조
  const regionOptions = useMemo(() => {
    const map = {}
    places.forEach(p => {
      const [sido, gu] = getAddressLevels(p.address)
      if (!sido) return
      if (!map[sido]) map[sido] = new Set()
      if (gu) map[sido].add(gu)
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([sido, gus]) => ({ sido, gus: Array.from(gus).sort() }))
  }, [places])

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

  const buildRoute = () => {
    const selectedCategories = styles.flatMap(s => STYLES.find(st => st.id === s)?.categories || [])

    // 1. 지역 필터 (gu 단위)
    const regionFiltered = places.filter(p => regions.includes(getAddressLevels(p.address)[1]))
    if (regionFiltered.length === 0) return []

    // 2. 스타일 점수: 선택 스타일 카테고리면 +2, 포인트 태그 일치하면 +1씩
    const styleKeywords = styles.map(s => STYLES.find(st => st.id === s)?.label || '')
    const scored = regionFiltered.map(p => {
      let score = 0
      if (selectedCategories.includes(p.category)) score += 2
      ;(p.points || []).forEach(pt => {
        if (styleKeywords.some(kw => pt.includes(kw))) score += 1
      })
      return { ...p, _score: score }
    })

    // 3. 구/군 단위로 그룹핑 (비슷한 동선끼리 묶기)
    const byGu = scored.reduce((acc, p) => {
      const gu = getAddressLevels(p.address)[1] || '기타'
      if (!acc[gu]) acc[gu] = []
      acc[gu].push(p)
      return acc
    }, {})

    // 4. 각 구/군 내에서 스코어 높은 순 정렬
    Object.keys(byGu).forEach(gu => {
      byGu[gu].sort((a, b) => b._score - a._score)
    })

    // 5. 구/군별로 Day에 균등 배분 (같은 구/군은 같은 날 몰기)
    const guGroups = Object.values(byGu)
    const days = duration.days
    const items = []
    let currentDay = 1

    guGroups.forEach(group => {
      // 이 구/군의 장소들은 같은 날(들)에 배치
      group.forEach((p, i) => {
        items.push({
          placeId: p.id,
          dayNumber: Math.min(currentDay, days),
          sortOrder: items.length,
        })
        // 하루에 너무 많이 몰리면 다음 날로
        const dayCount = items.filter(it => it.dayNumber === currentDay).length
        if (dayCount >= Math.ceil(scored.length / days) && currentDay < days) {
          currentDay++
        }
      })
      // 구/군 바뀌면 다음 날 고려
      if (currentDay < days) currentDay++
    })

    // day 범위 초과 방지
    return items.map(it => ({ ...it, dayNumber: Math.min(it.dayNumber, days) }))
  }

  const handleComplete = () => {
    const items = buildRoute()
    const name = routeName.trim() || `${regions.join('·')} ${duration.label}`
    onComplete({
      name,
      groupId: groupId ? Number(groupId) : null,
      regions,
      companion,
      styles,
      duration,
      items,
    })
  }

  const totalSteps = 4

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="modal-handle" />

        {/* 헤더 */}
        <div style={{ padding: '8px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button onClick={step > 1 ? () => setStep(s => s - 1) : onClose}
              style={{ fontSize: 20, color: 'var(--text-sub)', padding: '4px' }}>
              {step > 1 ? '←' : '✕'}
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} style={{
                  height: 4, borderRadius: 2, transition: 'all 0.3s',
                  width: i < step ? 24 : 8,
                  background: i < step ? 'var(--primary)' : 'var(--border)',
                }} />
              ))}
            </div>
            <div style={{ width: 28 }} />
          </div>
        </div>

        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Step 1: 지역 */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>어디로 떠나요? 🗺️</p>
              <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>복수 선택 가능해요</p>
              {regionOptions.length === 0 ? (
                <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>등록된 장소가 없어요. 먼저 장소를 추가해주세요!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {regionOptions.map(({ sido, gus }) => (
                    <div key={sido}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10 }}>{sido}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {gus.map(gu => (
                          <button key={gu} onClick={() => toggleRegion(gu)} style={{
                            padding: '10px 16px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                            border: `2px solid ${regions.includes(gu) ? 'var(--primary)' : 'var(--border)'}`,
                            background: regions.includes(gu) ? 'var(--primary)' : 'var(--surface)',
                            color: regions.includes(gu) ? 'white' : 'var(--text)',
                            transition: 'all 0.15s',
                          }}>{gu}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

              <div className="form-group">
                <label className="form-label">루트 이름 (선택)</label>
                <input
                  className="form-input"
                  placeholder={`예: ${regions.join('·')} ${duration?.label || '여행'}`}
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                />
              </div>
              {groups.length > 0 && (
                <div className="form-group">
                  <label className="form-label">그룹 공유 (선택)</label>
                  <select className="form-input" value={groupId} onChange={e => setGroupId(e.target.value)}>
                    <option value="">선택 안 함</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.cover} {g.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div style={{ padding: '12px 20px 20px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
          {step < totalSteps ? (
            <button
              className="btn-primary"
              disabled={!canNext()}
              onClick={() => setStep(s => s + 1)}
            >
              다음 →
            </button>
          ) : (
            <button
              className="btn-primary"
              disabled={!canNext()}
              onClick={handleComplete}
            >
              루트 추천받기 🎯
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
