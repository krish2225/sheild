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
  const featuresRef = useRef(null)
  const statsRef = useRef(null)

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

      // Animate features section
      if (featuresRef.current && featuresRef.current.children) {
        gsap.fromTo(featuresRef.current.children, {
          opacity: 0,
          y: 30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 1.2,
          stagger: 0.1,
          ease: 'power2.out'
        })
      }

      // Animate stats section
      if (statsRef.current && statsRef.current.children) {
        gsap.fromTo(statsRef.current.children, {
          opacity: 0,
          scale: 0.8
        }, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: 1.8,
          stagger: 0.1,
          ease: 'back.out(1.4)'
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
          <Link to="/" className="flex items-center">
            <ShieldLogoWithText size={40} showText={true} />
          </Link>
          <div className="text-sm text-white flex items-center gap-4">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
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

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Key Features</h2>
            <p className="text-slate-300 text-lg">Everything you need for predictive maintenance</p>
          </div>
          <div ref={featuresRef} className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 hover:border-cyan-500 transition-all hover:scale-105">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-Time Monitoring</h3>
              <p className="text-slate-300">Live sensor data streaming with instant updates. Monitor temperature, vibration, and current metrics in real-time.</p>
            </div>
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 hover:border-cyan-500 transition-all hover:scale-105">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Predictions</h3>
              <p className="text-slate-300">Advanced machine learning algorithms predict equipment failures before they happen, saving time and costs.</p>
            </div>
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 hover:border-cyan-500 transition-all hover:scale-105">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-slate-300">Comprehensive analytics with historical trends, health scores, and performance metrics visualization.</p>
            </div>
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 hover:border-cyan-500 transition-all hover:scale-105">
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Smart Alerts</h3>
              <p className="text-slate-300">Configurable threshold-based alerts with severity levels. Get notified immediately when issues arise.</p>
            </div>
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 hover:border-cyan-500 transition-all hover:scale-105">
              <div className="text-4xl mb-4">📥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Data Export</h3>
              <p className="text-slate-300">Export historical data to Excel with custom date ranges for detailed analysis and reporting.</p>
            </div>
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 hover:border-cyan-500 transition-all hover:scale-105">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure & Scalable</h3>
              <p className="text-slate-300">Built with modern security practices. Scalable architecture ready for enterprise deployment.</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 bg-slate-900 border-t-2 border-b-2 border-slate-600">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-300 text-lg">Simple, powerful, and effective</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-cyan-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect Devices</h3>
              <p className="text-slate-300 text-sm">IoT sensors collect real-time data from your equipment</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Analyze Data</h3>
              <p className="text-slate-300 text-sm">AI algorithms process sensor data and identify patterns</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Insights</h3>
              <p className="text-slate-300 text-sm">Receive health scores, predictions, and actionable alerts</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">4</div>
              <h3 className="text-lg font-semibold text-white mb-2">Take Action</h3>
              <p className="text-slate-300 text-sm">Schedule maintenance proactively and prevent failures</p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose SHIELD?</h2>
          </div>
          <div ref={statsRef} className="grid md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-cyan-300 mb-2">99.9%</div>
              <div className="text-white font-semibold mb-1">Uptime</div>
              <div className="text-slate-400 text-sm">Reliable monitoring</div>
            </div>
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-green-300 mb-2">50%</div>
              <div className="text-white font-semibold mb-1">Cost Reduction</div>
              <div className="text-slate-400 text-sm">Maintenance savings</div>
            </div>
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-yellow-300 mb-2">24/7</div>
              <div className="text-white font-semibold mb-1">Monitoring</div>
              <div className="text-slate-400 text-sm">Always watching</div>
            </div>
            <div className="bg-slate-900 border-2 border-slate-600 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-red-300 mb-2">90%</div>
              <div className="text-white font-semibold mb-1">Accuracy</div>
              <div className="text-slate-400 text-sm">Failure prediction</div>
            </div>
          </div>
        </div>

        {/* Technology Stack Section */}
        <div className="max-w-7xl mx-auto px-4 py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Built With Modern Technology
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
              Cutting-edge stack engineered for optimal performance and scalability
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Frontend Card */}
            <div className="bg-slate-900/80 border-2 border-cyan-500/30 rounded-xl p-8 shadow-2xl hover:border-cyan-500/60 hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Frontend</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 hover:scale-110">
                  React
                </span>
                <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 hover:scale-110">
                  GSAP
                </span>
                <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 hover:scale-110">
                  Tailwind CSS
                </span>
                <span className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 hover:scale-110">
                  Recharts
                </span>
              </div>
            </div>

            {/* Backend Card */}
            <div className="bg-slate-900/80 border-2 border-green-500/30 rounded-xl p-8 shadow-2xl hover:border-green-500/60 hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Backend</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-green-500/50 transition-all duration-200 hover:scale-110">
                  Node.js
                </span>
                <span className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-green-500/50 transition-all duration-200 hover:scale-110">
                  Express
                </span>
                <span className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-green-500/50 transition-all duration-200 hover:scale-110">
                  Firebase
                </span>
                <span className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-green-500/50 transition-all duration-200 hover:scale-110">
                  Firestore
                </span>
              </div>
            </div>

            {/* AI & Analytics Card */}
            <div className="bg-slate-900/80 border-2 border-purple-500/30 rounded-xl p-8 shadow-2xl hover:border-purple-500/60 hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">AI & Analytics</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-200 hover:scale-110">
                  Machine Learning
                </span>
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-200 hover:scale-110">
                  Predictive Models
                </span>
                <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-200 hover:scale-110">
                  Real-time Analytics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-12 text-center border-2 border-cyan-400">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-slate-100 text-lg mb-8">Join thousands of companies using SHIELD for predictive maintenance</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/dashboard" className="bg-white text-cyan-600 rounded-lg px-8 py-3 font-semibold transition-all hover:scale-105 hover:shadow-xl">
                Start Monitoring
              </Link>
              <Link to="/login" className="bg-transparent border-2 border-white text-white rounded-lg px-8 py-3 font-semibold transition-all hover:scale-105 hover:bg-white hover:text-cyan-600">
                Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


