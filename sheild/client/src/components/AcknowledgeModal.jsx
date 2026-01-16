import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * AcknowledgeModal component - Form for acknowledging alerts with action taken
 * @param {boolean} isOpen - Whether modal is open
 * @param {object} alert - Alert object being acknowledged
 * @param {function} onClose - Callback to close modal
 * @param {function} onSubmit - Callback when form is submitted (receives actionTaken)
 * @param {object} acknowledgment - Existing acknowledgment data (for viewing)
 */
export default function AcknowledgeModal({ isOpen, alert, onClose, onSubmit, acknowledgment = null }) {
  const [actionTaken, setActionTaken] = useState('')
  const [notes, setNotes] = useState('')
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const formRef = useRef(null)
  const isViewMode = !!acknowledgment

  useEffect(() => {
    if (isOpen) {
      if (acknowledgment) {
        // View mode - populate with existing data
        setActionTaken(acknowledgment.actionTaken || '')
        setNotes(acknowledgment.notes || '')
      } else {
        // Create mode - reset form
        setActionTaken('')
        setNotes('')
      }
      
      // Animate modal in
      if (modalRef.current && overlayRef.current) {
        gsap.fromTo(overlayRef.current, {
          opacity: 0
        }, {
          opacity: 1,
          duration: 0.3
        })
        
        gsap.fromTo(modalRef.current, {
          opacity: 0,
          scale: 0.9,
          y: 20
        }, {
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
      }
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (actionTaken.trim()) {
      onSubmit({
        actionTaken: actionTaken.trim(),
        notes: notes.trim(),
        timestamp: new Date().toISOString(),
        acknowledgedBy: 'User' // In production, get from auth
      })
      onClose()
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="bg-slate-900 border-2 border-slate-600 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isViewMode ? 'Acknowledgment Details' : 'Acknowledge Alert'}
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Alert Info */}
          {alert && (
            <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4 mb-6">
              <div className="text-sm text-slate-400 mb-1">Alert Details</div>
              <div className="text-white font-semibold mb-2">{alert.message || alert.label || 'Alert'}</div>
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span>Severity: <span className="text-cyan-300">{alert.severity || 'medium'}</span></span>
                <span>Time: <span className="text-cyan-300">
                  {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : '--'}
                </span></span>
              </div>
            </div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="actionTaken" className="block text-sm font-medium text-white mb-2">
                Action Taken {!isViewMode && <span className="text-red-400">*</span>}
              </label>
              <textarea
                id="actionTaken"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Describe what action you have taken to address this alert..."
                required={!isViewMode}
                disabled={isViewMode}
                rows={4}
                className={`w-full bg-slate-800 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none ${
                  isViewMode ? 'cursor-not-allowed opacity-75' : ''
                }`}
              />
              {!isViewMode && (
                <div className="text-xs text-slate-400 mt-1">
                  Please provide details about the action taken (e.g., "Adjusted temperature threshold", "Scheduled maintenance", "Replaced component")
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-white mb-2">
                Additional Notes {!isViewMode && <span className="text-slate-500">(Optional)</span>}
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or observations..."
                disabled={isViewMode}
                rows={3}
                className={`w-full bg-slate-800 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none ${
                  isViewMode ? 'cursor-not-allowed opacity-75' : ''
                }`}
              />
            </div>

            {/* Show acknowledgment timestamp in view mode */}
            {isViewMode && acknowledgment.timestamp && (
              <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4">
                <div className="text-sm text-slate-400 mb-1">Acknowledged On</div>
                <div className="text-white">
                  {new Date(acknowledgment.timestamp).toLocaleString()}
                </div>
                {acknowledgment.acknowledgedBy && (
                  <>
                    <div className="text-sm text-slate-400 mb-1 mt-3">Acknowledged By</div>
                    <div className="text-white">{acknowledgment.acknowledgedBy}</div>
                  </>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t-2 border-slate-700">
              {isViewMode ? (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-500 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-lg"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 rounded-lg text-white font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!actionTaken.trim()}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed border-2 border-cyan-500 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-lg"
                  >
                    Acknowledge Alert
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

