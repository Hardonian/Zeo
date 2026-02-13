import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
  id: 'capability-sensitivity',
  title: 'Sensitivity & Thresholds',
  description: 'Adjust sensitivity and flip thresholds',
  route: '/demo',
  slot: 'footer',
  kind: 'iframe',
  entry: './code.html',
  version: '1.0.0',
  capabilities: {},
  dataDeps: ['CalibrationConfig'],
  permissions: {},
};

export default manifest;
