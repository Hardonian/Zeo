#!/usr/bin/env python3
"""
Regression analysis module for Zeo analytics.
Implements OLS, Ridge, Lasso, and ElasticNet with proper cross-validation.
"""

import json
import sys
import warnings
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import (
    LinearRegression, Ridge, Lasso, ElasticNet,
    RidgeCV, LassoCV, ElasticNetCV, LogisticRegression
)
from sklearn.metrics import mean_absolute_error, r2_score, roc_auc_score, log_loss
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

warnings.filterwarnings('ignore')


def check_leakage(df: pd.DataFrame, X_cols: List[str], y_col: str, timestamp_col: Optional[str] = None) -> List[str]:
    """Check for data leakage - features from the future."""
    errors = []
    
    if timestamp_col and timestamp_col in df.columns:
        # Check if any X timestamp is after y timestamp for each row
        for col in X_cols:
            if col.startswith('timestamp_'):
                future_mask = df[col] > df[y_col + '_timestamp'] if f'{y_col}_timestamp' in df.columns else pd.Series([False] * len(df))
                if future_mask.any():
                    errors.append(f"LEAKAGE DETECTED: {col} has timestamps after outcome for {future_mask.sum()} rows")
    
    return errors


def compute_vif(df: pd.DataFrame, X_cols: List[str]) -> Dict[str, float]:
    """Compute Variance Inflation Factor for multicollinearity detection."""
    df_clean = df[X_cols].dropna()
    
    if len(df_clean) < len(X_cols) + 1:
        return {col: float('nan') for col in X_cols}
    
    try:
        # Add constant for VIF calculation
        X = sm.add_constant(df_clean)
        
        vif_data = {}
        for i, col in enumerate(X_cols, start=1):
            try:
                vif_data[col] = round(variance_inflation_factor(X.values, i), 2)
            except:
                vif_data[col] = float('nan')
        
        return vif_data
    except:
        return {col: float('nan') for col in X_cols}


def train_ols(X_train: pd.DataFrame, y_train: pd.Series) -> Dict[str, Any]:
    """Train OLS with robust standard errors."""
    try:
        X_const = sm.add_constant(X_train)
        model = sm.OLS(y_train, X_const).fit(cov_type='HC3')
        
        coefficients = {}
        for i, col in enumerate(X_train.columns):
            coef = model.params[i+1]  # Skip constant
            conf_int = model.conf_int(alpha=0.05).iloc[i+1]
            p_value = model.pvalues[i+1]
            
            coefficients[col] = {
                'estimate': round(coef, 6),
                'std_error': round(model.bse[i+1], 6),
                'conf_low': round(conf_int[0], 6),
                'conf_high': round(conf_int[1], 6),
                'p_value': round(p_value, 6),
                'significant': p_value < 0.05
            }
        
        return {
            'model_type': 'ols',
            'r_squared': round(model.rsquared, 4),
            'adj_r_squared': round(model.rsquared_adj, 4),
            'aic': round(model.aic, 2),
            'bic': round(model.bic, 2),
            'coefficients': coefficients,
            'intercept': round(model.params[0], 6)
        }
    except Exception as e:
        return {
            'model_type': 'ols',
            'error': str(e)
        }


def train_regularized(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    model_type: str = 'ridge',
    cv_folds: int = 5
) -> Dict[str, Any]:
    """Train regularized regression with cross-validation."""
    try:
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_train)
        
        if model_type == 'ridge':
            model = RidgeCV(alphas=np.logspace(-3, 3, 100), cv=cv_folds)
        elif model_type == 'lasso':
            model = LassoCV(alphas=np.logspace(-3, 3, 100), cv=cv_folds, max_iter=10000)
        elif model_type == 'elasticnet':
            model = ElasticNetCV(
                alphas=np.logspace(-3, 3, 50),
                l1_ratio=[0.1, 0.5, 0.7, 0.9, 0.95, 0.99],
                cv=cv_folds,
                max_iter=10000
            )
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        model.fit(X_scaled, y_train)
        
        # Compute metrics
        y_pred = model.predict(X_scaled)
        mae = mean_absolute_error(y_train, y_pred)
        r2 = r2_score(y_train, y_pred)
        
        # Feature importance
        coefficients = {}
        for i, col in enumerate(X_train.columns):
            coef = model.coef_[i] if hasattr(model.coef_, '__iter__') else model.coef_
            if hasattr(model.coef_, '__iter__'):
                coef = model.coef_[i]
            else:
                coef = model.coef_
            
            coefficients[col] = {
                'estimate': round(coef, 6),
                'importance': round(abs(coef), 6)
            }
        
        result = {
            'model_type': model_type,
            'r_squared': round(r2, 4),
            'mae': round(mae, 4),
            'coefficients': coefficients,
            'intercept': round(model.intercept_, 6)
        }
        
        if hasattr(model, 'alpha_'):
            result['alpha'] = round(model.alpha_, 6)
        if hasattr(model, 'l1_ratio_'):
            result['l1_ratio'] = round(model.l1_ratio_, 4)
        
        return result
    except Exception as e:
        return {
            'model_type': model_type,
            'error': str(e)
        }


