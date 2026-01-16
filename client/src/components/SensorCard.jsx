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
 */
export default function SensorCard({ label, value, unit = '', featureKey, icon }) {
  const threshold = featureKey ? getThreshold(featureKey) : null
  const isWarning = threshold && value > threshold
  const cardRef = useRef(null)
  const valueRef = useRef(null)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (cardRef.current) {
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
  }, [])

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
        {isWarning && (
          <span className="text-xs px-2 py-1 bg-yellow-900 text-yellow-200 rounded border border-yellow-500">
            Warning
          </span>
        )}
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

