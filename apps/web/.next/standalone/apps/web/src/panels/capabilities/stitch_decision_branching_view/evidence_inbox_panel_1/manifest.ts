import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'capability-evidence-inbox',
  title: 'Evidence Inbox',
  description: 'Review and ingest evidence',
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
