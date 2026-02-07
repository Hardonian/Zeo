import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'decision-composer',
  title: 'Decision Composer',
  description: 'Create and edit decision specifications',
  route: '/demo',
  slot: 'leftSidebar',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['DecisionSpec'],
  permissions: {},
};

export default manifest;
