import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ShieldLogo from './ShieldLogo'

export default function Footer() {
  const trackRef = useRef(null)
  const animationRef = useRef(null)
  const names = ['Krish Namboodri', 'Utkarsh Sakpal', 'Fardin Pirjade']

  useEffect(() => {
    if (!trackRef.current) return

    // Duplicate names multiple times for seamless infinite loop
    const duplicatedNames = [...names, ...names, ...names, ...names]
    
    // Create name elements with separators
    const nameElements = []
    duplicatedNames.forEach((name, index) => {
      const span = document.createElement('span')
      span.className = 'text-cyan-300 font-semibold mx-8 whitespace-nowrap text-lg md:text-xl'
      span.textContent = name
      span.style.display = 'inline-block'
      span.style.textShadow = '0 0 10px rgba(34, 211, 238, 0.5)'
      nameElements.push(span)
      
      // Add separator dot between names
      if (index < duplicatedNames.length - 1) {
        const separator = document.createElement('span')
        separator.className = 'text-slate-400 mx-3 text-xl'
        separator.textContent = '•'
        separator.style.display = 'inline-block'
        nameElements.push(separator)
      }
    })

    // Clear and add elements
    trackRef.current.innerHTML = ''
    nameElements.forEach(el => trackRef.current.appendChild(el))

    // Wait for layout to calculate widths properly
    const setupAnimation = () => {
      // Calculate width of one complete set (3 names + separators)
      let singleSetWidth = 0
      const elementsPerSet = names.length * 2 - 1 // 3 names + 2 separators
      for (let i = 0; i < elementsPerSet; i++) {
        const el = nameElements[i]
        if (el) {
          singleSetWidth += el.offsetWidth || el.getBoundingClientRect().width
        }
      }

      // Set initial position
      gsap.set(trackRef.current, { x: 0 })

      // Create infinite scroll animation
      animationRef.current = gsap.to(trackRef.current, {
        x: -singleSetWidth,
        duration: 18, // Adjust speed here (lower = faster)
        ease: 'none',
        repeat: -1
      })

      // Add pulsing glow effect to name elements only (not separators)
      nameElements.forEach((el, index) => {
        if (el.textContent && !el.textContent.includes('•')) {
          gsap.to(el, {
            textShadow: '0 0 15px rgba(34, 211, 238, 0.9), 0 0 25px rgba(34, 211, 238, 0.7), 0 0 35px rgba(34, 211, 238, 0.5)',
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
            delay: (index % names.length) * 0.4
          })
        }
      })
    }

    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      setTimeout(setupAnimation, 50)
    })

    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [])

  return (
    <footer className="bg-slate-900 border-t-2 border-slate-600 mt-auto w-full h-[20vh] min-h-[160px] flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-4 w-full">
        <div className="h-full w-full flex flex-col items-center justify-center gap-4">
          <div className="text-slate-400 text-xs md:text-sm text-center">
            © 2024 SHIELD Industrial Monitoring System. All rights reserved.
          </div>
          <div className="text-slate-200 text-sm md:text-base font-semibold text-center w-full">
            <div className="mb-2">Developed by</div>
            <div className="relative overflow-hidden py-3 h-12 flex items-center">
              {/* Gradient fade effects on edges */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
              <div 
                ref={trackRef}
                className="flex items-center"
                style={{ willChange: 'transform' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}