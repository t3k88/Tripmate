import { useState, useMemo } from 'react'
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
  const { username, places, updatePlace } = useApp()
  const [inviteMsg, setInviteMsg] = useState('')
  const [tab, setTab] = useState('members')
  const [showShareBox, setShowShareBox] = useState(false)
  const [selectedPlaceIds, setSelectedPlaceIds] = useState([])
  const [saving, setSaving] = useState(false)

  const currentGroup = groups.find(g => g.id === group.id) || group
  const isOwner = currentGroup.createdBy === username || (!currentGroup.createdBy && currentGroup.members.some(m => m.name === username))

  // 내 장소 중 이 그룹에 아직 안 들어간 것
  const myPlaces = useMemo(() =>
    places.filter(p => p.author === username),
    [places, username]
  )
  const notInGroup = useMemo(() =>
    myPlaces.filter(p => !(p.groupIds || []).includes(currentGroup.id)),
    [myPlaces, currentGroup.id]
  )

  const togglePlace = (id) =>
    setSelectedPlaceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleBulkAdd = async () => {
    setSaving(true)
    await Promise.all(selectedPlaceIds.map(id => {
      const place = places.find(p => p.id === id)
      const newGroupIds = [...new Set([...(place.groupIds || []), currentGroup.id])]
      return updatePlace(id, { groupIds: newGroupIds })
    }))
    setSelectedPlaceIds([])
    setSaving(false)
  }

  const inviteUrl = `${window.location.origin}/?join=${currentGroup.id.toString(36)}`
  const shareText = `${currentGroup.cover} ${currentGroup.name}\n초대코드: ${currentGroup.inviteCode}\n\nTripMate에서 함께 여행 기록해요!\n${inviteUrl}`

  const handleShare = () => {
    if (window.Kakao?.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: shareText,
        link: { mobileWebUrl: inviteUrl, webUrl: inviteUrl },
      })
      return
    }
    setShowShareBox(true)
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
          {[['members', '멤버 관리'], ['places', '장소 추가'], ['invite', '초대하기']].map(([id, label]) => (
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
              {currentGroup.members.map(member => {
                const isMe = member.name === username
                return (
                  <div key={member.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: isMe ? 'var(--primary-bg)' : 'var(--bg)',
                    borderRadius: 'var(--radius-sm)',
                    border: isMe ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                  }}>
                    <div className="avatar" style={{ fontSize: 20 }}>{member.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>
                        {member.name}
                        {isMe && <span style={{ fontSize: 11, color: 'var(--primary)', marginLeft: 6 }}>나</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {member.name === currentGroup.createdBy ? (
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: 'var(--primary)', background: 'white',
                          padding: '2px 8px', borderRadius: 10,
                        }}>방장</span>
                      ) : isOwner && !isMe ? (
                        <button
                          onClick={() => handleRemove(member.id, member.name)}
                          style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, padding: '2px 6px' }}
                        >
                          내보내기
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>

            {isOwner && (
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
            )}
          </div>
        )}

        {tab === 'places' && (
          <div className="form-section" style={{ paddingBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>
                {notInGroup.length === 0 ? '추가할 장소가 없어요' : `${notInGroup.length}개 장소`}
              </p>
              {notInGroup.length > 0 && (
                <button
                  onClick={() => setSelectedPlaceIds(
                    selectedPlaceIds.length === notInGroup.length ? [] : notInGroup.map(p => p.id)
                  )}
                  style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}
                >
                  {selectedPlaceIds.length === notInGroup.length ? '전체 해제' : '전체 선택'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {notInGroup.map(place => {
                const selected = selectedPlaceIds.includes(place.id)
                return (
                  <button
                    key={place.id}
                    onClick={() => togglePlace(place.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                      border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
                      background: selected ? 'var(--primary-bg)' : 'var(--surface)',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: selected ? 'none' : '2px solid var(--border)',
                      background: selected ? 'var(--primary)' : 'white',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>{selected && '✓'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--primary)' : 'var(--text)' }}>{place.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.address}</p>
                    </div>
                  </button>
                )
              })}
              {notInGroup.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-sub)', textAlign: 'center', padding: '20px 0' }}>
                  내 장소가 모두 이 그룹에 포함돼 있어요 ✓
                </p>
              )}
            </div>

            {selectedPlaceIds.length > 0 && (
              <button
                className="btn-primary"
                onClick={handleBulkAdd}
                disabled={saving}
              >
                {saving ? '추가 중...' : `선택한 장소 ${selectedPlaceIds.length}개 그룹에 추가`}
              </button>
            )}
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
            {/* 공유 메시지 박스 */}
            {showShareBox && (
              <div style={{ background: 'var(--bg)', borderRadius: 14, padding: 16, marginBottom: 16, border: '1.5px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>초대 메시지 복사하기</p>
                  <button onClick={() => setShowShareBox(false)} style={{ fontSize: 16, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
                <textarea
                  readOnly
                  value={shareText}
                  onFocus={e => e.target.select()}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1px solid var(--border)', background: 'white',
                    fontSize: 13, lineHeight: 1.7, color: 'var(--text)',
                    resize: 'none', minHeight: 100, boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(shareText)
                    setInviteMsg('✓ 복사됐어요! 카카오톡에 붙여넣기 하세요.')
                    setShowShareBox(false)
                    setTimeout(() => setInviteMsg(''), 3000)
                  }}
                  style={{
                    marginTop: 8, width: '100%', padding: '10px',
                    background: 'var(--primary)', color: 'white',
                    borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none',
                  }}
                >📋 전체 복사</button>
              </div>
            )}

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
