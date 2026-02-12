import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'stitch-decision-dashboard',
  title: 'Decision Dashboard',
  description: 'Overview of decision state and metrics',
  route: '/demo',
  slot: 'main',
  kind: 'iframe',
  entry: './code.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['DecisionSpec', 'DecisionResult'],
  permissions: {},
};

export default manifest;
