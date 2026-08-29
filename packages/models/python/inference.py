#!/usr/bin/env python3
"""
Zeo Bayesian Inference Engine
Uses PyMC for robust posterior computation.
Returns posterior summaries with full uncertainty characterization.
"""

import json
import sys
import time
import numpy as np
import pymc as pm
from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path


@dataclass
class VariableSpec:
    id: str
    name: str
    prior_type: str
    prior_params: Dict[str, float]


@dataclass
class ObservationSpec:
    evidence_id: str
    variable_id: str
    value: float
    noise_type: str
    noise_params: Dict[str, float]


@dataclass
class PosteriorSummary:
    variable_id: str
    mean: float
    median: float
    std: float
    credible_interval_low: float
    credible_interval_high: float
    samples: List[float]
    r_hat: float
    ess: float
    divergences: int


@dataclass
class BeliefUpdateResult:
    id: str
    timestamp: str
    variable_id: str
    update_type: str
    prior_mean: float
    posterior_mean: float
    kl_divergence: float
    uncertainty_widened: bool


class BayesianEngine:
    """
    PyMC-based Bayesian inference for Zeo world state updates.
    """

    def __init__(self):
        self.model: Optional[pm.Model] = None
        self.trace: Optional[pm.backends.base.MultiTrace] = None

    def _create_prior(self, var_spec: VariableSpec):
        """Create PyMC distribution from variable spec."""
        if var_spec.prior_type == "beta":
            return pm.Beta(
                var_spec.id,
                alpha=var_spec.prior_params.get("alpha", 1.0),
                beta=var_spec.prior_params.get("beta", 1.0)
            )
        elif var_spec.prior_type == "normal":
            return pm.Normal(
                var_spec.id,
                mu=var_spec.prior_params.get("mu", 0.0),
                sigma=var_spec.prior_params.get("sigma", 1.0)
            )
        elif var_spec.prior_type == "uniform":
            return pm.Uniform(
                var_spec.id,
                lower=var_spec.prior_params.get("lower", 0.0),
                upper=var_spec.prior_params.get("upper", 1.0)
            )
        elif var_spec.prior_type == "halfnormal":
            return pm.HalfNormal(
                var_spec.id,
                sigma=var_spec.prior_params.get("sigma", 1.0)
            )
        else:
            raise ValueError(f"Unknown prior type: {var_spec.prior_type}")

    def _create_likelihood(self, obs: ObservationSpec, prior_var):
        """Create observation likelihood."""
        if obs.noise_type == "gaussian":
            sigma = obs.noise_params.get("sigma", 1.0)
            return pm.Normal(
                f"obs_{obs.evidence_id}",
                mu=prior_var,
                sigma=sigma,
                observed=obs.value
            )
        elif obs.noise_type == "bernoulli":
            # For binary observations with probability parameter
            return pm.Bernoulli(
                f"obs_{obs.evidence_id}",
                p=prior_var,
                observed=int(obs.value)
            )
        elif obs.noise_type == "poisson":
            return pm.Poisson(
                f"obs_{obs.evidence_id}",
                mu=prior_var,
                observed=int(obs.value)
            )
        else:
            raise ValueError(f"Unknown noise type: {obs.noise_type}")

    def infer(
        self,
        variables: List[VariableSpec],
        observations: List[ObservationSpec],
        chains: int = 4,
        draws: int = 1000,
        tune: int = 500
    ) -> Tuple[List[PosteriorSummary], List[BeliefUpdateResult]]:
        """
        Run Bayesian inference and return posterior summaries.
        """
        with pm.Model() as self.model:
            # Create priors
            prior_vars = {}
            prior_means = {}
            for var_spec in variables:
                prior_vars[var_spec.id] = self._create_prior(var_spec)
                # Store prior mean for comparison
                if var_spec.prior_type == "beta":
                    alpha = var_spec.prior_params.get("alpha", 1.0)
                    beta = var_spec.prior_params.get("beta", 1.0)
                    prior_means[var_spec.id] = alpha / (alpha + beta)
                elif var_spec.prior_type == "normal":
                    prior_means[var_spec.id] = var_spec.prior_params.get("mu", 0.0)
                elif var_spec.prior_type == "uniform":
                    low = var_spec.prior_params.get("lower", 0.0)
                    high = var_spec.prior_params.get("upper", 1.0)
                    prior_means[var_spec.id] = (low + high) / 2
                else:
                    prior_means[var_spec.id] = 0.5

            # Create likelihoods
            for obs in observations:
                if obs.variable_id in prior_vars:
                    self._create_likelihood(obs, prior_vars[obs.variable_id])

            # Sample
            self.trace = pm.sample(
                draws=draws,
                tune=tune,
                chains=chains,
                cores=min(chains, 4),
                return_inferencedata=True
            )

        # Extract posteriors
        posteriors = []
        updates = []
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        for var_spec in variables:
            var_id = var_spec.id
            if var_id not in self.trace.posterior:
                continue

            samples = self.trace.posterior[var_id].values.flatten()

            # Compute diagnostics
            ess = float(pm.ess(self.trace, var_names=[var_id])[var_id].values)
            r_hat = float(pm.rhat(self.trace, var_names=[var_id])[var_id].values)
            divergences = int(self.trace.sample_stats.diverging.sum().values)

            # Credible interval
            ci_low, ci_high = np.percentile(samples, [2.5, 97.5])

            posterior = PosteriorSummary(
                variable_id=var_id,
                mean=float(np.mean(samples)),
                median=float(np.median(samples)),
                std=float(np.std(samples)),
                credible_interval_low=float(ci_low),
                credible_interval_high=float(ci_high),
                samples=samples.tolist()[:1000],  # Limit samples for response size
                r_hat=r_hat,
                ess=ess,
                divergences=divergences
            )
            posteriors.append(posterior)

            # Compute KL divergence (approximate)
            prior_mean = prior_means[var_id]
            posterior_mean = posterior.mean
            kl_div = 0.5 * ((posterior_mean - prior_mean) / max(posterior.std, 0.001)) ** 2

            # Check if uncertainty widened
            if var_spec.prior_type == "beta":
                alpha = var_spec.prior_params.get("alpha", 1.0)
                beta = var_spec.prior_params.get("beta", 1.0)
                prior_var = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1))
            elif var_spec.prior_type == "normal":
                prior_var = var_spec.prior_params.get("sigma", 1.0) ** 2
            else:
                prior_var = 0.1

            uncertainty_widened = posterior.std ** 2 > prior_var

            update = BeliefUpdateResult(
                id=f"update_{var_id}_{int(time.time())}",
                timestamp=timestamp,
                variable_id=var_id,
                update_type="bayesian",
                prior_mean=prior_mean,
                posterior_mean=posterior_mean,
                kl_divergence=kl_div,
                uncertainty_widened=uncertainty_widened
            )
            updates.append(update)

        return posteriors, updates


