import { useState } from 'react'

export default function ManualRouteCreate({ groups, onClose, onComplete }) {
  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState(null)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="modal-handle" />

        <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button onClick={onClose} style={{ fontSize: 20, color: 'var(--text-sub)' }}>✕</button>
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
            onClick={() => onComplete({ name: name.trim(), groupId })}
          >
            루트 만들기
          </button>
        </div>
      </div>
    </div>
  )
}
