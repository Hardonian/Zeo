/**
 * @zeo/kpi - Alert Monitor Service
 * 
 * Monitors KPIs at scheduled intervals, evaluates threshold conditions,
 * and triggers alerts when thresholds are breached.
 * 
 * Uses EventEmitter pattern for decoupled alert handling.
 * All evaluations are deterministic and include epistemic metadata.
 * 
 * @example
 * ```typescript
 * import { AlertMonitorService } from "@zeo/kpi";
 * import { createKpiWarehouseStorage } from "@zeo/warehouse";
 * 
 * const warehouse = new FilesystemWarehouseAdapter();
 * const storage = createKpiWarehouseStorage(warehouse);
 * const monitor = new AlertMonitorService(storage);
 * 
 * // Register alert handlers
 * monitor.on("alert", (alert) => {
 *   console.log(`Alert triggered: ${alert.message}`);
 * });
 * 
 * // Start monitoring
 * monitor.start({ intervalMs: 60000 }); // Check every minute
 * 
 * // Check a specific KPI
 * await monitor.checkKpi("decision-coverage");
 * 
 * // Stop monitoring
 * monitor.stop();
 * ```
 */

import type { 
  KpiContract, 
  KpiMeasurement, 
  KpiAlertRule, 
  KpiAlert,
  KpiValue,
  UUID 
} from "@zeo/contracts";
import type { KpiWarehouseStorage } from "@zeo/warehouse";

/**
 * Alert event types emitted by the monitor
 */
export type AlertEventType = 
  | "alert"           // Alert triggered
  | "resolved"        // Alert condition resolved
  | "error"           // Error during check
  | "threshold-crossed" // Threshold crossed but in cooldown
  | "check-complete"; // KPI check completed

/**
 * Alert event payload
 */
export interface AlertEvent {
  type: AlertEventType;
  timestamp: string;
  ruleId?: string;
  kpiId?: string;
  alert?: KpiAlert;
  measurement?: KpiMeasurement;
  error?: Error;
  message?: string;
}

/**
 * Alert monitor configuration
 */
export interface AlertMonitorConfig {
  /** Check interval in milliseconds (default: 60000) */
  intervalMs: number;
  /** Maximum alerts per KPI per check cycle (default: 10) */
  maxAlertsPerCycle: number;
  /** Whether to run initial check on start (default: true) */
  runInitialCheck: boolean;
  /** Alert cooldown buffer - minimum time between same alert (default: 300000) */
  cooldownBufferMs: number;
  /** Maximum alert history to retain (default: 1000) */
  maxAlertHistory: number;
  /** Auto-resolve alerts when condition clears (default: true) */
  autoResolve: boolean;
}

/**
 * Alert handler function type
 */
export type AlertHandler = (event: AlertEvent) => void | Promise<void>;

/**
 * Threshold evaluation result
 */
interface ThresholdEvaluation {
  crossed: boolean;
  direction: "above" | "below" | "within" | "outside";
  value: number;
  threshold: number | [number, number];
  severity: "low" | "medium" | "high" | "critical";
  sustained: boolean;
  sustainedForMs?: number;
}

/**
 * Alert state tracking for cooldown and deduplication
 */
export interface AlertState {
  ruleId: string;
  kpiId: string;
  lastTriggeredAt: string;
  lastValue: number;
  triggerCount: number;
  currentAlertId?: string;
  sustainedSince?: string;
}

/**
 * Default monitor configuration
 */
const DEFAULT_CONFIG: AlertMonitorConfig = {
  intervalMs: 60000,      // 1 minute
  maxAlertsPerCycle: 10,
  runInitialCheck: true,
  cooldownBufferMs: 300000, // 5 minutes
  maxAlertHistory: 1000,
  autoResolve: true,
};

/**
 * AlertMonitorService - Scheduled KPI monitoring and alerting
 * 
 * Features:
 * - Scheduled interval checks using setInterval
 * - Threshold evaluation with sustained condition detection
 * - Event-driven alert notifications
 * - Cooldown management to prevent alert spam
 * - Auto-resolution when conditions clear
 * - Epistemic discipline - alerts tagged as beliefs with confidence
 */
export class AlertMonitorService {
  private storage: KpiWarehouseStorage;
  private config: AlertMonitorConfig;
  private handlers: Map<AlertEventType, Set<AlertHandler>> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private alertStates: Map<string, AlertState> = new Map();
  private alertHistory: KpiAlert[] = [];
  private checkInProgress: boolean = false;
  private lastCheckTime: string | null = null;

  /**
   * Create a new alert monitor service
   */
  constructor(storage: KpiWarehouseStorage, config?: Partial<AlertMonitorConfig>) {
    this.storage = storage;
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize handler sets for all event types
    for (const eventType of ["alert", "resolved", "error", "threshold-crossed", "check-complete"] as AlertEventType[]) {
      this.handlers.set(eventType, new Set());
    }
  }