def process_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process an inference request and return results."""
    start_time = time.time()

    try:
        # Parse request
        world_state = request_data.get("worldState", {})
        new_evidence = request_data.get("newEvidence", [])
        method = request_data.get("method", "mcmc")
        mcmc_config = request_data.get("mcmcConfig", {})

        # Build variable specs
        variables = []
        for var in world_state.get("variables", []):
            dist = var.get("distribution", {})
            prior_type = dist.get("kind", "uniform")

            if prior_type == "beta":
                prior_params = {
                    "alpha": dist.get("alpha", 1.0),
                    "beta": dist.get("beta", 1.0)
                }
            elif prior_type == "normal":
                prior_params = {
                    "mu": dist.get("mean", 0.0),
                    "sigma": dist.get("std", 1.0)
                }
            elif prior_type == "interval":
                # Convert interval to uniform
                prior_type = "uniform"
                prior_params = {
                    "lower": dist.get("low", 0.0),
                    "upper": dist.get("high", 1.0)
                }
            else:
                prior_params = {"lower": 0.0, "upper": 1.0}

            variables.append(VariableSpec(
                id=var["id"],
                name=var["name"],
                prior_type=prior_type,
                prior_params=prior_params
            ))

        # Build observation specs
        observations = []
        for ev in new_evidence:
            likelihood = ev.get("likelihood", {})
            noise_type = "gaussian"
            noise_params = {"sigma": 0.1}

            if likelihood.get("likelihoodFunction") == "gaussian":
                noise_type = "gaussian"
                noise_params = {"sigma": likelihood.get("parameters", {}).get("sigma", 0.1)}
            elif likelihood.get("likelihoodFunction") == "bernoulli":
                noise_type = "bernoulli"
                noise_params = {}

            observations.append(ObservationSpec(
                evidence_id=ev["evidenceId"],
                variable_id=ev.get("variableId", ""),
                value=ev["observationValue"],
                noise_type=noise_type,
                noise_params=noise_params
            ))

        # Run inference
        engine = BayesianEngine()
        chains = mcmc_config.get("chains", 4)
        draws = mcmc_config.get("draws", 1000)
        tune = mcmc_config.get("tune", 500)

        posteriors, updates = engine.infer(
            variables=variables,
            observations=observations,
            chains=chains,
            draws=draws,
            tune=tune
        )

        computation_time = time.time() - start_time

        return {
            "success": True,
            "updates": [asdict(u) for u in updates],
            "posteriors": [asdict(p) for p in posteriors],
            "computationTime": computation_time,
            "modelEvidence": None
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "updates": [],
            "posteriors": [],
            "computationTime": time.time() - start_time
        }


def main():
    """CLI entry point for JSON-RPC interface."""
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        # Run a simple test
        test_request = {
            "worldState": {
                "variables": [
                    {
                        "id": "var_1",
                        "name": "market_stress",
                        "distribution": {"kind": "beta", "alpha": 2.0, "beta": 5.0}
                    }
                ]
            },
            "newEvidence": [
                {
                    "evidenceId": "ev_1",
                    "variableId": "var_1",
                    "observationValue": 0.7,
                    "likelihood": {
                        "likelihoodFunction": "gaussian",
                        "parameters": {"sigma": 0.15}
                    }
                }
            ],
            "method": "mcmc",
            "mcmcConfig": {"chains": 2, "draws": 500, "tune": 250}
        }
        result = process_request(test_request)
        print(json.dumps(result, indent=2))
    elif len(sys.argv) > 1:
        # Read request from file
        request_file = Path(sys.argv[1])
        request_data = json.loads(request_file.read_text())
        result = process_request(request_data)
        print(json.dumps(result))
    else:
        # Read from stdin
        request_data = json.loads(sys.stdin.read())
        result = process_request(request_data)
        print(json.dumps(result))


if __name__ == "__main__":
    main()