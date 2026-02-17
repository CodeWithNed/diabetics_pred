import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, Target, ArrowRight, AlertCircle } from 'lucide-react'
import Navigation from '../components/Navigation'
import { getStoredUser } from '../services/auth'
import { getLatestResult, getResultsSummary } from '../services/results'
import { getPrimaryPlan } from '../services/plans'
import './DashboardPage.css'

function DashboardPage() {
  const [user, setUser] = useState(null)
  const [latestResult, setLatestResult] = useState(null)
  const [summary, setSummary] = useState(null)
  const [primaryPlan, setPrimaryPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const storedUser = getStoredUser()
        if (!storedUser) {
          navigate('/login')
          return
        }
        setUser(storedUser)

        // Load latest result, summary, and primary plan
        const [resultData, summaryData, planData] = await Promise.allSettled([
          getLatestResult(),
          getResultsSummary(),
          getPrimaryPlan()
        ])

        if (resultData.status === 'fulfilled') {
          setLatestResult(resultData.value.result)
        }

        if (summaryData.status === 'fulfilled') {
          setSummary(summaryData.value)
        }

        if (planData.status === 'fulfilled') {
          setPrimaryPlan(planData.value.plan)
        }

      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [navigate])

  const getRiskColor = (risk) => {
    if (risk < 25) return '#4CAF50'
    if (risk < 50) return '#FF9800'
    if (risk < 75) return '#FF5722'
    return '#F44336'
  }

  const getRiskLabel = (category) => {
    const labels = {
      low: 'Low Risk',
      moderate: 'Moderate Risk',
      high: 'High Risk',
      very_high: 'Very High Risk'
    }
    return labels[category] || 'Unknown'
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="dashboard-page">
          <div className="loading-state">
            <Activity className="loading-icon" />
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  // First-time user - no analysis yet
  if (!latestResult) {
    return (
      <>
        <Navigation />
        <div className="dashboard-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="welcome-section"
          >
            <div className="welcome-card">
              <h1>Welcome to Diabetes AI, {user?.username}! 👋</h1>
              <p>Get started by completing your first health assessment</p>

              <div className="getting-started">
                <h3>What happens next:</h3>
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Complete Analysis</h4>
                      <p>Upload retinal image and lifestyle data</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Choose Your Plan</h4>
                      <p>Select a personalized health improvement plan</p>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Track Progress</h4>
                      <p>Monitor your journey and achieve your goals</p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="cta-button" onClick={() => navigate('/analyze')}>
                Begin Your Assessment
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </>
    )
  }

  // User with analysis results
  const riskScore = latestResult.combined_risk || 0
  const riskColor = getRiskColor(riskScore)

  return (
    <>
      <Navigation />
      <div className="dashboard-page">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="dashboard-content"
        >
          {/* Main Risk Card */}
          <div className="risk-overview">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="risk-card"
            >
              <div className="risk-header">
                <h2>Your Latest Assessment</h2>
                <span className="assessment-date">
                  {new Date(latestResult.analysis_date).toLocaleDateString()}
                </span>
              </div>

              <div className="risk-score-container">
                <svg className="progress-ring" width="200" height="200">
                  <circle
                    className="progress-ring-circle-bg"
                    stroke="#f0f0f0"
                    strokeWidth="16"
                    fill="transparent"
                    r="84"
                    cx="100"
                    cy="100"
                  />
                  <circle
                    className="progress-ring-circle"
                    stroke={riskColor}
                    strokeWidth="16"
                    fill="transparent"
                    r="84"
                    cx="100"
                    cy="100"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 84}`,
                      strokeDashoffset: `${2 * Math.PI * 84 * (1 - riskScore / 100)}`,
                      transition: 'stroke-dashoffset 1s ease'
                    }}
                  />
                  <text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    className="risk-score-text"
                    fill={riskColor}
                  >
                    {riskScore.toFixed(1)}%
                  </text>
                  <text
                    x="100"
                    y="115"
                    textAnchor="middle"
                    className="risk-label-text"
                    fill="#666"
                  >
                    Risk Score
                  </text>
                </svg>
              </div>

              <div className="risk-category-badge" style={{ backgroundColor: `${riskColor}20`, color: riskColor }}>
                {getRiskLabel(latestResult.risk_category)}
              </div>

              {summary?.risk_trend && (
                <div className="risk-trend">
                  {summary.risk_trend === 'improving' ? (
                    <><TrendingDown size={20} style={{ color: '#4CAF50' }} /> <span style={{ color: '#4CAF50' }}>Improving</span></>
                  ) : summary.risk_trend === 'worsening' ? (
                    <><TrendingUp size={20} style={{ color: '#F44336' }} /> <span style={{ color: '#F44336' }}>Needs Attention</span></>
                  ) : (
                    <span style={{ color: '#999' }}>Stable</span>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Plan and Actions Grid */}
          <div className="dashboard-grid">
            {/* Active Plan Card */}
            {primaryPlan ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="plan-card"
              >
                <div className="card-header">
                  <Target size={24} style={{ color: '#667eea' }} />
                  <h3>Your Active Plan</h3>
                </div>

                <div className="plan-details">
                  <h4>{primaryPlan.plan_name}</h4>
                  <p>{primaryPlan.description}</p>

                  <div className="progress-bar-container">
                    <div className="progress-info">
                      <span>Progress</span>
                      <span className="progress-percent">{primaryPlan.current_progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${primaryPlan.current_progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button className="card-action-btn" onClick={() => navigate('/progress')}>
                  Track Progress
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="plan-card empty"
              >
                <AlertCircle size={48} style={{ color: '#FF9800', marginBottom: '16px' }} />
                <h3>No Active Plan</h3>
                <p>Choose a health plan to start your improvement journey</p>
                <button className="cta-button" onClick={() => navigate('/plans')}>
                  Select a Plan
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {/* Recommendations Card */}
            {latestResult?.recommendations && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="recommendations-card"
              >
                <div className="card-header">
                  <h3>Personalized Recommendations</h3>
                </div>

                <div className="recommendations-list">
                  {(latestResult.recommendations.slice(0, 3) || []).map((rec, idx) => (
                    <div key={idx} className="recommendation-item">
                      <div className="rec-icon">💡</div>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>

                <button className="card-action-btn secondary" onClick={() => navigate('/results')}>
                  View All Insights
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="quick-actions"
          >
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-card" onClick={() => navigate('/plans')}>
                <Target size={32} />
                <span>My Plans</span>
              </button>
              <button className="action-card" onClick={() => navigate('/simulations')}>
                <Activity size={32} />
                <span>What-If Scenarios</span>
              </button>
              <button className="action-card" onClick={() => navigate('/results')}>
                <TrendingUp size={32} />
                <span>View History</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default DashboardPage
