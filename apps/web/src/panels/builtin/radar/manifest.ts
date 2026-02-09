
import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
    id: 'radar-panel',
    title: 'Strategic Radar',
    description: 'Top signals and active risks',
    route: '/demo',
    slot: 'rightInspector',
    kind: 'react',
    entry: './panel.tsx',
    version: '1.0.0',
    capabilities: {},
    dataDeps: ['DecisionSpec'],
    permissions: {},
};

export default manifest;
