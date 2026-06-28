import { useState } from 'react'
import RouteMapPicker from './RouteMapPicker'
import RouteDayAssign from './RouteDayAssign'

export default function ManualRouteCreate({ places, groups, onClose, onComplete }) {
  const [step, setStep] = useState('name') // 'name' | 'map' | 'days'
  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState(null)
  const [selectedPlaces, setSelectedPlaces] = useState([])

  if (step === 'map') {
    return (
      <RouteMapPicker
        places={places}
        onBack={() => setStep('name')}
        onComplete={(picked) => { setSelectedPlaces(picked); setStep('days') }}
      />
    )
  }

  if (step === 'days') {
    return (
      <RouteDayAssign
        selectedPlaces={selectedPlaces}
        onBack={() => setStep('map')}
        onComplete={(items) => onComplete({ name, groupId, items })}
      />
    )
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="modal-handle" />

        <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button onClick={onClose} style={{ fontSize: 20, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          <p style={{ fontSize: 18, fontWeight: 800 }}>직접 루트 만들기</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div className="form-group">
            <label className="form-label">루트 이름</label>
            <input
              className="form-input"
              placeholder="예: 제주 3박 여행"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {groups.length > 0 && (
            <div className="form-group">
              <label className="form-label">그룹 공유 (선택)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groups.map(g => (
                  <button key={g.id}
                    onClick={() => setGroupId(prev => prev === g.id ? null : g.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                      border: `1.5px solid ${groupId === g.id ? 'var(--primary)' : 'var(--border)'}`,
                      background: groupId === g.id ? 'var(--primary-bg)' : 'var(--surface)',
                    }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{g.cover}</span>
                      <span>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{g.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>멤버 {g.members.length}명</p>
                      </span>
                    </span>
                    {groupId === g.id && <span style={{ color: 'var(--primary)', fontSize: 16 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn-primary"
            disabled={!name.trim()}
            onClick={() => setStep('map')}
          >
            지도에서 장소 선택 →
          </button>
        </div>
      </div>
    </div>
  )
}
