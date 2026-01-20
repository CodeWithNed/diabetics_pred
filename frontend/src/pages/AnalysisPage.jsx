import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Upload, User, Activity, Heart, ArrowRight, Loader, Ruler, Weight, Info } from 'lucide-react'
import { analyzeComplete } from '../services/api'
import './AnalysisPage.css'

function AnalysisPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [heightUnit, setHeightUnit] = useState('cm') // 'cm' or 'ft'
  const [weightUnit, setWeightUnit] = useState('kg') // 'kg' or 'lbs'
  const [waistUnit, setWaistUnit] = useState('in') // 'cm' or 'in' - default to inches
  const [lifestyleData, setLifestyleData] = useState({
    // Basic Demographics
    gender: 'male',
    age: '',
    ethnicity: 3,

    // Body Measurements (stored in metric for backend)
    height_cm: '',
    weight_kg: '',
    bmi: '',  // Auto-calculated
    waist_circumference: '',

    // Imperial inputs (temporary, converted to metric)
    height_ft: '',
    height_in: '',
    weight_lbs: '',
    waist_inches: '',

    // Blood Pressure
    systolic_bp: '',
    diastolic_bp: '',

    // Lab Results
    HbA1c: '',
    hdl_cholesterol: '',

    // Medical History
    has_hypertension: false,
    takes_cholesterol_med: false,
    family_diabetes_history: false
  })
  const [loading, setLoading] = useState(false)

  // Convert height ft/in to cm
  useEffect(() => {
    if (heightUnit === 'ft') {
      const ft = parseFloat(lifestyleData.height_ft) || 0
      const inches = parseFloat(lifestyleData.height_in) || 0
      const totalInches = (ft * 12) + inches
      const cm = totalInches * 2.54

      if (cm > 0) {
        setLifestyleData(prev => ({ ...prev, height_cm: cm.toFixed(1) }))
      }
    }
  }, [lifestyleData.height_ft, lifestyleData.height_in, heightUnit])

  // Convert weight lbs to kg
  useEffect(() => {
    if (weightUnit === 'lbs') {
      const lbs = parseFloat(lifestyleData.weight_lbs) || 0
      const kg = lbs * 0.453592

      if (kg > 0) {
        setLifestyleData(prev => ({ ...prev, weight_kg: kg.toFixed(1) }))
      }
    }
  }, [lifestyleData.weight_lbs, weightUnit])

  // Convert waist inches to cm
  useEffect(() => {
    if (waistUnit === 'in') {
      const inches = parseFloat(lifestyleData.waist_inches) || 0
      const cm = inches * 2.54

      if (cm > 0) {
        setLifestyleData(prev => ({ ...prev, waist_circumference: cm.toFixed(1) }))
      }
    }
  }, [lifestyleData.waist_inches, waistUnit])

  // Auto-calculate BMI when height or weight changes
  useEffect(() => {
    const height = parseFloat(lifestyleData.height_cm)
    const weight = parseFloat(lifestyleData.weight_kg)

    if (height > 0 && weight > 0) {
      const heightInMeters = height / 100
      const bmi = weight / (heightInMeters * heightInMeters)
      setLifestyleData(prev => ({ ...prev, bmi: bmi.toFixed(1) }))
    }
  }, [lifestyleData.height_cm, lifestyleData.weight_kg])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field, value) => {
    setLifestyleData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!image) {
      alert('Please upload a retinal image')
      return
    }

    setLoading(true)

    try {
      const result = await analyzeComplete(image, lifestyleData)
      navigate('/results', { state: { results: result } })
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analysis-page">
      <div className="analysis-background">
        <div className="diagnostic-grid"></div>
      </div>

      <div className="container analysis-container">
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="progress-indicator"
        >
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Retinal Image</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Lifestyle Data</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Analysis</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="form-section glass"
            >
              <h2>Upload Retinal Image</h2>
              <p className="section-description">
                Upload a retinal fundus image captured from a smartphone-based retinal camera or standard fundus camera.
              </p>

              <div className="upload-area" onClick={() => document.getElementById('imageInput').click()}>
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Retinal preview" />
                    <div className="image-overlay">
                      <Upload size={32} />
                      <span>Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Upload size={48} />
                    <h3>Drop retinal image here</h3>
                    <p>or click to browse</p>
                    <span className="file-formats">JPG, PNG (max 10MB)</span>
                  </div>
                )}
                <input
                  id="imageInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <button
                className="next-button"
                onClick={() => setStep(2)}
                disabled={!image}
              >
                Next
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="form-section glass large-form"
            >
              <h2>Health & Lifestyle Profile</h2>
              <p className="section-description">
                Provide your health information for accurate diabetes risk assessment.
              </p>

              {/* Basic Demographics */}
              <div className="form-section-header">
                <User size={20} />
                <h3>Basic Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={lifestyleData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="select-input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Age (years) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={lifestyleData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                    placeholder="45"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Ethnicity
                    <span className="info-tooltip" title="Used for risk calculation based on population data">
                      <Info size={14} />
                    </span>
                  </label>
                  <select
                    value={lifestyleData.ethnicity}
                    onChange={(e) => handleInputChange('ethnicity', parseInt(e.target.value))}
                    className="select-input"
                  >
                    <option value={1}>Mexican American</option>
                    <option value={2}>Other Hispanic</option>
                    <option value={3}>Non-Hispanic White</option>
                    <option value={4}>Non-Hispanic Black</option>
                    <option value={6}>Non-Hispanic Asian</option>
                    <option value={7}>Other/Multi-Racial</option>
                  </select>
                </div>
              </div>

              {/* Body Measurements */}
              <div className="form-section-header">
                <Activity size={20} />
                <h3>Body Measurements</h3>
              </div>

              <div className="form-grid">
                {/* Height with individual unit selector */}
                <div className="form-group with-unit-select">
                  <label>
                    <Ruler size={16} />
                    Height <span className="required">*</span>
                  </label>
                  <div className="input-with-unit">
                    {heightUnit === 'cm' ? (
                      <input
                        type="number"
                        step="0.1"
                        value={lifestyleData.height_cm}
                        onChange={(e) => handleInputChange('height_cm', e.target.value)}
                        placeholder="170"
                        required
                      />
                    ) : (
                      <div className="dual-input">
                        <input
                          type="number"
                          value={lifestyleData.height_ft}
                          onChange={(e) => handleInputChange('height_ft', e.target.value)}
                          placeholder="5"
                          className="small-input"
                          required
                        />
                        <span className="input-separator">ft</span>
                        <input
                          type="number"
                          value={lifestyleData.height_in}
                          onChange={(e) => handleInputChange('height_in', e.target.value)}
                          placeholder="10"
                          className="small-input"
                          required
                        />
                        <span className="input-separator">in</span>
                      </div>
                    )}
                    <select
                      value={heightUnit}
                      onChange={(e) => setHeightUnit(e.target.value)}
                      className="unit-selector"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft/in</option>
                    </select>
                  </div>
                </div>

                {/* Weight with individual unit selector */}
                <div className="form-group with-unit-select">
                  <label>
                    <Weight size={16} />
                    Weight <span className="required">*</span>
                  </label>
                  <div className="input-with-unit">
                    {weightUnit === 'kg' ? (
                      <input
                        type="number"
                        step="0.1"
                        value={lifestyleData.weight_kg}
                        onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                        placeholder="75"
                        required
                      />
                    ) : (
                      <input
                        type="number"
                        step="0.1"
                        value={lifestyleData.weight_lbs}
                        onChange={(e) => handleInputChange('weight_lbs', e.target.value)}
                        placeholder="165"
                        required
                      />
                    )}
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value)}
                      className="unit-selector"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>

                {/* Waist with individual unit selector */}
                <div className="form-group with-unit-select">
                  <label>
                    Waist <span className="optional-badge">optional</span>
                  </label>
                  <div className="input-with-unit">
                    {waistUnit === 'cm' ? (
                      <input
                        type="number"
                        step="0.1"
                        value={lifestyleData.waist_circumference}
                        onChange={(e) => handleInputChange('waist_circumference', e.target.value)}
                        placeholder="90"
                      />
                    ) : (
                      <input
                        type="number"
                        step="0.1"
                        value={lifestyleData.waist_inches}
                        onChange={(e) => handleInputChange('waist_inches', e.target.value)}
                        placeholder="35"
                      />
                    )}
                    <select
                      value={waistUnit}
                      onChange={(e) => setWaistUnit(e.target.value)}
                      className="unit-selector"
                    >
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                  <span className="field-hint">At belly button level</span>
                </div>

                {/* BMI Display */}
                <div className="form-group bmi-display">
                  <label>BMI (calculated)</label>
                  <div className="calculated-value">
                    {lifestyleData.bmi ? (
                      <>
                        <span className="bmi-value">{lifestyleData.bmi}</span>
                        <span className="bmi-category">
                          {lifestyleData.bmi < 18.5 ? 'Underweight' :
                           lifestyleData.bmi < 25 ? 'Normal' :
                           lifestyleData.bmi < 30 ? 'Overweight' :
                           'Obese'}
                        </span>
                      </>
                    ) : (
                      <span className="placeholder-text">Enter height & weight</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="form-section-header">
                <Heart size={20} />
                <h3>Blood Pressure</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Systolic BP (mmHg)
                    <span className="optional-badge">optional</span>
                  </label>
                  <input
                    type="number"
                    value={lifestyleData.systolic_bp}
                    onChange={(e) => handleInputChange('systolic_bp', e.target.value)}
                    placeholder="120"
                  />
                  <span className="field-hint">Top number (normal: 90-120)</span>
                </div>

                <div className="form-group">
                  <label>
                    Diastolic BP (mmHg)
                    <span className="optional-badge">optional</span>
                  </label>
                  <input
                    type="number"
                    value={lifestyleData.diastolic_bp}
                    onChange={(e) => handleInputChange('diastolic_bp', e.target.value)}
                    placeholder="80"
                  />
                  <span className="field-hint">Bottom number (normal: 60-80)</span>
                </div>
              </div>

              {/* Lab Results */}
              <div className="form-section-header">
                <Activity size={20} />
                <h3>Lab Results (if available)</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    HbA1c (%)
                    <span className="info-tooltip" title="Glycated hemoglobin - 3 month average blood sugar">
                      <Info size={14} />
                    </span>
                    <span className="optional-badge">optional</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={lifestyleData.HbA1c}
                    onChange={(e) => handleInputChange('HbA1c', e.target.value)}
                    placeholder="5.5"
                  />
                  <span className="field-hint">Normal: &lt;5.7%, Pre-diabetes: 5.7-6.4%, Diabetes: ≥6.5%</span>
                </div>

                <div className="form-group">
                  <label>
                    HDL Cholesterol (mg/dL)
                    <span className="info-tooltip" title="Good cholesterol">
                      <Info size={14} />
                    </span>
                    <span className="optional-badge">optional</span>
                  </label>
                  <input
                    type="number"
                    value={lifestyleData.hdl_cholesterol}
                    onChange={(e) => handleInputChange('hdl_cholesterol', e.target.value)}
                    placeholder="50"
                  />
                  <span className="field-hint">Higher is better (normal: 40-60)</span>
                </div>
              </div>

              {/* Medical History */}
              <div className="form-section-header">
                <Heart size={20} />
                <h3>Medical History</h3>
              </div>
              <div className="checkbox-group modern">
                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={lifestyleData.has_hypertension}
                    onChange={(e) => handleInputChange('has_hypertension', e.target.checked)}
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-title">High Blood Pressure</span>
                    <span className="checkbox-subtitle">Diagnosed hypertension</span>
                  </div>
                </label>

                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={lifestyleData.takes_cholesterol_med}
                    onChange={(e) => handleInputChange('takes_cholesterol_med', e.target.checked)}
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-title">Cholesterol Medication</span>
                    <span className="checkbox-subtitle">Taking statins or similar</span>
                  </div>
                </label>

                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={lifestyleData.family_diabetes_history}
                    onChange={(e) => handleInputChange('family_diabetes_history', e.target.checked)}
                  />
                  <div className="checkbox-content">
                    <span className="checkbox-title">Family History</span>
                    <span className="checkbox-subtitle">Diabetes in immediate family</span>
                  </div>
                </label>
              </div>

              <div className="form-note">
                <Info size={16} />
                <span>Fields marked with * are required. Optional fields help improve accuracy.</span>
              </div>

              <div className="button-group">
                <button className="back-button" onClick={() => setStep(1)}>
                  Back
                </button>
                <button
                  className="next-button"
                  onClick={() => setStep(3)}
                  disabled={!lifestyleData.age || !lifestyleData.height_cm || !lifestyleData.weight_kg}
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="form-section glass"
            >
              <h2>Review Your Information</h2>
              <p className="section-description">
                Verify your details before running the multimodal AI analysis.
              </p>

              <div className="review-grid-full">
                <div className="review-card">
                  <h3>Retinal Image</h3>
                  {imagePreview && (
                    <div className="review-image">
                      <img src={imagePreview} alt="Retinal" />
                    </div>
                  )}
                </div>

                <div className="review-card">
                  <h3>Demographics</h3>
                  <div className="review-data">
                    <div className="review-item">
                      <span>Gender:</span>
                      <strong>{lifestyleData.gender === 'male' ? 'Male' : 'Female'}</strong>
                    </div>
                    <div className="review-item">
                      <span>Age:</span>
                      <strong>{lifestyleData.age} years</strong>
                    </div>
                  </div>
                </div>

                <div className="review-card">
                  <h3>Body Measurements</h3>
                  <div className="review-data">
                    <div className="review-item">
                      <span>Height:</span>
                      <strong>{lifestyleData.height_cm} cm</strong>
                    </div>
                    <div className="review-item">
                      <span>Weight:</span>
                      <strong>{lifestyleData.weight_kg} kg</strong>
                    </div>
                    <div className="review-item highlight">
                      <span>BMI:</span>
                      <strong>{lifestyleData.bmi}</strong>
                    </div>
                    {lifestyleData.waist_circumference && (
                      <div className="review-item">
                        <span>Waist:</span>
                        <strong>{lifestyleData.waist_circumference} cm</strong>
                      </div>
                    )}
                  </div>
                </div>

                {(lifestyleData.systolic_bp || lifestyleData.diastolic_bp ||
                  lifestyleData.HbA1c || lifestyleData.hdl_cholesterol) && (
                  <div className="review-card">
                    <h3>Clinical Data</h3>
                    <div className="review-data">
                      {lifestyleData.systolic_bp && (
                        <div className="review-item">
                          <span>Blood Pressure:</span>
                          <strong>{lifestyleData.systolic_bp}/{lifestyleData.diastolic_bp || '?'} mmHg</strong>
                        </div>
                      )}
                      {lifestyleData.HbA1c && (
                        <div className="review-item">
                          <span>HbA1c:</span>
                          <strong>{lifestyleData.HbA1c}%</strong>
                        </div>
                      )}
                      {lifestyleData.hdl_cholesterol && (
                        <div className="review-item">
                          <span>HDL Cholesterol:</span>
                          <strong>{lifestyleData.hdl_cholesterol} mg/dL</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="review-card">
                  <h3>Medical History</h3>
                  <div className="review-data">
                    <div className="review-item">
                      <span>Hypertension:</span>
                      <strong className={lifestyleData.has_hypertension ? 'text-warning' : 'text-success'}>
                        {lifestyleData.has_hypertension ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="review-item">
                      <span>Cholesterol Med:</span>
                      <strong className={lifestyleData.takes_cholesterol_med ? 'text-warning' : 'text-success'}>
                        {lifestyleData.takes_cholesterol_med ? 'Yes' : 'No'}
                      </strong>
                    </div>
                    <div className="review-item">
                      <span>Family History:</span>
                      <strong className={lifestyleData.family_diabetes_history ? 'text-warning' : 'text-success'}>
                        {lifestyleData.family_diabetes_history ? 'Yes' : 'No'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-group">
                <button className="back-button" onClick={() => setStep(2)}>
                  Back
                </button>
                <button
                  className="analyze-button"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="spinner" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Run AI Analysis
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AnalysisPage
