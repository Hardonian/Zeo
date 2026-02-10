
import {
    Connector,
    ConnectorError,
    DecisionResult,
    ConnectorCapability
} from "@zeo/contracts";
import { renderDecisionSummary } from "../../reporting";

export class MarkdownExportConnector implements Connector {
    id = "builtin.markdown-export";
    displayName = "Markdown Export";
    capabilities: ConnectorCapability[] = ["exportSummary"];

    async healthCheck() {
        return { status: "ok" as const, latencyMs: 0 };
    }

    async export(artifact: { kind: "summary" | "repro_pack"; data: DecisionResult | Blob; filename?: string }) {
        if (artifact.kind !== "summary") {
            throw new Error("MarkdownExportConnector only supports 'summary' kind.");
        }

        // Ensure data is DecisionResult
        // In a real app we might need type guards
        const result = artifact.data as DecisionResult;

        // Use decision summary renderer
        const markdown = renderDecisionSummary(result);

        return {
            location: "memory",
            id: `summary-${Date.now()}.md`,
            content: markdown
        };
    }

    normalizeError(error: unknown): ConnectorError {
        const err = new Error(String(error)) as ConnectorError;
        err.code = "CONNECTOR_INTERNAL_SAFE";
        return err;
    }

    // Ingest not supported
}