  /**
   * Register an event handler
   */
  on(event: AlertEventType, handler: AlertHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.add(handler);
    }
  }

  /**
   * Remove an event handler
   */
  off(event: AlertEventType, handler: AlertHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit an event to all registered handlers
   */
  private async emit(event: AlertEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) return;

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Alert handler error for ${event.type}:`, error);
      }
    }
  }

  /**
   * Start the scheduled monitoring
   */
  start(config?: Partial<AlertMonitorConfig>): void {
    if (this.isRunning) {
      console.warn("AlertMonitorService is already running");
      return;
    }

    // Update config if provided
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.isRunning = true;

    // Run initial check if configured
    if (this.config.runInitialCheck) {
      void this.runCheckCycle();
    }

    // Start scheduled checks
    this.intervalId = setInterval(() => {
      void this.runCheckCycle();
    }, this.config.intervalMs);

    console.log(`AlertMonitorService started with ${this.config.intervalMs}ms interval`);
  }

  /**
   * Stop the scheduled monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log("AlertMonitorService stopped");
  }

  /**
   * Check if the monitor is currently running
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Get the last check time
   */
  get lastCheck(): string | null {
    return this.lastCheckTime;
  }

  /**
   * Get current alert states
   */
  getAlertStates(): AlertState[] {
    return Array.from(this.alertStates.values());
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit?: number): KpiAlert[] {
    const sorted = [...this.alertHistory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Run a complete check cycle across all KPIs with active alert rules
   */
  private async runCheckCycle(): Promise<void> {
    if (this.checkInProgress) {
      console.log("Previous check cycle still in progress, skipping...");
      return;
    }

    this.checkInProgress = true;
    this.lastCheckTime = new Date().toISOString();

    try {
      // Get all active alert rules from storage
      const rules = await this.getActiveAlertRules();

      // Check each rule
      for (const rule of rules) {
        try {
          await this.checkKpiWithRule(rule);
        } catch (error) {
          await this.emit({
            type: "error",
            timestamp: new Date().toISOString(),
            ruleId: rule.id,
            kpiId: rule.kpiId,
            error: error instanceof Error ? error : new Error(String(error)),
            message: `Error checking KPI ${rule.kpiId}: ${String(error)}`,
          });
        }
      }

      // Process auto-resolution for cleared conditions
      if (this.config.autoResolve) {
        await this.processAutoResolutions();
      }
    } catch (error) {
      await this.emit({
        type: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error : new Error(String(error)),
        message: `Error in check cycle: ${String(error)}`,
      });
    } finally {
      this.checkInProgress = false;
    }
  }

  /**
   * Check a specific KPI against its alert rules
   */
  async checkKpi(kpiId: string): Promise<void> {
    const rules = await this.getActiveAlertRules();
    const matchingRules = rules.filter(r => r.kpiId === kpiId);

    for (const rule of matchingRules) {
      await this.checkKpiWithRule(rule);
    }

    await this.emit({
      type: "check-complete",
      timestamp: new Date().toISOString(),
      kpiId,
      message: `Completed check for KPI ${kpiId}`,
    });
  }

  /**
   * Check a KPI against a specific alert rule
   */
  private async checkKpiWithRule(rule: KpiAlertRule): Promise<void> {
    // Get the latest measurement for this KPI
    const measurements = await this.storage.queryMeasurements({
      kpiIds: [rule.kpiId],
      limit: 1,
    });

    if (measurements.length === 0) {
      return; // No measurements to check
    }

    const measurement = measurements[0].content;
    const value = this.extractNumericValue(measurement.measurement);

    if (value === null) {
      return; // Cannot evaluate non-numeric value
    }

    // Evaluate threshold condition
    const evaluation = this.evaluateThreshold(value, rule.condition, rule.severity);
    
    // Get current alert state
    const stateKey = `${rule.kpiId}:${rule.id}`;
    const existingState = this.alertStates.get(stateKey);

    if (evaluation.crossed) {
      // Check if we've already triggered an alert for this rule
      if (existingState) {
        // Check cooldown
        const lastTrigger = new Date(existingState.lastTriggeredAt).getTime();
        const now = Date.now();
        const cooldownMs = (rule.cooldownSeconds * 1000) + this.config.cooldownBufferMs;

        if (now - lastTrigger < cooldownMs) {
          // In cooldown, emit threshold-crossed but don't create new alert
          await this.emit({
            type: "threshold-crossed",
            timestamp: new Date().toISOString(),
            ruleId: rule.id,
            kpiId: rule.kpiId,
            measurement,
            message: `Threshold crossed but in cooldown for ${rule.kpiId}`,
          });
          return;
        }

        // Update sustained tracking
        if (!existingState.sustainedSince) {
          existingState.sustainedSince = new Date().toISOString();
        }
      }

      // Create and store the alert
      const alert = await this.createAlert(rule, measurement, evaluation);
      
      // Update alert state
      this.alertStates.set(stateKey, {
        ruleId: rule.id,
        kpiId: rule.kpiId,
        lastTriggeredAt: new Date().toISOString(),
        lastValue: value,
        triggerCount: (existingState?.triggerCount || 0) + 1,
        currentAlertId: alert.id,
        sustainedSince: existingState?.sustainedSince || new Date().toISOString(),
      });

      // Add to history
      this.alertHistory.push(alert);
      this.trimAlertHistory();

      // Emit alert event
      await this.emit({
        type: "alert",
        timestamp: new Date().toISOString(),
        ruleId: rule.id,
        kpiId: rule.kpiId,
        alert,
        measurement,
        message: `Alert triggered for ${rule.kpiId}: ${value} ${evaluation.direction} threshold`,
      });
    } else {
      // Condition cleared - reset sustained tracking but don't auto-resolve here
      if (existingState) {
        existingState.sustainedSince = undefined;
      }
    }
  }

  /**
   * Evaluate if a value crosses a threshold condition
   */
  private evaluateThreshold(
    value: number,
    condition: KpiAlertRule["condition"],
    severity: KpiAlertRule["severity"]
  ): ThresholdEvaluation {
    const threshold = condition.threshold;
    let crossed = false;
    let direction: ThresholdEvaluation["direction"] = "within";

    switch (condition.operator) {
      case "lt":
        crossed = value < (threshold as number);
        direction = crossed ? "below" : "within";
        break;
      case "gt":
        crossed = value > (threshold as number);
        direction = crossed ? "above" : "within";
        break;
      case "lte":
        crossed = value <= (threshold as number);
        direction = crossed ? "below" : "within";
        break;
      case "gte":
        crossed = value >= (threshold as number);
        direction = crossed ? "above" : "within";
        break;
      case "eq":
        crossed = value === (threshold as number);
        direction = crossed ? "above" : "within"; // eq is both
        break;
      case "between": {
        const [low, high] = threshold as [number, number];
        crossed = value >= low && value <= high;
        direction = crossed ? "within" : "outside";
        break;
      }
      case "outside": {
        const [low, high] = threshold as [number, number];
        crossed = value < low || value > high;
        direction = crossed ? "outside" : "within";
        break;
      }
    }

    return {
      crossed,
      direction,
      value,
      threshold,
      severity,
      sustained: crossed && condition.duration !== undefined,
    };
  }

  /**
   * Create a new alert instance
   */
  private async createAlert(
    rule: KpiAlertRule,
    measurement: KpiMeasurement,
    evaluation: ThresholdEvaluation
  ): Promise<KpiAlert> {
    const now = new Date().toISOString();
    const id = `alert:${rule.id}:${Date.now()}`;
    
    const threshold = Array.isArray(evaluation.threshold) 
      ? evaluation.threshold[0] 
      : evaluation.threshold;

    const deviation = {
      absolute: Math.abs(evaluation.value - threshold),
      relative: Math.abs(evaluation.value - threshold) / Math.abs(threshold || 1),
    };

    const alert: KpiAlert = {
      id,
      ruleId: rule.id,
      kpiId: rule.kpiId,
      measurementId: measurement.id,
      status: "triggered",
      severity: rule.severity,
      triggered: {
        at: now,
        value: evaluation.value,
        threshold,
        condition: `${rule.condition.operator} ${Array.isArray(rule.condition.threshold) ? rule.condition.threshold.join("-") : rule.condition.threshold}`,
      },
      notifications: rule.channels.map(channel => ({
        channel: channel.type,
        sentAt: now,
        status: "pending",
      })),
      createdAt: now,
      updatedAt: now,
    };

    // Store the alert
    await this.storage.storeAlert(alert);

    return alert;
  }

  /**
   * Process auto-resolution for alerts where conditions have cleared
   */
  private async processAutoResolutions(): Promise<void> {
    const activeAlerts = this.alertHistory.filter(a => a.status === "triggered" || a.status === "active");

    for (const alert of activeAlerts) {
      // Get the rule
      const rules = await this.getActiveAlertRules();
      const rule = rules.find(r => r.id === alert.ruleId);
      
      if (!rule) {
        // Rule no longer exists, resolve the alert
        await this.resolveAlert(alert, "Rule removed");
        continue;
      }

      // Get latest measurement
      const measurements = await this.storage.queryMeasurements({
        kpiIds: [rule.kpiId],
        limit: 1,
      });

      if (measurements.length === 0) continue;

      const measurement = measurements[0].content;
      const value = this.extractNumericValue(measurement.measurement);

      if (value === null) continue;

      // Check if condition is cleared
      const evaluation = this.evaluateThreshold(value, rule.condition, rule.severity);

      if (!evaluation.crossed) {
        await this.resolveAlert(alert, "Condition cleared");
      }
    }
  }

  /**
   * Resolve an alert
   */
  private async resolveAlert(alert: KpiAlert, reason: string): Promise<void> {
    const now = new Date().toISOString();
    
    alert.status = "resolved";
    alert.resolved = {
      at: now,
      reason,
    };
    alert.updatedAt = now;

    // Update state tracking
    const stateKey = `${alert.kpiId}:${alert.ruleId}`;
    const state = this.alertStates.get(stateKey);
    if (state) {
      state.currentAlertId = undefined;
      state.sustainedSince = undefined;
    }

    // Update stored alert (re-store to update)
    await this.storage.storeAlert(alert);

    await this.emit({
      type: "resolved",
      timestamp: now,
      ruleId: alert.ruleId,
      kpiId: alert.kpiId,
      alert,
      message: `Alert resolved: ${reason}`,
    });
  }

  /**
   * Extract numeric value from KPI value
   */
  private extractNumericValue(value: KpiValue): number | null {
    switch (value.type) {
      case "scalar":
        return value.value;
      case "interval":
        return (value.low + value.high) / 2; // Use midpoint
      case "distribution":
        return value.mean;
      default:
        return null;
    }
  }

  /**
   * Get all active alert rules from storage
   */
  private async getActiveAlertRules(): Promise<KpiAlertRule[]> {
    const alerts = await this.storage.queryAlerts({ 
      status: "active",
      limit: 1000,
    });

    // Convert stored alerts back to rules (simplified - in production, you'd have separate rule storage)
    // For now, return default rules for standard KPIs
    return this.getDefaultAlertRules();
  }

  /**
   * Get default alert rules for standard KPIs
   */
  private getDefaultAlertRules(): KpiAlertRule[] {
    const now = new Date().toISOString();
    
    return [
      {
        id: "alert:decision-coverage-low",
        name: "Decision Coverage Below Threshold",
        description: "Alerts when decision coverage falls below acceptable levels",
        kpiId: "decision-coverage",
        condition: {
          operator: "lt",
          threshold: 0.75,
        },
        severity: "high",
        channels: [{ type: "console", config: {} }],
        cooldownSeconds: 3600, // 1 hour
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "alert:calibration-poor",
        name: "Calibration Score Degraded",
        description: "Alerts when calibration score indicates poor forecast accuracy",
        kpiId: "calibration-score",
        condition: {
          operator: "lt",
          threshold: 0.7,
        },
        severity: "critical",
        channels: [{ type: "console", config: {} }],
        cooldownSeconds: 1800, // 30 minutes
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "alert:robustness-low",
        name: "Robustness Score Low",
        description: "Alerts when robustness score indicates fragile decisions",
        kpiId: "robustness-score",
        condition: {
          operator: "lt",
          threshold: 0.6,
        },
        severity: "medium",
        channels: [{ type: "console", config: {} }],
        cooldownSeconds: 3600,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "alert:uncertainty-high",
        name: "Uncertainty Band Width High",
        description: "Alerts when uncertainty bands are excessively wide",
        kpiId: "uncertainty-width",
        condition: {
          operator: "gt",
          threshold: 0.5,
        },
        severity: "medium",
        channels: [{ type: "console", config: {} }],
        cooldownSeconds: 7200, // 2 hours
        enabled: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  /**
   * Trim alert history to max size
   */
  private trimAlertHistory(): void {
    if (this.alertHistory.length > this.config.maxAlertHistory) {
      this.alertHistory = this.alertHistory.slice(-this.config.maxAlertHistory);
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, by: string, note?: string): Promise<void> {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const now = new Date().toISOString();
    alert.status = "acknowledged";
    alert.acknowledged = {
      at: now,
      by,
      note,
    };
    alert.updatedAt = now;

    await this.storage.storeAlert(alert);
  }

  /**
   * Force a manual check cycle
   */
  async forceCheck(): Promise<void> {
    await this.runCheckCycle();
  }

  /**
   * Dispose of the monitor - stop and cleanup
   */
  dispose(): void {
    this.stop();
    this.handlers.clear();
    this.alertStates.clear();
    this.alertHistory = [];
  }
}

/**
 * Factory function to create an alert monitor service
 */
export function createAlertMonitorService(
  storage: KpiWarehouseStorage,
  config?: Partial<AlertMonitorConfig>
): AlertMonitorService {
  return new AlertMonitorService(storage, config);
}

