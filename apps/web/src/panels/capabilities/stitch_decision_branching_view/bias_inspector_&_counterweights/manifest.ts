import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'stitch-bias-inspector',
  title: 'Bias Inspector',
  description: 'Detect bias and apply counterweights',
  route: '/demo',
  slot: 'rightInspector',
  kind: 'iframe',
  entry: './code.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['BiasReport', 'CounterweightSet'],
  permissions: {},
};

export default manifest;
