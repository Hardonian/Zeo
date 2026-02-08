import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'explanation-toggle',
  title: 'Explanation',
  description: 'User-controlled explanation depth toggle',
  route: '/demo',
  slot: 'footer',
  kind: 'react',
  entry: './panel.tsx',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['ExplanationContent'],
  permissions: {},
};

export default manifest;
