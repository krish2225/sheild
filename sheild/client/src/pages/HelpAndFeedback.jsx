import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { api } from '../lib/api'

export default function HelpAndFeedback() {
  const [activeTab, setActiveTab] = useState('getting-started')
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    type: 'general',
    subject: '',
    message: ''
  })
  const [feedbackStatus, setFeedbackStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      })
    }
  }, [])

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedbackStatus(null)

    try {
      const { data } = await api.post('/feedback', {
        name: feedbackForm.name,
        email: feedbackForm.email,
        type: feedbackForm.type,
        subject: feedbackForm.subject,
        message: feedbackForm.message
      })
      
      setFeedbackStatus({
        success: true,
        message: data.message || 'Thank you for your feedback! We\'ll get back to you soon.'
      })
      setFeedbackForm({
        name: '',
        email: '',
        type: 'general',
        subject: '',
        message: ''
      })
    } catch (error) {
      setFeedbackStatus({
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to submit feedback. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const faqs = [
    {
      question: 'What is SHIELD?',
      answer: 'SHIELD is a Predictive Maintenance System for industrial equipment. It uses Machine Learning (Isolation Forest) to detect anomalies and predict equipment failures in real-time, helping you prevent costly downtime.'
    },
    {
      question: 'How does the ML prediction work?',
      answer: 'The system uses an Isolation Forest algorithm that automatically trains every 5 minutes on the latest 500 sensor readings. It analyzes temperature, vibration, and current readings to detect anomalies and calculate health scores and Remaining Useful Life (RUL).'
    },
    {
      question: 'What does RUL mean?',
      answer: 'RUL stands for Remaining Useful Life. It\'s an estimate (in hours) of how long your equipment can operate before it requires maintenance or replacement. This helps you plan maintenance schedules proactively.'
    },
    {
      question: 'How often is the data updated?',
      answer: 'Sensor data is updated in real-time from Firebase Firestore. The system receives live updates from your IoT devices and displays them immediately on the Dashboard and Device Detail pages.'
    },
    {
      question: 'What are the different health statuses?',
      answer: 'The system uses three status levels: Healthy (green) - Normal operation, Degrading (yellow) - Showing signs of wear, and Critical (red) - Immediate attention required. These are calculated based on ML predictions and sensor thresholds.'
    },
    {
      question: 'How do I acknowledge an alert?',
      answer: 'Go to the Alerts page, find the alert you want to acknowledge, and click the "Acknowledge" button. You\'ll be prompted to enter what action was taken. Once acknowledged, the alert will be marked as resolved.'
    },
    {
      question: 'Can I export historical data?',
      answer: 'Yes! On the History page, you can view historical sensor data and export it to Excel format for further analysis. The data includes all sensor readings, timestamps, and health scores.'
    },
    {
      question: 'What should I do if I see a Critical alert?',
      answer: 'Critical alerts indicate immediate attention is required. Review the alert details, check the Device Detail page for specific component failure predictions, and take appropriate maintenance action. The system will also send email notifications to maintenance heads if configured.'
    },
    {
      question: 'How do I log a maintenance event?',
      answer: 'On the Device Detail page, click the "Log Maintenance Event" button. Fill in the action taken and any notes, then submit. This creates a maintenance history timeline for that device.'
    },
    {
      question: 'What is the Failure Prediction feature?',
      answer: 'The Failure Prediction panel analyzes sensor patterns to predict which components (like bearings, motor windings, etc.) are likely to fail. It shows probability, risk level, symptoms, and recommended actions for each potential failure.'
    }
  ]

  const tabs = [
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'features', label: 'Features', icon: '⚡' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' },
    { id: 'feedback', label: 'Feedback', icon: '💬' },
    { id: 'contact', label: 'Contact', icon: '📧' }
  ]

  return (
    <div ref={containerRef} className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-4">
            Help & Support Center
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Everything you need to know about SHIELD Predictive Maintenance System
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center border-b-2 border-slate-700 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 md:p-8 shadow-xl">
          {/* Getting Started */}
          {activeTab === 'getting-started' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Getting Started</h2>
              
              <div className="space-y-4">
                <div className="bg-slate-800/50 border-l-4 border-cyan-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">1. Login</h3>
                  <p className="text-slate-300">
                    Use the default credentials: <code className="bg-slate-900 px-2 py-1 rounded">admin@example.com</code> / <code className="bg-slate-900 px-2 py-1 rounded">password</code>
                  </p>
                </div>

                <div className="bg-slate-800/50 border-l-4 border-teal-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-teal-300 mb-2">2. Explore the Dashboard</h3>
                  <p className="text-slate-300 mb-2">
                    The Dashboard provides an overview of your device (PM_001) including:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>Real-time health score and status</li>
                    <li>Remaining Useful Life (RUL) prediction</li>
                    <li>Live sensor readings (Temperature, Vibration, Current)</li>
                    <li>Data quality indicators</li>
                    <li>Maintenance priority score</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 border-l-4 border-purple-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-300 mb-2">3. Monitor Device Details</h3>
                  <p className="text-slate-300 mb-2">
                    Click on "Device Detail" to see:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>Detailed sensor readings with charts</li>
                    <li>Failure prediction for components</li>
                    <li>Maintenance history timeline</li>
                    <li>What Changed? panel showing recent changes</li>
                    <li>Log maintenance events</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">4. Review Alerts</h3>
                  <p className="text-slate-300 mb-2">
                    The Alerts page shows:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>Threshold alerts when sensor values exceed limits</li>
                    <li>Health status alerts</li>
                    <li>Failure predictions with component details</li>
                    <li>Ability to acknowledge alerts with action taken</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 border-l-4 border-green-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-300 mb-2">5. View History & Analytics</h3>
                  <p className="text-slate-300 mb-2">
                    Use the History and Analytics pages to:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>View historical sensor data trends</li>
                    <li>Export data to Excel for analysis</li>
                    <li>Analyze patterns and correlations</li>
                    <li>Plan maintenance schedules</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Key Features</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-cyan-900/30 to-slate-800 border border-cyan-700 rounded-lg p-6">
                  <div className="text-4xl mb-3">🤖</div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">AI-Powered Predictions</h3>
                  <p className="text-slate-300">
                    Machine Learning model (Isolation Forest) automatically detects anomalies and predicts equipment failures with high accuracy.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-teal-900/30 to-slate-800 border border-teal-700 rounded-lg p-6">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-xl font-semibold text-teal-300 mb-2">Real-Time Monitoring</h3>
                  <p className="text-slate-300">
                    Live sensor data updates from Firebase Firestore with sub-second latency. Monitor your equipment 24/7.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-700 rounded-lg p-6">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="text-xl font-semibold text-purple-300 mb-2">RUL Calculation</h3>
                  <p className="text-slate-300">
                    Remaining Useful Life predictions help you plan maintenance proactively and avoid unexpected downtime.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800 border border-yellow-700 rounded-lg p-6">
                  <div className="text-4xl mb-3">🔔</div>
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">Smart Alerts</h3>
                  <p className="text-slate-300">
                    Automated alerts for threshold violations, health status changes, and predicted component failures with email notifications.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-slate-800 border border-green-700 rounded-lg p-6">
                  <div className="text-4xl mb-3">📈</div>
                  <h3 className="text-xl font-semibold text-green-300 mb-2">Analytics Dashboard</h3>
                  <p className="text-slate-300">
                    Comprehensive charts and graphs showing trends, patterns, and correlations in your sensor data.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-900/30 to-slate-800 border border-red-700 rounded-lg p-6">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-xl font-semibold text-red-300 mb-2">Failure Prediction</h3>
                  <p className="text-slate-300">
                    Identifies which components (bearings, motor windings, etc.) are likely to fail with probability scores and recommended actions.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-slate-800 border border-blue-700 rounded-lg p-6">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="text-xl font-semibold text-blue-300 mb-2">Maintenance Logging</h3>
                  <p className="text-slate-300">
                    Log maintenance events with action taken and notes. View complete maintenance history timeline for each device.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/30 to-slate-800 border border-indigo-700 rounded-lg p-6">
                  <div className="text-4xl mb-3">💾</div>
                  <h3 className="text-xl font-semibold text-indigo-300 mb-2">Data Export</h3>
                  <p className="text-slate-300">
                    Export historical sensor data to Excel format for offline analysis and reporting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              
              {faqs.map((faq, index) => (
                <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-cyan-600 transition-colors">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-2 flex items-start">
                    <span className="mr-2">Q{index + 1}:</span>
                    {faq.question}
                  </h3>
                  <p className="text-slate-300 ml-6">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Troubleshooting */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Troubleshooting</h2>
              
              <div className="space-y-4">
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-300 mb-2">No Data Appearing</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>Check if Firebase connection is active</li>
                    <li>Verify device (PM_001) is sending data to Firebase</li>
                    <li>Refresh the page and wait a few seconds</li>
                    <li>Check browser console for errors</li>
                  </ul>
                </div>

                <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">ML Predictions Not Loading</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>Wait for the model to train (happens every 5 minutes)</li>
                    <li>Ensure backend server is running on port 5000</li>
                    <li>Check that Python dependencies are installed</li>
                    <li>Verify sensor data is being synced to MongoDB</li>
                  </ul>
                </div>

                <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-300 mb-2">Alerts Not Showing</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>Check if sensor values exceed configured thresholds</li>
                    <li>Verify alert settings are enabled</li>
                    <li>Refresh the Alerts page</li>
                    <li>Check Socket.IO connection status</li>
                  </ul>
                </div>

                <div className="bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-300 mb-2">Login Issues</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>Use default credentials: admin@example.com / password</li>
                    <li>Clear browser cache and localStorage</li>
                    <li>Check backend server is running</li>
                    <li>Verify MongoDB connection</li>
                  </ul>
                </div>

                <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-300 mb-2">Performance Issues</h3>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-4">
                    <li>Close unnecessary browser tabs</li>
                    <li>Clear browser cache</li>
                    <li>Check network connection speed</li>
                    <li>Reduce date range in History/Analytics pages</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Send Us Feedback</h2>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-2 font-medium">Name *</label>
                    <input
                      type="text"
                      required
                      value={feedbackForm.name}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-2 font-medium">Email *</label>
                    <input
                      type="email"
                      required
                      value={feedbackForm.email}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Feedback Type *</label>
                  <select
                    required
                    value={feedbackForm.type}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="general">General Feedback</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="improvement">Improvement Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Subject *</label>
                  <input
                    type="text"
                    required
                    value={feedbackForm.subject}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="Brief description of your feedback"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                    placeholder="Please provide detailed feedback..."
                  />
                </div>

                {feedbackStatus && (
                  <div className={`p-4 rounded-lg ${
                    feedbackStatus.success 
                      ? 'bg-green-900/30 border border-green-600 text-green-300'
                      : 'bg-red-900/30 border border-red-600 text-red-300'
                  }`}>
                    {feedbackStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Contact Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Support
                  </h3>
                  <p className="text-slate-300 mb-2">For technical support and inquiries:</p>
                  <a href="mailto:support@shield-iot.com" className="text-cyan-400 hover:text-cyan-300">
                    support@shield-iot.com
                  </a>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-teal-300 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Development Team
                  </h3>
                  <p className="text-slate-300 mb-2">Developed by:</p>
                  <ul className="text-slate-300 space-y-1">
                    <li>• Krish Namboodri</li>
                    <li>• Utkarsh Sakpal</li>
                    <li>• Fardin Pirjade</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    System Information
                  </h3>
                  <div className="text-slate-300 space-y-2 text-sm">
                    <p><strong>Version:</strong> MVP 1.0</p>
                    <p><strong>Backend:</strong> Node.js + Express</p>
                    <p><strong>Frontend:</strong> React + Vite</p>
                    <p><strong>Database:</strong> MongoDB</p>
                    <p><strong>ML Model:</strong> Isolation Forest</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Response Time
                  </h3>
                  <p className="text-slate-300 mb-2">We aim to respond to all inquiries within:</p>
                  <p className="text-yellow-300 font-semibold">24-48 hours</p>
                  <p className="text-slate-400 text-sm mt-2">For urgent issues, please use the feedback form and mark it as "Bug Report"</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

