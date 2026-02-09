
import type { UiPanelManifest } from '@zeo/contracts';

const manifest: UiPanelManifest = {
    id: 'signals-dashboard',
    title: 'Signal Discovery',
    description: 'Exploratory view of potential signals',
    route: '/demo',
    slot: 'main',
    kind: 'react',
    entry: './panel.tsx',
    version: '1.0.0',
    capabilities: {
        needsNetwork: true,
    },
    dataDeps: ['SignalDiscoveryGraph'],
    permissions: {},
};

export default manifest;
