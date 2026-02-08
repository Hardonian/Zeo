import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'patterns-dashboard',
  title: 'Patterns',
  description: 'Meta-insights from decision history',
  route: '/demo',
  slot: 'leftSidebar',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['MetaInsight'],
  permissions: {},
};

export default manifest;
