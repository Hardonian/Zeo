import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'branch-explorer',
  title: 'Branch Explorer',
  description: 'View and explore decision branches',
  route: '/demo',
  slot: 'main',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['BranchGraph', 'DecisionResult'],
  permissions: {},
};

export default manifest;
