import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { api } from '../lib/api'

/**
 * MaintenanceEventModal component - Form for logging maintenance events
 * @param {boolean} isOpen - Whether modal is open
 * @param {string} deviceId - Device ID
 * @param {function} onClose - Callback to close modal
 * @param {function} onSuccess - Callback when event is created successfully
 */
export default function MaintenanceEventModal({ isOpen, deviceId, onClose, onSuccess }) {
  const [actionTaken, setActionTaken] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setActionTaken('')
      setNotes('')
      setError(null)
      
      // Animate modal in
      if (modalRef.current && overlayRef.current) {
        // Set initial styles
        overlayRef.current.style.opacity = '0'
        modalRef.current.style.opacity = '0'
        modalRef.current.style.transform = 'scale(0.9) translateY(20px)'
        
        // Animate in
        try {
          gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 0.3
          })
          
          gsap.to(modalRef.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'back.out(1.2)'
          })

          if (formRef.current) {
            gsap.fromTo(formRef.current.children, {
              opacity: 0,
              y: 10
            }, {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.1,
              delay: 0.2
            })
          }
        } catch (error) {
          // Fallback if GSAP fails
          console.warn('GSAP animation failed, using fallback:', error)
          if (overlayRef.current) overlayRef.current.style.opacity = '1'
          if (modalRef.current) {
            modalRef.current.style.opacity = '1'
            modalRef.current.style.transform = 'scale(1) translateY(0)'
          }
        }
      }
    } else {
      // Reset styles when closed
      if (overlayRef.current) overlayRef.current.style.opacity = '0'
      if (modalRef.current) {
        modalRef.current.style.opacity = '0'
        modalRef.current.style.transform = 'scale(0.9) translateY(20px)'
      }
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!actionTaken.trim()) {
      setError('Action Taken is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Submitting maintenance event:', { deviceId, actionTaken, notes })
      const response = await api.post('/maintenance', {
        deviceId,
        actionTaken: actionTaken.trim(),
        notes: notes.trim()
      })

      console.log('Maintenance event response:', response.data)

      // Backend returns { success: true, message, data: { event } }
      if (response.data && response.data.data && response.data.data.event) {
        if (onSuccess) {
          onSuccess(response.data.data.event)
        }
        handleClose()
      } else if (response.data && response.data.data) {
        // Fallback for different response format
        if (onSuccess) {
          onSuccess(response.data.data)
        }
        handleClose()
      } else {
        setError('Unexpected response format from server')
      }
    } catch (err) {
      console.error('Error logging maintenance event:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to log maintenance event'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to([modalRef.current, overlayRef.current], {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          onClose()
        }
      })
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={handleClose}
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div
        ref={modalRef}
        className="bg-slate-900 border-2 border-slate-600 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Log Maintenance Event</h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Device Info */}
          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4 mb-6">
            <div className="text-sm text-slate-400 mb-1">Device</div>
            <div className="text-white font-semibold">{deviceId}</div>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900 border-2 border-red-500 rounded-lg p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="actionTaken" className="block text-sm font-medium text-white mb-2">
                Action Taken <span className="text-red-400">*</span>
              </label>
              <textarea
                id="actionTaken"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Describe the maintenance action taken (e.g., 'Replaced bearing', 'Calibrated sensor', 'Cleaned filters')..."
                required
                rows={4}
                className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-white mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes, observations, or follow-up actions..."
                rows={3}
                className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t-2 border-slate-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 rounded-lg text-white font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!actionTaken.trim() || loading}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed border-2 border-cyan-500 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-lg"
              >
                {loading ? 'Saving...' : 'Log Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

