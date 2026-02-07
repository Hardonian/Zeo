import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'example-html',
  title: 'Example HTML Panel',
  description: 'Simple iframe panel demonstrating bridge communication',
  route: '/demo',
  slot: 'main',
  kind: 'iframe',
  entry: './panel.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: [],
  permissions: {},
};

export default manifest;
