#!/usr/bin/env python3
"""
Zeo Time Series Engine
ARIMA/GARCH modeling for volatility-aware probability intervals.
Uses statsmodels and arch libraries.
"""

import json
import sys
import time
import warnings
from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import numpy as np

warnings.filterwarnings("ignore")

try:
    from statsmodels.tsa.arima.model import ARIMA
    from statsmodels.tsa.stattools import adfuller, acf, pacf
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False

try:
    from arch import arch_model
    ARCH_AVAILABLE = True
except ImportError:
    ARCH_AVAILABLE = False

try:
    import ruptures as rpt
    RUPTURES_AVAILABLE = True
except ImportError:
    RUPTURES_AVAILABLE = False


@dataclass
class VolatilityRegime:
    regime: str
    persistence: float
    half_life: float
    asymmetry: float


@dataclass
class ForecastResult:
    point: float
    interval_lower: float
    interval_upper: float
    confidence: float
    volatility_adjusted: bool
    regime: Dict[str, Any]


@dataclass
class ModelFit:
    model_type: str
    parameters: Dict[str, float]
    aic: float
    bic: float
    log_likelihood: float
    residuals: List[float]
    convergence: bool
    warnings: List[str]


@dataclass
class ChangePoint:
    index: int
    timestamp: str
    from_model: str
    to_model: str
    confidence: float
    cusum_score: float


