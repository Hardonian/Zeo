#!/usr/bin/env python3
"""
Zeo Reality Signal Layer Engine
State-space modeling with change point detection.
Uses filterpy for Kalman filters, custom particle filter, ruptures for change points.
"""

import json
import sys
import time
from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import numpy as np

try:
    from filterpy.kalman import KalmanFilter as FPKalmanFilter
    from filterpy.common import Q_discrete_white_noise
    FILTERPY_AVAILABLE = True
except ImportError:
    FILTERPY_AVAILABLE = False

try:
    import ruptures as rpt
    RUPTURES_AVAILABLE = True
except ImportError:
    RUPTURES_AVAILABLE = False


@dataclass
class StateVariableConfig:
    name: str
    initial_value: float
    process_noise: float
    observation_noise: float
    filter_type: str = "kalman"


@dataclass
class SignalObservation:
    timestamp: str
    variable_name: str
    value: float
    source_type: str
    reliability: float


@dataclass
class StateEstimate:
    variable_name: str
    timestamp: str
    value: float
    uncertainty_lower: float
    uncertainty_upper: float
    epistemic_uncertainty: float
    aleatoric_uncertainty: float
    regime: str
    change_probability: float


@dataclass
class ChangePoint:
    timestamp: str
    variable_name: str
    from_regime: str
    to_regime: str
    confidence: float
    detection_method: str


@dataclass
class RegimeDetection:
    current_regime: str
    regime_probabilities: Dict[str, float]
    change_detected: bool
    change_point: Optional[ChangePoint]
    stability_score: float


