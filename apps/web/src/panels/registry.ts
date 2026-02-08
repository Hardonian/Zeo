import type { UiPanelManifest } from '@zeo/contracts';
import { assertUiPanelManifest, denyDangerousPanel } from '@zeo/contracts';

import decisionComposerManifest from './builtin/decision-composer/manifest';
import branchExplorerManifest from './builtin/branch-explorer/manifest';
import evidenceInboxManifest from './builtin/evidence-inbox/manifest';
import signalsStripManifest from './builtin/signals-strip/manifest';
import worldStateManifest from './builtin/world-state/manifest.json';
import voiPanelManifest from './builtin/voi-panel/manifest.json';

// Trust & v0.4.0 feature panels
import trustConsentManagerManifest from './builtin/trust-consent-manager/manifest';
import patternsDashboardManifest from './builtin/patterns-dashboard/manifest';
import explanationToggleManifest from './builtin/explanation-toggle/manifest';
import strategyLensManifest from './builtin/strategy-lens/manifest';
import timeDecayInspectorManifest from './builtin/time-decay-inspector/manifest';
import valueProfileViewerManifest from './builtin/value-profile-viewer/manifest';

import stitchDecisionComposerManifest from './stitch/stitch_decision_branching_view/decision_composer_panel/manifest';
import stitchBranchExplorerManifest from './stitch/stitch_decision_branching_view/branch_explorer_panel/manifest';
import stitchEvidenceInboxManifest from './stitch/stitch_decision_branching_view/evidence_inbox_panel_1/manifest';
import stitchSignalsManifest from './stitch/stitch_decision_branching_view/signals_strip_panel/manifest';
import stitchDecisionDashboardManifest from './stitch/stitch_decision_branching_view/zeo_decision_dashboard/manifest';
import stitchDecisionBranchingManifest from './stitch/stitch_decision_branching_view/decision_branching_view_1/manifest';
import stitchEvidenceLedgerManifest from './stitch/stitch_decision_branching_view/evidence_&_inputs_ledger/manifest';
import stitchSensitivityManifest from './stitch/stitch_decision_branching_view/sensitivity_&_flip-thresholds_panel/manifest';
import stitchBiasInspectorManifest from './stitch/stitch_decision_branching_view/bias_inspector_&_counterweights/manifest';

const BUILTIN_MANIFESTS: UiPanelManifest[] = [
  decisionComposerManifest as UiPanelManifest,
  branchExplorerManifest as UiPanelManifest,
  evidenceInboxManifest as UiPanelManifest,
  signalsStripManifest as UiPanelManifest,
  worldStateManifest as UiPanelManifest,
  voiPanelManifest as UiPanelManifest,
  // Trust & v0.4.0 feature panels
  trustConsentManagerManifest as UiPanelManifest,
  patternsDashboardManifest as UiPanelManifest,
  explanationToggleManifest as UiPanelManifest,
  strategyLensManifest as UiPanelManifest,
  timeDecayInspectorManifest as UiPanelManifest,
  valueProfileViewerManifest as UiPanelManifest,
];

const STITCH_MANIFESTS: UiPanelManifest[] = [
  stitchDecisionComposerManifest as UiPanelManifest,
  stitchBranchExplorerManifest as UiPanelManifest,
  stitchEvidenceInboxManifest as UiPanelManifest,
  stitchSignalsManifest as UiPanelManifest,
  stitchDecisionDashboardManifest as UiPanelManifest,
  stitchDecisionBranchingManifest as UiPanelManifest,
  stitchEvidenceLedgerManifest as UiPanelManifest,
  stitchSensitivityManifest as UiPanelManifest,
  stitchBiasInspectorManifest as UiPanelManifest,
];

export const ALL_PANELS = [...BUILTIN_MANIFESTS, ...STITCH_MANIFESTS];

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

export function getStitchPanels(): UiPanelManifest[] {
  return STITCH_MANIFESTS;
}

export function isBuiltinPanel(id: string): boolean {
  return BUILTIN_MANIFESTS.some((p) => p.id === id);
}

export function isStitchPanel(id: string): boolean {
  return STITCH_MANIFESTS.some((p) => p.id === id);
}
