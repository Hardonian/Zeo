/**
 * Kill-switches and safe mode controls for Zeo
 *
 * Provides runtime control over high-risk features.
 * All kill-switches are controllable via environment variables.
 */
export type KillSwitch = 'ai_assist' | 'freeze_markets' | 'max_uncertainty' | 'strategic_assumptions' | 'external_adapters';
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
export declare function _resetKillSwitches(): void;
/**
 * Initialize kill-switches from environment variables
 * Must be called once at startup
 *
 * @param env Environment variables (e.g., process.env in Node.js).
 *            If not provided, will attempt to read from global process.env
 */
export declare function initKillSwitches(env?: KillSwitchEnvironment): void;
/**
 * Initialize kill-switches from Node.js process.env
 * Use this in Node.js environments
 */
export declare function initKillSwitchesFromProcess(): void;
/**
 * Check if a feature is enabled (kill-switch is not triggered)
 */
export declare function isFeatureEnabled(feature: KillSwitch): boolean;
/**
 * Set kill-switch state programmatically
 */
export declare function setKillSwitch(feature: KillSwitch, enabled: boolean): void;
/**
 * Check if safe mode is active (all kill-switches triggered)
 */
export declare function isSafeMode(): boolean;
/**
 * Get current kill-switch status for all features
 */
export declare function getKillSwitchStatus(): Record<KillSwitch, {
    enabled: boolean;
    envVar: string;
}>;
/**
 * Guard function - throws if AI assist is disabled
 */
export declare function requireAiAssist(): void;
/**
 * Guard function - throws if markets are frozen
 */
export declare function requireMarketsActive(): void;
//# sourceMappingURL=kill-switches.d.ts.map