import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { TrendingDown, Zap, Calendar, Target, ArrowLeft, Home } from 'lucide-react'
import './SimulationPage.css'

function SimulationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const results = location.state?.results

  if (!results) {
    return (
      <div className="error-state">
        <h2>No Simulation Data</h2>
        <p>Please complete an analysis first</p>
        <button onClick={() => navigate('/analyze')}>Go to Analysis</button>
      </div>
    )
  }

  // what_if_simulations is directly an array, not an object with .simulations property
  const simulations = Array.isArray(results.what_if_simulations)
    ? results.what_if_simulations
    : (results.what_if_simulations?.simulations || [])
  const currentRisk = results.risk_assessment?.overall_risk_score || 0.5

  // Debug
  console.log('Simulations data:', simulations)
  console.log('Simulations count:', simulations.length)

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'easy': '#2ECC71',
      'easy-moderate': '#3498DB',
      'moderate': '#F39C12',
      'hard': '#E85D75'
    }
    return colors[difficulty] || '#718096'
  }

  const getImpactColor = (impact) => {
    const colors = {
      'moderate': '#3498DB',
      'moderate-high': '#2ECC71',
      'high': '#27AE60',
      'very high': '#16A085'
    }
    return colors[impact] || '#718096'
  }

  return (
    <div className="simulation-page">
      <div className="container simulation-container">
        {/* Page Navigation */}
        <div className="page-nav">
          <button className="nav-back-btn" onClick={() => navigate('/results', { state: { results } })}>
            <ArrowLeft size={18} />
            Back to Results
          </button>
          <button className="nav-home-btn" onClick={() => navigate('/')}>
            <Home size={18} />
            Home
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="simulation-header"
        >
          <h1>
            <TrendingDown size={36} />
            What-If Simulations
          </h1>
          <p className="header-description">
            Explore how different lifestyle interventions could reduce your diabetes risk.
            Each scenario shows projected outcomes based on clinical research.
          </p>

          <div className="current-risk-banner">
            <span className="text-mono">Your Current Risk Score:</span>
            <span className="current-risk-value">{(currentRisk * 100).toFixed(1)}%</span>
          </div>
        </motion.div>

        {simulations.length === 0 ? (
          <div className="no-simulations">
            <Zap size={48} />
            <h3>No Simulations Available</h3>
            <p>Simulations are being generated. Please try refreshing or complete a new analysis.</p>
            <button className="nav-back-btn" onClick={() => navigate('/results', { state: { results } })}>
              <ArrowLeft size={18} />
              Back to Results
            </button>
          </div>
        ) : (
          <div className="simulations-grid">
          {simulations.map((sim, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="simulation-card glass"
            >
              <div className="simulation-header-card">
                <h3>{sim.intervention}</h3>
                <div className="simulation-badges">
                  <span
                    className="badge difficulty-badge"
                    style={{ background: getDifficultyColor(sim.difficulty) + '20', color: getDifficultyColor(sim.difficulty) }}
                  >
                    {sim.difficulty}
                  </span>
                  <span
                    className="badge impact-badge"
                    style={{ background: getImpactColor(sim.impact) + '20', color: getImpactColor(sim.impact) }}
                  >
                    {sim.impact} impact
                  </span>
                </div>
              </div>

              <p className="simulation-description">{sim.description}</p>

              {/* Risk Reduction Visualization */}
              <div className="risk-reduction-viz">
                <div className="viz-labels">
                  <span>Current</span>
                  <span className="reduction-amount">
                    -{sim.risk_reduction_percent.toFixed(0)}%
                  </span>
                  <span>Projected</span>
                </div>

                <div className="risk-bars">
                  <div className="risk-bar current">
                    <div className="bar-fill" style={{ width: `${currentRisk * 100}%` }}></div>
                    <span className="bar-value">{(currentRisk * 100).toFixed(1)}%</span>
                  </div>
                  <TrendingDown className="arrow-icon" size={24} />
                  <div className="risk-bar projected">
                    <div
                      className="bar-fill projected"
                      style={{ width: `${sim.projected_risk * 100}%`, background: getImpactColor(sim.impact) }}
                    ></div>
                    <span className="bar-value">{(sim.projected_risk * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="action-items">
                <h4>
                  <Target size={18} />
                  Action Plan
                </h4>
                <ul className="action-list">
                  {sim.action_items.map((action, actionIdx) => (
                    <li key={actionIdx}>{action}</li>
                  ))}
                </ul>
              </div>

              {/* Timeframe */}
              <div className="simulation-footer">
                <div className="timeframe">
                  <Calendar size={16} />
                  <span>{sim.timeframe}</span>
                </div>
                <button className="try-simulation-btn">
                  <Zap size={16} />
                  Try This
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Best Scenario Highlight */}
        {simulations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="best-scenario glass"
          >
            <h2>
              <Zap size={28} />
              Recommended Path
            </h2>
            <p>
              Based on your risk profile, we recommend starting with <strong>graduated lifestyle changes</strong>,
              focusing first on the most impactful and achievable interventions.
            </p>
            <div className="recommendation-pathway">
              <div className="pathway-step">
                <span className="step-label">Immediate</span>
                <span>Improve sleep quality & dietary choices</span>
              </div>
              <div className="pathway-arrow">→</div>
              <div className="pathway-step">
                <span className="step-label">1-3 Months</span>
                <span>Increase physical activity gradually</span>
              </div>
              <div className="pathway-arrow">→</div>
              <div className="pathway-step">
                <span className="step-label">3-6 Months</span>
                <span>Achieve target weight & maintain habits</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SimulationPage
