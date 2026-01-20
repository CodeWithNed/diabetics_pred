import { useNavigate } from 'react-router-dom'

function TestResultsPage() {
  const navigate = useNavigate()

  // Sample results data structure
  const sampleResults = {
    status: 'success',
    risk_assessment: {
      overall_risk_score: 0.65,
      risk_level: 'moderate',
      confidence_score: 0.85,
      key_factors: [
        { factor: 'High BMI', importance: 0.3, category: 'lifestyle' },
        { factor: 'Family History', importance: 0.25, category: 'genetic' },
        { factor: 'Physical Inactivity', importance: 0.2, category: 'lifestyle' }
      ]
    },
    lifestyle_analysis: {
      risk_score: 0.6,
      significant_factors: ['BMI', 'Physical Activity', 'Diet']
    },
    retinal_analysis: {
      dr_detected: true,
      severity: 'Mild',
      confidence: 0.75,
      predicted_class: 1
    },
    personalized_advice: {
      recommendations: [
        "Start with 150 minutes of moderate exercise weekly to improve insulin sensitivity",
        "Reduce refined sugar intake and focus on whole grains to stabilize blood glucose",
        "Monitor blood pressure regularly as it's a key risk factor for diabetes complications",
        "Consider Mediterranean diet which has shown 30% reduction in diabetes risk",
        "Schedule regular eye exams to monitor for diabetic retinopathy progression"
      ],
      priority_actions: ['Exercise', 'Diet', 'Monitoring']
    },
    what_if_simulations: [
      {
        intervention: "Increase Physical Activity",
        risk_reduction_percent: 25,
        projected_risk: 0.49,
        timeframe: "3-6 months",
        difficulty: "moderate",
        impact: "high",
        description: "Adding 30 minutes of daily walking can significantly improve insulin sensitivity",
        action_items: [
          "Start with 10-minute walks after meals",
          "Gradually increase to 30 minutes daily",
          "Track steps with smartphone or fitness tracker"
        ]
      },
      {
        intervention: "Mediterranean Diet",
        risk_reduction_percent: 20,
        projected_risk: 0.52,
        timeframe: "2-4 months",
        difficulty: "easy",
        impact: "moderate-high",
        description: "Rich in healthy fats and fiber, this diet improves glucose metabolism",
        action_items: [
          "Replace butter with olive oil",
          "Eat fish twice a week",
          "Include nuts and legumes daily"
        ]
      }
    ],
    timestamp: new Date().toISOString()
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Test Results Page Navigation</h1>
      <p>Click below to test the Results page with sample data:</p>
      <button
        onClick={() => navigate('/results', { state: { results: sampleResults } })}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          background: '#1B6B93',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '2rem'
        }}
      >
        Go to Results Page with Sample Data
      </button>
    </div>
  )
}

export default TestResultsPage