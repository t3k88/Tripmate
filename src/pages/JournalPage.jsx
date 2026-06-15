import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/helpers'

const MOODS = ['😍', '😊', '😐', '😢', '😤']

export default function JournalPage() {
  const { journals, setJournals, places, groups } = useApp()
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', mood: '😊', groupId: '' })

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) return

    if (editingId) {
      setJournals(js => js.map(j => j.id === editingId ? { ...j, ...form } : j))
    } else {
      setJournals(js => [...js, {
        id: Date.now(),
        ...form,
        groupId: form.groupId ? Number(form.groupId) : null,
        author: '나',
        date: new Date().toISOString().slice(0, 10),
        placeIds: [],
      }])
    }
    setShowEditor(false)
    setEditingId(null)
    setForm({ title: '', content: '', mood: '😊', groupId: '' })
  }

  const handleEdit = (journal) => {
    setForm({
      title: journal.title,
      content: journal.content,
      mood: journal.mood,
      groupId: journal.groupId ? String(journal.groupId) : '',
    })
    setEditingId(journal.id)
    setShowEditor(true)
  }

  const handleDelete = (id) => {
    setJournals(js => js.filter(j => j.id !== id))
  }

  return (
    <>
      <div className="header">
        <span className="header-title">여행 일지</span>
        <button className="header-action" onClick={() => { setShowEditor(true); setEditingId(null); setForm({ title: '', content: '', mood: '😊', groupId: '' }) }}>+</button>
      </div>

      <div style={{ padding: '16px 16px 80px' }}>
        {journals.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📔</span>
            <p className="empty-text">아직 일지가 없어요.<br />오늘의 여행을 기록해보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...journals].reverse().map(journal => (
              <JournalCard
                key={journal.id}
                journal={journal}
                groupName={groups.find(g => g.id === journal.groupId)?.name}
                onEdit={() => handleEdit(journal)}
                onDelete={() => handleDelete(journal.id)}
              />
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => { setShowEditor(true); setEditingId(null); setForm({ title: '', content: '', mood: '😊', groupId: '' }) }}>+</button>

      {showEditor && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEditor(false)}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-header">
              <span className="modal-title">{editingId ? '일지 수정' : '새 일지 작성'}</span>
              <button className="modal-close" onClick={() => setShowEditor(false)}>✕</button>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label className="form-label">오늘의 기분</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {MOODS.map(m => (
                    <button
                      key={m}
                      onClick={() => setForm(f => ({ ...f, mood: m }))}
                      style={{
                        fontSize: 28,
                        padding: '6px',
                        borderRadius: 10,
                        background: form.mood === m ? 'var(--primary-bg)' : 'transparent',
                        border: form.mood === m ? '2px solid var(--primary)' : '2px solid transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">제목</label>
                <input
                  className="form-input"
                  placeholder="일지 제목을 입력하세요"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">내용</label>
                <textarea
                  className="form-textarea"
                  placeholder="오늘 여행에서 기억하고 싶은 순간을 적어보세요..."
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  style={{ minHeight: 140 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">그룹 공유</label>
                <select
                  className="form-input"
                  value={form.groupId}
                  onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}
                >
                  <option value="">공유 안 함 (나만 보기)</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.cover} {g.name}</option>
                  ))}
                </select>
              </div>

              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={!form.title.trim() || !form.content.trim()}
              >
                {editingId ? '수정 완료' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function JournalCard({ journal, groupName, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>{journal.mood}</span>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{journal.title}</h3>
            <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 1 }}>
              {journal.author} · {formatDate(journal.date)}
              {groupName && ` · ${groupName}`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onEdit} style={{ fontSize: 16, color: 'var(--text-sub)' }}>✏️</button>
          <button onClick={onDelete} style={{ fontSize: 16, color: 'var(--text-sub)' }}>🗑️</button>
        </div>
      </div>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text)',
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical',
          overflow: expanded ? 'visible' : 'hidden',
        }}
      >
        {journal.content}
      </p>
      {journal.content.length > 100 && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ fontSize: 12, color: 'var(--primary)', marginTop: 6, fontWeight: 600 }}
        >
          {expanded ? '접기' : '더 보기'}
        </button>
      )}
    </div>
  )
}
