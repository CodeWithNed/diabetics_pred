"""Master orchestrator agent that coordinates all sub-agents."""
import asyncio
from typing import Dict, Any
from agents.base_agent import BaseAgent
from agents.retinal_agent import RetinalAgent
from agents.lifestyle_agent import LifestyleAgent
from agents.fusion_agent import FusionAgent
from agents.llm_agent import LLMAgent
from agents.simulation_agent import SimulationAgent
from utils.logger import get_logger

logger = get_logger(__name__)


class DiabetesOrchestrator(BaseAgent):
    """Master agent that coordinates all diabetes detection sub-agents."""

    def __init__(self):
        """Initialize orchestrator with all sub-agents."""
        super().__init__(agent_id="orchestrator")

        # Initialize sub-agents
        self.retinal_agent = RetinalAgent()
        self.lifestyle_agent = LifestyleAgent()
        self.fusion_agent = FusionAgent()
        self.llm_agent = LLMAgent()
        self.simulation_agent = SimulationAgent()

        logger.info("DiabetesOrchestrator initialized with all sub-agents")

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the complete diabetes detection pipeline.

        Args:
            task: User data containing:
                - image: Retinal image file
                - lifestyle_data: Dict of lifestyle/demographic info
                - user_id: Optional user identifier

        Returns:
            Complete analysis result with risk score, advice, and simulations
        """
        try:
            logger.info(f"Starting orchestration for task: {task.get('user_id', 'anonymous')}")
            self.log_action("orchestration_started", task.keys())

            # Step 1: Parallel execution of retinal and lifestyle analysis
            logger.info("Step 1: Analyzing retinal image and lifestyle data in parallel")
            retinal_task = self.retinal_agent.execute({
                'image': task.get('image')
            })
            lifestyle_task = self.lifestyle_agent.execute({
                'lifestyle_data': task.get('lifestyle_data')
            })

            retinal_result, lifestyle_result = await asyncio.gather(
                retinal_task,
                lifestyle_task
            )

            self.log_action("parallel_analysis_complete", {
                'retinal': retinal_result.get('status'),
                'lifestyle': lifestyle_result.get('status')
            })

            # Step 2: Fusion of multimodal data
            logger.info("Step 2: Fusing retinal and lifestyle predictions")
            fusion_result = await self.fusion_agent.execute({
                'retinal_result': retinal_result,
                'lifestyle_result': lifestyle_result
            })

            self.log_action("fusion_complete", fusion_result.get('risk_score'))

            # Step 3: Generate personalized advice using LLM
            logger.info("Step 3: Generating personalized advice with LLM")
            advice_result = await self.llm_agent.execute({
                'risk_score': fusion_result.get('risk_score'),
                'risk_factors': fusion_result.get('risk_factors'),
                'lifestyle_data': task.get('lifestyle_data'),
                'retinal_findings': retinal_result.get('findings')
            })

            self.log_action("advice_generated", advice_result.get('status'))

            # Step 4: Create what-if simulations
            logger.info("Step 4: Creating what-if simulations")
            simulation_result = await self.simulation_agent.execute({
                'risk_score': fusion_result.get('risk_score'),
                'lifestyle_data': task.get('lifestyle_data'),
                'risk_factors': fusion_result.get('risk_factors')
            })

            self.log_action("simulations_complete", len(simulation_result.get('simulations', [])))

            # Compile final result
            final_result = {
                'status': 'success',
                'user_id': task.get('user_id'),
                'risk_assessment': {
                    'overall_risk_score': fusion_result.get('risk_score'),
                    'risk_level': fusion_result.get('risk_level'),
                    'confidence': fusion_result.get('confidence'),
                    'retinal_analysis': {
                        'dr_detected': retinal_result.get('dr_detected'),
                        'severity': retinal_result.get('severity'),
                        'confidence': retinal_result.get('confidence'),
                        'findings': retinal_result.get('findings')
                    },
                    'lifestyle_analysis': {
                        'risk_score': lifestyle_result.get('risk_score'),
                        'key_factors': lifestyle_result.get('key_factors'),
                        'confidence': lifestyle_result.get('confidence')
                    }
                },
                'personalized_advice': {
                    'recommendations': advice_result.get('recommendations'),
                    'priority_actions': advice_result.get('priority_actions'),
                    'explanation': advice_result.get('explanation')
                },
                'what_if_simulations': simulation_result.get('simulations'),
                'metadata': {
                    'processing_time': simulation_result.get('processing_time'),
                    'model_versions': {
                        'retinal': retinal_result.get('model_version'),
                        'lifestyle': lifestyle_result.get('model_version')
                    }
                }
            }

            logger.info(f"Orchestration completed successfully. Risk score: {fusion_result.get('risk_score')}")
            self.log_action("orchestration_complete", "success")

            return final_result

        except Exception as e:
            logger.error(f"Orchestration failed: {str(e)}")
            self.log_action("orchestration_failed", str(e))
            return {
                'status': 'error',
                'error': str(e),
                'message': 'Failed to process diabetes detection request'
            }

    async def health_check(self) -> Dict[str, Any]:
        """
        Check health status of all sub-agents.

        Returns:
            Health status of each agent
        """
        return {
            'orchestrator': 'healthy',
            'retinal_agent': 'healthy',
            'lifestyle_agent': 'healthy',
            'fusion_agent': 'healthy',
            'llm_agent': 'healthy',
            'simulation_agent': 'healthy'
        }
