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
  const [region, setRegion] = useState('')
  const [companion, setCompanion] = useState('')
  const [styles, setStyles] = useState([])
  const [duration, setDuration] = useState(null)
  const [routeName, setRouteName] = useState('')
  const [groupId, setGroupId] = useState('')

  const regionOptions = useMemo(() => {
    const set = new Set(
      places.map(p => {
        const levels = getAddressLevels(p.address)
        return levels[1] ? `${levels[0]} ${levels[1]}` : levels[0]
      }).filter(Boolean)
    )
    return Array.from(set).sort()
  }, [places])

  const toggleStyle = (id) =>
    setStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const canNext = () => {
    if (step === 1) return !!region
    if (step === 2) return !!duration
    if (step === 3) return !!companion
    if (step === 4) return styles.length > 0
    return false
  }

  const buildRoute = () => {
    const selectedCategories = styles.flatMap(s => STYLES.find(st => st.id === s)?.categories || [])

    // 지역 필터
    const regionFiltered = places.filter(p => {
      const levels = getAddressLevels(p.address)
      const placeRegion = levels[1] ? `${levels[0]} ${levels[1]}` : levels[0]
      return placeRegion === region
    })

    // 스타일 필터 (해당 카테고리 우선 + 나머지)
    const matched = regionFiltered.filter(p => selectedCategories.includes(p.category))
    const others = regionFiltered.filter(p => !selectedCategories.includes(p.category))
    const sorted = [...matched, ...others]

    // Day별 배분 (duration.days 기준으로 균등 분배)
    const perDay = Math.ceil(sorted.length / duration.days)
    const items = sorted.map((p, i) => ({
      placeId: p.id,
      dayNumber: Math.min(Math.floor(i / perDay) + 1, duration.days),
      sortOrder: i % perDay,
    }))

    return items
  }

  const handleComplete = () => {
    const items = buildRoute()
    const name = routeName.trim() || `${region} ${duration.label}`
    onComplete({
      name,
      groupId: groupId ? Number(groupId) : null,
      region,
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
              <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 24 }}>등록된 장소가 있는 지역이에요</p>
              {regionOptions.length === 0 ? (
                <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>등록된 장소가 없어요. 먼저 장소를 추가해주세요!</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {regionOptions.map(r => (
                    <button key={r} onClick={() => setRegion(r)} style={{
                      padding: '12px 18px', borderRadius: 14, fontSize: 14, fontWeight: 600,
                      border: `2px solid ${region === r ? 'var(--primary)' : 'var(--border)'}`,
                      background: region === r ? 'var(--primary)' : 'var(--surface)',
                      color: region === r ? 'white' : 'var(--text)',
                      transition: 'all 0.15s',
                    }}>{r}</button>
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
                  placeholder={`예: ${region} ${duration?.label || '여행'}`}
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
