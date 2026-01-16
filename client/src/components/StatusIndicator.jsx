import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { getHealthStatus } from '../services/statusLogic'

/**
 * StatusIndicator component - Visual status indicator with health score
 * @param {number} healthScore - Health score from 0-100
 * @param {string} size - Size variant: 'sm', 'md', 'lg'
 */
export default function StatusIndicator({ healthScore, size = 'md' }) {
  const status = getHealthStatus(healthScore || 0)
  const dotRef = useRef(null)

  useEffect(() => {
    if (dotRef.current) {
      gsap.fromTo(dotRef.current, {
        scale: 0,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'back.out(1.7)'
      })
      
      // Continuous pulse animation
      gsap.to(dotRef.current, {
        scale: 1.2,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      })
    }
  }, [healthScore])

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  }

  const colorClasses = {
    green: 'bg-green-400 shadow-green-500',
    yellow: 'bg-yellow-400 shadow-yellow-500',
    red: 'bg-red-400 shadow-red-500',
    gray: 'bg-slate-400 shadow-slate-500'
  }

  const textSizeClass = size === 'lg' ? 'text-lg' : 'sm'
  const textColorClass = status.color === 'green' ? 'text-green-400' :
    status.color === 'yellow' ? 'text-yellow-400' :
    status.color === 'red' ? 'text-red-400' :
    'text-slate-400'

  return (
    <div className="flex items-center gap-2">
      <div ref={dotRef} className={`${sizeClasses[size]} ${colorClasses[status.color] || colorClasses.gray} rounded-full shadow-lg`} />
      <span className={`${textSizeClass} font-medium ${textColorClass}`}>
        {status.label}
      </span>
    </div>
  )
}

