import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'capability-evidence-ledger',
  title: 'Evidence & Inputs Ledger',
  description: 'Track all evidence and inputs',
  route: '/demo',
  slot: 'rightInspector',
  kind: 'iframe',
  entry: './code.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['EvidenceEvent'],
  permissions: {},
};

export default manifest;
