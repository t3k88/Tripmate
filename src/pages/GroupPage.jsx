import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { getCategoryInfo } from '../utils/helpers'
import PlaceDetailModal from '../components/PlaceDetailModal'
import AppPortal from '../components/AppPortal'

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

export default function GroupPage() {
  const { groups, setShowGroupModal, setSelectedGroup, places, joinGroupByCode,
    username, userId, toggleLike, toggleDislike, addComment, deleteComment,
    deletePlace, setEditingPlace, setShowPlaceModal } = useApp()

  const isDesktop = useIsDesktop()

  const [codeInput, setCodeInput] = useState('')
  const [codeMsg, setCodeMsg] = useState('')
  const [joining, setJoining] = useState(false)
  const [showMyInfo, setShowMyInfo] = useState(false)
  const [codeCopied, setCodeCopied] = useState(null)
  const [popupGroupId, setPopupGroupId] = useState(null)
  const [groupTab, setGroupTab] = useState('places')
  const [detailPlace, setDetailPlace] = useState(null)

  const popupGroup = groups.find(g => g.id === popupGroupId)
  const groupPlacesList = popupGroup ? places.filter(p => (p.groupIds || []).includes(popupGroupId)) : []

  const getGroupNames = (groupIds) =>
    (groupIds || []).map(id => groups.find(g => g.id === id)?.name).filter(Boolean)

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCodeCopied(key)
      setTimeout(() => setCodeCopied(null), 2000)
    })
  }

  const openPopup = (group) => {
    setPopupGroupId(group.id)
    setGroupTab('places')
  }

  const closePopup = () => {
    setPopupGroupId(null)
    setDetailPlace(null)
  }

  const handleJoinByCode = async () => {
    if (!codeInput.trim()) return
    setJoining(true)
    setCodeMsg('')
    const result = await joinGroupByCode(codeInput.trim())
    if (result.error) setCodeMsg(result.error)
    else { setCodeMsg(`🎉 "${result.groupName}" 그룹에 참여했어요!`); setCodeInput('') }
    setJoining(false)
  }

  const drawerContent = popupGroup ? (
    <DrawerContent
      group={popupGroup}
      groupPlacesList={groupPlacesList}
      groupTab={groupTab}
      setGroupTab={setGroupTab}
      setDetailPlace={setDetailPlace}
      copyText={copyText}
      codeCopied={codeCopied}
      setSelectedGroup={setSelectedGroup}
      setShowGroupModal={setShowGroupModal}
      onClose={closePopup}
    />
  ) : null

  return (
    <>
      <div className="header">
        <span className="header-title">그룹</span>
        <button className="header-action" onClick={() => { setSelectedGroup(null); setShowGroupModal(true) }}>+</button>
      </div>

      <div style={{ position: 'relative', display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        {/* 그룹 목록 */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 16px 80px',
          transition: 'filter 0.2s',
          filter: isDesktop && popupGroup ? 'none' : 'none',
        }}>
          {/* 내 정보 */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--border)' }}>
            <button onClick={() => setShowMyInfo(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>👤</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 15, fontWeight: 700 }}>{username}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>내 정보 {showMyInfo ? '▲' : '▼'}</p>
                </div>
              </div>
            </button>
            {showMyInfo && (
              <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <p style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 6, fontWeight: 600 }}>🔑 복구코드</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#F5F5F5', borderRadius: 8, padding: '8px 10px', fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', color: '#555' }}>
                    {userId}
                  </div>
                  <button onClick={() => copyText(userId, 'uid')}
                    style={{ flexShrink: 0, padding: '8px 12px', background: codeCopied === 'uid' ? '#4CAF50' : 'var(--primary)', color: 'white', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    {codeCopied === 'uid' ? '✓' : '복사'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 초대코드 입력 */}
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px', marginBottom: 20, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔑 초대코드로 그룹 참여</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="6자리 코드 입력"
                value={codeInput} onChange={e => setCodeInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoinByCode()} maxLength={6}
                style={{ flex: 1, letterSpacing: '3px', fontWeight: 700, fontSize: 16 }} />
              <button onClick={handleJoinByCode} disabled={joining || codeInput.length < 6}
                style={{ padding: '0 20px', borderRadius: 10, fontWeight: 700, fontSize: 14,
                  background: codeInput.length >= 6 ? 'var(--primary)' : 'var(--border)',
                  color: codeInput.length >= 6 ? 'white' : 'var(--text-sub)', flexShrink: 0 }}>
                {joining ? '...' : '참여'}
              </button>
            </div>
            {codeMsg && <p style={{ fontSize: 13, marginTop: 8, color: codeMsg.startsWith('🎉') ? '#2E7D32' : '#E05252', fontWeight: 600 }}>{codeMsg}</p>}
          </div>

          {/* 그룹 목록 */}
          {groups.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p className="empty-text">아직 그룹이 없어요.<br />친구들과 여행 그룹을 만들어보세요!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {groups.map(group => {
                const gPlaces = places.filter(p => p.groupIds?.includes(group.id))
                const isActive = popupGroupId === group.id
                return (
                  <button key={group.id} className="card"
                    onClick={() => isActive ? closePopup() : openPopup(group)}
                    style={{ padding: 16, textAlign: 'left', width: '100%',
                      border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isActive ? 'var(--primary-bg)' : 'var(--surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                        {group.cover}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{group.name}</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>멤버 {group.members.length}명 · 장소 {gPlaces.length}개</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={e => { e.stopPropagation(); setSelectedGroup(group); setShowGroupModal(true) }}
                          style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600, padding: '5px 10px',
                            background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
                          관리
                        </button>
                        <span style={{ fontSize: 16, color: isActive ? 'var(--primary)' : 'var(--text-sub)' }}>
                          {isActive ? '←' : '›'}
                        </span>
                      </div>
                    </div>
                    {/* 멤버 아바타 */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                      {group.members.slice(0, 5).map((m, i) => (
                        <div key={m.id} style={{
                          width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-bg)',
                          border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, marginLeft: i > 0 ? -6 : 0,
                        }}>{m.avatar}</div>
                      ))}
                      {group.members.length > 5 && <span style={{ fontSize: 11, color: 'var(--text-sub)', marginLeft: 6 }}>+{group.members.length - 5}</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <button style={{ width: '100%', padding: 16, border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-sub)', fontSize: 14, fontWeight: 600, marginTop: 8, background: 'transparent' }}
            onClick={() => { setSelectedGroup(null); setShowGroupModal(true) }}>
            + 새 그룹 만들기
          </button>
        </div>

        {/* 데스크톱: 오른쪽 드로어 */}
        {isDesktop && (
          <div style={{
            width: popupGroup ? 400 : 0,
            minWidth: 0,
            overflow: 'hidden',
            transition: 'width 0.25s ease',
            borderLeft: popupGroup ? '1px solid var(--border)' : 'none',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {popupGroup && (
              <div style={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {drawerContent}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 모바일: 바텀시트 */}
      {!isDesktop && popupGroup && (
        <AppPortal>
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closePopup()}>
            <div className="modal-sheet" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-handle" />
              {drawerContent}
            </div>
          </div>
        </AppPortal>
      )}

      {/* 장소 상세 */}
      {detailPlace && (
        <AppPortal>
          <PlaceDetailModal
            place={detailPlace}
            groupNames={getGroupNames(detailPlace.groupIds)}
            isOwner={detailPlace.author === username}
            username={username}
            onClose={() => setDetailPlace(null)}
            onEdit={() => { setDetailPlace(null); setEditingPlace(detailPlace); setShowPlaceModal(true) }}
            onDelete={async () => { if (window.confirm('이 장소를 삭제할까요?')) { await deletePlace(detailPlace.id); setDetailPlace(null) } }}
            onLike={() => toggleLike(detailPlace.id)}
            onDislike={() => toggleDislike(detailPlace.id)}
            onComment={text => addComment(detailPlace.id, text)}
            onDeleteComment={cid => deleteComment(detailPlace.id, cid)}
          />
        </AppPortal>
      )}
    </>
  )
}

function DrawerContent({ group, groupPlacesList, groupTab, setGroupTab, setDetailPlace, copyText, codeCopied, setSelectedGroup, setShowGroupModal, onClose }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 12px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{group.cover}</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{group.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => { setSelectedGroup(group); setShowGroupModal(true) }}
            style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600, padding: '5px 10px',
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
            관리
          </button>
          <button onClick={onClose} style={{ fontSize: 18, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}>✕</button>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', margin: '12px 16px 8px', background: 'var(--bg)', borderRadius: 10, padding: 3, flexShrink: 0 }}>
        {[['places', `장소 ${groupPlacesList.length}`], ['members', `멤버 ${group.members.length}`], ['invite', '초대']].map(([id, label]) => (
          <button key={id} onClick={() => setGroupTab(id)} style={{
            flex: 1, padding: '9px 4px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: groupTab === id ? 'var(--surface)' : 'transparent',
            color: groupTab === id ? 'var(--primary)' : 'var(--text-sub)',
            boxShadow: groupTab === id ? 'var(--shadow-sm)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        {/* 장소 탭 */}
        {groupTab === 'places' && (
          groupPlacesList.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📍</span>
              <p className="empty-text">아직 공유된 장소가 없어요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {groupPlacesList.map(place => {
                const info = getCategoryInfo(place.category)
                return (
                  <button key={place.id} className="card" style={{ padding: '14px 16px', textAlign: 'left', width: '100%' }}
                    onClick={() => setDetailPlace(place)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 26, flexShrink: 0 }}>{info.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, background: 'var(--primary-bg)', padding: '2px 7px', borderRadius: 8 }}>{info.label}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>by {place.author}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{place.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{place.address}</p>
                        {place.comment && <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, borderLeft: '3px solid var(--primary-bg)', paddingLeft: 8, marginTop: 6 }}>{place.comment}</p>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

        {/* 멤버 탭 */}
        {groupTab === 'members' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.members.map(member => {
              const isCreator = member.name === group.createdBy
              return (
                <div key={member.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 12,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 22 }}>{member.avatar}</span>
                  <p style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{member.name}</p>
                  {isCreator && <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 10 }}>방장</span>}
                </div>
              )
            })}
          </div>
        )}

        {/* 초대 탭 */}
        {groupTab === 'invite' && (() => {
          const inviteUrl = `${window.location.origin}/?join=${group.id.toString(36)}`
          const shareText = `${group.cover} ${group.name}\n초대코드: ${group.inviteCode}\n\nTripMate에서 함께 여행 기록해요!\n${inviteUrl}`
          return (
            <div>
              <div style={{ background: 'var(--primary-bg)', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>초대코드</p>
                <div onClick={() => copyText(group.inviteCode, 'code')}
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 12, background: 'white' }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', letterSpacing: '6px' }}>{group.inviteCode}</span>
                  <span style={{ fontSize: 18 }}>{codeCopied === 'code' ? '✅' : '📋'}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--primary)', opacity: 0.7, marginTop: 6 }}>탭해서 복사</p>
              </div>
              <button onClick={() => copyText(shareText, 'share')}
                style={{ width: '100%', padding: 14, background: '#FEE500', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#3A1D1D', marginBottom: 12 }}>
                {codeCopied === 'share' ? '✅ 복사됐어요!' : '📤 초대 메시지 복사 (카카오톡)'}
              </button>
              <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 6 }}>초대 링크</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text)', flex: 1, wordBreak: 'break-all' }}>{inviteUrl}</p>
                  <button onClick={() => copyText(inviteUrl, 'link')}
                    style={{ padding: '6px 12px', borderRadius: 8, background: codeCopied === 'link' ? '#4CAF50' : 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {codeCopied === 'link' ? '✓' : '복사'}
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </>
  )
}
