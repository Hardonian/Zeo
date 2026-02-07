import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPanelManifest, getPanelsBySlot, getAllRegisteredPanels } from './registry';

describe('Panel Registry', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('getPanelManifest', () => {
    it('should return manifest for valid panel id', () => {
      const manifest = getPanelManifest('decision-composer');
      expect(manifest).toBeDefined();
      expect(manifest?.id).toBe('decision-composer');
    });

    it('should return undefined for unknown panel id', () => {
      const manifest = getPanelManifest('unknown-panel');
      expect(manifest).toBeUndefined();
    });
  });

  describe('getPanelsBySlot', () => {
    it('should return panels for leftSidebar slot', () => {
      const panels = getPanelsBySlot('leftSidebar');
      expect(panels.length).toBeGreaterThan(0);
      expect(panels.every(p => p.slot === 'leftSidebar')).toBe(true);
    });

    it('should return panels for main slot', () => {
      const panels = getPanelsBySlot('main');
      expect(panels.length).toBeGreaterThan(0);
      expect(panels.every(p => p.slot === 'main')).toBe(true);
    });
  });

  describe('getAllRegisteredPanels', () => {
    it('should return all registered panels', () => {
      const panels = getAllRegisteredPanels();
      expect(panels.length).toBeGreaterThan(0);
    });

    it('should include builtin panels', () => {
      const panels = getAllRegisteredPanels();
      const builtinIds = panels.map(p => p.id).filter(id => 
        id === 'decision-composer' || 
        id === 'branch-explorer' || 
        id === 'evidence-inbox' ||
        id === 'signals-strip'
      );
      expect(builtinIds.length).toBe(4);
    });
  });
});
