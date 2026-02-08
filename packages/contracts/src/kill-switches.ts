/**
 * Kill-switches and safe mode controls for Zeo
 * 
 * Provides runtime control over high-risk features.
 * All kill-switches are controllable via environment variables.
 */

export type KillSwitch = 
  | 'ai_assist'
  | 'freeze_markets'
  | 'max_uncertainty'
  | 'strategic_assumptions'
  | 'external_adapters';

interface KillSwitchState {
  ai_assist: boolean;
  freeze_markets: boolean;
  max_uncertainty: boolean;
  strategic_assumptions: boolean;
  external_adapters: boolean;
}

// Default state - all features enabled unless explicitly disabled
const state: KillSwitchState = {
  ai_assist: true,
  freeze_markets: true,
  max_uncertainty: true,
  strategic_assumptions: true,
  external_adapters: true,
};

let initialized = false;

/**
 * Initialize kill-switches from environment variables
 * Must be called once at startup
 */
export function initKillSwitches(): void {
  if (initialized) return;
  
  // Check master safe mode first
  const safeMode = process.env.ZEO_SAFE_MODE === 'true';
  
  if (safeMode) {
    // Disable all features
    state.ai_assist = false;
    state.freeze_markets = false;
    state.max_uncertainty = false;
    state.strategic_assumptions = false;
    state.external_adapters = false;
  } else {
    // Check individual switches
    state.ai_assist = process.env.ZEO_DISABLE_AI_ASSIST !== 'true';
    state.freeze_markets = process.env.ZEO_FREEZE_MARKETS !== 'true';
    state.max_uncertainty = process.env.ZEO_FORCE_MAX_UNCERTAINTY !== 'true';
    state.strategic_assumptions = process.env.ZEO_DISABLE_STRATEGIC_ASSUMPTIONS !== 'true';
    state.external_adapters = process.env.ZEO_DISABLE_EXTERNAL_ADAPTERS !== 'true';
  }
  
  initialized = true;
}

/**
 * Check if a feature is enabled (kill-switch is not triggered)
 */
export function isFeatureEnabled(feature: KillSwitch): boolean {
  if (!initialized) initKillSwitches();
  return state[feature];
}

/**
 * Set kill-switch state programmatically
 */
export function setKillSwitch(feature: KillSwitch, enabled: boolean): void {
  if (!initialized) initKillSwitches();
  state[feature] = enabled;
}

/**
 * Check if safe mode is active (all kill-switches triggered)
 */
export function isSafeMode(): boolean {
  if (!initialized) initKillSwitches();
  return Object.values(state).every(s => !s);
}

/**
 * Get current kill-switch status for all features
 */
export function getKillSwitchStatus(): Record<KillSwitch, { enabled: boolean; envVar: string }> {
  if (!initialized) initKillSwitches();
  
  return {
    ai_assist: { 
      enabled: state.ai_assist, 
      envVar: 'ZEO_DISABLE_AI_ASSIST' 
    },
    freeze_markets: { 
      enabled: state.freeze_markets, 
      envVar: 'ZEO_FREEZE_MARKETS' 
    },
    max_uncertainty: { 
      enabled: state.max_uncertainty, 
      envVar: 'ZEO_FORCE_MAX_UNCERTAINTY' 
    },
    strategic_assumptions: { 
      enabled: state.strategic_assumptions, 
      envVar: 'ZEO_DISABLE_STRATEGIC_ASSUMPTIONS' 
    },
    external_adapters: { 
      enabled: state.external_adapters, 
      envVar: 'ZEO_DISABLE_EXTERNAL_ADAPTERS' 
    },
  };
}

/**
 * Guard function - throws if AI assist is disabled
 */
export function requireAiAssist(): void {
  if (!isFeatureEnabled('ai_assist')) {
    throw new Error('AI assist is disabled via ZEO_DISABLE_AI_ASSIST');
  }
}

/**
 * Guard function - throws if markets are frozen
 */
export function requireMarketsActive(): void {
  if (!isFeatureEnabled('freeze_markets')) {
    throw new Error('Markets are frozen via ZEO_FREEZE_MARKETS');
  }
}
