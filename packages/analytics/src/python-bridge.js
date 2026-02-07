import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const PYTHON_DIR = join(__dirname, '..', 'python');
function runPythonScript(scriptName, args, timeout = 300000) {
    return new Promise((resolve, reject) => {
        const scriptPath = join(PYTHON_DIR, scriptName);
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const proc = spawn(pythonCmd, [scriptPath, ...args], {
            timeout,
            env: {
                ...process.env,
                PYTHONPATH: PYTHON_DIR,
            },
        });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        proc.on('close', (code) => {
            resolve({ stdout, stderr, exitCode: code ?? 0 });
        });
        proc.on('error', (err) => {
            reject(err);
        });
    });
}
export async function runCorrelation(inputCsv, outputJson, config) {
    const configPath = `${outputJson}.config.json`;
    try {
        await fs.writeFile(configPath, JSON.stringify({
            numeric_cols: config.numericCols,
            include_robust: config.includeRobust ?? true,
            partial_controls: config.partialControls,
        }));
        const result = await runPythonScript('correlation.py', [
            inputCsv,
            outputJson,
            configPath,
        ]);
        if (result.exitCode !== 0) {
            throw new Error(`Correlation script failed: ${result.stderr}`);
        }
        const output = await fs.readFile(outputJson, 'utf-8');
        return JSON.parse(output);
    }
    finally {
        // Cleanup config file
        try {
            await fs.unlink(configPath);
        }
        catch {
            // Ignore cleanup errors
        }
    }
}
export async function runRegression(inputCsv, outputJson, config) {
    if (!config.targetCol || !config.featureCols || config.featureCols.length === 0) {
        throw new Error('targetCol and featureCols are required for regression');
    }
    const result = await runPythonScript('regression.py', [
        inputCsv,
        outputJson,
        config.targetCol,
        ...config.featureCols,
    ]);
    if (result.exitCode !== 0) {
        throw new Error(`Regression script failed: ${result.stderr}`);
    }
    const output = await fs.readFile(outputJson, 'utf-8');
    return JSON.parse(output);
}
export async function generateReport(correlations, regressions, datasetHash) {
    const generatedAt = new Date().toISOString();
    let report = `# Zeo Analytics Report
Generated: ${generatedAt}
Dataset Hash: ${datasetHash}

## Epistemic Warning
**${'WARNING'.toUpperCase()}**: All analytics results are **PREDICTIVE HYPOTHESES**, not causal facts.
These associations do not imply causation. Use for generating evidence candidates only.

---

`;
    if (correlations) {
        report += `## Correlation Analysis

Sample Size: ${correlations.sample_size}
Variables: ${correlations.variables.join(', ')}

### Top Correlations

`;
        // Sort by absolute correlation value, filter out errors
        const validCorrelations = correlations.correlations
            .filter(c => c.correlation !== null && !c.error)
            .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
            .slice(0, 20);
        for (const corr of validCorrelations) {
            const sigMarker = (corr.p_value ?? 1) < 0.05 ? '*' : '';
            report += `- **${corr.x}** vs **${corr.y}**: ${corr.correlation?.toFixed(3)}${sigMarker} (${corr.method}${corr.robust ? ', robust' : ''}, n=${corr.n})\n`;
        }
        if (validCorrelations.length === 0) {
            report += 'No valid correlations computed.\n';
        }
        if (correlations.warnings.length > 0) {
            report += '\n### Warnings\n\n';
            for (const warning of correlations.warnings) {
                report += `- ${warning}\n`;
            }
        }
        report += '\n---\n\n';
    }
    if (regressions) {
        if (regressions.error) {
            report += `## Regression Analysis

**Error**: ${regressions.error}

`;
            if (regressions.leakage_errors) {
                report += '### Data Leakage Detected\n\n';
                for (const error of regressions.leakage_errors) {
                    report += `- ${error}\n`;
                }
            }
        }
        else {
            report += `## Regression Analysis

Target: ${regressions.target}
Features: ${regressions.features.join(', ')}
Training Samples: ${regressions.n_train}
Test Samples: ${regressions.n_test}
Binary Outcome: ${regressions.is_binary ? 'Yes' : 'No'}

`;
            if (regressions.multicollinearity_warning) {
                report += `### Multicollinearity Warning\n${regressions.multicollinearity_warning}\n\n`;
            }
            // VIF table
            report += '### Variance Inflation Factors\n\n';
            report += '| Feature | VIF |\n|---------|-----|\n';
            for (const [col, vif] of Object.entries(regressions.vif)) {
                const vifWarning = vif > 10 ? ' ⚠️' : '';
                report += `| ${col} | ${vif.toFixed(2)}${vifWarning} |\n`;
            }
            report += '\n';
            // Model results
            for (const [modelName, model] of Object.entries(regressions.models)) {
                if (model.error) {
                    report += `### ${modelName.toUpperCase()}\nError: ${model.error}\n\n`;
                    continue;
                }
                report += `### ${modelName.toUpperCase()}\n\n`;
                if (model.r_squared !== undefined) {
                    report += `R²: ${model.r_squared}\n`;
                }
                if (model.adj_r_squared !== undefined) {
                    report += `Adjusted R²: ${model.adj_r_squared}\n`;
                }
                if (model.mae !== undefined) {
                    report += `MAE: ${model.mae}\n`;
                }
                if (model.auc !== undefined) {
                    report += `AUC: ${model.auc}\n`;
                }
                if (model.alpha !== undefined) {
                    report += `Alpha: ${model.alpha}\n`;
                }
                report += '\n**Coefficients**:\n\n';
                report += '| Feature | Estimate | Std Error | p-value | Notes |\n';
                report += '|---------|----------|-----------|---------|-------|\n';
                for (const [feat, coef] of Object.entries(model.coefficients)) {
                    const sig = coef.significant ? ' *' : '';
                    const stdErr = coef.std_error !== undefined ? coef.std_error.toFixed(4) : 'N/A';
                    const pval = coef.p_value !== undefined ? coef.p_value.toFixed(4) : 'N/A';
                    const notes = coef.odds_ratio ? `OR: ${coef.odds_ratio}` : (coef.importance ? `Imp: ${coef.importance}` : '');
                    report += `| ${feat} | ${coef.estimate.toFixed(4)}${sig} | ${stdErr} | ${pval} | ${notes} |\n`;
                }
                report += `\nIntercept: ${model.intercept.toFixed(4)}\n\n`;
            }
            if (regressions.warnings && regressions.warnings.length > 0) {
                report += '### Warnings\n\n';
                for (const warning of regressions.warnings) {
                    report += `- ${warning}\n`;
                }
            }
        }
        report += '\n---\n\n';
    }
    report += `## Interpretation Guidelines

1. **Correlation ≠ Causation**: Associations may be spurious or confounded.
2. **Sample Size**: Small samples (n < 30) produce unreliable estimates.
3. **Missing Data**: High missingness (>20%) can bias results.
4. **Outliers**: Robust methods reduce but don't eliminate outlier influence.
5. **Multicollinearity**: VIF > 10 indicates problematic correlations among predictors.
6. **Time Ordering**: Regression respects temporal ordering to prevent leakage.

## Recommended Actions

Based on these results:
- Identify features with strong associations for potential evidence gathering
- Consider measuring under-represented variables to reduce uncertainty
- Validate findings with out-of-sample prediction when possible
- Update priors conservatively - never narrow uncertainty solely from regression

---

*Report generated by Zeo Analytics v0.3.3*
`;
    return report;
}
//# sourceMappingURL=python-bridge.js.map