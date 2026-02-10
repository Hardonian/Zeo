
import type {
    Connector,
    ConnectorFixture,
    ConnectorError,
    DecisionSpec
} from "@zeo/contracts";

export class ConnectorManager {
    private connectors = new Map<string, Connector>();
    private fixtures = new Map<string, ConnectorFixture[]>();
    private fixturesMode = false;

    register(connector: Connector) {
        this.connectors.set(connector.id, connector);
    }

    setFixtures(fixtures: ConnectorFixture[]) {
        this.fixtures.clear();
        fixtures.forEach(f => {
            const list = this.fixtures.get(f.connectorId) || [];
            list.push(f);
            this.fixtures.set(f.connectorId, list);
        });
    }

    enableFixturesMode(enabled: boolean) {
        this.fixturesMode = enabled;
    }

    async healthCheck(connectorId: string) {
        const connector = this.connectors.get(connectorId);
        if (!connector) return { status: "error", message: "Connector not registered" };

        if (this.fixturesMode) {
            // Simulate health check fixture or just return ok
            return { status: "ok", latencyMs: 10, message: "Fixture mode" };
        }

        try {
            return await connector.healthCheck();
        } catch (err) {
            return { status: "error", message: String(err) };
        }
    }

    async ingest(connectorId: string, context: Record<string, unknown>): Promise<{
        spec?: Partial<DecisionSpec>;
        assumptions?: unknown[];
        metadata?: Record<string, unknown>;
    }> {
        if (this.fixturesMode) {
            return this.runFixture(connectorId, context) as any;
        }

        const connector = this.connectors.get(connectorId);
        if (!connector) throw new Error(`Connector ${connectorId} not found`);
        if (!connector.ingest) throw new Error(`Connector ${connectorId} does not support ingest`);

        try {
            return await connector.ingest(context);
        } catch (err) {
            throw connector.normalizeError(err);
        }
    }

    async export(connectorId: string, artifact: any): Promise<{ location: string; id?: string }> {
        if (this.fixturesMode) {
            return this.runFixture(connectorId, artifact) as any;
        }
        const connector = this.connectors.get(connectorId);
        if (!connector) throw new Error(`Connector ${connectorId} not found`);
        if (!connector.export) throw new Error(`Connector ${connectorId} does not support export`);
        try {
            return await connector.export(artifact);
        } catch (err) {
            throw connector.normalizeError(err);
        }
    }

    private async runFixture(connectorId: string, input: any): Promise<unknown> {
        const fixtures = this.fixtures.get(connectorId) || [];

        // Simple matching: linear search
        const match = fixtures.find(f => {
            // If scenario requires strict input matching
            if (f.inputMatch) {
                for (const k in f.inputMatch) {
                    if ((input as any)[k] !== f.inputMatch[k]) return false;
                }
            }
            return true;
        });

        if (!match) {
            // Fallback: if no fixture matches, throw error or return empty?
            // In strict mode, error is better to alert missing test coverage
            throw new Error(`[ChoiceFixture] No fixture match found for ${connectorId}`);
        }

        if (match.latencyMs) {
            await new Promise(r => setTimeout(r, match.latencyMs));
        }

        if (match.scenario !== "success") {
            const err = new Error(`Fixture Error: ${match.scenario}`) as any;
            // Map to ConnectorError like structure if needed, or rely on caller to catch simple Error
            err.code = this.mapScenarioToCode(match.scenario);
            throw err;
        }

        return match.output;
    }

    private mapScenarioToCode(scenario: string) {
        switch (scenario) {
            case "auth_fail": return "CONNECTOR_UNAUTHORIZED";
            case "rate_limit": return "CONNECTOR_RATE_LIMITED";
            case "network_error": return "CONNECTOR_UNAVAILABLE";
            default: return "CONNECTOR_INTERNAL_SAFE";
        }
    }
}

export const globalConnectorManager = new ConnectorManager();
