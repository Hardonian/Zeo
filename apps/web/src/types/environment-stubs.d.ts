declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    metadataBase?: URL;
    openGraph?: {
      type?: string;
      siteName?: string;
      title?: string;
      description?: string;
      images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      images?: string[];
    };
    robots?: {
      index?: boolean;
      follow?: boolean;
    };
  }
}

declare module 'next/server' {
  export class NextRequest extends Request {
    headers: Headers;
    nextUrl: URL;
    url: string;
    cookies: { get: (name: string) => { value: string } | undefined };
    text(): Promise<string>;
    json(): Promise<any>;
    formData(): Promise<FormData>;
  }

  export class NextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    headers: Headers;
    cookies: { set: (name: string, value: string, options?: Record<string, unknown>) => void };
    static json(body: unknown, init?: { status?: number; headers?: Record<string, string> }): NextResponse;
    static next(init?: { request?: { headers?: Headers } }): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
  }
}

declare module 'next/server.js' {
  export * from 'next/server';
}

declare module 'next/types.js' {
  export type Route = string;
  export type ResolvingMetadata = unknown;
  export type ResolvingViewport = unknown;
}

declare module 'next/link' {
  import type { ComponentType, ReactNode } from 'react';
  const Link: ComponentType<{ href: string; children?: ReactNode; className?: string }>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): { push: (href: string) => void; replace: (href: string) => void };
  export function useSearchParams<T extends string = string>(): URLSearchParams;
  export function useParams<T extends Record<string, string | string[]> = Record<string, string | string[]>>(): T;
}

declare module 'next/dynamic' {
  export default function dynamic<T>(loader: () => Promise<T>, options?: unknown): T;
}

declare module '@zeo/analysis' {
  export class StaticAnalysisService {
    analyze(fileName: string, diffContent: string): Promise<Array<Record<string, any>>>;
  }
}

declare module '@zeo/policy' {
  export type PolicyPack = Record<string, any>;
  export type Waiver = Record<string, any>;
  export type EvidenceBundle = Record<string, any>;
  export type EvidenceInputs = Record<string, any>;
  export type EvidenceOutputs = Record<string, any>;

  export const policyEngineService: {
    loadEffectivePolicy(orgId: string, repoId: string, sha: string, branch: string): Promise<any>;
    evaluate(findings: any[], policy: any): Promise<{ blocked: boolean; score: number; blockingReason?: string }>;
    produceEvidence(inputs: any, outputs: any, policy: any, timings?: Record<string, number>): Promise<any>;
  };
}

declare module 'jsonwebtoken' {
  export function sign(payload: object | string, secret: string, options?: Record<string, any>): string;
}

declare module 'better-sqlite3' {
  class Database {
    constructor(path: string, options?: Record<string, any>);
    prepare(sql: string): any;
    exec(sql: string): void;
    close(): void;
  }

  namespace Database {
    interface Database {
      prepare(sql: string): any;
      exec(sql: string): void;
      close(): void;
    }
  }

  export default Database;
}




declare module '@zeo/core/client' {
  import type { DecisionResult, DecisionSpec, PolicyViolation, RunMeta, Scenario } from '@zeo/contracts';

  export function makeNegotiationExample(): DecisionSpec;
  export function makeOpsExample(): DecisionSpec;
  export function runDecision(spec: DecisionSpec, options?: { depth?: 2 | 3 }): DecisionResult;
  export function hashDecisionSpec(input: DecisionSpec): string;
  export function buildEvidencePacket(...args: unknown[]): unknown;
  export function buildEvidencePacketMarkdown(...args: unknown[]): string;
  export function computeDeterministicSeed(hash: string, salt?: string, depth?: 2 | 3): string;
  export const scenarios: {
    listScenarios(): Scenario[];
    saveScenario(spec: DecisionSpec, name: string, description?: string): Scenario;
    createTemplate(name: string, type: "investment" | "hiring" | "crisis"): DecisionSpec;
  };
  export function exportScenarioPack(scenarios: any[], options: any): Promise<Uint8Array>;
  export function importScenarioPack(buffer: Uint8Array): Promise<any>;
  export const policyEngine: { validate(context: unknown): PolicyViolation[] };
  export function generateDecisionReport(result: DecisionResult): { markdown: string; sections: Array<{ id: string; title: string; content: string; citations: Array<{ label: string; description: string }> }> };

  export type { RunMeta };
}
