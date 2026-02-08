import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'trust-consent-manager',
  title: 'Trust & Consent',
  description: 'Consent scope controls and trust settings',
  route: '/demo',
  slot: 'leftSidebar',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['ConsentScope'],
  permissions: {},
};

export default manifest;
