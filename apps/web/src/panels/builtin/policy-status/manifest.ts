import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
    id: 'policy-status',
    title: 'Policy Status',
    description: 'View policy evaluation results and governance evidence',
    route: '/quickstart',
    slot: 'rightInspector',
    kind: 'react',
    entry: './panel.tsx',
    version: '1.0.0',
    capabilities: {
    },
    dataDeps: [],
    permissions: {},
};

export default manifest;
