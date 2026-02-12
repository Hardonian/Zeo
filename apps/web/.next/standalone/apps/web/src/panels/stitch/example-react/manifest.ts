import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'example-react',
  title: 'Example React Panel',
  description: 'Simple React panel demonstrating bridge communication',
  route: '/demo',
  slot: 'rightInspector',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['DecisionSpec'],
  permissions: {},
};

export default manifest;