class RSLEngine:
    """
    Reality Signal Layer engine combining filters and change point detection.
    """
    
    def __init__(self):
        self.filters: Dict[str, Any] = {}
        self.state_history: Dict[str, List[StateEstimate]] = {}
        self.observation_history: Dict[str, List[SignalObservation]] = {}
    
    def initialize_variable(self, config: StateVariableConfig):
        """Initialize state variable with appropriate filter."""
        if config.filter_type == "kalman" and FILTERPY_AVAILABLE:
            kf = FPKalmanFilter(dim_x=1, dim_z=1)
            kf.x = np.array([[config.initial_value]])
            kf.F = np.array([[1.]])
            kf.H = np.array([[1.]])
            kf.P *= config.process_noise
            kf.R = config.observation_noise
            kf.Q = Q_discrete_white_noise(dim=1, dt=1.0, var=config.process_noise)
            self.filters[config.name] = kf
        else:
            # Fallback to simple exponential smoothing
            self.filters[config.name] = {
                "type": "exp_smooth",
                "value": config.initial_value,
                "alpha": 0.3,
                "variance": config.process_noise
            }
        
        self.state_history[config.name] = []
        self.observation_history[config.name] = []
    
    def process_observation(self, obs: SignalObservation) -> StateEstimate:
        """Process new observation and update state estimate."""
        var_name = obs.variable_name
        
        if var_name not in self.filters:
            # Auto-initialize
            self.initialize_variable(StateVariableConfig(
                name=var_name,
                initial_value=obs.value,
                process_noise=0.1,
                observation_noise=0.2,
                filter_type="kalman" if FILTERPY_AVAILABLE else "exp_smooth"
            ))
        
        filter_obj = self.filters[var_name]
        
        if FILTERPY_AVAILABLE and hasattr(filter_obj, 'predict'):
            # Kalman filter
            filter_obj.predict()
            filter_obj.update(np.array([[obs.value]]))
            estimated_value = float(filter_obj.x[0, 0])
            uncertainty = float(np.sqrt(filter_obj.P[0, 0]))
        else:
            # Exponential smoothing fallback
            alpha = filter_obj["alpha"]
            filter_obj["value"] = alpha * obs.value + (1 - alpha) * filter_obj["value"]
            filter_obj["variance"] = (1 - alpha) ** 2 * filter_obj["variance"] + alpha ** 2 * (obs.value - filter_obj["value"]) ** 2
            estimated_value = filter_obj["value"]
            uncertainty = np.sqrt(filter_obj["variance"])
        
        # Apply bias counterweight based on source type
        bias_adjustment = self._compute_bias_adjustment(obs)
        adjusted_value = estimated_value + bias_adjustment
        
        # Compute uncertainty components
        epistemic = uncertainty * (1 - obs.reliability)  # Uncertainty due to lack of knowledge
        aleatoric = uncertainty * obs.reliability  # Uncertainty due to randomness
        
        # Detect regime
        regime = self._detect_regime(var_name, adjusted_value, uncertainty)
        change_prob = self._compute_change_probability(var_name)
        
        estimate = StateEstimate(
            variable_name=var_name,
            timestamp=obs.timestamp,
            value=adjusted_value,
            uncertainty_lower=adjusted_value - 2 * uncertainty,
            uncertainty_upper=adjusted_value + 2 * uncertainty,
            epistemic_uncertainty=epistemic,
            aleatoric_uncertainty=aleatoric,
            regime=regime,
            change_probability=change_prob
        )
        
        self.state_history[var_name].append(estimate)
        self.observation_history[var_name].append(obs)
        
        return estimate
    
    def _compute_bias_adjustment(self, obs: SignalObservation) -> float:
        """Compute bias adjustment based on source type."""
        adjustments = {
            "news": -0.1,  # News tends to sensationalize
            "social": -0.05,  # Social media has amplification bias
            "market": 0.0,  # Markets relatively efficient
            "official": 0.0,  # Official sources neutral
            "geopolitical": -0.15  # Geopolitical news often fear-driven
        }
        return adjustments.get(obs.source_type, 0.0) * obs.value
    
    def _detect_regime(self, var_name: str, value: float, uncertainty: float) -> str:
        """Detect which regime the variable is in."""
        history = self.state_history.get(var_name, [])
        if len(history) < 5:
            return "insufficient_data"
        
        recent_values = [h.value for h in history[-10:]]
        mean_val = np.mean(recent_values)
        std_val = np.std(recent_values)
        
        if std_val < 0.1 * abs(mean_val) if mean_val != 0 else std_val < 0.05:
            return "stable"
        elif value > mean_val + 1.5 * std_val:
            return "elevated"
        elif value < mean_val - 1.5 * std_val:
            return "depressed"
        else:
            return "normal"
    
    def _compute_change_probability(self, var_name: str) -> float:
        """Compute probability of regime change."""
        history = self.state_history.get(var_name, [])
        if len(history) < 5:
            return 0.0
        
        # Simple heuristic: recent volatility / historical volatility
        recent = [h.value for h in history[-5:]]
        historical = [h.value for h in history[:-5]] if len(history) > 5 else recent
        
        recent_vol = np.std(recent)
        hist_vol = np.std(historical) if len(historical) > 1 else recent_vol
        
        if hist_vol < 1e-10:
            return 0.0
        
        ratio = recent_vol / hist_vol
        return min(1.0, max(0.0, (ratio - 1) / 2))
    
    def detect_change_points(self, var_name: str) -> Optional[ChangePoint]:
        """Detect structural breaks using ruptures library."""
        history = self.state_history.get(var_name, [])
        if len(history) < 10 or not RUPTURES_AVAILABLE:
            return None
        
        values = np.array([h.value for h in history])
        
        # Use Pelt algorithm for change point detection
        model = rpt.Pelt(model="rbf", min_size=3, jump=1)
        change_points = model.fit_predict(values.reshape(-1, 1), pen=10)
        
        if len(change_points) > 1:
            # Most recent change point
            cp_idx = change_points[-2]  # -1 is end of series
            if cp_idx < len(history):
                cp_estimate = history[cp_idx]
                prev_regime = history[cp_idx - 1].regime if cp_idx > 0 else "unknown"
                
                return ChangePoint(
                    timestamp=cp_estimate.timestamp,
                    variable_name=var_name,
                    from_regime=prev_regime,
                    to_regime=cp_estimate.regime,
                    confidence=0.7,
                    detection_method="pelt"
                )
        
        return None
    
    def get_regime_detection(self, var_name: str) -> RegimeDetection:
        """Get complete regime detection result."""
        history = self.state_history.get(var_name, [])
        if not history:
            return RegimeDetection(
                current_regime="unknown",
                regime_probabilities={"unknown": 1.0},
                change_detected=False,
                change_point=None,
                stability_score=0.0
            )
        
        current = history[-1]
        change_point = self.detect_change_points(var_name)
        
        # Compute regime probabilities based on recent history
        recent_regimes = [h.regime for h in history[-20:]]
        regime_counts = {}
        for r in recent_regimes:
            regime_counts[r] = regime_counts.get(r, 0) + 1
        
        total = len(recent_regimes)
        regime_probs = {r: c / total for r, c in regime_counts.items()}
        
        # Stability score: inverse of recent change probability
        stability = 1.0 - current.change_probability
        
        return RegimeDetection(
            current_regime=current.regime,
            regime_probabilities=regime_probs,
            change_detected=change_point is not None,
            change_point=change_point,
            stability_score=stability
        )


