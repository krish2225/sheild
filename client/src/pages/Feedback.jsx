import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Feedback() {
  const [feedback, setFeedback] = useState({
    type: 'bug',
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    classification: 'unknown'
  })
  const [submittedFeedback, setSubmittedFeedback] = useState([])
  const [stats, setStats] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadSubmittedFeedback()
    loadStats()
  }, [])

  const loadSubmittedFeedback = async () => {
    try {
      const { data } = await api.get('/feedback')
      setSubmittedFeedback(data.data.feedback || [])
    } catch (error) {
      console.error('Error loading feedback:', error)
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await api.get('/feedback/stats')
      setStats(data.data.stats || {})
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await api.post('/feedback', feedback)
      alert('Feedback submitted successfully! Thank you for your input.')
      setFeedback({
        type: 'bug',
        title: '',
        description: '',
        priority: 'medium',
        category: 'other',
        classification: 'unknown'
      })
      loadSubmittedFeedback()
      loadStats()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Error submitting feedback: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVote = async (feedbackId, action) => {
    try {
      await api.post(`/feedback/${feedbackId}/vote`, { action })
      loadSubmittedFeedback()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleResolve = async (feedbackId) => {
    const resolution = prompt('Please provide resolution notes:')
    if (resolution) {
      try {
        await api.patch(`/feedback/${feedbackId}/resolve`, { resolution })
        alert('Feedback marked as resolved!')
        loadSubmittedFeedback()
        loadStats()
      } catch (error) {
        console.error('Error resolving feedback:', error)
        alert('Error resolving feedback: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-700/70 text-red-100'
      case 'high': return 'bg-orange-700/60 text-orange-100'
      case 'medium': return 'bg-yellow-700/60 text-yellow-100'
      case 'low': return 'bg-green-700/60 text-green-100'
      default: return 'bg-slate-700 text-slate-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-700/60 text-blue-100'
      case 'in_progress': return 'bg-yellow-700/60 text-yellow-100'
      case 'resolved': return 'bg-green-700/60 text-green-100'
      case 'closed': return 'bg-slate-700 text-slate-200'
      default: return 'bg-slate-700 text-slate-200'
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-slate-200">{stats.total || 0}</div>
          <div className="text-sm text-slate-400">Total Feedback</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{stats.open || 0}</div>
          <div className="text-sm text-slate-400">Open Issues</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.bugs || 0}</div>
          <div className="text-sm text-slate-400">Bug Reports</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{stats.resolved || 0}</div>
          <div className="text-sm text-slate-400">Resolved</div>
        </div>
      </div>

      {/* Submit Feedback Form */}
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Submit Feedback</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={feedback.type}
                onChange={(e) => setFeedback({...feedback, type: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement</option>
                <option value="general">General Feedback</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                value={feedback.priority}
                onChange={(e) => setFeedback({...feedback, priority: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={feedback.category}
                onChange={(e) => setFeedback({...feedback, category: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              >
                <option value="ui">User Interface</option>
                <option value="performance">Performance</option>
                <option value="functionality">Functionality</option>
                <option value="data">Data & Analytics</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Classification</label>
              <select
                value={feedback.classification}
                onChange={(e) => setFeedback({...feedback, classification: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              >
                <option value="software">Software Issue</option>
                <option value="hardware">Hardware Issue</option>
                <option value="both">Both Software & Hardware</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input
              type="text"
              value={feedback.title}
              onChange={(e) => setFeedback({...feedback, title: e.target.value})}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              placeholder="Brief description of the issue or request"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={feedback.description}
              onChange={(e) => setFeedback({...feedback, description: e.target.value})}
              rows={4}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              placeholder="Please provide detailed information about the issue, steps to reproduce (for bugs), or your feature request..."
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-medium rounded-lg px-6 py-3 transition-colors shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>

      {/* Feedback List */}
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Feedback</h3>
        
        <div className="space-y-4">
          {submittedFeedback.map((item) => (
            <div key={item._id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-slate-200">{item.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Type: {item.type}</span>
                    <span>Category: {item.category}</span>
                    <span>Classification: {item.classification}</span>
                    <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.status === 'resolved' && item.resolvedAt && (
                      <span className="text-green-400">Resolved: {new Date(item.resolvedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {item.status === 'resolved' && item.resolution && (
                    <div className="mt-2 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                      <div className="text-sm font-medium text-green-300 mb-1">Resolution Notes:</div>
                      <div className="text-sm text-green-200">{item.resolution}</div>
                      {item.assignedTo && (
                        <div className="text-xs text-green-400 mt-1">Resolved by: {item.assignedTo}</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(item._id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors"
                      title="Mark as resolved"
                    >
                      ✓ Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleVote(item._id, 'up')}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-green-400 transition-colors"
                    title="Vote up"
                  >
                    ↑
                  </button>
                  <span className="text-sm text-slate-300 min-w-[20px] text-center">{item.votes || 0}</span>
                  <button
                    onClick={() => handleVote(item._id, 'down')}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                    title="Vote down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {submittedFeedback.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No feedback submitted yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
