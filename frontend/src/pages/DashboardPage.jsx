import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Activity, Target, ArrowRight, AlertCircle,
  Heart, Droplets, Brain, Eye, Zap, Moon, Scale, Clock,
  ChevronRight, Sparkles, Shield, BarChart3, User, Download, FileText, FileSpreadsheet
} from 'lucide-react'
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
  const [activeMetric, setActiveMetric] = useState(null)
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

  const getRiskGradient = (risk) => {
    if (risk < 25) return 'linear-gradient(135deg, #00F5A0 0%, #00D9FF 100%)'
    if (risk < 50) return 'linear-gradient(135deg, #FFD200 0%, #F7971E 100%)'
    if (risk < 75) return 'linear-gradient(135deg, #FF6B9D 0%, #FEC064 100%)'
    return 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)'
  }

  const getRiskLabel = (category) => {
    const labels = {
      low: 'Optimal Health',
      moderate: 'Moderate Caution',
      high: 'Elevated Risk',
      very_high: 'Critical Alert'
    }
    return labels[category] || 'Analyzing...'
  }

  // Generate comprehensive report content using analysis data
  const generateReportContent = () => {
    const riskScore = latestResult.combined_risk || 0
    const riskCategory = latestResult.risk_category || 'moderate'

    // Generate personalized insights based on risk level
    const getPersonalizedInsights = () => {
      const insights = []

      if (riskScore < 25) {
        insights.push("Your current health metrics indicate a low risk for diabetes. This is excellent news!")
        insights.push("Continue maintaining your healthy lifestyle habits to keep your risk low.")
        insights.push("Regular monitoring and preventive care will help you stay on track.")
      } else if (riskScore < 50) {
        insights.push("Your assessment shows moderate risk factors for diabetes that warrant attention.")
        insights.push("Early intervention at this stage can significantly reduce your risk progression.")
        insights.push("Focus on lifestyle modifications and regular monitoring of key health metrics.")
      } else if (riskScore < 75) {
        insights.push("Your risk assessment indicates elevated concern for diabetes development.")
        insights.push("Immediate lifestyle changes and medical consultation are strongly recommended.")
        insights.push("With proper intervention, you can still prevent or delay diabetes onset.")
      } else {
        insights.push("Your assessment shows critical risk factors requiring immediate medical attention.")
        insights.push("Consult with a healthcare provider as soon as possible for comprehensive evaluation.")
        insights.push("Aggressive intervention strategies may be necessary to manage your risk.")
      }

      // Add specific insights based on retinal vs lifestyle risk
      if (latestResult.retinal_risk > latestResult.lifestyle_risk) {
        insights.push("Retinal analysis shows concerning patterns. Regular eye examinations are crucial.")
      } else if (latestResult.lifestyle_risk > latestResult.retinal_risk) {
        insights.push("Lifestyle factors are your primary risk drivers. Focus on diet, exercise, and weight management.")
      }

      return insights
    }

    // Generate actionable recommendations
    const getDetailedRecommendations = () => {
      const recs = []

      // Diet recommendations
      recs.push({
        category: "Dietary Changes",
        items: [
          "Reduce sugar and refined carbohydrate intake",
          "Increase fiber consumption through whole grains and vegetables",
          "Control portion sizes and meal timing",
          "Stay hydrated with water instead of sugary drinks"
        ]
      })

      // Exercise recommendations
      if (healthMetrics?.lifestyle?.find(m => m.label === "Activity")?.value < 150) {
        recs.push({
          category: "Physical Activity",
          items: [
            "Aim for at least 150 minutes of moderate exercise per week",
            "Include both aerobic and resistance training",
            "Start with 10-minute walks after meals",
            "Gradually increase intensity and duration"
          ]
        })
      }

      // Medical follow-up
      recs.push({
        category: "Medical Follow-up",
        items: [
          riskScore > 50 ? "Schedule immediate consultation with healthcare provider" : "Annual diabetes screening recommended",
          "Monitor blood pressure and cholesterol regularly",
          "Consider HbA1c testing every 3-6 months",
          "Maintain regular eye examinations"
        ]
      })

      return recs
    }

    return {
      insights: getPersonalizedInsights(),
      recommendations: getDetailedRecommendations(),
      riskInterpretation: getRiskInterpretation(riskScore),
      nextSteps: getNextSteps(riskCategory)
    }
  }

  // Get risk interpretation text
  const getRiskInterpretation = (score) => {
    if (score < 25) return "Your risk level is optimal. You're doing great!"
    if (score < 50) return "Moderate risk detected. Preventive action recommended."
    if (score < 75) return "Elevated risk identified. Immediate lifestyle changes needed."
    return "Critical risk level. Urgent medical consultation required."
  }

  // Get next steps based on risk category
  const getNextSteps = (category) => {
    const steps = {
      low: [
        "Continue current healthy lifestyle",
        "Annual health check-ups",
        "Maintain awareness of risk factors"
      ],
      moderate: [
        "Implement lifestyle modifications",
        "Schedule doctor consultation within 3 months",
        "Begin regular glucose monitoring"
      ],
      high: [
        "Urgent medical consultation needed",
        "Start intensive lifestyle intervention",
        "Consider medication if recommended by doctor"
      ],
      very_high: [
        "Immediate medical attention required",
        "Comprehensive diabetes evaluation",
        "Begin treatment protocol as advised"
      ]
    }
    return steps[category] || steps.moderate
  }

  // Generate PDF report with rich content
  const downloadPDF = () => {
    if (!latestResult) return

    const reportContent = generateReportContent()
    const riskScore = latestResult.combined_risk || 0

    // Create rich PDF content as HTML
    const pdfContent = `
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 {
            color: #1a1a2e;
            font-size: 28px;
            margin-bottom: 10px;
          }
          h2 {
            color: #667eea;
            font-size: 20px;
            margin: 25px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
          }
          h3 {
            color: #444;
            font-size: 16px;
            margin: 15px 0 10px 0;
          }
          .metadata {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin: 30px 0;
            page-break-inside: avoid;
          }
          .metric {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            margin: 8px 0;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .metric strong {
            color: #1a1a2e;
          }
          .risk-score-box {
            background: linear-gradient(135deg, ${riskScore < 50 ? '#00F5A0, #00D9FF' : riskScore < 75 ? '#FFD200, #F7971E' : '#FF416C, #FF4B2B'});
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 20px 0;
          }
          .risk-score-box .score {
            font-size: 48px;
            font-weight: bold;
          }
          .risk-high { color: #ff4b2b; font-weight: bold; }
          .risk-moderate { color: #f7971e; font-weight: bold; }
          .risk-low { color: #00d9ff; font-weight: bold; }
          .insight-box {
            background: #f0f4ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
          }
          .recommendation-category {
            margin: 20px 0;
          }
          ul {
            margin-left: 20px;
          }
          li {
            margin: 8px 0;
          }
          .next-steps {
            background: #fff8e1;
            border: 1px solid #ffeb3b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Comprehensive Diabetes Risk Assessment Report</h1>
          <div class="metadata">
            <p><strong>Patient:</strong> ${user?.username || 'Anonymous'}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Report ID:</strong> ${Date.now()}</p>
          </div>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="risk-score-box">
            <div class="score">${riskScore.toFixed(0)}%</div>
            <div>${getRiskLabel(latestResult.risk_category)}</div>
          </div>
          <p style="margin-top: 15px; font-size: 16px;">
            <strong>${reportContent.riskInterpretation}</strong>
          </p>
        </div>

        <div class="section">
          <h2>Risk Assessment Breakdown</h2>
          <div class="metric">
            <span>Overall Diabetes Risk:</span>
            <strong class="${riskScore < 50 ? 'risk-low' : riskScore < 75 ? 'risk-moderate' : 'risk-high'}">${riskScore.toFixed(1)}%</strong>
          </div>
          <div class="metric">
            <span>Retinal Analysis Risk:</span>
            <strong>${(latestResult.retinal_risk || 0).toFixed(1)}%</strong>
          </div>
          <div class="metric">
            <span>Lifestyle Factors Risk:</span>
            <strong>${(latestResult.lifestyle_risk || 0).toFixed(1)}%</strong>
          </div>
          <div class="metric">
            <span>Confidence Score:</span>
            <strong>${((latestResult.confidence_score || 0.85) * 100).toFixed(0)}%</strong>
          </div>
        </div>

        ${healthMetrics ? `
        <div class="section">
          <h2>Health Metrics Analysis</h2>
          <h3>Vital Signs</h3>
          ${healthMetrics.vitals.map(m => `
            <div class="metric">
              <span>${m.label}:</span>
              <strong>${m.value} ${m.unit || ''}</strong>
            </div>
          `).join('')}

          ${healthMetrics.lifestyle ? `
          <h3>Lifestyle Factors</h3>
          ${healthMetrics.lifestyle.map(m => `
            <div class="metric">
              <span>${m.label}:</span>
              <strong>${m.value} ${m.unit || ''}</strong>
            </div>
          `).join('')}
          ` : ''}
        </div>
        ` : ''}

        <div class="section">
          <h2>Personalized Health Insights</h2>
          ${reportContent.insights.map(insight => `
            <div class="insight-box">
              <p>${insight}</p>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h2>Detailed Recommendations</h2>
          ${reportContent.recommendations.map(rec => `
            <div class="recommendation-category">
              <h3>${rec.category}</h3>
              <ul>
                ${rec.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h2>Immediate Next Steps</h2>
          <div class="next-steps">
            <ul>
              ${reportContent.nextSteps.map(step => `<li><strong>${step}</strong></li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="footer">
          <p><strong>Disclaimer:</strong> This report is generated by an AI-powered system for informational purposes only.
          It does not constitute medical advice. Please consult with qualified healthcare professionals for diagnosis and treatment.</p>
          <p><strong>Powered by:</strong> Advanced AI Diabetes Detection System | ${new Date().getFullYear()}</p>
        </div>
      </body>
      </html>
    `

    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `diabetes-risk-report-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Generate CSV report
  const downloadCSV = () => {
    if (!latestResult) return

    // Create CSV content
    const csvRows = [
      ['Diabetes Risk Assessment Report'],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [`Patient: ${user?.username || 'Anonymous'}`],
      [],
      ['Metric', 'Value', 'Unit'],
      ['Overall Risk Score', (latestResult.combined_risk || 0).toFixed(1), '%'],
      ['Risk Category', getRiskLabel(latestResult.risk_category), ''],
      ['Retinal Risk', (latestResult.retinal_risk || 0).toFixed(1), '%'],
      ['Lifestyle Risk', (latestResult.lifestyle_risk || 0).toFixed(1), '%'],
      []
    ]

    // Add health metrics if available
    if (healthMetrics) {
      csvRows.push(['Health Metrics', '', ''])
      healthMetrics.vitals.forEach(metric => {
        csvRows.push([metric.label, metric.value, metric.unit || ''])
      })
      csvRows.push([])

      if (healthMetrics.lifestyle) {
        csvRows.push(['Lifestyle Factors', '', ''])
        healthMetrics.lifestyle.forEach(metric => {
          csvRows.push([metric.label, metric.value, metric.unit || ''])
        })
      }
    }

    // Add recommendations
    csvRows.push([])
    csvRows.push(['Recommendations'])
    if (latestResult.recommendations) {
      latestResult.recommendations.forEach(rec => {
        csvRows.push([rec])
      })
    }

    // Convert to CSV string
    const csvContent = csvRows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `diabetes-risk-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Extract user's health metrics from latest analysis
  const getUserHealthMetrics = () => {
    if (!latestResult) return null

    const metrics = latestResult.lifestyle_data || {}
    const retinalData = latestResult.retinal_data || {}

    return {
      vitals: [
        { icon: Heart, label: 'Blood Pressure', value: metrics.blood_pressure || '120/80', unit: 'mmHg', color: '#FF6B9D' },
        { icon: Droplets, label: 'Glucose', value: metrics.blood_glucose || '95', unit: 'mg/dL', color: '#4ECDC4' },
        { icon: Scale, label: 'BMI', value: metrics.bmi || '24.5', unit: 'kg/m²', color: '#FFD93D' },
        { icon: Brain, label: 'HbA1c', value: metrics.hba1c || '5.4', unit: '%', color: '#95E1D3' }
      ],
      lifestyle: [
        { icon: Activity, label: 'Exercise', value: metrics.physical_activity || '30', unit: 'min/day', color: '#F38181' },
        { icon: Moon, label: 'Sleep', value: metrics.sleep_hours || '7', unit: 'hours', color: '#AA96DA' },
        { icon: Zap, label: 'Stress', value: metrics.stress_level || 'Low', unit: '', color: '#FCBAD3' },
        { icon: Eye, label: 'Retinal', value: retinalData.dr_detected ? 'Alert' : 'Clear', unit: '', color: '#A8E6CF' }
      ]
    }
  }

  const healthMetrics = getUserHealthMetrics()

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="dashboard-page">
          <motion.div className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div className="pulse-loader"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Heart size={48} />
            </motion.div>
            <p>Analyzing your health data...</p>
          </motion.div>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="welcome-section"
          >
            <motion.div className="welcome-hero"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div className="welcome-avatar"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                <User size={48} />
              </motion.div>
              <h1 className="welcome-title">
                Welcome back,
                <span className="user-name"> {user?.username}</span>
              </h1>
              <p className="welcome-subtitle">
                Let's begin your diabetes risk assessment with our AI-powered health analysis
              </p>

              <div className="onboarding-cards">
                {[
                  { icon: Eye, title: 'Retinal Scan', desc: 'AI-powered eye analysis for early detection', delay: 0.5 },
                  { icon: BarChart3, title: 'Risk Assessment', desc: 'Comprehensive health risk evaluation', delay: 0.6 },
                  { icon: Shield, title: 'Prevention Plan', desc: 'Personalized action steps for better health', delay: 0.7 }
                ].map((step, idx) => (
                  <motion.div key={idx} className="onboarding-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: step.delay }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="card-icon-wrapper">
                      <step.icon size={32} />
                    </div>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </motion.div>
                ))}
              </div>

              <button
                className="start-assessment-btn"
                onClick={() => navigate('/analyze')}
              >
                <Sparkles size={20} />
                Begin Health Assessment
                <ArrowRight size={20} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </>
    )
  }

  // User with analysis results
  const riskScore = latestResult.combined_risk || 0
  const riskGradient = getRiskGradient(riskScore)

  return (
    <>
      <Navigation />
      <div className="dashboard-page">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="dashboard-content"
        >
          {/* Header Section */}
          <motion.div className="dashboard-header"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="user-greeting">
              <h1 className="greeting-title">
                Health Dashboard
              </h1>
              <p className="greeting-subtitle">
                Welcome back, {user?.username} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </motion.div>

          {/* Risk Score Hero */}
          <motion.div className="risk-hero-section"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="risk-hero-card">
              <div className="risk-visualization">
                <motion.div className="risk-circle-wrapper"
                  whileHover={{ scale: 1.05 }}
                >
                  <svg className="risk-circle" viewBox="0 0 250 250">
                    <defs>
                      <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF416C" />
                        <stop offset="100%" stopColor="#FF4B2B" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="125" cy="125" r="110"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="20"
                    />
                    <motion.circle
                      cx="125" cy="125" r="110"
                      fill="none"
                      stroke="url(#riskGradient)"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 110}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 110 * (1 - riskScore / 100) }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </svg>
                  <div className="risk-score-display">
                    <motion.span className="risk-number"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      {riskScore.toFixed(0)}
                    </motion.span>
                    <span className="risk-percent">%</span>
                  </div>
                </motion.div>

                <div className="risk-info">
                  <div className="risk-label-badge" style={{ background: riskGradient }}>
                    {getRiskLabel(latestResult.risk_category)}
                  </div>

                  {summary?.risk_trend && (
                    <motion.div className="trend-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {summary.risk_trend === 'improving' ? (
                        <div className="trend-badge improving">
                          <TrendingDown size={18} />
                          <span>Improving</span>
                        </div>
                      ) : (
                        <div className="trend-badge worsening">
                          <TrendingUp size={18} />
                          <span>Needs Focus</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="risk-breakdown">
                <h3>Risk Components</h3>
                <div className="breakdown-items" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem' }}>
                  <div className="breakdown-item" style={{ textAlign: 'center' }}>
                    <span className="breakdown-label" style={{ display: 'block', fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Retinal Analysis</span>
                    <span className="breakdown-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#6366f1' }}>
                      {(latestResult.retinal_risk || 0).toFixed(0)}%
                    </span>
                  </div>

                  <div className="breakdown-item" style={{ textAlign: 'center' }}>
                    <span className="breakdown-label" style={{ display: 'block', fontSize: '0.9rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Lifestyle Factors</span>
                    <span className="breakdown-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
                      {(latestResult.lifestyle_risk || 0).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Download Report Section */}
              <div className="download-section" style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  className="download-btn pdf-btn"
                  onClick={downloadPDF}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                >
                  <FileText size={18} />
                  Download PDF Report
                </button>

                <button
                  className="download-btn csv-btn"
                  onClick={downloadCSV}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                >
                  <FileSpreadsheet size={18} />
                  Download CSV Data
                </button>
              </div>
            </div>
          </motion.div>

          {/* Health Metrics Summary */}
          {healthMetrics && (
            <motion.div className="health-metrics-section"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="section-title">Your Health Snapshot</h2>

              <div className="metrics-grid">
                <div className="metrics-group">
                  <h3>Vital Signs</h3>
                  <div className="metrics-cards">
                    {healthMetrics.vitals.map((metric, idx) => (
                      <motion.div key={idx}
                        className="metric-card"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        whileHover={{ y: -5, scale: 1.05 }}
                        onClick={() => setActiveMetric(activeMetric === idx ? null : idx)}
                      >
                        <div className="metric-icon" style={{ background: metric.color }}>
                          <metric.icon size={24} />
                        </div>
                        <div className="metric-info">
                          <span className="metric-label">{metric.label}</span>
                          <div className="metric-value-wrapper">
                            <span className="metric-value">{metric.value}</span>
                            {metric.unit && <span className="metric-unit">{metric.unit}</span>}
                          </div>
                        </div>
                        <AnimatePresence>
                          {activeMetric === idx && (
                            <motion.div className="metric-tooltip"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              Latest reading from your health assessment
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="metrics-group">
                  <h3>Lifestyle Factors</h3>
                  <div className="metrics-cards">
                    {healthMetrics.lifestyle.map((metric, idx) => (
                      <motion.div key={idx}
                        className="metric-card lifestyle"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 + idx * 0.1 }}
                        whileHover={{ y: -5, scale: 1.05 }}
                      >
                        <div className="metric-icon" style={{ background: metric.color }}>
                          <metric.icon size={24} />
                        </div>
                        <div className="metric-info">
                          <span className="metric-label">{metric.label}</span>
                          <div className="metric-value-wrapper">
                            <span className="metric-value">{metric.value}</span>
                            {metric.unit && <span className="metric-unit">{metric.unit}</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Cards */}
          <motion.div className="action-section"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="action-cards-grid">
              {/* Health Plan Card */}
              <motion.div className="action-card plan-card"
                whileHover={{ scale: 1.02 }}
              >
                <div className="card-glow"></div>
                {primaryPlan ? (
                  <>
                    <div className="card-header">
                      <Shield size={28} />
                      <h3>Active Health Plan</h3>
                    </div>
                    <div className="plan-content">
                      <h4>{primaryPlan.plan_name}</h4>
                      <p className="plan-desc">{primaryPlan.description}</p>

                      <div className="progress-indicator" style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <div className="progress-header" style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Progress</span>
                        </div>
                        <div className="progress-display" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                          {primaryPlan.current_progress}%
                        </div>
                      </div>

                      <button className="action-btn primary" onClick={() => navigate('/progress')}>
                        Continue Plan
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-plan-state">
                    <div className="empty-icon">
                      <Target size={48} />
                    </div>
                    <h3>Start Your Health Journey</h3>
                    <p>Select a personalized plan to begin improving your health</p>
                    <button className="action-btn highlight" onClick={() => navigate('/plans')}>
                      <Sparkles size={18} />
                      Choose Plan
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions Card */}
              <motion.div className="action-card quick-actions"
                whileHover={{ scale: 1.02 }}
              >
                <div className="card-header">
                  <Zap size={28} />
                  <h3>Quick Actions</h3>
                </div>

                <div className="quick-action-list">
                  <button className="quick-action-item"
                    onClick={() => navigate('/analyze')}
                  >
                    <Eye size={20} />
                    <span>New Analysis</span>
                    <ChevronRight size={16} />
                  </button>

                  <button className="quick-action-item"
                    onClick={() => navigate('/results')}
                  >
                    <BarChart3 size={20} />
                    <span>View Results</span>
                    <ChevronRight size={16} />
                  </button>

                  <button className="quick-action-item"
                    onClick={() => navigate('/simulations')}
                  >
                    <Activity size={20} />
                    <span>What-If Scenarios</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Insights Section */}
          {latestResult?.recommendations && (
            <motion.div className="insights-section"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="section-title">AI Health Insights</h2>
              <div className="insights-grid">
                {latestResult.recommendations.slice(0, 3).map((rec, idx) => (
                  <motion.div key={idx} className="insight-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 + idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="insight-icon">
                      <Brain size={20} />
                    </div>
                    <p>{rec}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default DashboardPage