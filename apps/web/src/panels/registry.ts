import type { UiPanelManifest } from '@zeo/contracts';
import { assertUiPanelManifest, denyDangerousPanel } from '@zeo/contracts';

import decisionComposerManifest from './builtin/decision-composer/manifest';
import branchExplorerManifest from './builtin/branch-explorer/manifest';
import evidenceInboxManifest from './builtin/evidence-inbox/manifest';
import signalsStripManifest from './builtin/signals-strip/manifest';
import exampleHtmlManifest from './stitch/example-html/manifest';
import exampleReactManifest from './stitch/example-react/manifest';

const BUILTIN_MANIFESTS: UiPanelManifest[] = [
  decisionComposerManifest as UiPanelManifest,
  branchExplorerManifest as UiPanelManifest,
  evidenceInboxManifest as UiPanelManifest,
  signalsStripManifest as UiPanelManifest,
];

const STITCH_MANIFESTS: UiPanelManifest[] = [
  exampleHtmlManifest as UiPanelManifest,
  exampleReactManifest as UiPanelManifest,
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
