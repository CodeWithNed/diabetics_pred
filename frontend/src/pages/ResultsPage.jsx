import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle, Eye, Activity, TrendingDown, Zap, ArrowRight, ArrowLeft, Home, MessageCircle, X, Send } from 'lucide-react'
import './ResultsPage.css'

function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const results = location.state?.results
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  if (!results || results.status === 'error') {
    return (
      <div className="error-state">
        <h2>Analysis Failed</h2>
        <p>{results?.error || 'No results available'}</p>
        <button onClick={() => navigate('/analyze')}>Try Again</button>
      </div>
    )
  }

  // Function to calculate risk level based on score thresholds
  const calculateRiskLevel = (score) => {
    const percentage = score * 100
    if (percentage > 80) return 'very_high'
    if (percentage > 60) return 'high'
    if (percentage > 40) return 'moderate'
    return 'low'
  }

  const { risk_assessment = {}, personalized_advice = {}, what_if_simulations = [] } = results || {}
  const overallRisk = risk_assessment?.overall_risk_score || 0.5
  // Use calculated risk level based on new thresholds
  const riskLevel = calculateRiskLevel(overallRisk)

  // Filter out ONLY empty lines and markdown formatting - keep all actual recommendations
  const filteredRecommendations = (personalized_advice.recommendations || [])
    .filter(rec => rec && rec.trim().length > 0)  // Remove completely empty
    .filter(rec => !rec.startsWith('#'))  // Remove markdown headers
    .filter(rec => !rec.startsWith('|'))  // Remove markdown tables
    .filter(rec => !rec.match(/^[\d.]+$/))  // Remove lone numbers
    .map(rec => rec.replace(/^\d+\.\s*/, '').replace(/^[-•*]\s*/, '').trim())  // Clean bullets
    .filter(rec => rec.length > 10)  // Remove very short items

  const getRiskColor = (level) => {
    const colors = {
      low: '#2ECC71',
      moderate: '#F39C12',
      high: '#E85D75',
      very_high: '#FF6B6B'
    }
    return colors[level] || '#718096'
  }

  const getRiskLabel = (level) => {
    const labels = {
      low: 'Low Risk',
      moderate: 'Moderate Risk',
      high: 'High Risk',
      very_high: 'Very High Risk'
    }
    return labels[level] || 'Unknown'
  }

  const getDRSeverityLabel = (severity) => {
    if (!severity) return 'Detected'

    const severityMap = {
      'mild': 'Mild Risk',
      'moderate': 'Moderate Risk',
      'severe': 'Severe Risk',
      'proliferative': 'Proliferative Risk',
      'non-proliferative': 'Non-Proliferative Risk'
    }

    // Handle both lowercase and mixed case inputs
    const normalized = severity.toLowerCase()
    return severityMap[normalized] || severity
  }

  const openChat = (recommendation, index) => {
    setSelectedRecommendation({ text: recommendation, index })
    setChatMessages([
      {
        type: 'ai',
        text: `I can help you understand and implement this recommendation better. What would you like to know?`
      }
    ])
    setChatOpen(true)
  }

  const sendMessage = async () => {
    if (!userInput.trim()) return

    const userMessage = userInput
    setUserInput('')
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }])
    setChatLoading(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        type: 'ai',
        text: `Here's more detail about "${selectedRecommendation.text.substring(0, 50)}...": ${userMessage}. This is a personalized response based on your question.`
      }])
      setChatLoading(false)
    }, 1000)
  }

  return (
    <div className="results-page">
      <div className="container results-container">
        {/* Page Header with Navigation */}
        <div className="page-nav">
          <button className="nav-back-btn" onClick={() => navigate('/analyze')}>
            <ArrowLeft size={18} />
            New Analysis
          </button>
          <button className="nav-home-btn" onClick={() => navigate('/')}>
            <Home size={18} />
            Home
          </button>
        </div>

        {/* Risk Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="risk-display glass"
        >
          <div className="risk-header">
            <h2>Your Risk Assessment</h2>
            <div className="scan-indicator">
              <span className="pulse-dot"></span>
              <span>Analysis Complete</span>
            </div>
          </div>

          <div className="risk-score-container">
            <div className="risk-circle" style={{ '--risk-percent': `${overallRisk * 100}%` }}>
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" className="risk-track" />
                <circle cx="100" cy="100" r="90" className="risk-progress" style={{ stroke: getRiskColor(riskLevel) }} />
              </svg>
              <div className="risk-score-value">
                <span className="score">{(overallRisk * 100).toFixed(1)}</span>
                <span className="score-label">Risk Score</span>
              </div>
            </div>

            <div className="risk-level-badge" style={{ background: getRiskColor(riskLevel) + '20', color: getRiskColor(riskLevel) }}>
              {getRiskLabel(riskLevel)}
            </div>
          </div>
        </motion.div>

        {/* Quick Summary Cards */}
        <div className="summary-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="summary-card glass"
          >
            <Eye size={24} className="summary-icon" />
            <span className="summary-label">Retinal Scan</span>
            <strong className={risk_assessment?.retinal_analysis?.dr_detected ? 'text-warning' : 'text-success'}>
              {risk_assessment?.retinal_analysis?.dr_detected ?
                getDRSeverityLabel(risk_assessment?.retinal_analysis?.severity) :
                'No DR Detected'}
            </strong>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="summary-card glass"
          >
            <Activity size={24} className="summary-icon" />
            <span className="summary-label">Lifestyle Risk</span>
            <strong>
              {risk_assessment?.lifestyle_analysis?.risk_score ?
                `${(risk_assessment?.lifestyle_analysis?.risk_score * 100).toFixed(0)}%` :
                'Low'}
            </strong>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="summary-card glass"
          >
            <Zap size={24} className="summary-icon" />
            <span className="summary-label">Overall</span>
            <strong style={{ color: getRiskColor(riskLevel) }}>
              {getRiskLabel(riskLevel)}
            </strong>
          </motion.div>
        </div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="recommendations-section glass"
        >
          <div className="recommendations-header">
            <h2>
              <Zap size={24} />
              Your Personalized Action Plan
            </h2>
            <p className="recommendations-subtitle">
              AI-generated recommendations based on your analysis
            </p>
          </div>

          <div className="recommendations-list">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((rec, idx) => {
                // Try to split on common patterns: "because", "Why:", "This helps", etc.
                let action = rec
                let reason = ''

                const patterns = [
                  { split: ' because ', prefix: 'Because ' },
                  { split: ' as ', prefix: 'As ' },
                  { split: '. This ', prefix: 'This ' },
                  { split: ' since ', prefix: 'Since ' },
                  { split: ' to help ', prefix: 'To help ' },
                  { split: '. Why: ', prefix: '' },
                  { split: ' - ', prefix: '' }
                ]

                for (const pattern of patterns) {
                  if (rec.toLowerCase().includes(pattern.split.toLowerCase())) {
                    const parts = rec.split(new RegExp(pattern.split, 'i'))
                    if (parts.length >= 2) {
                      action = parts[0].trim()
                      reason = pattern.prefix + parts.slice(1).join(pattern.split).trim()
                      break
                    }
                  }
                }

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.05) }}
                    className="recommendation-card"
                  >
                    <div className="rec-icon">{idx + 1}</div>
                    <div className="rec-content">
                      <div className="rec-action">{action}</div>
                      {reason && <div className="rec-reason">{reason}</div>}
                    </div>
                    <button
                      className="chat-btn"
                      onClick={() => openChat(rec, idx)}
                      title="Ask AI for more details"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </motion.div>
                )
              })
            ) : (
              <div className="loading-state">
                <div className="spinner-small"></div>
                <p>Generating personalized recommendations...</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="navigation-actions"
        >
          <button
            className="action-button primary"
            onClick={() => navigate('/simulations', { state: { results } })}
          >
            <TrendingDown size={22} />
            <div className="button-content">
              <span className="button-title">What-If Scenarios</span>
              <span className="button-subtitle">See how changes reduce your risk</span>
            </div>
            <ArrowRight size={20} />
          </button>

          <button
            className="action-button secondary"
            onClick={() => navigate('/advanced', { state: { results } })}
          >
            <Zap size={22} />
            <div className="button-content">
              <span className="button-title">ML Metrics</span>
              <span className="button-subtitle">Technical analysis & model details</span>
            </div>
            <ArrowRight size={20} />
          </button>
        </motion.div>

        {/* Chat Modal */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="chat-overlay"
              onClick={() => setChatOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="chat-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="chat-header">
                  <div>
                    <h3>Ask AI About This Recommendation</h3>
                    <p className="chat-subtitle">#{selectedRecommendation?.index + 1}: {selectedRecommendation?.text.substring(0, 60)}...</p>
                  </div>
                  <button className="close-chat" onClick={() => setChatOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="chat-messages">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.type}`}>
                      <div className="message-bubble">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="chat-message ai">
                      <div className="message-bubble">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-input-container">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask for clarification, steps, or tips..."
                    className="chat-input"
                  />
                  <button
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={!userInput.trim() || chatLoading}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ResultsPage
