export interface DatasetConfig {
    numericCols?: string[];
    targetCol?: string;
    featureCols?: string[];
    timestampCol?: string;
    includeRobust?: boolean;
    partialControls?: string[];
    testSize?: number;
    randomSeed?: number;
}
export interface CorrelationResult {
    method: string;
    x: string;
    y: string;
    n: number;
    correlation: number | null;
    p_value: number | null;
    robust?: boolean;
    warning?: string;
    error?: string;
}
export interface RegressionCoefficient {
    estimate: number;
    std_error?: number;
    conf_low?: number;
    conf_high?: number;
    p_value?: number;
    significant?: boolean;
    importance?: number;
    odds_ratio?: number;
}
export interface RegressionModel {
    model_type: string;
    r_squared?: number;
    adj_r_squared?: number;
    aic?: number;
    bic?: number;
    mae?: number;
    auc?: number;
    log_loss?: number;
    coefficients: Record<string, RegressionCoefficient>;
    intercept: number;
    alpha?: number;
    l1_ratio?: number;
    error?: string;
}
export interface RegressionResult {
    target: string;
    features: string[];
    n_train: number;
    n_test: number;
    is_binary: boolean;
    vif: Record<string, number>;
    multicollinearity_warning?: string;
    models: Record<string, RegressionModel>;
    epistemic_label: string;
    epistemic_note: string;
    warnings?: string[];
    error?: string;
    leakage_errors?: string[];
}
export interface AnalyticsReport {
    correlations?: {
        correlations: CorrelationResult[];
        warnings: string[];
        sample_size: number;
        variables: string[];
    };
    regressions?: RegressionResult;
    generatedAt: string;
    datasetHash: string;
    epistemicWarning: string;
}
export declare function runCorrelation(inputCsv: string, outputJson: string, config: DatasetConfig): Promise<AnalyticsReport['correlations']>;
export declare function runRegression(inputCsv: string, outputJson: string, config: DatasetConfig): Promise<AnalyticsReport['regressions']>;
export declare function generateReport(correlations: AnalyticsReport['correlations'], regressions: AnalyticsReport['regressions'], datasetHash: string): Promise<string>;
//# sourceMappingURL=python-bridge.d.ts.map
