import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import ResultsPage from './pages/ResultsPage'
import SimulationPage from './pages/SimulationPage'
import AdvancedMetricsPage from './pages/AdvancedMetricsPage'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalysisPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/simulations" element={<SimulationPage />} />
        <Route path="/advanced" element={<AdvancedMetricsPage />} />
      </Routes>
    </div>
  )
}

export default App
