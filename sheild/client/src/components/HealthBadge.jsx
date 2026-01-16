import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { getHealthStatus } from '../services/statusLogic'

/**
 * HealthBadge component displays machine health status
 * @param {number} healthScore - Health score from 0-100
 * @param {string} deviceId - Device ID
 */
export default function HealthBadge({ healthScore, deviceId = 'PM_001' }) {
  const status = getHealthStatus(healthScore || 0)
  const badgeRef = useRef(null)

  useEffect(() => {
    if (badgeRef.current) {
      gsap.fromTo(badgeRef.current, {
        opacity: 0,
        scale: 0.8
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.4)'
      })
    }
  }, [healthScore])

  const colorClasses = {
    green: 'bg-green-900 text-green-200 border-green-500',
    yellow: 'bg-yellow-900 text-yellow-200 border-yellow-500',
    red: 'bg-red-900 text-red-200 border-red-500',
    gray: 'bg-slate-700 text-slate-200 border-slate-500'
  }

  return (
    <div ref={badgeRef} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:scale-105 ${colorClasses[status.color] || colorClasses.gray}`}>
      <div className={`w-2 h-2 rounded-full ${
        status.color === 'green' ? 'bg-green-400' :
        status.color === 'yellow' ? 'bg-yellow-400' :
        status.color === 'red' ? 'bg-red-400' :
        'bg-slate-400'
      }`} />
      <span className="font-medium">{status.label}</span>
      <span className="text-sm">({healthScore || 0}%)</span>
    </div>
  )
}

