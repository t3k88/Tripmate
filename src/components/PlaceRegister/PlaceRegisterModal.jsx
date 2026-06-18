import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Step1Category from './Step1Category'
import Step2MapSearch from './Step2MapSearch'
import Step3Review from './Step3Review'
import EditPlaceForm from './EditPlaceForm'

const STEPS = ['카테고리', '위치', '추천포인트']

export default function PlaceRegisterModal() {
  const { setShowPlaceModal, addPlace, updatePlace, groups, editingPlace, setEditingPlace } = useApp()
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
    groupIds: [],
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

  const handleSubmit = async (finalData) => {
    if (editingPlace) {
      await updatePlace(editingPlace.id, { ...data, ...finalData })
    } else {
      await addPlace({ ...data, ...finalData })
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
            onClick={editingPlace || step === 0 ? handleClose : handleBack}
            style={{
              background: !editingPlace && step > 0 ? 'var(--primary-bg)' : 'var(--border)',
              color: !editingPlace && step > 0 ? 'var(--primary)' : 'var(--text-sub)',
            }}
          >
            {editingPlace || step === 0 ? '✕' : '←'}
          </button>
          <span className="modal-title">{editingPlace ? '장소 수정' : '장소 등록'}</span>
          <div style={{ width: 28 }} />
        </div>

        {editingPlace ? (
          <EditPlaceForm data={data} groups={groups} onSubmit={handleSubmit} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
