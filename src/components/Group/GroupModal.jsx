import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const COVERS = ['🏝️', '🏔️', '🌊', '🌸', '🍜', '🍺', '🎡', '✈️', '🚂', '🏕️', '🌅', '🗺️']

export default function GroupModal() {
  const { setShowGroupModal, groups, addGroup, deleteGroup, removeMember, selectedGroup } = useApp()
  const [view, setView] = useState(selectedGroup ? 'manage' : 'create')
  const [managingGroup, setManagingGroup] = useState(selectedGroup)

  const handleClose = () => setShowGroupModal(false)

  if (view === 'create') {
    return <CreateGroupView onClose={handleClose} onCreated={(group) => { setManagingGroup(group); setView('manage') }} addGroup={addGroup} />
  }

  return <ManageGroupView group={managingGroup} onClose={handleClose} groups={groups} deleteGroup={deleteGroup} removeMember={removeMember} />
}

function CreateGroupView({ onClose, onCreated, addGroup }) {
  const [name, setName] = useState('')
  const [cover, setCover] = useState('✈️')

  const handleCreate = async () => {
    if (!name.trim()) return
    const newGroup = await addGroup({ name: name.trim(), cover })
    if (newGroup) onCreated(newGroup)
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

const KAKAO_JS_KEY = '133c1dcabbefac66f726ff7b63a16179'

function ManageGroupView({ group, onClose, groups, deleteGroup, removeMember }) {
  const [inviteMsg, setInviteMsg] = useState('')
  const [tab, setTab] = useState('members')

  const currentGroup = groups.find(g => g.id === group.id) || group

  const handleShare = async () => {
    const inviteUrl = `${window.location.origin}/?join=${currentGroup.id.toString(36)}`
    const text = `${currentGroup.cover} ${currentGroup.name}\n초대코드: ${currentGroup.inviteCode}\n\nTripMate에서 함께 여행 기록해요!\n${inviteUrl}`

    if (navigator.share) {
      try {
        await navigator.share({ title: `TripMate - ${currentGroup.name}`, text })
        return
      } catch (e) {
        if (e.name === 'AbortError') return
      }
    }

    // fallback: 클립보드 복사
    await navigator.clipboard?.writeText(text)
    setInviteMsg('✓ 초대 메시지가 복사됐어요! 카카오톡에 붙여넣기 하세요.')
    setTimeout(() => setInviteMsg(''), 3000)
  }

  const handleRemove = (memberId, memberName) => {
    if (!window.confirm(`${memberName}님을 그룹에서 내보낼까요?`)) return
    removeMember(currentGroup.id, memberId)
  }

  const handleDeleteGroup = async () => {
    await deleteGroup(currentGroup.id)
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
                        onClick={() => handleRemove(member.id, member.name)}
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
              <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>카카오톡으로 초대 링크를 보낼 수 있어요</p>
            </div>

            <button
              onClick={handleShare}
              style={{
                width: '100%',
                padding: '13px',
                background: '#FEE500',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontWeight: 700,
                color: '#3A1D1D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginBottom: 20,
              }}
            >
              📤 초대 메시지 공유하기
            </button>

            {/* Invite link */}
            {/* 초대코드 강조 표시 */}
            <div style={{ background: 'var(--primary-bg)', borderRadius: 14, padding: '16px', marginBottom: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>초대코드</p>
              <div
                onClick={() => {
                  navigator.clipboard?.writeText(currentGroup.inviteCode)
                  setInviteMsg('✓ 코드가 복사됐어요!')
                  setTimeout(() => setInviteMsg(''), 2000)
                }}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderRadius: 10, background: 'white', margin: '0 auto 4px' }}
              >
                <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', letterSpacing: '6px' }}>
                  {currentGroup.inviteCode}
                </span>
                <span style={{ fontSize: 16 }}>📋</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--primary)', opacity: 0.7 }}>탭해서 복사</p>
            </div>

            <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 6 }}>초대 링크</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}>
                  {window.location.origin}/?join={currentGroup.id.toString(36)}
                </p>
                <button
                  style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 600, flexShrink: 0 }}
                  onClick={() => {
                    navigator.clipboard?.writeText(`${window.location.origin}/?join=${currentGroup.id.toString(36)}`)
                    setInviteMsg('✓ 링크가 복사됐어요!')
                    setTimeout(() => setInviteMsg(''), 2000)
                  }}
                >복사</button>
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
