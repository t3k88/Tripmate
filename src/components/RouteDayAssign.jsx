import { useState, useMemo } from 'react'

export default function RouteDayAssign({ selectedPlaces, onBack, onComplete }) {
  const [numDays, setNumDays] = useState(1)
  const [dayMap, setDayMap] = useState(() =>
    Object.fromEntries(selectedPlaces.map(p => [p.id, 1]))
  )

  const setDay = (placeId, day) => {
    setDayMap(prev => ({ ...prev, [placeId]: Math.max(1, Math.min(numDays, day)) }))
  }

  const clampedDayMap = useMemo(() => {
    const result = {}
    for (const [id, day] of Object.entries(dayMap)) {
      result[id] = Math.min(day, numDays)
    }
    return result
  }, [dayMap, numDays])

  const groupedByDay = useMemo(() => {
    const groups = {}
    for (let d = 1; d <= numDays; d++) groups[d] = []
    selectedPlaces.forEach(p => {
      const day = clampedDayMap[p.id] || 1
      groups[day].push(p)
    })
    return groups
  }, [selectedPlaces, clampedDayMap, numDays])

  const handleComplete = () => {
    const items = selectedPlaces.map((p, i) => ({
      placeId: p.id,
      dayNumber: clampedDayMap[p.id] || 1,
      sortOrder: i,
    }))
    onComplete(items)
  }

  const durationLabel = numDays === 1 ? '당일치기' : `${numDays - 1}박 ${numDays}일`

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* 헤더 */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ fontSize: 20, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>←</button>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>날짜 배분</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 100px' }}>
        {/* 기간 스테퍼 */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>여행 기간</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setNumDays(d => Math.max(1, d - 1))}
              style={stepperBtn(numDays > 1)}
            >−</button>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', minWidth: 72, textAlign: 'center' }}>
              {durationLabel}
            </span>
            <button
              onClick={() => setNumDays(d => Math.min(14, d + 1))}
              style={stepperBtn(numDays < 14)}
            >+</button>
          </div>
        </div>

        {/* 장소 리스트 + DAY 스테퍼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {selectedPlaces.map((place, i) => {
            const day = clampedDayMap[place.id] || 1
            return (
              <div key={place.id} style={{
                background: 'var(--surface)', borderRadius: 14,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={numBadge}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{place.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setDay(place.id, day - 1)}
                    disabled={day <= 1}
                    style={dayBtn(day > 1)}
                  >‹</button>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', minWidth: 44, textAlign: 'center' }}>
                    DAY {day}
                  </span>
                  <button
                    onClick={() => setDay(place.id, day + 1)}
                    disabled={day >= numDays}
                    style={dayBtn(day < numDays)}
                  >›</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* DAY별 미리보기 */}
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 10, letterSpacing: '0.5px' }}>미리보기</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(groupedByDay).map(([day, ps]) => (
            <div key={day} style={{ background: 'var(--surface)', borderRadius: 14, padding: '12px 16px' }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginBottom: ps.length > 0 ? 6 : 0 }}>
                DAY {day}
              </p>
              {ps.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>장소 없음</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {ps.map(p => (
                    <p key={p.id} style={{ fontSize: 13, color: 'var(--text)' }}>• {p.name}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 완료 버튼 */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 28px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <button className="btn-primary" onClick={handleComplete}>
          루트 완성 🎉
        </button>
      </div>
    </div>
  )
}

const numBadge = {
  width: 26, height: 26, borderRadius: '50%',
  background: 'var(--primary)', color: 'white',
  fontSize: 12, fontWeight: 800, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const stepperBtn = (enabled) => ({
  width: 32, height: 32, borderRadius: '50%',
  background: 'var(--bg)', border: '1.5px solid var(--border)',
  fontSize: 18, cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center',
})

const dayBtn = (enabled) => ({
  width: 28, height: 28, borderRadius: '50%',
  background: 'var(--bg)', border: '1.5px solid var(--border)',
  fontSize: 16, cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center',
})
