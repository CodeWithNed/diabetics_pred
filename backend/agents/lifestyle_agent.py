"""Lifestyle data analysis agent using XGBoost."""
import time
from typing import Dict, Any
from agents.base_agent import BaseAgent
from models.lifestyle.xgboost_model import LifestyleXGBoostModel
from models.lifestyle.feature_engineering import engineer_features
from utils.logger import get_logger

logger = get_logger(__name__)


class LifestyleAgent(BaseAgent):
    """Agent responsible for lifestyle and demographic risk prediction."""

    def __init__(self):
        """Initialize lifestyle agent with XGBoost model."""
        super().__init__(agent_id="lifestyle_agent")
        self.model = LifestyleXGBoostModel()

        # Load model on initialization
        try:
            self.model.load_model()
            logger.info("LifestyleAgent initialized with loaded Gradient Boosting model")
        except Exception as e:
            logger.warning(f"Model not loaded on init: {e}. Predictions will fail until model is loaded.")
            logger.info("LifestyleAgent initialized without model")

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze lifestyle data for diabetes risk.

        Args:
            task: Dict containing 'lifestyle_data' with demographic/behavioral info

        Returns:
            Risk prediction with key contributing factors
        """
        try:
            start_time = time.time()
            lifestyle_data = task.get('lifestyle_data', {})

            if not lifestyle_data:
                raise ValueError("No lifestyle data provided")

            logger.info(f"Starting lifestyle analysis for {len(lifestyle_data)} features")
            self.log_action("analysis_started", {"features_count": len(lifestyle_data)})

            # Feature engineering
            logger.debug("Engineering features from lifestyle data")
            features = engineer_features(lifestyle_data)
            self.log_action("features_engineered", features.shape)

            # Run XGBoost prediction
            logger.debug("Running XGBoost prediction")
            prediction = self.model.predict(features)
            self.log_action("prediction_complete", prediction)

            # Extract key risk factors
            key_factors = self._identify_key_factors(lifestyle_data, prediction)

            processing_time = time.time() - start_time

            result = {
                'status': 'success',
                'risk_score': float(prediction['risk_score']),
                'risk_probability': float(prediction['probability']),
                'confidence': float(prediction['confidence']),
                'key_factors': key_factors,
                'feature_importance': prediction.get('feature_importance', {}),
                'processing_time': processing_time,
                'model_version': self.model.version
            }

            logger.info(f"Lifestyle analysis complete. Risk score: {result['risk_score']:.2f}")
            self.log_action("analysis_complete", result)

            return result

        except Exception as e:
            logger.error(f"Lifestyle analysis failed: {str(e)}")
            self.log_action("analysis_failed", str(e))
            return {
                'status': 'error',
                'error': str(e),
                'risk_score': 0.0,
                'confidence': 0.0
            }

    def _identify_key_factors(self, lifestyle_data: Dict[str, Any],
                             prediction: Dict[str, Any]) -> list:
        """
        Identify key contributing risk factors.

        Args:
            lifestyle_data: Original lifestyle input
            prediction: Model prediction with feature importance

        Returns:
            List of key risk factors with their impact
        """
        key_factors = []
        feature_importance = prediction.get('feature_importance', {})

        # Helper to safely convert to number
        def safe_number(val):
            if val == '' or val is None:
                return None
            try:
                return float(val)
            except (ValueError, TypeError):
                return None

        # Common risk factors to check
        risk_checks = [
            ('bmi', 'High BMI', lambda x: safe_number(x) is not None and safe_number(x) > 30),
            ('age', 'Age over 45', lambda x: safe_number(x) is not None and safe_number(x) > 45),
            ('physical_activity', 'Low physical activity', lambda x: safe_number(x) is not None and safe_number(x) < 30),
            ('sleep_hours', 'Insufficient sleep', lambda x: safe_number(x) is not None and safe_number(x) < 6),
            ('family_history', 'Family history of diabetes', lambda x: x == True or x == 'true'),
            ('smoking', 'Smoking', lambda x: x == True or x == 'true'),
        ]

        for feature, description, condition in risk_checks:
            value = lifestyle_data.get(feature)
            if value is not None and value != '' and condition(value):
                importance = feature_importance.get(feature, 0.0)
                key_factors.append({
                    'factor': description,
                    'value': value,
                    'importance': float(importance),
                    'modifiable': feature not in ['age', 'family_history']
                })

        # Sort by importance
        key_factors.sort(key=lambda x: x['importance'], reverse=True)

        return key_factors[:5]  # Return top 5 factors
