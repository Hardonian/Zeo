import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCapabilityHtml, getCapabilityPages } from '@/lib/capabilities';
import { __resetStitchCacheForTests, getStitchPanelConfig, resolveStitchCapability } from '@/lib/stitch';

vi.mock('@/lib/capabilities', () => ({
  getCapabilityHtml: vi.fn(),
  getCapabilityPages: vi.fn(),
}));

const mockedGetCapabilityHtml = vi.mocked(getCapabilityHtml);
const mockedGetCapabilityPages = vi.mocked(getCapabilityPages);

describe('stitch route resolution', () => {
  beforeEach(() => {
    __resetStitchCacheForTests();
    mockedGetCapabilityHtml.mockReset();
    mockedGetCapabilityPages.mockReset();
  });

  it('resolves exact capability slug first', async () => {
    mockedGetCapabilityHtml.mockResolvedValueOnce({
      slug: 'decision-branching-view-1',
      title: 'Decision Branching View 1',
      filePath: '/tmp/code.html',
      category: 'Decision Intelligence',
      html: '<html></html>',
    });

    const result = await resolveStitchCapability('decision-branching-view-1');

    expect(result?.slug).toBe('decision-branching-view-1');
    expect(mockedGetCapabilityPages).not.toHaveBeenCalled();
  });

  it('falls back from legacy slug to generated capability slug', async () => {
    mockedGetCapabilityHtml
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        slug: 'stitch-oss-governance-dashboard-kpi-health-monitor-1',
        title: 'KPI Health Monitor 1',
        filePath: '/tmp/code.html',
        category: 'Governance & Compliance',
        html: '<html>kpi</html>',
      });

    mockedGetCapabilityPages.mockResolvedValueOnce([
      {
        slug: 'stitch-oss-governance-dashboard-kpi-health-monitor-1',
        title: 'KPI Health Monitor 1',
        filePath: '/tmp/code.html',
        category: 'Governance & Compliance',
      },
    ]);

    const result = await resolveStitchCapability('kpi-health-monitor-1');

    expect(result?.slug).toBe('stitch-oss-governance-dashboard-kpi-health-monitor-1');
    expect(mockedGetCapabilityHtml).toHaveBeenNthCalledWith(1, 'kpi-health-monitor-1');
    expect(mockedGetCapabilityHtml).toHaveBeenNthCalledWith(2, 'stitch-oss-governance-dashboard-kpi-health-monitor-1');
  });

  it('returns null when no exact or fallback match exists', async () => {
    mockedGetCapabilityHtml.mockResolvedValueOnce(null);
    mockedGetCapabilityPages.mockResolvedValueOnce([
      {
        slug: 'stitch-oss-governance-dashboard-evidence-planner',
        title: 'Evidence Planner',
        filePath: '/tmp/code.html',
        category: 'Governance & Compliance',
      },
    ]);

    const result = await resolveStitchCapability('missing-panel');

    expect(result).toBeNull();
  });


  it('caches capability listing after first fallback resolution', async () => {
    mockedGetCapabilityHtml
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        slug: 'stitch-oss-governance-dashboard-kpi-health-monitor-1',
        title: 'KPI Health Monitor 1',
        filePath: '/tmp/code.html',
        category: 'Governance & Compliance',
        html: '<html>kpi</html>',
      })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        slug: 'stitch-oss-governance-dashboard-evidence-planner',
        title: 'Evidence Planner',
        filePath: '/tmp/code-2.html',
        category: 'Governance & Compliance',
        html: '<html>planner</html>',
      });

    mockedGetCapabilityPages.mockResolvedValue([
      {
        slug: 'stitch-oss-governance-dashboard-kpi-health-monitor-1',
        title: 'KPI Health Monitor 1',
        filePath: '/tmp/code.html',
        category: 'Governance & Compliance',
      },
      {
        slug: 'stitch-oss-governance-dashboard-evidence-planner',
        title: 'Evidence Planner',
        filePath: '/tmp/code-2.html',
        category: 'Governance & Compliance',
      },
    ]);

    await resolveStitchCapability('kpi-health-monitor-1');
    await resolveStitchCapability('evidence-planner');

    expect(mockedGetCapabilityPages).toHaveBeenCalledTimes(1);
  });

  it('exposes stitch panel metadata for known slugs', () => {
    const panel = getStitchPanelConfig('kpi-health-monitor-1');

    expect(panel?.title).toBe('KPI Health Monitoring');
    expect(panel?.cliWorkflow.length).toBeGreaterThan(1);
  });
});