def train_logistic(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    cv_folds: int = 5
) -> Dict[str, Any]:
    """Train logistic regression for binary outcomes."""
    try:
        model = LogisticRegression(max_iter=1000, cv=cv_folds)
        model.fit(X_train, y_train)
        
        y_pred_proba = model.predict_proba(X_train)[:, 1]
        
        # Compute metrics
        try:
            auc = roc_auc_score(y_train, y_pred_proba)
        except:
            auc = None
        
        try:
            logloss = log_loss(y_train, y_pred_proba)
        except:
            logloss = None
        
        # Coefficients
        coefficients = {}
        for i, col in enumerate(X_train.columns):
            coef = model.coef_[0][i]
            coefficients[col] = {
                'estimate': round(coef, 6),
                'odds_ratio': round(np.exp(coef), 4)
            }
        
        return {
            'model_type': 'logistic',
            'auc': round(auc, 4) if auc is not None else None,
            'log_loss': round(logloss, 4) if logloss is not None else None,
            'coefficients': coefficients,
            'intercept': round(model.intercept_[0], 6)
        }
    except Exception as e:
        return {
            'model_type': 'logistic',
            'error': str(e)
        }


def run_regression_analysis(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: List[str],
    timestamp_col: Optional[str] = None,
    test_size: float = 0.2,
    random_seed: int = 42
) -> Dict[str, Any]:
    """Run complete regression analysis."""
    
    # Check for leakage
    leakage_errors = check_leakage(df, feature_cols, target_col, timestamp_col)
    if leakage_errors:
        return {
            'error': 'Data leakage detected',
            'leakage_errors': leakage_errors,
            'epistemic_label': 'ERROR'
        }
    
    # Prepare data
    df_clean = df[feature_cols + [target_col]].dropna()
    
    if len(df_clean) < len(feature_cols) + 10:
        return {
            'error': f'Insufficient data: {len(df_clean)} rows for {len(feature_cols)} features',
            'epistemic_label': 'ERROR'
        }
    
    X = df_clean[feature_cols]
    y = df_clean[target_col]
    
    # Check if binary outcome
    is_binary = y.nunique() == 2 and set(y.unique()).issubset({0, 1, True, False})
    
    # Time-based split if timestamp available
    if timestamp_col and timestamp_col in df.columns:
        df_sorted = df_clean.sort_values(timestamp_col)
        split_idx = int(len(df_sorted) * (1 - test_size))
        train_mask = df_sorted.index[:split_idx]
        test_mask = df_sorted.index[split_idx:]
    else:
        # Random split with fixed seed
        np.random.seed(random_seed)
        indices = np.random.permutation(len(df_clean))
        split_idx = int(len(df_clean) * (1 - test_size))
        train_mask = df_clean.index[indices[:split_idx]]
        test_mask = df_clean.index[indices[split_idx:]]
    
    X_train, X_test = X.loc[train_mask], X.loc[test_mask]
    y_train, y_test = y.loc[train_mask], y.loc[test_mask]
    
    # Compute VIF
    vif_values = compute_vif(df_clean, feature_cols)
    
    # Train models
    results = {
        'target': target_col,
        'features': feature_cols,
        'n_train': len(X_train),
        'n_test': len(X_test),
        'is_binary': is_binary,
        'vif': vif_values,
        'models': {}
    }
    
    # Check multicollinearity
    high_vif = {k: v for k, v in vif_values.items() if v > 10}
    if high_vif:
        results['multicollinearity_warning'] = f'High VIF (>10): {high_vif}'
    
    if is_binary:
        # Logistic regression
        log_result = train_logistic(X_train, y_train)
        results['models']['logistic'] = log_result
    else:
        # OLS
        ols_result = train_ols(X_train, y_train)
        results['models']['ols'] = ols_result
        
        # Regularized models
        for model_type in ['ridge', 'lasso']:
            reg_result = train_regularized(X_train, y_train, model_type)
            results['models'][model_type] = reg_result
    
    # Epistemic labeling
    results['epistemic_label'] = 'PREDICTIVE_HYPOTHESIS'
    results['epistemic_note'] = 'These are associations, not causal claims. Do not treat as Fact.'
    
    # Add warnings
    warnings_list = []
    if len(df_clean) < 100:
        warnings_list.append(f'Small sample size (n={len(df_clean)})')
    
    missing_pct = (df[feature_cols + [target_col]].isna().sum() / len(df) * 100).to_dict()
    high_missing = {k: v for k, v in missing_pct.items() if v > 20}
    if high_missing:
        warnings_list.append(f'High missingness: {high_missing}')
    
    if warnings_list:
        results['warnings'] = warnings_list
    
    return results


def main():
    """CLI entry point."""
    if len(sys.argv) < 5:
        print("Usage: regression.py <input_csv> <output_json> <target_col> <feature_cols...>", file=sys.stderr)
        sys.exit(1)
    
    input_csv = sys.argv[1]
    output_json = sys.argv[2]
    target_col = sys.argv[3]
    feature_cols = sys.argv[4:]
    
    df = pd.read_csv(input_csv)
    
    results = run_regression_analysis(df, target_col, feature_cols)
    
    with open(output_json, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Results written to {output_json}")


if __name__ == '__main__':
    main()
