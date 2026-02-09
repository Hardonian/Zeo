/**
 * Kill-switches and safe mode controls for Zeo
 *
 * Provides runtime control over high-risk features.
 * All kill-switches are controllable via environment variables.
 */
// Default state - all features enabled unless explicitly disabled
const state = {
    ai_assist: true,
    freeze_markets: true,
    max_uncertainty: true,
    strategic_assumptions: true,
    external_adapters: true,
};
let initialized = false;
/**
 * Reset kill-switch state to defaults (for testing)
 * @internal
 */
export function _resetKillSwitches() {
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
function getProcessEnv() {
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env;
        }
    }
    catch {
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
export function initKillSwitches(env) {
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
    }
    else {
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
export function initKillSwitchesFromProcess() {
    // In Node.js environments, use global process
    const env = typeof process !== 'undefined' && process.env
        ? process.env
        : {};
    initKillSwitches(env);
}
/**
 * Check if a feature is enabled (kill-switch is not triggered)
 */
export function isFeatureEnabled(feature) {
    if (!initialized)
        initKillSwitches();
    return state[feature];
}
/**
 * Set kill-switch state programmatically
 */
export function setKillSwitch(feature, enabled) {
    if (!initialized)
        initKillSwitches();
    state[feature] = enabled;
}
/**
 * Check if safe mode is active (all kill-switches triggered)
 */
export function isSafeMode() {
    if (!initialized)
        initKillSwitches();
    return Object.values(state).every(s => !s);
}
/**
 * Get current kill-switch status for all features
 */
export function getKillSwitchStatus() {
    if (!initialized)
        initKillSwitches();
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
export function requireAiAssist() {
    if (!isFeatureEnabled('ai_assist')) {
        throw new Error('AI assist is disabled via ZEO_DISABLE_AI_ASSIST');
    }
}
/**
 * Guard function - throws if markets are frozen
 */
export function requireMarketsActive() {
    if (!isFeatureEnabled('freeze_markets')) {
        throw new Error('Markets are frozen via ZEO_FREEZE_MARKETS');
    }
}
//# sourceMappingURL=kill-switches.js.map