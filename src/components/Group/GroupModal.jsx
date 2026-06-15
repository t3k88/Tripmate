import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const COVERS = ['🏝️', '🏔️', '🌊', '🌸', '🍜', '🍺', '🎡', '✈️', '🚂', '🏕️', '🌅', '🗺️']

export default function GroupModal() {
  const { setShowGroupModal, groups, setGroups, selectedGroup } = useApp()
  const [view, setView] = useState(selectedGroup ? 'manage' : 'create')
  const [managingGroup, setManagingGroup] = useState(selectedGroup)

  const handleClose = () => setShowGroupModal(false)

  if (view === 'create') {
    return <CreateGroupView onClose={handleClose} onCreated={(group) => { setManagingGroup(group); setView('manage') }} groups={groups} setGroups={setGroups} />
  }

  return <ManageGroupView group={managingGroup} onClose={handleClose} groups={groups} setGroups={setGroups} />
}

function CreateGroupView({ onClose, onCreated, groups, setGroups }) {
  const [name, setName] = useState('')
  const [cover, setCover] = useState('✈️')

  const handleCreate = () => {
    if (!name.trim()) return
    const newGroup = {
      id: Date.now(),
      name: name.trim(),
      cover,
      members: [{ id: 1, name: '나', email: 'taeeun.kang88@gmail.com', role: 'owner', avatar: '🧡' }],
    }
    setGroups(gs => [...gs, newGroup])
    onCreated(newGroup)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <span className="modal-title">새 그룹 만들기</span>
          <div style={{ width: 28 }} />
        </div>

        <div className="form-section" style={{ paddingBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>그룹을 만들어보세요!</p>
            <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>친구들과 여행 기록을 함께 나눠요</p>
          </div>

          <div className="form-group">
            <label className="form-label">그룹 아이콘</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {COVERS.map(c => (
                <button
                  key={c}
                  onClick={() => setCover(c)}
                  style={{
                    padding: '8px 4px',
                    fontSize: 24,
                    borderRadius: 10,
                    border: cover === c ? '2px solid var(--primary)' : '2px solid transparent',
                    background: cover === c ? 'var(--primary-bg)' : 'var(--bg)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">그룹 이름</label>
            <input
              className="form-input"
              placeholder="예: 제주도 여행단"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          <div style={{
            padding: '12px 14px',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 44, height: 44,
              borderRadius: 12,
              background: 'var(--primary-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}>
              {cover}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700 }}>{name || '그룹 이름'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>멤버 1명 · 방금 만들어짐</p>
            </div>
          </div>

          <button className="btn-primary" disabled={!name.trim()} onClick={handleCreate}>
            그룹 만들기
          </button>
        </div>
      </div>
    </div>
  )
}

function ManageGroupView({ group, onClose, groups, setGroups }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')
  const [tab, setTab] = useState('members')

  const currentGroup = groups.find(g => g.id === group.id) || group

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(inviteEmail)) {
      setInviteMsg('올바른 이메일 주소를 입력해주세요.')
      return
    }
    if (currentGroup.members.some(m => m.email === inviteEmail)) {
      setInviteMsg('이미 그룹에 있는 멤버예요.')
      return
    }

    const EMOJIS = ['💙', '💚', '💜', '🧡', '❤️', '🤍', '💛']
    const newMember = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: 'member',
      avatar: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }

    setGroups(gs => gs.map(g => g.id === currentGroup.id
      ? { ...g, members: [...g.members, newMember] }
      : g
    ))
    setInviteEmail('')
    setInviteMsg(`✓ ${inviteEmail}에 초대를 보냈어요!`)
    setTimeout(() => setInviteMsg(''), 3000)
  }

  const handleRemove = (memberId) => {
    setGroups(gs => gs.map(g => g.id === currentGroup.id
      ? { ...g, members: g.members.filter(m => m.id !== memberId) }
      : g
    ))
  }

  const handleDeleteGroup = () => {
    setGroups(gs => gs.filter(g => g.id !== currentGroup.id))
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <span className="modal-title">{currentGroup.cover} {currentGroup.name}</span>
          <div style={{ width: 28 }} />
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', margin: '0 20px 16px', background: 'var(--bg)', borderRadius: 10, padding: 3 }}>
          {[['members', '멤버 관리'], ['invite', '초대하기']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: tab === id ? 'var(--surface)' : 'transparent',
                color: tab === id ? 'var(--primary)' : 'var(--text-sub)',
                boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'members' && (
          <div className="form-section" style={{ paddingBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 12 }}>
              총 {currentGroup.members.length}명의 멤버
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {currentGroup.members.map(member => (
                <div key={member.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div className="avatar" style={{ fontSize: 20 }}>{member.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{member.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{member.email}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {member.role === 'owner' ? (
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: 'var(--primary)', background: 'var(--primary-bg)',
                        padding: '2px 8px', borderRadius: 10,
                      }}>방장</span>
                    ) : (
                      <button
                        onClick={() => handleRemove(member.id)}
                        style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, padding: '2px 6px' }}
                      >
                        내보내기
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleDeleteGroup}
              style={{
                width: '100%',
                padding: 14,
                border: '1.5px solid #E05252',
                borderRadius: 'var(--radius-md)',
                color: '#E05252',
                fontSize: 14,
                fontWeight: 600,
                background: 'transparent',
              }}
            >
              그룹 삭제
            </button>
          </div>
        )}

        {tab === 'invite' && (
          <div className="form-section" style={{ paddingBottom: 24 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔗</div>
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>친구를 초대해요</p>
              <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>이메일로 초대 링크를 보낼 수 있어요</p>
            </div>

            <div className="form-group">
              <label className="form-label">이메일 주소</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); setInviteMsg('') }}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                />
                <button
                  onClick={handleInvite}
                  style={{
                    padding: '0 16px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  초대
                </button>
              </div>
              {inviteMsg && (
                <p style={{
                  marginTop: 8, fontSize: 13,
                  color: inviteMsg.startsWith('✓') ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 600,
                }}>
                  {inviteMsg}
                </p>
              )}
            </div>

            {/* Invite link */}
            <div style={{
              padding: 14,
              background: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 6 }}>초대 링크</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}>
                  tripmate://join/{currentGroup.id.toString(36)}
                </p>
                <button
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'var(--primary)',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                  onClick={() => {
                    navigator.clipboard?.writeText(`tripmate://join/${currentGroup.id.toString(36)}`)
                    setInviteMsg('✓ 링크가 복사됐어요!')
                    setTimeout(() => setInviteMsg(''), 2000)
                  }}
                >
                  복사
                </button>
              </div>
            </div>

            <div style={{
              padding: '12px 14px',
              background: 'var(--primary-bg)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              gap: 8,
            }}>
              <span>ℹ️</span>
              <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
                초대받은 친구는 링크를 클릭하거나 이메일 확인 후 그룹에 참여할 수 있어요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
