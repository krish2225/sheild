import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { getThreshold } from '../services/thresholds'

/**
 * SensorCard component displays a single sensor reading
 * @param {string} label - Sensor label (e.g., "Temperature")
 * @param {number} value - Current sensor value
 * @param {string} unit - Unit of measurement (e.g., "°C", "m/s²", "A")
 * @param {string} featureKey - Feature key for threshold checking (e.g., "temp_mean")
 * @param {string} icon - Optional icon name
 * @param {object} driftStatus - Sensor drift detection status from sensorDrift utility
 */
export default function SensorCard({ label, value, unit = '', featureKey, icon, driftStatus }) {
  const threshold = featureKey ? getThreshold(featureKey) : null
  const isWarning = threshold && value > threshold
  const cardRef = useRef(null)
  const valueRef = useRef(null)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (cardRef.current) {
      // Ensure card is always visible
      gsap.set(cardRef.current, { opacity: 1, scale: 1, display: 'block' })
      // Only animate on initial mount if not already visible
      if (cardRef.current.style.opacity === '' || cardRef.current.style.opacity === '0') {
        gsap.fromTo(cardRef.current, {
          opacity: 0,
          scale: 0.9
        }, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.4)'
        })
      }
    }
  }, [])

  // Ensure card stays visible on re-renders
  useEffect(() => {
    if (cardRef.current) {
      gsap.set(cardRef.current, { opacity: 1, display: 'block' })
    }
  }, [value])

  useEffect(() => {
    if (valueRef.current && value !== null && value !== undefined && prevValueRef.current !== value) {
      // Pulse animation on value change
      gsap.to(valueRef.current, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      })
      prevValueRef.current = value
    }
  }, [value])

  return (
    <div 
      ref={cardRef}
      className={`bg-slate-900 border-2 rounded-lg p-5 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500 cursor-pointer ${
        isWarning 
          ? 'border-yellow-400 bg-yellow-900 hover:border-yellow-400' 
          : 'border-slate-600 hover:border-slate-500'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white font-medium">{label}</div>
        <div className="flex items-center gap-2">
          {driftStatus?.isStuck && (
            <div 
              className="text-yellow-400 cursor-help" 
              title="Sensor value not changing – possible drift or failure"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          {isWarning && (
            <span className="text-xs px-2 py-1 bg-yellow-900 text-yellow-200 rounded border border-yellow-500">
              Warning
            </span>
          )}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span ref={valueRef} className="text-2xl font-bold text-white inline-block">
          {value !== null && value !== undefined ? value.toFixed(2) : '--'}
        </span>
        {unit && <span className="text-sm text-white">{unit}</span>}
      </div>
      {threshold && (
          <div className="mt-2 text-xs text-slate-300">
          Threshold: {threshold} {unit}
        </div>
      )}
    </div>
  )
}

