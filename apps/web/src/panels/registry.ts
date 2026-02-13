import type { UiPanelManifest } from '@zeo/contracts';
import { assertUiPanelManifest, denyDangerousPanel } from '@zeo/contracts';

import decisionComposerManifest from './builtin/decision-composer/manifest';
import branchExplorerManifest from './builtin/branch-explorer/manifest';
import evidenceInboxManifest from './builtin/evidence-inbox/manifest';
import signalsStripManifest from './builtin/signals-strip/manifest';
import worldStateManifest from './builtin/world-state/manifest.json';
import voiPanelManifest from './builtin/voi-panel/manifest.json';
import counterfactualLabManifest from './builtin/counterfactual-lab/manifest.json';
import evidencePlanBuilderManifest from './builtin/evidence-plan-builder/manifest.json';
import kpiDashboardManifest from './builtin/kpi-dashboard/manifest.json';
import kpiAlertMonitorManifest from './builtin/kpi-alert-monitor/manifest.json';
import radarManifest from './builtin/radar/manifest';
import signalsDashboardManifest from './builtin/signals/manifest';
import assumptionsPanelManifest from './builtin/assumptions-panel/manifest.json';
import inferencesPanelManifest from './builtin/inferences-panel/manifest.json';
import explanationPanelManifest from './builtin/explanation-panel/manifest.json';
import scenariosPanelManifest from './builtin/scenarios-panel/manifest.json';
import specComparisonManifest from './builtin/spec-comparison/manifest.json';
import policyStatusManifest from './builtin/policy-status/manifest';

// Trust & v0.4.0 feature panels
import trustConsentManagerManifest from './builtin/trust-consent-manager/manifest';
import patternsDashboardManifest from './builtin/patterns-dashboard/manifest';
import explanationToggleManifest from './builtin/explanation-toggle/manifest';
import strategyLensManifest from './builtin/strategy-lens/manifest';
import timeDecayInspectorManifest from './builtin/time-decay-inspector/manifest';
import valueProfileViewerManifest from './builtin/value-profile-viewer/manifest';

import fundamentalDecisionComposerManifest from './capabilities/stitch_decision_branching_view/decision_composer_panel/manifest';
import fundamentalBranchExplorerManifest from './capabilities/stitch_decision_branching_view/branch_explorer_panel/manifest';
import fundamentalEvidenceInboxManifest from './capabilities/stitch_decision_branching_view/evidence_inbox_panel_1/manifest';
import fundamentalSignalsManifest from './capabilities/stitch_decision_branching_view/signals_strip_panel/manifest';
import fundamentalDecisionDashboardManifest from './capabilities/stitch_decision_branching_view/zeo_decision_dashboard/manifest';
import fundamentalDecisionBranchingManifest from './capabilities/stitch_decision_branching_view/decision_branching_view_1/manifest';
import fundamentalEvidenceLedgerManifest from './capabilities/stitch_decision_branching_view/evidence_&_inputs_ledger/manifest';
import fundamentalSensitivityManifest from './capabilities/stitch_decision_branching_view/sensitivity_&_flip-thresholds_panel/manifest';
import fundamentalBiasInspectorManifest from './capabilities/stitch_decision_branching_view/bias_inspector_&_counterweights/manifest';

const BUILTIN_MANIFESTS: UiPanelManifest[] = [
  decisionComposerManifest as UiPanelManifest,
  branchExplorerManifest as UiPanelManifest,
  evidenceInboxManifest as UiPanelManifest,
  signalsStripManifest as UiPanelManifest,
  worldStateManifest as UiPanelManifest,
  voiPanelManifest as UiPanelManifest,
  counterfactualLabManifest as UiPanelManifest,
  evidencePlanBuilderManifest as UiPanelManifest,
  // KPI & Analytics panels (v0.6.0)
  kpiDashboardManifest as UiPanelManifest,
  kpiAlertMonitorManifest as UiPanelManifest,
  radarManifest as UiPanelManifest,
  signalsDashboardManifest as UiPanelManifest,
  // Trust & v0.4.0 feature panels
  trustConsentManagerManifest as UiPanelManifest,
  patternsDashboardManifest as UiPanelManifest,
  explanationToggleManifest as UiPanelManifest,
  strategyLensManifest as UiPanelManifest,
  timeDecayInspectorManifest as UiPanelManifest,
  valueProfileViewerManifest as UiPanelManifest,
  assumptionsPanelManifest as UiPanelManifest,
  inferencesPanelManifest as UiPanelManifest,
  explanationPanelManifest as UiPanelManifest,
  scenariosPanelManifest as UiPanelManifest,
  specComparisonManifest as UiPanelManifest,
  policyStatusManifest as UiPanelManifest,
];

const FUNDAMENTAL_MANIFESTS: UiPanelManifest[] = [
  fundamentalDecisionComposerManifest as UiPanelManifest,
  fundamentalBranchExplorerManifest as UiPanelManifest,
  fundamentalEvidenceInboxManifest as UiPanelManifest,
  fundamentalSignalsManifest as UiPanelManifest,
  fundamentalDecisionDashboardManifest as UiPanelManifest,
  fundamentalDecisionBranchingManifest as UiPanelManifest,
  fundamentalEvidenceLedgerManifest as UiPanelManifest,
  fundamentalSensitivityManifest as UiPanelManifest,
  fundamentalBiasInspectorManifest as UiPanelManifest,
];

export const ALL_PANELS = [...BUILTIN_MANIFESTS, ...FUNDAMENTAL_MANIFESTS];

const _validatedPanels: Map<string, UiPanelManifest> = new Map();

for (const manifest of ALL_PANELS) {
  assertUiPanelManifest(manifest);
  const denial = denyDangerousPanel(manifest);
  if (denial) {
    console.warn(`Panel "${manifest.id}" was denied: ${denial}`);
    continue;
  }
  _validatedPanels.set(manifest.id, manifest);
}

export function getPanelManifest(id: string): UiPanelManifest | undefined {
  return _validatedPanels.get(id);
}

export function getPanelsBySlot(slot: string): UiPanelManifest[] {
  return Array.from(_validatedPanels.values()).filter((p) => p.slot === slot);
}

export function getPanelsByRoute(route: string): UiPanelManifest[] {
  return Array.from(_validatedPanels.values()).filter((p) => p.route === route);
}

export function getAllRegisteredPanels(): UiPanelManifest[] {
  return Array.from(_validatedPanels.values());
}

export function getBuiltinPanels(): UiPanelManifest[] {
  return BUILTIN_MANIFESTS;
}

export function getFundamentalPanels(): UiPanelManifest[] {
  return FUNDAMENTAL_MANIFESTS;
}

export function isBuiltinPanel(id: string): boolean {
  return BUILTIN_MANIFESTS.some((p) => p.id === id);
}

export function isFundamentalPanel(id: string): boolean {
  return FUNDAMENTAL_MANIFESTS.some((p) => p.id === id);
}