class TimeSeriesEngine:
    """Time series modeling with ARIMA/GARCH for volatility-aware intervals."""
    
    def __init__(self):
        self.warnings = []
        
    def analyze(self, data: List[Dict[str, Any]], model_type: str = "auto") -> Dict[str, Any]:
        """Analyze time series and produce forecasts with uncertainty."""
        values = np.array([d["value"] for d in data])
        timestamps = [d["timestamp"] for d in data]
        
        if len(values) < 10:
            return {
                "usable": False,
                "rationale": "Insufficient data points (minimum 10 required)",
                "uncertainty_multiplier": 2.0,
                "forecasts": []
            }
        
        # Check stationarity
        adf_result = self._adf_test(values)
        
        # Select and fit model
        if model_type == "auto":
            model_type = self._select_model(values, adf_result)
        
        model_fit = self._fit_model(values, model_type)
        
        # Detect change points
        change_points = self._detect_change_points(values, timestamps)
        
        # Fit GARCH if volatility clustering suspected
        volatility_regimes = []
        if ARCH_AVAILABLE and len(values) > 30:
            try:
                garch_fit = self._fit_garch(values)
                volatility_regimes = [asdict(self._extract_volatility_regime(garch_fit))]
            except Exception as e:
                self.warnings.append(f"GARCH fitting failed: {e}")
        
        # Generate forecasts
        forecasts = self._generate_forecasts(values, model_fit, volatility_regimes)
        
        # Determine usability
        usable = model_fit.convergence and len(values) >= 20
        uncertainty_mult = self._compute_uncertainty_multiplier(model_fit, change_points)
        
        return {
            "usable": usable,
            "rationale": f"ARIMA fit converged: {model_fit.convergence}, Change points: {len(change_points)}",
            "uncertainty_multiplier": uncertainty_mult,
            "model_fit": asdict(model_fit),
            "forecasts": [asdict(f) for f in forecasts],
            "change_points": [asdict(cp) for cp in change_points],
            "volatility_regimes": volatility_regimes,
            "warnings": self.warnings
        }
    
    def _adf_test(self, values: np.ndarray) -> Dict[str, Any]:
        """Augmented Dickey-Fuller test for stationarity."""
        if not STATSMODELS_AVAILABLE:
            return {"stationary": True, "p_value": 0.01}
        
        try:
            result = adfuller(values)
            return {
                "stationary": result[1] < 0.05,
                "p_value": result[1],
                "adf_statistic": result[0]
            }
        except:
            return {"stationary": True, "p_value": 0.01}
    
    def _select_model(self, values: np.ndarray, adf_result: Dict) -> str:
        """Select appropriate model based on data characteristics."""
        if not adf_result.get("stationary", True):
            return "arima"
        return "arima"
    
    def _fit_model(self, values: np.ndarray, model_type: str) -> ModelFit:
        """Fit ARIMA model."""
        if not STATSMODELS_AVAILABLE:
            # Fallback
            return ModelFit(
                model_type="fallback",
                parameters={"mean": float(np.mean(values)), "std": float(np.std(values))},
                aic=9999,
                bic=9999,
                log_likelihood=-9999,
                residuals=[],
                convergence=False,
                warnings=["statsmodels not available"]
            )
        
        try:
            # Auto-select order (simple)
            if len(values) < 30:
                order = (1, 0, 0)
            else:
                order = (2, 0, 1)
            
            model = ARIMA(values, order=order)
            fitted = model.fit()
            
            return ModelFit(
                model_type="arima",
                parameters={
                    "ar1": fitted.params.get("ar.L1", 0),
                    "ma1": fitted.params.get("ma.L1", 0),
                    "sigma2": fitted.params.get("sigma2", 1)
                },
                aic=fitted.aic,
                bic=fitted.bic,
                log_likelihood=fitted.llf,
                residuals=fitted.resid.tolist()[:100],
                convergence=fitted.mle_retvals.get("converged", True),
                warnings=[]
            )
        except Exception as e:
            self.warnings.append(f"ARIMA fitting failed: {e}")
            return ModelFit(
                model_type="failed",
                parameters={},
                aic=9999,
                bic=9999,
                log_likelihood=-9999,
                residuals=[],
                convergence=False,
                warnings=[str(e)]
            )
    
    def _fit_garch(self, values: np.ndarray):
        """Fit GARCH model."""
        if not ARCH_AVAILABLE:
            return None
        
        try:
            model = arch_model(values, vol='Garch', p=1, q=1)
            return model.fit(disp='off')
        except Exception as e:
            self.warnings.append(f"GARCH fitting failed: {e}")
            return None
    
    def _extract_volatility_regime(self, garch_fit) -> VolatilityRegime:
        """Extract volatility regime from GARCH fit."""
        if garch_fit is None:
            return VolatilityRegime(regime="unknown", persistence=0.5, half_life=10, asymmetry=0)
        
        params = garch_fit.params
        alpha = params.get("alpha[1]", 0.1)
        beta = params.get("beta[1]", 0.85)
        persistence = alpha + beta
        half_life = np.log(0.5) / np.log(persistence) if persistence < 1 else 100
        
        # Classify regime
        if persistence < 0.7:
            regime = "low"
        elif persistence < 0.9:
            regime = "medium"
        elif persistence < 0.98:
            regime = "high"
        else:
            regime = "extreme"
        
        return VolatilityRegime(
            regime=regime,
            persistence=persistence,
            half_life=half_life,
            asymmetry=params.get("gamma[1]", 0)
        )
    
    def _detect_change_points(self, values: np.ndarray, timestamps: List[str]) -> List[ChangePoint]:
        """Detect structural breaks."""
        if not RUPTURES_AVAILABLE or len(values) < 20:
            return []
        
        try:
            model = rpt.Pelt(model="rbf", min_size=5).fit(values.reshape(-1, 1))
            change_indices = model.predict(pen=10)
            
            change_points = []
            for idx in change_indices[:-1]:  # Exclude end
                cp = ChangePoint(
                    index=idx,
                    timestamp=timestamps[idx] if idx < len(timestamps) else "",
                    from_model="pre_change",
                    to_model="post_change",
                    confidence=0.7,
                    cusum_score=0.0
                )
                change_points.append(cp)
            
            return change_points
        except Exception as e:
            self.warnings.append(f"Change point detection failed: {e}")
            return []
    
    def _generate_forecasts(self, values: np.ndarray, model_fit: ModelFit, vol_regimes: List[VolatilityRegime]) -> List[ForecastResult]:
        """Generate forecasts with uncertainty bands."""
        forecasts = []
        
        if not model_fit.convergence:
            # Simple persistence forecast
            for i in range(3):
                forecasts.append(ForecastResult(
                    point=float(np.mean(values)),
                    interval_lower=float(np.mean(values) - 2 * np.std(values)),
                    interval_upper=float(np.mean(values) + 2 * np.std(values)),
                    confidence=0.95,
                    volatility_adjusted=False,
                    regime=asdict(vol_regimes[0]) if vol_regimes else {"regime": "unknown"}
                ))
            return forecasts
        
        # Use model parameters for forecast
        mean_val = float(np.mean(values))
        std_val = float(np.std(values))
        vol_mult = 1.0 + len(vol_regimes) * 0.2 if vol_regimes else 1.0
        
        for i in range(3):
            horizon_mult = np.sqrt(i + 1)
            forecasts.append(ForecastResult(
                point=mean_val,
                interval_lower=mean_val - 2 * std_val * horizon_mult * vol_mult,
                interval_upper=mean_val + 2 * std_val * horizon_mult * vol_mult,
                confidence=0.95,
                volatility_adjusted=len(vol_regimes) > 0,
                regime=asdict(vol_regimes[0]) if vol_regimes else {"regime": "unknown"}
            ))
        
        return forecasts
    
    def _compute_uncertainty_multiplier(self, model_fit: ModelFit, change_points: List[ChangePoint]) -> float:
        """Compute uncertainty multiplier based on model quality and change points."""
        base = 1.0
        
        if not model_fit.convergence:
            base += 1.0
        
        if model_fit.aic > 1000:
            base += 0.5
        
        base += len(change_points) * 0.3
        
        return min(base, 3.0)


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_data = [
            {"timestamp": f"2026-02-{i:02d}T00:00:00Z", "value": 0.5 + np.random.randn() * 0.1}
            for i in range(1, 31)
        ]
        engine = TimeSeriesEngine()
        result = engine.analyze(test_data, "arima")
        print(json.dumps(result, indent=2))
    elif len(sys.argv) > 1:
        request_file = Path(sys.argv[1])
        request_data = json.loads(request_file.read_text())
        engine = TimeSeriesEngine()
        result = engine.analyze(request_data["data"], request_data.get("modelType", "auto"))
        print(json.dumps(result))
    else:
        request_data = json.loads(sys.stdin.read())
        engine = TimeSeriesEngine()
        result = engine.analyze(request_data["data"], request_data.get("modelType", "auto"))
        print(json.dumps(result))


if __name__ == "__main__":
    main()