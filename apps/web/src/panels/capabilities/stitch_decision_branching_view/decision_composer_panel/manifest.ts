import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'capability-decision-composer',
  title: 'Decision Composer',
  description: 'Compose and edit decision specifications',
  route: '/demo',
  slot: 'leftSidebar',
  kind: 'iframe',
  entry: './code.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['DecisionSpec'],
  permissions: {},
};

export default manifest;
