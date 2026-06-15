import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Step1Category from './Step1Category'
import Step2MapSearch from './Step2MapSearch'
import Step3Review from './Step3Review'

const STEPS = ['카테고리', '위치', '추천포인트']

export default function PlaceRegisterModal() {
  const { setShowPlaceModal, setPlaces, groups, editingPlace, setEditingPlace } = useApp()
  const [step, setStep] = useState(0)
  const [data, setData] = useState(editingPlace ?? {
    category: '',
    name: '',
    address: '',
    lat: null,
    lng: null,
    placeUrl: '',
    points: [],
    comment: '',
    groupId: null,
  })

  const handleClose = () => {
    setShowPlaceModal(false)
    setEditingPlace(null)
  }

  const handleNext = (newData) => {
    setData(d => ({ ...d, ...newData }))
    setStep(s => s + 1)
  }

  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = (finalData) => {
    if (editingPlace) {
      setPlaces(ps => ps.map(p => p.id === editingPlace.id ? { ...p, ...data, ...finalData } : p))
    } else {
      setPlaces(ps => [...ps, {
        id: Date.now(),
        ...data,
        ...finalData,
        author: '나',
        date: new Date().toISOString().slice(0, 10),
      }])
    }
    handleClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-header">
          <button
            className="modal-close"
            onClick={step === 0 ? handleClose : handleBack}
            style={{
              background: step > 0 ? 'var(--primary-bg)' : 'var(--border)',
              color: step > 0 ? 'var(--primary)' : 'var(--text-sub)',
            }}
          >
            {step === 0 ? '✕' : '←'}
          </button>
          <span className="modal-title">{editingPlace ? '장소 수정' : '장소 등록'}</span>
          <div style={{ width: 28 }} />
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
              {i < STEPS.length - 1 && (
                <div style={{ width: 20, height: 1, background: i < step ? 'var(--primary)' : 'var(--border)', opacity: 0.5 }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>
            {step + 1} / {STEPS.length} — {STEPS[step]}
          </span>
        </div>

        {step === 0 && <Step1Category data={data} onNext={handleNext} />}
        {step === 1 && <Step2MapSearch data={data} onNext={handleNext} />}
        {step === 2 && <Step3Review data={data} groups={groups} onSubmit={handleSubmit} />}
      </div>
    </div>
  )
}
