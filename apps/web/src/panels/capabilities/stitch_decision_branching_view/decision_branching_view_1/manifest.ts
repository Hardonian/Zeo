import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'capability-decision-branching',
  title: 'Decision Branching View',
  description: 'Visualize decision branches and paths',
  route: '/demo',
  slot: 'main',
  kind: 'iframe',
  entry: './code.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['BranchGraph', 'DecisionSpec'],
  permissions: {},
};

export default manifest;
