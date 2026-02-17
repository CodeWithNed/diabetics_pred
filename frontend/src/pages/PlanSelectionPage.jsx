import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, TrendingDown, Activity, Apple, Heart, ArrowRight, CheckCircle } from 'lucide-react'
import Navigation from '../components/Navigation'
import { createPlan, getMyPlans } from '../services/plans'
import { getLatestResult } from '../services/results'
import './PlanSelectionPage.css'

const PLAN_TEMPLATES = [
  {
    id: 'weight_loss',
    name: 'Weight Loss Journey',
    icon: TrendingDown,
    color: '#4CAF50',
    description: 'Lose 10-20 lbs through balanced nutrition and exercise',
    duration: '3-6 months',
    difficulty: 'Moderate',
    milestones: [
      { name: 'Lose 5 lbs', target: 25 },
      { name: 'Lose 10 lbs', target: 50 },
      { name: 'Lose 15 lbs', target: 75 },
      { name: 'Reach goal weight', target: 100 }
    ],
    expectedOutcome: '15-30% risk reduction'
  },
  {
    id: 'exercise',
    name: 'Active Lifestyle',
    icon: Activity,
    color: '#2196F3',
    description: '30 minutes of daily physical activity',
    duration: '2-3 months',
    difficulty: 'Easy',
    milestones: [
      { name: '1 week streak', target: 20 },
      { name: '1 month streak', target: 50 },
      { name: '2 months streak', target: 75 },
      { name: 'Habit formed', target: 100 }
    ],
    expectedOutcome: '10-20% risk reduction'
  },
  {
    id: 'diet',
    name: 'Healthy Eating',
    icon: Apple,
    color: '#FF9800',
    description: 'Improve diet with whole foods, reduce sugar and processed foods',
    duration: '3-4 months',
    difficulty: 'Moderate',
    milestones: [
      { name: 'Sugar-free 1 week', target: 25 },
      { name: 'Meal planning mastery', target: 50 },
      { name: 'Consistent healthy choices', target: 75 },
      { name: 'Lifestyle integrated', target: 100 }
    ],
    expectedOutcome: '20-35% risk reduction'
  },
  {
    id: 'lifestyle',
    name: 'Complete Lifestyle Change',
    icon: Heart,
    color: '#E91E63',
    description: 'Comprehensive approach: diet, exercise, sleep, and stress management',
    duration: '6-12 months',
    difficulty: 'Challenging',
    milestones: [
      { name: 'Initial habits', target: 20 },
      { name: 'Routine established', target: 40 },
      { name: 'Significant progress', target: 60 },
      { name: 'Transformation complete', target: 100 }
    ],
    expectedOutcome: '40-60% risk reduction'
  }
]

function PlanSelectionPage() {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [latestResult, setLatestResult] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const fromAnalysis = location.state?.fromAnalysis

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getLatestResult()
        setLatestResult(result.result)
      } catch (error) {
        console.log('No analysis result yet')
      }
    }
    loadData()
  }, [])

  const handleSelectPlan = async (template) => {
    setLoading(true)
    try {
      const response = await createPlan({
        plan_name: template.name,
        plan_type: template.id,
        description: template.description,
        scenario_parameters: {
          duration: template.duration,
          difficulty: template.difficulty
        },
        expected_outcomes: {
          risk_reduction: template.expectedOutcome
        },
        milestones: template.milestones,
        is_primary: true
      })

      console.log('✅ Plan created successfully!', response)

      // Navigate to dashboard with refresh flag
      navigate('/dashboard', { state: { planJustCreated: true }, replace: true })

      // Force page reload to fetch new plan
      setTimeout(() => window.location.href = '/dashboard', 100)

    } catch (error) {
      console.error('Error creating plan:', error)
      console.error('Error details:', error.response?.data)
      alert(`Failed to create plan: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="plan-selection-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="plan-selection-content"
        >
          <div className="page-header">
            {fromAnalysis && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="success-banner"
              >
                <CheckCircle size={24} />
                <span>Analysis Complete! Results Saved Successfully</span>
              </motion.div>
            )}
            <h1>Choose Your Health Plan</h1>
            <p>Select a personalized plan to start your health improvement journey</p>
            {latestResult && (
              <div className="current-risk-badge">
                Current Risk: {latestResult.combined_risk?.toFixed(1)}% - {latestResult.risk_category}
              </div>
            )}
          </div>

          <div className="plans-grid">
            {PLAN_TEMPLATES.map((template, idx) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`plan-template-card ${selectedPlan?.id === template.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(template)}
              >
                <div className="plan-icon-circle" style={{ background: template.color }}>
                  <template.icon size={32} color="white" />
                </div>

                <h3>{template.name}</h3>
                <p className="plan-desc">{template.description}</p>

                <div className="plan-meta">
                  <div className="meta-item">
                    <span className="meta-label">Duration</span>
                    <span className="meta-value">{template.duration}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Difficulty</span>
                    <span className="meta-value">{template.difficulty}</span>
                  </div>
                </div>

                <div className="expected-outcome">
                  <strong>Expected:</strong> {template.expectedOutcome}
                </div>

                {selectedPlan?.id === template.id && (
                  <motion.button
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="select-plan-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectPlan(template)
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Creating Plan...' : 'Start This Plan'}
                    <ArrowRight size={18} />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>

          <div className="plan-note">
            <p>💡 You can change or adjust your plan anytime from your dashboard</p>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default PlanSelectionPage