def process_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process RSL request."""
    start_time = time.time()
    
    try:
        engine = RSLEngine()
        
        # Initialize state variables
        for var_config in request_data.get("variables", []):
            engine.initialize_variable(StateVariableConfig(
                name=var_config["name"],
                initial_value=var_config.get("initialValue", 0.5),
                process_noise=var_config.get("processNoise", 0.1),
                observation_noise=var_config.get("observationNoise", 0.2),
                filter_type=var_config.get("filterType", "kalman")
            ))
        
        # Process observations
        estimates = []
        for obs_data in request_data.get("observations", []):
            obs = SignalObservation(
                timestamp=obs_data["timestamp"],
                variable_name=obs_data["variableName"],
                value=obs_data["value"],
                source_type=obs_data.get("sourceType", "market"),
                reliability=obs_data.get("reliability", 0.8)
            )
            estimate = engine.process_observation(obs)
            estimates.append(asdict(estimate))
        
        # Get regime detections
        regimes = {}
        for var_name in engine.state_history.keys():
            regimes[var_name] = asdict(engine.get_regime_detection(var_name))
        
        computation_time = time.time() - start_time
        
        return {
            "success": True,
            "estimates": estimates,
            "regimes": regimes,
            "computationTime": computation_time,
            "filtersUsed": "filterpy" if FILTERPY_AVAILABLE else "fallback",
            "rupturesAvailable": RUPTURES_AVAILABLE
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "estimates": [],
            "regimes": {},
            "computationTime": time.time() - start_time
        }


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_request = {
            "variables": [
                {"name": "volatility_regime", "initialValue": 0.3, "processNoise": 0.05},
                {"name": "liquidity_stress", "initialValue": 0.2, "processNoise": 0.03}
            ],
            "observations": [
                {"timestamp": "2026-02-07T10:00:00Z", "variableName": "volatility_regime", "value": 0.35, "sourceType": "market", "reliability": 0.9},
                {"timestamp": "2026-02-07T10:05:00Z", "variableName": "volatility_regime", "value": 0.42, "sourceType": "news", "reliability": 0.6},
                {"timestamp": "2026-02-07T10:10:00Z", "variableName": "liquidity_stress", "value": 0.25, "sourceType": "market", "reliability": 0.85},
            ]
        }
        result = process_request(test_request)
        print(json.dumps(result, indent=2))
    elif len(sys.argv) > 1:
        request_file = Path(sys.argv[1])
        request_data = json.loads(request_file.read_text())
        result = process_request(request_data)
        print(json.dumps(result))
    else:
        request_data = json.loads(sys.stdin.read())
        result = process_request(request_data)
        print(json.dumps(result))


if __name__ == "__main__":
    main()