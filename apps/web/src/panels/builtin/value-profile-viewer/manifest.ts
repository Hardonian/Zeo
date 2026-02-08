import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'value-profile-viewer',
  title: 'Value Profile',
  description: 'View current value function components',
  route: '/demo',
  slot: 'rightInspector',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['ValueProfile'],
  permissions: {},
};

export default manifest;
