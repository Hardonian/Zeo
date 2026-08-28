import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initKillSwitches,
  isFeatureEnabled,
  setKillSwitch,
  isSafeMode,
  getKillSwitchStatus,
  requireAiAssist,
  requireMarketsActive,
  _resetKillSwitches,
  type KillSwitch,
} from './kill-switches';

describe('kill-switches', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset kill-switch state completely
    _resetKillSwitches();
    // Reset environment to clean state
    process.env = { ...originalEnv };
    // Clear specific env vars that tests will set
    delete process.env.ZEO_SAFE_MODE;
    delete process.env.ZEO_DISABLE_AI_ASSIST;
    delete process.env.ZEO_FREEZE_MARKETS;
    delete process.env.ZEO_FORCE_MAX_UNCERTAINTY;
    delete process.env.ZEO_DISABLE_STRATEGIC_ASSUMPTIONS;
    delete process.env.ZEO_DISABLE_EXTERNAL_ADAPTERS;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('isFeatureEnabled', () => {
    it('should return true by default for all features', () => {
      expect(isFeatureEnabled('ai_assist')).toBe(true);
      expect(isFeatureEnabled('freeze_markets')).toBe(true);
      expect(isFeatureEnabled('max_uncertainty')).toBe(true);
      expect(isFeatureEnabled('strategic_assumptions')).toBe(true);
      expect(isFeatureEnabled('external_adapters')).toBe(true);
    });

    it('should return false when ZEO_DISABLE_AI_ASSIST is set', () => {
      process.env.ZEO_DISABLE_AI_ASSIST = 'true';
      initKillSwitches();
      expect(isFeatureEnabled('ai_assist')).toBe(false);
    });

    it('should return false when ZEO_FREEZE_MARKETS is set', () => {
      process.env.ZEO_FREEZE_MARKETS = 'true';
      initKillSwitches();
      expect(isFeatureEnabled('freeze_markets')).toBe(false);
    });

    it('should return false when ZEO_FORCE_MAX_UNCERTAINTY is set', () => {
      process.env.ZEO_FORCE_MAX_UNCERTAINTY = 'true';
      initKillSwitches();
      expect(isFeatureEnabled('max_uncertainty')).toBe(false);
    });

    it('should disable all features when ZEO_SAFE_MODE is set', () => {
      process.env.ZEO_SAFE_MODE = 'true';
      initKillSwitches();
      expect(isFeatureEnabled('ai_assist')).toBe(false);
      expect(isFeatureEnabled('freeze_markets')).toBe(false);
      expect(isFeatureEnabled('max_uncertainty')).toBe(false);
      expect(isFeatureEnabled('strategic_assumptions')).toBe(false);
      expect(isFeatureEnabled('external_adapters')).toBe(false);
    });
  });

  describe('setKillSwitch', () => {
    it('should allow programmatic toggling', () => {
      setKillSwitch('ai_assist', false);
      expect(isFeatureEnabled('ai_assist')).toBe(false);

      setKillSwitch('ai_assist', true);
      expect(isFeatureEnabled('ai_assist')).toBe(true);
    });
  });

  describe('isSafeMode', () => {
    it('should return false when not in safe mode', () => {
      expect(isSafeMode()).toBe(false);
    });

    it('should return true when all switches are disabled', () => {
      process.env.ZEO_SAFE_MODE = 'true';
      initKillSwitches();
      expect(isSafeMode()).toBe(true);
    });
  });

  describe('getKillSwitchStatus', () => {
    it('should return status for all features', () => {
      const status = getKillSwitchStatus();
      expect(status.ai_assist.enabled).toBe(true);
      expect(status.ai_assist.envVar).toBe('ZEO_DISABLE_AI_ASSIST');
    });
  });

  describe('requireAiAssist', () => {
    it('should not throw when AI assist is enabled', () => {
      expect(() => requireAiAssist()).not.toThrow();
    });

    it('should throw when AI assist is disabled', () => {
      process.env.ZEO_DISABLE_AI_ASSIST = 'true';
      initKillSwitches();
      expect(() => requireAiAssist()).toThrow('AI assist is disabled');
    });
  });

  describe('requireMarketsActive', () => {
    it('should not throw when markets are active', () => {
      expect(() => requireMarketsActive()).not.toThrow();
    });

    it('should throw when markets are frozen', () => {
      process.env.ZEO_FREEZE_MARKETS = 'true';
      initKillSwitches();
      expect(() => requireMarketsActive()).toThrow('Markets are frozen');
    });
  });
});

