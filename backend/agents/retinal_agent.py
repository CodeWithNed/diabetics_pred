"""Retinal image analysis agent using CNN."""
import time
from typing import Dict, Any
import numpy as np
from agents.base_agent import BaseAgent
from models.retinal.cnn_model import RetinalCNNModel
from models.retinal.preprocessing import preprocess_retinal_image
from utils.logger import get_logger

logger = get_logger(__name__)


class RetinalAgent(BaseAgent):
    """Agent responsible for retinal image analysis and DR detection."""

    def __init__(self):
        """Initialize retinal agent with CNN model."""
        super().__init__(agent_id="retinal_agent")
        self.model = RetinalCNNModel()

        # Load model on initialization
        self.model_loaded = False
        try:
            self.model.load_model()
            self.model_loaded = True
            logger.info("RetinalAgent initialized with loaded CNN model")
        except Exception as e:
            logger.warning(f"Retinal model not loaded: {e}")
            logger.info("RetinalAgent initialized without model - using fallback")

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze retinal image for diabetic retinopathy.

        Args:
            task: Dict containing 'image' (file path or bytes)

        Returns:
            Analysis result with DR detection, severity, and findings
        """
        try:
            start_time = time.time()
            image = task.get('image')

            if not image:
                raise ValueError("No image provided for retinal analysis")

            logger.info("Starting retinal image analysis")
            self.log_action("analysis_started", {"image_type": type(image).__name__})

            # If model not loaded, return fallback
            if not self.model_loaded or not self.model.is_loaded:
                logger.warning("Retinal model not loaded, using fallback")
                return {
                    'status': 'success',
                    'dr_detected': False,
                    'severity': 'none',
                    'confidence': 0.5,
                    'findings': {},
                    'dr_probability': 0.0,
                    'processing_time': 0.0,
                    'model_version': 'fallback',
                    'note': 'Model not loaded - using fallback values'
                }

            # Preprocess image
            logger.debug("Preprocessing retinal image")
            processed_image = preprocess_retinal_image(image)
            self.log_action("image_preprocessed", processed_image.shape)

            # Run CNN inference
            logger.debug("Running CNN inference")
            prediction = self.model.predict(processed_image)
            self.log_action("prediction_complete", prediction)

            # Extract results
            dr_detected = prediction['dr_probability'] > 0.5
            severity = self._determine_severity(prediction['dr_probability'])
            confidence = float(prediction['confidence'])

            # Extract key findings
            findings = self._extract_findings(prediction)

            processing_time = time.time() - start_time

            result = {
                'status': 'success',
                'dr_detected': dr_detected,
                'severity': severity,
                'confidence': confidence,
                'findings': findings,
                'dr_probability': float(prediction['dr_probability']),
                'processing_time': processing_time,
                'model_version': self.model.version
            }

            logger.info(f"Retinal analysis complete. DR detected: {dr_detected}, Severity: {severity}")
            self.log_action("analysis_complete", result)

            return result

        except Exception as e:
            logger.error(f"Retinal analysis failed: {str(e)}")
            self.log_action("analysis_failed", str(e))
            return {
                'status': 'error',
                'error': str(e),
                'dr_detected': None,
                'severity': None,
                'confidence': 0.0
            }

    def _determine_severity(self, dr_probability: float) -> str:
        """
        Determine DR severity level.

        Args:
            dr_probability: Probability of DR (0-1)

        Returns:
            Severity level string
        """
        if dr_probability < 0.3:
            return "none"
        elif dr_probability < 0.5:
            return "mild"
        elif dr_probability < 0.7:
            return "moderate"
        else:
            return "severe"

    def _extract_findings(self, prediction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract detailed findings from prediction.

        Args:
            prediction: Raw model prediction

        Returns:
            Structured findings dictionary
        """
        findings = {
            'microaneurysms': prediction.get('features', {}).get('microaneurysms', False),
            'hemorrhages': prediction.get('features', {}).get('hemorrhages', False),
            'exudates': prediction.get('features', {}).get('exudates', False),
            'neovascularization': prediction.get('features', {}).get('neovascularization', False)
        }

        # Count detected features
        detected_features = sum(1 for v in findings.values() if v)
        findings['total_features_detected'] = detected_features

        return findings
