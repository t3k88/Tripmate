import { useState } from 'react'
import { getCategoryInfo, RECOMMENDATION_POINTS } from '../../utils/helpers'

export default function Step3Review({ data, groups, onSubmit }) {
  const [points, setPoints] = useState(data.points || [])
  const [comment, setComment] = useState(data.comment || '')
  const [groupId, setGroupId] = useState(data.groupId || null)

  const info = getCategoryInfo(data.category)
  const availablePoints = RECOMMENDATION_POINTS[data.category] || RECOMMENDATION_POINTS.etc

  const togglePoint = (pt) => {
    setPoints(prev =>
      prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt]
    )
  }

  return (
    <div className="form-section" style={{ paddingBottom: 24 }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>추천 포인트를 골라주세요</p>
        <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>여기가 좋았던 이유가 뭔가요?</p>
      </div>

      {/* Place summary */}
      <div style={{
        padding: '12px 14px',
        background: 'var(--bg)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: 'var(--primary-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {info.icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700 }}>{data.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.address}
          </p>
        </div>
      </div>

      {/* Recommendation point tags */}
      <div className="form-group">
        <label className="form-label">추천 포인트 <span style={{ color: 'var(--text-sub)', fontWeight: 400, textTransform: 'none' }}>(복수 선택 가능)</span></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {availablePoints.map(pt => {
            const isSelected = points.includes(pt)
            return (
              <button
                key={pt}
                onClick={() => togglePoint(pt)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border)',
                  background: isSelected ? 'var(--primary)' : 'var(--surface)',
                  color: isSelected ? 'white' : 'var(--text-sub)',
                  transition: 'all 0.15s',
                }}
              >
                {pt}
              </button>
            )
          })}
        </div>
      </div>

      {/* Comment */}
      <div className="form-group">
        <label className="form-label">한마디 <span style={{ color: 'var(--text-sub)', fontWeight: 400, textTransform: 'none' }}>(선택)</span></label>
        <textarea
          className="form-textarea"
          placeholder="다음에 올 친구들에게 한마디 남겨주세요 :)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{ minHeight: 90 }}
        />
      </div>

      {/* Group share */}
      <div className="form-group">
        <label className="form-label">그룹 공유</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <GroupOption
            label="공유 안 함"
            sub="나만 볼 수 있어요"
            icon="🔒"
            selected={groupId === null}
            onClick={() => setGroupId(null)}
          />
          {groups.map(g => (
            <GroupOption
              key={g.id}
              label={g.name}
              sub={`멤버 ${g.members.length}명`}
              icon={g.cover}
              selected={groupId === g.id}
              onClick={() => setGroupId(g.id)}
            />
          ))}
        </div>
      </div>

      <button
        className="btn-primary"
        disabled={points.length === 0}
        onClick={() => onSubmit({ points, comment, groupId })}
      >
        등록 완료 🎉
      </button>
    </div>
  )
}

function GroupOption({ label, sub, icon, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
        background: selected ? 'var(--primary-bg)' : 'var(--surface)',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--primary)' : 'var(--text)' }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{sub}</p>
      </div>
      <div style={{
        width: 18, height: 18,
        borderRadius: '50%',
        border: selected ? '5px solid var(--primary)' : '2px solid var(--border)',
        background: 'white',
        flexShrink: 0,
        transition: 'all 0.15s',
      }} />
    </button>
  )
}
