import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'capability-branch-explorer',
  title: 'Branch Explorer',
  description: 'Explore decision branches and outcomes',
  route: '/demo',
  slot: 'main',
  kind: 'iframe',
  entry: './code.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['BranchGraph', 'DecisionResult'],
  permissions: {},
};

export default manifest;
