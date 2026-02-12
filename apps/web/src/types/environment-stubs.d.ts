declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
  }
}

declare module 'next/server' {
  export class NextRequest extends Request {
    headers: Headers;
    nextUrl: URL;
    url: string;
    text(): Promise<string>;
    json(): Promise<any>;
    formData(): Promise<FormData>;
  }

  export class NextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
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
