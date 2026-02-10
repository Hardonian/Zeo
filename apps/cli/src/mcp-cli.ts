import { createInterface } from "node:readline";
import { executeZeoliteOperation, type ZeoliteOperation } from "./zeolite-core.js";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

export interface McpCliArgs {
  command: "serve" | "ping" | "tools" | null;
  http: boolean;
}

export function parseMcpArgs(argv: string[]): McpCliArgs {
  const raw = argv[0];
  const command = raw === "serve" || raw === "ping" || raw === "tools" ? raw : null;
  return { command, http: argv.includes("--http") };
}

const TOOL_DEFS = [
  {
    name: "load_context",
    description: "Initialize deterministic Zeolite context.",
    inputSchema: { type: "object", properties: { example: { type: "string" }, depth: { type: "number" }, seed: { type: "string" } } },
  },
  {
    name: "submit_evidence",
    description: "Submit evidence to an active Zeolite context.",
    inputSchema: { type: "object", properties: { contextId: { type: "string" }, sourceId: { type: "string" }, claim: { type: "string" }, capturedAt: { type: "string" } } },
  },
  {
    name: "compute_flip_distance",
    description: "Compute deterministic flip-distance approximations.",
    inputSchema: { type: "object", properties: { contextId: { type: "string" } }, required: ["contextId"] },
  },
  {
    name: "rank_evidence_by_voi",
    description: "Rank evidence actions by VOI.",
    inputSchema: { type: "object", properties: { contextId: { type: "string" }, minEvoi: { type: "number" } }, required: ["contextId"] },
  },
  {
    name: "generate_regret_bounded_plan",
    description: "Generate bounded-horizon regret-aware evidence plan.",
    inputSchema: { type: "object", properties: { contextId: { type: "string" }, horizon: { type: "number" }, minEvoi: { type: "number" } }, required: ["contextId"] },
  },
];

function help(): void {
  console.log("\nZeo MCP Commands\n\nUsage:\n  zeo mcp serve\n  zeo mcp ping\n  zeo mcp tools\n");
}

function response(id: JsonRpcId, result: unknown): string {
  return JSON.stringify({ jsonrpc: "2.0", id, result });
}

function error(id: JsonRpcId, code: number, message: string): string {
  return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const knownOperations = new Set<ZeoliteOperation>([
    "load_context",
    "submit_evidence",
    "compute_flip_distance",
    "rank_evidence_by_voi",
    "generate_regret_bounded_plan",
  ]);

  if (knownOperations.has(name as ZeoliteOperation)) {
    try {
      const structuredContent = executeZeoliteOperation(name as ZeoliteOperation, args);
      return {
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
        structuredContent,
        isError: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: JSON.stringify({ error: message }) }],
        structuredContent: { error: message },
        isError: true,
      };
    }
  }

  return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
}

async function dispatch(raw: string): Promise<string | null> {
  let req: JsonRpcRequest;
  try {
    req = JSON.parse(raw);
  } catch {
    return error(0, -32700, "Parse error");
  }

  const id = req.id ?? null;
  const method = req.method ?? "";

  if (id === null) return null;

  if (method === "initialize") {
    return response(id, {
      protocolVersion: "2024-11-05",
      serverInfo: { name: "zeo-mcp-cli", version: "1.0.0" },
      capabilities: { tools: {} },
    });
  }

  if (method === "tools/list") {
    return response(id, { tools: TOOL_DEFS });
  }

  if (method === "tools/call") {
    const params = (req.params ?? {}) as Record<string, unknown>;
    const name = typeof params.name === "string" ? params.name : "";
    const args = typeof params.arguments === "object" && params.arguments !== null ? params.arguments as Record<string, unknown> : {};
    if (!name) return error(id, -32602, "Missing tool name in params");
    return response(id, await handleToolCall(name, args));
  }

  return error(id, -32601, `Method not found: ${method}`);
}

async function runServeCommand(args: McpCliArgs): Promise<number> {
  if (args.http) {
    process.stderr.write("[zeo mcp] HTTP transport is unsupported in CLI mode.\n");
    return 2;
  }

  process.stderr.write("[zeo mcp] stdio transport ready\n");
  const rl = createInterface({ input: process.stdin });
  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    void dispatch(trimmed).then((out) => { if (out) process.stdout.write(`${out}\n`); });
  });

  await new Promise<void>((resolve) => {
    const shutdown = () => {
      rl.close();
      resolve();
    };
    process.on("SIGINT", shutdown);
    rl.on("close", shutdown);
  });

  return 0;
}

async function runPingCommand(): Promise<number> {
  console.log(`ok: initialize + tools/list (${TOOL_DEFS.length} tools)`);
  return 0;
}

async function runToolsCommand(): Promise<number> {
  for (const tool of TOOL_DEFS) console.log(tool.name);
  return 0;
}

export async function runMcpCommand(args: McpCliArgs): Promise<number> {
  if (!args.command) {
    help();
    return 1;
  }
  if (args.command === "serve") return runServeCommand(args);
  if (args.command === "ping") return runPingCommand();
  return runToolsCommand();
}
