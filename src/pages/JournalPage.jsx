import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/helpers'
import { supabase } from '../lib/supabase'
import AppPortal from '../components/AppPortal'

const MOODS = ['😍', '😊', '😐', '😢', '😤']

export default function JournalPage() {
  const { journals, addJournal, updateJournal, deleteJournal, username, places, myGroupIds } = useApp()
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', mood: '😊', imageUrls: [], isPublic: false, placeId: null, visitDate: '' })
  const [showPlacePicker, setShowPlacePicker] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(null) // 'YYYY-MM'

  const myPlaces = places.filter(p => p.author === username || (p.groupIds || []).some(id => myGroupIds.includes(id)))
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [detail, setDetail] = useState(null)

  const myJournals = journals.filter(j => j.author === username)

  // 방문일자 기준으로 정렬 (없으면 작성일)
  const sortedJournals = [...myJournals].sort((a, b) => {
    const da = a.visitDate || a.date
    const db = b.visitDate || b.date
    return db.localeCompare(da)
  })

  // 월별 목록 (방문일자 기준)
  const monthGroups = sortedJournals.reduce((acc, j) => {
    const key = (j.visitDate || j.date).slice(0, 7) // 'YYYY-MM'
    if (!acc[key]) acc[key] = []
    acc[key].push(j)
    return acc
  }, {})
  const months = Object.keys(monthGroups).sort((a, b) => b.localeCompare(a))

  // 선택된 달 없으면 최신 달로 기본값
  const activeMonth = selectedMonth || months[0] || null
  const filteredJournals = activeMonth ? (monthGroups[activeMonth] || []) : sortedJournals

  const openNew = () => {
    setForm({ title: '', content: '', mood: '😊', imageUrls: [], isPublic: false, placeId: null })
    setEditingId(null)
    setShowEditor(true)
  }

  const openEdit = (journal) => {
    setForm({ title: journal.title, content: journal.content, mood: journal.mood, imageUrls: journal.imageUrls || [], isPublic: journal.isPublic || false, placeId: journal.placeId || null, visitDate: journal.visitDate || '' })
    setEditingId(journal.id)
    setShowEditor(true)
    setDetail(null)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return
    if (editingId) {
      await updateJournal(editingId, form)
    } else {
      await addJournal(form)
    }
    setShowEditor(false)
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('이 일지를 삭제할까요?')) return
    await deleteJournal(id)
    setDetail(null)
  }

  const handleUpload = async (e) => {
    const remaining = 3 - form.imageUrls.length
    const files = Array.from(e.target.files).slice(0, remaining)
    if (!files.length) return
    if (remaining <= 0) { setUploadError('사진은 최대 3장까지 추가할 수 있어요.'); return }
    setUploading(true)
    setUploadError('')
    const urls = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('journal-images').upload(path, file)
      if (error) {
        setUploadError('사진 업로드에 실패했어요. Supabase Storage 버킷(journal-images)을 확인해주세요.')
      } else {
        const { data } = supabase.storage.from('journal-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    if (urls.length > 0) setForm(f => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }))
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (url) => {
    setForm(f => ({ ...f, imageUrls: f.imageUrls.filter(u => u !== url) }))
  }

  return (
    <>
      <div className="header">
        <span className="header-title">나의 일지</span>
        <button className="header-action" onClick={openNew}>+</button>
      </div>

      {/* 월별 탭 */}
      {months.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 12px', scrollbarWidth: 'none' }}>
          {months.map(m => {
            const [y, mo] = m.split('-')
            const label = `${y}.${mo}`
            const isActive = m === activeMonth
            return (
              <button key={m} onClick={() => setSelectedMonth(m === activeMonth && months.length > 0 ? m : m)}
                style={{
                  flexShrink: 0, padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                  background: isActive ? 'var(--primary)' : 'var(--surface)',
                  color: isActive ? 'white' : 'var(--text-sub)',
                  border: isActive ? 'none' : '1.5px solid var(--border)',
                }}>
                {label} <span style={{ fontSize: 11, opacity: 0.8 }}>({monthGroups[m].length})</span>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ padding: '0 16px 80px' }}>
        {myJournals.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📔</span>
            <p className="empty-text">아직 일지가 없어요.<br />오늘의 여행을 기록해보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredJournals.map(journal => (
              <JournalCard
                key={journal.id}
                journal={journal}
                onClick={() => setDetail(journal)}
              />
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={openNew}>+</button>

      {/* 상세 보기 */}
      {detail && (
        <AppPortal>
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetail(null)}>
            <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-handle" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', flexShrink: 0 }}>
                <button onClick={() => setDetail(null)} style={{ fontSize: 20, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => openEdit(detail)} style={{ fontSize: 16, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDelete(detail.id)} style={{ fontSize: 16, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 36 }}>{detail.mood}</span>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800 }}>{detail.title}</h2>
                    <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                      {detail.visitDate ? `📅 ${formatDate(detail.visitDate)}` : formatDate(detail.date)}
                    </p>
                  </div>
                </div>

                {detail.placeId && (() => {
                  const p = places.find(pl => pl.id === detail.placeId)
                  return p ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg)', borderRadius: 10, marginBottom: 16 }}>
                      <span>📍</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</p>
                      </div>
                    </div>
                  ) : null
                })()}

                {detail.imageUrls?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, scrollbarWidth: 'none' }}>
                    {detail.imageUrls.map((url, i) => (
                      <img key={i} src={url} alt="" style={{ height: 180, width: 'auto', borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    ))}
                  </div>
                )}

                <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{detail.content}</p>
              </div>
            </div>
          </div>
        </AppPortal>
      )}

      {/* 작성/수정 에디터 */}
      {showEditor && (
        <AppPortal>
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEditor(false)}>
            <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="modal-handle" />
              <div className="modal-header" style={{ flexShrink: 0 }}>
                <button className="modal-close" onClick={() => setShowEditor(false)}>✕</button>
                <span className="modal-title">{editingId ? '일지 수정' : '새 일지 작성'}</span>
                <div style={{ width: 28 }} />
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
                {/* 장소 연결 */}
                <div className="form-group">
                  <label className="form-label">장소 연결 <span style={{ color: 'var(--text-sub)', fontWeight: 400, textTransform: 'none' }}>(선택)</span></label>
                  {form.placeId ? (() => {
                    const p = myPlaces.find(p => p.id === form.placeId)
                    return p ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--primary-bg)', borderRadius: 10, border: '1.5px solid var(--primary)' }}>
                        <span style={{ fontSize: 20 }}>📍</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{p.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</p>
                        </div>
                        <button onClick={() => setForm(f => ({ ...f, placeId: null }))} style={{ fontSize: 18, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                      </div>
                    ) : null
                  })() : (
                    <button
                      onClick={() => setShowPlacePicker(true)}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 10,
                        border: '2px dashed var(--border)', background: 'var(--bg)',
                        color: 'var(--text-sub)', fontSize: 14, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        cursor: 'pointer',
                      }}
                    >
                      📍 장소 선택하기
                    </button>
                  )}
                </div>

                {/* 방문일자 */}
                <div className="form-group">
                  <label className="form-label">방문일자 <span style={{ color: 'var(--text-sub)', fontWeight: 400, textTransform: 'none' }}>(선택)</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.visitDate || ''}
                    onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* 기분 */}
                <div className="form-group">
                  <label className="form-label">오늘의 기분</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {MOODS.map(m => (
                      <button key={m} onClick={() => setForm(f => ({ ...f, mood: m }))} style={{
                        fontSize: 28, padding: '6px', borderRadius: 10,
                        background: form.mood === m ? 'var(--primary-bg)' : 'transparent',
                        border: form.mood === m ? '2px solid var(--primary)' : '2px solid transparent',
                      }}>{m}</button>
                    ))}
                  </div>
                </div>

                {/* 제목 */}
                <div className="form-group">
                  <label className="form-label">제목</label>
                  <input className="form-input" placeholder="일지 제목을 입력하세요"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>

                {/* 내용 */}
                <div className="form-group">
                  <label className="form-label">내용</label>
                  <textarea className="form-textarea" placeholder="오늘 여행에서 기억하고 싶은 순간을 적어보세요..."
                    value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    style={{ minHeight: 140 }} />
                </div>

                {/* 공개/비공개 */}
                <div className="form-group">
                  <label className="form-label">공개 설정</label>
                  <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 10, padding: 3 }}>
                    {[
                      { value: false, icon: '🔒', label: '나만 보기' },
                      { value: true,  icon: '🌍', label: '전체 공개' },
                    ].map(opt => (
                      <button key={String(opt.value)} onClick={() => setForm(f => ({ ...f, isPublic: opt.value }))} style={{
                        flex: 1, padding: '10px 8px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        background: form.isPublic === opt.value ? 'var(--surface)' : 'transparent',
                        color: form.isPublic === opt.value ? 'var(--primary)' : 'var(--text-sub)',
                        boxShadow: form.isPublic === opt.value ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s',
                      }}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 사진 */}
                <div className="form-group">
                  <label className="form-label">사진</label>
                  <PhotoUploader
                    imageUrls={form.imageUrls}
                    uploading={uploading}
                    uploadError={uploadError}
                    onUpload={handleUpload}
                    onRemove={removeImage}
                  />
                </div>
              </div>

              <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                <button className="btn-primary" onClick={handleSave}
                  disabled={!form.title.trim() || !form.content.trim() || uploading}>
                  {uploading ? '업로드 중...' : editingId ? '수정 완료' : '저장하기'}
                </button>
              </div>
            </div>
          </div>
        </AppPortal>
      )}

      {/* 장소 선택 모달 */}
      {showPlacePicker && (
        <AppPortal>
          <div className="modal-overlay" onClick={() => setShowPlacePicker(false)}>
            <div className="modal-sheet" style={{ display: 'flex', flexDirection: 'column', maxHeight: '80%', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header" style={{ flexShrink: 0 }}>
                <button className="modal-close" onClick={() => setShowPlacePicker(false)}>✕</button>
                <span className="modal-title">장소 선택</span>
                <div style={{ width: 28 }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
                {myPlaces.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--text-sub)', textAlign: 'center', padding: '24px 0' }}>저장된 장소가 없어요</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {myPlaces.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setForm(f => ({ ...f, placeId: p.id })); setShowPlacePicker(false) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                          border: '1.5px solid var(--border)', background: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>📍</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </AppPortal>
      )}
    </>
  )
}

function PhotoUploader({ imageUrls, uploading, uploadError, onUpload, onRemove }) {
  const inputRef = useRef(null)

  return (
    <div>
      {/* 추가된 사진 목록 */}
      {imageUrls.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 8 }}>
            사진 {imageUrls.length}장 추가됨 · 탭하면 삭제
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {imageUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1/1' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                <button
                  onClick={() => onRemove(url)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer',
                  }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 업로드 버튼 */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading || imageUrls.length >= 3}
        style={{
          width: '100%', padding: '14px', borderRadius: 10,
          border: `2px dashed ${uploading ? 'var(--primary)' : 'var(--border)'}`,
          background: uploading ? 'var(--primary-bg)' : 'var(--bg)',
          color: uploading ? 'var(--primary)' : 'var(--text-sub)',
          fontSize: 14, fontWeight: 600, cursor: (uploading || imageUrls.length >= 3) ? 'not-allowed' : 'pointer',
          opacity: imageUrls.length >= 3 ? 0.4 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}
      >
        {uploading ? '⏳ 업로드 중...' : imageUrls.length >= 3 ? '📷 최대 3장 (완료)' : `📷 사진 추가하기 (${imageUrls.length}/3)`}
      </button>

      {/* 에러 메시지 */}
      {uploadError && (
        <p style={{ fontSize: 12, color: '#E05252', marginTop: 8, lineHeight: 1.5 }}>{uploadError}</p>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onUpload} />
    </div>
  )
}

function JournalCard({ journal, onClick }) {
  return (
    <button className="card" onClick={onClick} style={{ padding: 16, textAlign: 'left', width: '100%', cursor: 'pointer' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {journal.imageUrls?.[0] && (
          <img src={journal.imageUrls[0]} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{journal.mood}</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{journal.title}</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {journal.content}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>
              {journal.visitDate ? `📅 ${formatDate(journal.visitDate)}` : ''}
            </p>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 8,
              background: journal.isPublic ? '#E8F5E9' : 'var(--bg)',
              color: journal.isPublic ? '#2E7D32' : 'var(--text-sub)' }}>
              {journal.isPublic ? '🌍 공개' : '🔒 비공개'}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
