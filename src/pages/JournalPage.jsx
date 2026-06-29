import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { formatDate } from '../utils/helpers'
import { supabase } from '../lib/supabase'
import AppPortal from '../components/AppPortal'

const MOODS = ['😍', '😊', '😐', '😢', '😤']

export default function JournalPage() {
  const { journals, addJournal, updateJournal, deleteJournal, username } = useApp()
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', mood: '😊', imageUrls: [], isPublic: false })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [detail, setDetail] = useState(null) // 상세 보기

  // 내 일지만 필터
  const myJournals = journals.filter(j => j.author === username)

  const openNew = () => {
    setForm({ title: '', content: '', mood: '😊', imageUrls: [], isPublic: false })
    setEditingId(null)
    setShowEditor(true)
  }

  const openEdit = (journal) => {
    setForm({ title: journal.title, content: journal.content, mood: journal.mood, imageUrls: journal.imageUrls || [], isPublic: journal.isPublic || false })
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
    const files = Array.from(e.target.files)
    if (!files.length) return
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

      <div style={{ padding: '16px 16px 80px' }}>
        {myJournals.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📔</span>
            <p className="empty-text">아직 일지가 없어요.<br />오늘의 여행을 기록해보세요!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myJournals.map(journal => (
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
                    <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>{formatDate(detail.date)}</p>
                  </div>
                </div>

                {detail.imageUrls?.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: detail.imageUrls.length === 1 ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {detail.imageUrls.map((url, i) => (
                      <img key={i} src={url} alt="" style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: detail.imageUrls.length === 1 ? '16/9' : '1/1' }} />
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
        disabled={uploading}
        style={{
          width: '100%', padding: '14px', borderRadius: 10,
          border: `2px dashed ${uploading ? 'var(--primary)' : 'var(--border)'}`,
          background: uploading ? 'var(--primary-bg)' : 'var(--bg)',
          color: uploading ? 'var(--primary)' : 'var(--text-sub)',
          fontSize: 14, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s',
        }}
      >
        {uploading ? '⏳ 업로드 중...' : '📷 사진 추가하기'}
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
            <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>{formatDate(journal.date)}</p>
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
