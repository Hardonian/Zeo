
import {
    applyGovernanceRules,
    evaluateRiskTier,
    DecisionRiskProfile,
    AuditEntry
} from '@zeo/governance';
import type { DecisionSpec, EvidenceEvent } from '@zeo/contracts';
import { useCallback } from 'react';

export function useGovernance() {

    const checkCompliance = useCallback((spec: DecisionSpec, evidence: EvidenceEvent[] = []) => {
        try {
            return applyGovernanceRules({
                decisionSpec: spec,
                evidenceEvents: evidence
            });
        } catch (e) {
            console.error("Governance check failed:", e);
            // Fail open or closed depending on policy? Failing closed (safe) here.
            return {
                approved: false,
                warnings: ["Governance check failed internally"],
                riskProfile: { tier: 'existential' } as DecisionRiskProfile,
                auditEntry: {} as AuditEntry
            };
        }
    }, []);

    const getRiskProfile = useCallback((spec: DecisionSpec) => {
        return evaluateRiskTier(spec, 0);
    }, []);

    return {
        checkCompliance,
        getRiskProfile
    };
}
