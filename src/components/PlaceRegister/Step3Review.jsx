import { useState, useRef } from 'react'
import { getCategoryInfo, RECOMMENDATION_POINTS, EXTRA_SECTION } from '../../utils/helpers'

export default function Step3Review({ data, groups, onSubmit }) {
  const [points, setPoints] = useState(data.points || [])
  const [menus, setMenus] = useState(data.menus || [])
  const [comment, setComment] = useState(data.comment || '')
  const [groupIds, setGroupIds] = useState(data.groupIds || [])
  const [customTag, setCustomTag] = useState('')
  const [menuInput, setMenuInput] = useState('')
  const tagInputRef = useRef(null)

  const info = getCategoryInfo(data.category)
  const availablePoints = RECOMMENDATION_POINTS[data.category] || RECOMMENDATION_POINTS.etc
  const extraSection = EXTRA_SECTION[data.category]

  const togglePoint = (pt) => {
    setPoints(prev => prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt])
  }

  const addCustomTag = () => {
    const tag = customTag.trim().replace(/^#/, '')
    if (!tag) return
    const full = `#${tag}`
    if (!points.includes(full)) setPoints(prev => [...prev, full])
    setCustomTag('')
  }

  const removePoint = (pt) => setPoints(prev => prev.filter(p => p !== pt))

  const addMenu = () => {
    const item = menuInput.trim()
    if (!item) return
    if (!menus.includes(item)) setMenus(prev => [...prev, item])
    setMenuInput('')
  }

  const removeMenu = (item) => setMenus(prev => prev.filter(m => m !== item))

  const toggleGroup = (id) => {
    setGroupIds(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  return (
    <div className="form-section" style={{ paddingBottom: 24 }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>추천 포인트를 골라주세요</p>
        <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>여기가 좋았던 이유가 뭔가요?</p>
      </div>

      {/* 장소 요약 */}
      <div style={{
        padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-md)',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: 'var(--primary-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
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

      {/* 추천 메뉴 / 액티비티 */}
      {extraSection && (
        <div className="form-group">
          <label className="form-label">{extraSection.icon} {extraSection.label}</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder={extraSection.placeholder}
              value={menuInput}
              onChange={e => setMenuInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMenu()}
            />
            <button
              onClick={addMenu}
              style={{
                padding: '0 16px', background: 'var(--primary)', color: 'white',
                borderRadius: 'var(--radius-sm)', fontSize: 20, fontWeight: 700, flexShrink: 0,
              }}
            >+</button>
          </div>
          {menus.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {menus.map(item => (
                <span key={item} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: 'var(--primary)', color: 'white',
                }}>
                  {item}
                  <button onClick={() => removeMenu(item)} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1 }}>✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 추천 포인트 태그 */}
      <div className="form-group">
        <label className="form-label">추천 태그 <span style={{ color: 'var(--text-sub)', fontWeight: 400, textTransform: 'none' }}>(복수 선택 가능)</span></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {availablePoints.map(pt => {
            const isSelected = points.includes(pt)
            return (
              <button
                key={pt}
                onClick={() => togglePoint(pt)}
                style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border)',
                  background: isSelected ? 'var(--primary)' : 'var(--surface)',
                  color: isSelected ? 'white' : 'var(--text-sub)',
                }}
              >
                {pt}
              </button>
            )
          })}
        </div>

        {/* 직접 입력 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: points.filter(p => !availablePoints.includes(p)).length > 0 ? 8 : 0 }}>
          <input
            ref={tagInputRef}
            className="form-input"
            style={{ flex: 1 }}
            placeholder="태그 직접 추가 (예: 뷰맛집)"
            value={customTag}
            onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustomTag()}
          />
          <button
            onClick={addCustomTag}
            style={{
              padding: '0 16px', background: 'var(--primary-bg)', color: 'var(--primary)',
              borderRadius: 'var(--radius-sm)', fontSize: 20, fontWeight: 700, flexShrink: 0,
              border: '1.5px solid var(--primary)',
            }}
          >+</button>
        </div>
        {/* 직접 추가한 태그들 */}
        {points.filter(p => !availablePoints.includes(p)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {points.filter(p => !availablePoints.includes(p)).map(pt => (
              <span key={pt} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: 'var(--primary)', color: 'white',
              }}>
                {pt}
                <button onClick={() => removePoint(pt)} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1 }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 한마디 */}
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

      {/* 그룹 공유 */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label className="form-label" style={{ margin: 0 }}>그룹 공유</label>
          {groups.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-sub)', cursor: 'pointer' }}>
              <input type="checkbox"
                checked={groupIds.length === groups.length}
                onChange={() => setGroupIds(groupIds.length === groups.length ? [] : groups.map(g => g.id))}
                style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
              />
              전체 선택
            </label>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {groups.map(g => (
            <GroupOption
              key={g.id} label={g.name} sub={`멤버 ${g.members.length}명`} icon={g.cover}
              selected={groupIds.includes(g.id)} onClick={() => toggleGroup(g.id)}
            />
          ))}
          {groups.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>참여 중인 그룹이 없어요</p>
          )}
        </div>
      </div>

      <button
        className="btn-primary"
        disabled={points.length === 0}
        onClick={() => onSubmit({ points, menus, comment, groupIds })}
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
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
        background: selected ? 'var(--primary-bg)' : 'var(--surface)',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: selected ? 'var(--primary)' : 'var(--text)' }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{sub}</p>
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: 5,
        border: selected ? 'none' : '2px solid var(--border)',
        background: selected ? 'var(--primary)' : 'white',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>
        {selected && '✓'}
      </div>
    </button>
  )
}
