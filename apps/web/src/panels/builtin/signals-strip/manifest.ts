import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'signals-strip',
  title: 'Signals',
  description: 'Real-time signal monitoring',
  route: '/demo',
  slot: 'footer',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['ObservationBatch'],
  permissions: {},
};

export default manifest;
