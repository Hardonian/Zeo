#!/usr/bin/env python3
"""
Correlation analysis module for Zeo analytics.
Computes Pearson, Spearman, and Kendall correlations with robust variants.
"""

import json
import sys
import warnings
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd
from scipy import stats


def winsorize_series(series: pd.Series, limits: Tuple[float, float] = (0.05, 0.05)) -> pd.Series:
    """Winsorize a series at specified percentiles."""
    lower = series.quantile(limits[0])
    upper = series.quantile(1 - limits[1])
    return series.clip(lower=lower, upper=upper)


def compute_correlation(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    method: str = 'pearson',
    robust: bool = False,
    winsorize_limits: Tuple[float, float] = (0.05, 0.05)
) -> Dict[str, Any]:
    """Compute correlation between two columns."""
    x = df[x_col].dropna()
    y = df[y_col].dropna()
    
    # Find common indices
    common_idx = x.index.intersection(y.index)
    x = x.loc[common_idx]
    y = y.loc[common_idx]
    
    n = len(x)
    
    if n < 3:
        return {
            'method': method,
            'x': x_col,
            'y': y_col,
            'n': n,
            'correlation': None,
            'p_value': None,
            'warning': 'Insufficient sample size (n < 3)'
        }
    
    # Apply winsorization if robust
    if robust:
        x = winsorize_series(x, winsorize_limits)
        y = winsorize_series(y, winsorize_limits)
    
    try:
        if method == 'pearson':
            corr, p_value = stats.pearsonr(x, y)
        elif method == 'spearman':
            corr, p_value = stats.spearmanr(x, y)
        elif method == 'kendall':
            corr, p_value = stats.kendalltau(x, y)
        else:
            raise ValueError(f"Unknown method: {method}")
        
        result = {
            'method': method,
            'x': x_col,
            'y': y_col,
            'n': n,
            'correlation': round(corr, 6),
            'p_value': round(p_value, 6) if p_value is not None else None,
            'robust': robust
        }
        
        # Add warning for small sample
        if n < 30:
            result['warning'] = f'Small sample size (n={n})'
        
        return result
    except Exception as e:
        return {
            'method': method,
            'x': x_col,
            'y': y_col,
            'n': n,
            'correlation': None,
            'p_value': None,
            'error': str(e)
        }


def compute_partial_correlation(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    control_cols: List[str],
    method: str = 'pearson'
) -> Dict[str, Any]:
    """Compute partial correlation controlling for specified columns."""
    cols = [x_col, y_col] + control_cols
    df_clean = df[cols].dropna()
    
    n = len(df_clean)
    
    if n < len(cols) + 2:
        return {
            'method': f'partial_{method}',
            'x': x_col,
            'y': y_col,
            'controls': control_cols,
            'n': n,
            'correlation': None,
            'p_value': None,
            'warning': 'Insufficient sample size for partial correlation'
        }
    
    try:
        # Compute residuals after controlling
        from sklearn.linear_model import LinearRegression
        
        X_controls = df_clean[control_cols].values
        
        # Regress x on controls
        reg_x = LinearRegression().fit(X_controls, df_clean[x_col])
        resid_x = df_clean[x_col] - reg_x.predict(X_controls)
        
        # Regress y on controls
        reg_y = LinearRegression().fit(X_controls, df_clean[y_col])
        resid_y = df_clean[y_col] - reg_y.predict(X_controls)
        
        # Correlate residuals
        if method == 'pearson':
            corr, p_value = stats.pearsonr(resid_x, resid_y)
        elif method == 'spearman':
            corr, p_value = stats.spearmanr(resid_x, resid_y)
        else:
            raise ValueError(f"Method {method} not supported for partial correlation")
        
        result = {
            'method': f'partial_{method}',
            'x': x_col,
            'y': y_col,
            'controls': control_cols,
            'n': n,
            'correlation': round(corr, 6),
            'p_value': round(p_value, 6) if p_value is not None else None
        }
        
        if n < 50:
            result['warning'] = f'Small sample for partial correlation (n={n})'
        
        return result
    except Exception as e:
        return {
            'method': f'partial_{method}',
            'x': x_col,
            'y': y_col,
            'controls': control_cols,
            'n': n,
            'correlation': None,
            'p_value': None,
            'error': str(e)
        }


def compute_all_correlations(
    df: pd.DataFrame,
    numeric_cols: Optional[List[str]] = None,
    include_robust: bool = True,
    partial_controls: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Compute all pairwise correlations for numeric columns."""
    if numeric_cols is None:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    correlations = []
    
    methods = ['pearson', 'spearman']
    if include_robust:
        methods.append('pearson_robust')
    
    for i, col1 in enumerate(numeric_cols):
        for col2 in numeric_cols[i+1:]:
            for method in methods:
                is_robust = method == 'pearson_robust'
                actual_method = 'pearson' if is_robust else method
                
                result = compute_correlation(
                    df, col1, col2,
                    method=actual_method,
                    robust=is_robust
                )
                correlations.append(result)
            
            # Partial correlation if controls specified
            if partial_controls and len(partial_controls) > 0:
                result = compute_partial_correlation(
                    df, col1, col2, partial_controls, method='pearson'
                )
                correlations.append(result)
    
    # Compute warnings
    warnings_list = []
    missing_pct = (df[numeric_cols].isna().sum() / len(df) * 100).to_dict()
    high_missing = {k: v for k, v in missing_pct.items() if v > 20}
    if high_missing:
        warnings_list.append(f"High missingness (>20%): {high_missing}")
    
    # Check for non-stationarity (simplified)
    for col in numeric_cols:
        if len(df) > 30:
            try:
                # Simple trend test using first vs second half mean
                mid = len(df) // 2
                first_half = df[col].iloc[:mid].mean()
                second_half = df[col].iloc[mid:].mean()
                if abs(second_half - first_half) / (abs(first_half) + 1e-10) > 0.5:
                    warnings_list.append(f"Potential non-stationarity in {col}")
            except:
                pass
    
    return {
        'correlations': correlations,
        'warnings': warnings_list,
        'sample_size': len(df),
        'variables': numeric_cols
    }


def main():
    """CLI entry point."""
    if len(sys.argv) < 3:
        print("Usage: correlation.py <input_csv> <output_json>", file=sys.stderr)
        sys.exit(1)
    
    input_csv = sys.argv[1]
    output_json = sys.argv[2]
    
    df = pd.read_csv(input_csv)
    
    # Load config if provided
    config = {}
    if len(sys.argv) > 3:
        with open(sys.argv[3]) as f:
            config = json.load(f)
    
    numeric_cols = config.get('numeric_cols')
    include_robust = config.get('include_robust', True)
    partial_controls = config.get('partial_controls')
    
    results = compute_all_correlations(
        df,
        numeric_cols=numeric_cols,
        include_robust=include_robust,
        partial_controls=partial_controls
    )
    
    with open(output_json, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Results written to {output_json}")


if __name__ == '__main__':
    main()
