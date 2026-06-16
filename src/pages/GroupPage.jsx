import { useApp } from '../context/AppContext'

export default function GroupPage() {
  const { groups, setShowGroupModal, setSelectedGroup, places } = useApp()

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
