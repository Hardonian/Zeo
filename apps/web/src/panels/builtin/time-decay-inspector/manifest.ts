import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'time-decay-inspector',
  title: 'Time & Decay',
  description: 'Visualize evidence staleness and decay',
  route: '/demo',
  slot: 'rightInspector',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['EvidenceEvent'],
  permissions: {},
};

export default manifest;
