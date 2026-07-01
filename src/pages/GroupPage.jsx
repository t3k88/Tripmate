import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function GroupPage() {
  const { groups, setShowGroupModal, setSelectedGroup, places, joinGroupByCode } = useApp()
  const [codeInput, setCodeInput] = useState('')
  const [codeMsg, setCodeMsg] = useState('')
  const [joining, setJoining] = useState(false)

  const handleJoinByCode = async () => {
    if (!codeInput.trim()) return
    setJoining(true)
    setCodeMsg('')
    const result = await joinGroupByCode(codeInput.trim())
    if (result.error) setCodeMsg(result.error)
    else { setCodeMsg(`🎉 "${result.groupName}" 그룹에 참여했어요!`); setCodeInput('') }
    setJoining(false)
  }

  const handleOpenGroup = (group) => {
    setSelectedGroup(group)
    setShowGroupModal(true)
  }

  return (
    <>
      <div className="header">
        <span className="header-title">그룹</span>
        <button className="header-action" onClick={() => { setSelectedGroup(null); setShowGroupModal(true) }}>+</button>
      </div>

      <div style={{ padding: '16px 16px 80px' }}>
        {/* 초대코드 입력 */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px', marginBottom: 20, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔑 초대코드로 그룹 참여</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder="6자리 코드 입력"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoinByCode()}
              maxLength={6}
              style={{ flex: 1, letterSpacing: '3px', fontWeight: 700, fontSize: 16 }}
            />
            <button
              onClick={handleJoinByCode}
              disabled={joining || codeInput.length < 6}
              style={{
                padding: '0 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                background: codeInput.length >= 6 ? 'var(--primary)' : 'var(--border)',
                color: codeInput.length >= 6 ? 'white' : 'var(--text-sub)',
                flexShrink: 0,
              }}
            >{joining ? '...' : '참여'}</button>
          </div>
          {codeMsg && <p style={{ fontSize: 13, marginTop: 8, color: codeMsg.startsWith('🎉') ? '#2E7D32' : '#E05252', fontWeight: 600 }}>{codeMsg}</p>}
        </div>

        {groups.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <p className="empty-text">아직 그룹이 없어요.<br />친구들과 여행 그룹을 만들어보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {groups.map(group => {
              const groupPlaces = places.filter(p => p.groupIds?.includes(group.id))
              return (
                <button
                  key={group.id}
                  className="card"
                  style={{ padding: 16, textAlign: 'left', width: '100%', cursor: 'pointer' }}
                  onClick={() => handleOpenGroup(group)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 48, height: 48,
                      borderRadius: 14,
                      background: 'var(--primary-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                    }}>
                      {group.cover}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{group.name}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                        멤버 {group.members.length}명 · 장소 {groupPlaces.length}개
                      </p>
                    </div>
                  </div>

                  {/* Member avatars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: -4 }}>
                    <div style={{ display: 'flex' }}>
                      {group.members.slice(0, 4).map((m, i) => (
                        <div
                          key={m.id}
                          style={{
                            width: 28, height: 28,
                            borderRadius: '50%',
                            background: 'var(--primary-bg)',
                            border: '2px solid white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14,
                            marginLeft: i > 0 ? -8 : 0,
                          }}
                          title={m.name}
                        >
                          {m.avatar}
                        </div>
                      ))}
                    </div>
                    {group.members.length > 4 && (
                      <span style={{ fontSize: 11, color: 'var(--text-sub)', marginLeft: 4 }}>
                        +{group.members.length - 4}
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                      관리하기 →
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <button
          style={{
            width: '100%',
            padding: 16,
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-sub)',
            fontSize: 14,
            fontWeight: 600,
            marginTop: 8,
            background: 'transparent',
          }}
          onClick={() => { setSelectedGroup(null); setShowGroupModal(true) }}
        >
          + 새 그룹 만들기
        </button>
      </div>
    </>
  )
}
