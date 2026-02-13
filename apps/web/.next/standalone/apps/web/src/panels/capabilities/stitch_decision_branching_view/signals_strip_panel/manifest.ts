import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'capability-signals',
  title: 'Signals',
  description: 'Real-time signal monitoring',
  route: '/demo',
  slot: 'footer',
  kind: 'iframe',
  entry: './code.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['ObservationBatch'],
  permissions: {},
};

export default manifest;
