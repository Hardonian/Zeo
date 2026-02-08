import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'strategy-lens',
  title: 'Strategy Lens',
  description: 'Display adversarial assumptions and strategic context',
  route: '/demo',
  slot: 'rightInspector',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['StrategicWorld'],
  permissions: {},
};

export default manifest;
