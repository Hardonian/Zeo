
import React from "react";
import type {
    ExtendedUncertaintyLedger,
    UncertaintyBand,
    ExtendedUncertaintyCategory
} from "@zeo/eval";

interface UncertaintyPanelProps {
    ledger: ExtendedUncertaintyLedger;
}

const formatBand = (band: UncertaintyBand) => {
    const width = band.high - band.low;
    return `±${(width / 2).toFixed(3)} (CI: ${(band.confidence * 100).toFixed(0)}%)`;
};

const UncertaintyRow: React.FC<{
    label: string;
    band?: UncertaintyBand;
    highlight?: boolean;
}> = ({ label, band, highlight }) => {
    if (!band) return null;
    return (
        <div className={`flex justify-between items-center py-1 ${highlight ? "font-bold text-blue-400" : "text-gray-300"}`}>
            <span>{label}</span>
            <span>{formatBand(band)}</span>
        </div>
    );
};

const QuantComponentBadge: React.FC<{
    label: string;
    active: boolean;
    value?: string | number;
}> = ({ label, active, value }) => {
    if (!active) return null;
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-200 mr-2 mb-1">
            {label}{value !== undefined ? `: ${value}` : ""}
        </span>
    );
};

export const UncertaintyPanel: React.FC<UncertaintyPanelProps> = ({ ledger }) => {
    const quantComponents = ledger.quantComponents || {};

    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Uncertainty Breakdown</h3>

            <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Quant Factors</h4>
                <div className="flex flex-wrap">
                    <QuantComponentBadge
                        label="Change-Point"
                        active={!!quantComponents.changepointInstability?.detected}
                        value={quantComponents.changepointInstability?.stabilityScore
                            ? `${(quantComponents.changepointInstability.stabilityScore * 100).toFixed(0)}% Stable`
                            : undefined}
                    />
                    <QuantComponentBadge
                        label="Shrinkage"
                        active={!!quantComponents.shrinkageAdjustment?.applied}
                        value={quantComponents.shrinkageAdjustment?.shrinkageFactor.toFixed(2)}
                    />
                    <QuantComponentBadge
                        label="Redundancy"
                        active={!!quantComponents.redundancyPenalty?.detected}
                        value={quantComponents.redundancyPenalty?.overallRedundancy.toFixed(2)}
                    />
                    <QuantComponentBadge
                        label="Sensitivity"
                        active={!!quantComponents.sensitivityRisk && quantComponents.sensitivityRisk.combinedRisk !== "low"}
                        value={quantComponents.sensitivityRisk?.combinedRisk}
                    />
                    {(!ledger.integrationMetadata?.quantPackagesUsed?.length) && (
                        <span className="text-xs text-gray-500 italic">No quant adjustments applied</span>
                    )}
                </div>
            </div>

            <div className="space-y-1 mb-4 border-t border-gray-700 pt-2">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Standard Components</h4>
                {Object.entries(ledger.categories).map(([cat, band]) => {
                    // Skip quant categories here, they are implicitly handled or shown separately if significant
                    if (["changepoint_instability", "shrinkage_adjustment", "redundancy_penalty", "sensitivity_risk"].includes(cat)) {
                        return null;
                    }
                    return <UncertaintyRow key={cat} label={cat.replace(/_/g, " ")} band={band} />;
                })}
            </div>

            <div className="space-y-1 mb-4 border-t border-gray-700 pt-2">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Quant Adjustments</h4>
                <UncertaintyRow label="Change-Point Instability" band={(ledger.categories as any)["changepoint_instability"]} />
                <UncertaintyRow label="Shrinkage Adjustment" band={(ledger.categories as any)["shrinkage_adjustment"]} />
                <UncertaintyRow label="Redundancy Penalty" band={(ledger.categories as any)["redundancy_penalty"]} />
                <UncertaintyRow label="Sensitivity Risk" band={(ledger.categories as any)["sensitivity_risk"]} />
            </div>

            <div className="mt-4 pt-3 border-t border-gray-600">
                <UncertaintyRow label="Base Uncertainty" band={ledger.total} />
                <UncertaintyRow label="Quant-Adjusted Total" band={ledger.quantAdjustedAggregate} highlight />
            </div>

            {ledger.integrationMetadata && (
                <div className="mt-2 text-xs text-gray-500 text-right">
                    Computed in {ledger.integrationMetadata.computeTimeMs}ms using {ledger.integrationMetadata.quantPackagesUsed.length} packages
                </div>
            )}
        </div>
    );
};
