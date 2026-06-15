import { useState } from 'react'
import { CATEGORIES } from '../../utils/helpers'

export default function Step1Category({ data, onNext }) {
  const [selected, setSelected] = useState(data.category || '')

  return (
    <div className="form-section" style={{ paddingBottom: 24 }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>어떤 장소인가요?</p>
        <p style={{ fontSize: 13, color: 'var(--text-sub)' }}>카테고리를 선택해 주세요</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
        marginBottom: 24,
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat.id)}
            style={{
              padding: '18px 8px',
              borderRadius: 'var(--radius-md)',
              border: selected === cat.id ? '2px solid var(--primary)' : '2px solid var(--border)',
              background: selected === cat.id ? 'var(--primary-bg)' : 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 30 }}>{cat.icon}</span>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: selected === cat.id ? 'var(--primary)' : 'var(--text)',
            }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        disabled={!selected}
        onClick={() => onNext({ category: selected })}
      >
        다음 단계
      </button>
    </div>
  )
}
