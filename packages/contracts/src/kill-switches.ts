/**
 * Kill-switches and safe mode controls for Zeo
 *
 * Provides runtime control over high-risk features.
 * All kill-switches are controllable via environment variables.
 */

// Declare process for environments that support it (Node.js)
declare const process: { env: Record<string, string | undefined> } | undefined;

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
 * Environment provider interface for platform-agnostic kill-switch initialization
 * In Node.js, pass process.env; in browsers, pass an object with the same keys
 */
export interface KillSwitchEnvironment {
  ZEO_SAFE_MODE?: string;
  ZEO_DISABLE_AI_ASSIST?: string;
  ZEO_FREEZE_MARKETS?: string;
  ZEO_FORCE_MAX_UNCERTAINTY?: string;
  ZEO_DISABLE_STRATEGIC_ASSUMPTIONS?: string;
  ZEO_DISABLE_EXTERNAL_ADAPTERS?: string;
  [key: string]: string | undefined;
}

/**
 * Reset kill-switch state to defaults (for testing)
 * @internal
 */
export function _resetKillSwitches(): void {
  state.ai_assist = true;
  state.freeze_markets = true;
  state.max_uncertainty = true;
  state.strategic_assumptions = true;
  state.external_adapters = true;
  initialized = false;
}

/**
 * Get environment variables from global process if available
 */
function getProcessEnv(): KillSwitchEnvironment {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env as KillSwitchEnvironment;
    }
  } catch {
    // process not available (browser environment)
  }
  return {};
}

/**
 * Initialize kill-switches from environment variables
 * Must be called once at startup
 *
 * @param env Environment variables (e.g., process.env in Node.js).
 *            If not provided, will attempt to read from global process.env
 */
export function initKillSwitches(env?: KillSwitchEnvironment): void {
  // Use provided env, or try to read from process.env, or use empty object
  const environment = env ?? getProcessEnv();

  // Check master safe mode first
  const safeMode = environment.ZEO_SAFE_MODE === 'true';

  if (safeMode) {
    // Disable all features
    state.ai_assist = false;
    state.freeze_markets = false;
    state.max_uncertainty = false;
    state.strategic_assumptions = false;
    state.external_adapters = false;
  } else {
    // Check individual switches
    state.ai_assist = environment.ZEO_DISABLE_AI_ASSIST !== 'true';
    state.freeze_markets = environment.ZEO_FREEZE_MARKETS !== 'true';
    state.max_uncertainty = environment.ZEO_FORCE_MAX_UNCERTAINTY !== 'true';
    state.strategic_assumptions = environment.ZEO_DISABLE_STRATEGIC_ASSUMPTIONS !== 'true';
    state.external_adapters = environment.ZEO_DISABLE_EXTERNAL_ADAPTERS !== 'true';
  }

  initialized = true;
}

/**
 * Initialize kill-switches from Node.js process.env
 * Use this in Node.js environments
 */
export function initKillSwitchesFromProcess(): void {
  // In Node.js environments, use global process
  const env = typeof process !== 'undefined' && process.env
    ? process.env as KillSwitchEnvironment
    : {};
  initKillSwitches(env);
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
