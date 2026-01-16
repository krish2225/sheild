import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import ShieldLogoWithText from '../components/ShieldLogo'

export default function Landing() {
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const textRef = useRef(null)
  const buttonsRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    
    // Fallback: ensure cards are visible after timeout
    const fallbackTimeout = setTimeout(() => {
      if (cardsRef.current && cardsRef.current.children) {
        Array.from(cardsRef.current.children).forEach(card => {
          if (card.style.opacity === '0' || !card.style.opacity) {
            card.style.opacity = '1'
            card.style.transform = 'translateY(0) scale(1)'
          }
        })
      }
    }, 2000)
    
    const ctx = gsap.context(() => {
      // Animate title
      if (titleRef.current) {
        gsap.fromTo(titleRef.current, {
          opacity: 0,
          y: -30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        })
      }

      // Animate description
      if (textRef.current) {
        gsap.fromTo(textRef.current, {
          opacity: 0,
          y: 20
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power2.out'
        })
      }

      // Animate buttons
      if (buttonsRef.current && buttonsRef.current.children) {
        gsap.fromTo(buttonsRef.current.children, {
          opacity: 0,
          scale: 0.8
        }, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: 0.4,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        })
      }

      // Animate feature cards
      if (cardsRef.current && cardsRef.current.children && cardsRef.current.children.length > 0) {
        // Set initial state
        gsap.set(cardsRef.current.children, { opacity: 0, y: 40, scale: 0.9 })
        
        // Animate in
        gsap.to(cardsRef.current.children, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        })

        // Floating animation for cards (after initial animation)
        Array.from(cardsRef.current.children).forEach((card, index) => {
          gsap.to(card, {
            y: -10,
            duration: 2 + index * 0.2,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
            delay: 1.5 + index * 0.1
          })
        })
      }
    }, containerRef)

    return () => {
      clearTimeout(fallbackTimeout)
      ctx.revert()
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen app-gradient flex flex-col">
      <header className="border-b-2 border-slate-600 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <ShieldLogoWithText size={40} showText={true} />
          <div className="text-sm text-white flex items-center gap-4">
            <Link to="/login" className="hover:text-white">Login</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 ref={titleRef} className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Intelligent Maintenance. Uninterrupted.
            </h1>
            <p ref={textRef} className="mt-4 text-slate-200 text-lg">
              Our SHIELD solution leverages IoT data and AI insights to predict equipment failures, minimize downtime, and optimize maintenance schedules with real-time monitoring and automated alerts.
            </p>
            <div ref={buttonsRef} className="mt-6 flex items-center gap-4">
              <Link to="/dashboard" className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-6 py-3 font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500">Go to Dashboard</Link>
              <Link to="/login" className="text-cyan-300 hover:text-cyan-200 transition-all hover:scale-105">Login</Link>
            </div>
          </div>
          <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 shadow-xl">
            <div className="text-slate-200 mb-3 font-semibold">Why SHIELD is better</div>
            <div ref={cardsRef} className="grid grid-cols-2 gap-3" style={{ opacity: 1 }}>
              <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-5 transition-all hover:bg-slate-800 hover:scale-105 cursor-pointer hover:shadow-xl hover:shadow-cyan-500" style={{ opacity: 1 }}>
                <div className="text-slate-300 text-sm mb-1 font-medium">Faster insights</div>
                <div className="text-xl font-semibold text-cyan-300">Real-time IoT streaming</div>
              </div>
              <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-5 transition-all hover:bg-slate-800 hover:scale-105 cursor-pointer hover:shadow-xl hover:shadow-cyan-500" style={{ opacity: 1 }}>
                <div className="text-slate-300 text-sm mb-1 font-medium">Smarter predictions</div>
                <div className="text-xl font-semibold text-red-300">Explainable AI scoring</div>
              </div>
              <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-5 transition-all hover:bg-slate-800 hover:scale-105 cursor-pointer hover:shadow-xl hover:shadow-cyan-500" style={{ opacity: 1 }}>
                <div className="text-slate-400 text-sm mb-1">Optimized uptime</div>
                <div className="text-xl font-semibold text-green-300">RUL-driven scheduling</div>
              </div>
              <div className="bg-slate-900 border-2 border-slate-600 rounded-lg p-5 transition-all hover:bg-slate-800 hover:scale-105 cursor-pointer hover:shadow-xl hover:shadow-cyan-500" style={{ opacity: 1 }}>
                <div className="text-slate-400 text-sm mb-1">Seamless deployment</div>
                <div className="text-xl font-semibold text-teal-300">Docker & cloud ready</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


