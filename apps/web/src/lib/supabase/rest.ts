import { cookies } from 'next/headers';
import { getPublicEnv, getServerEnv } from '@/lib/env';

type Primitive = string | number | boolean;
type FilterOperator = 'eq' | 'gte';

class QueryBuilder {
  filters: Array<[string, FilterOperator, Primitive]> = [];
  orderBy: string | null = null;
  limitCount: number | null = null;

  constructor(
    readonly baseUrl: string,
    readonly apiKey: string,
    readonly authToken: string,
    readonly table: string,
    readonly schema: string,
  ) {}

  eq(column: string, value: Primitive) { this.filters.push([column, 'eq', value]); return this; }
  gte(column: string, value: Primitive) { this.filters.push([column, 'gte', value]); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orderBy = `${column}.${options?.ascending === false ? 'desc' : 'asc'}`; return this; }
  limit(count: number) { this.limitCount = count; return this; }

  buildUrl(select?: string) {
    const url = new URL(`${this.baseUrl}/rest/v1/${this.table}`);
    if (select) url.searchParams.set('select', select);
    this.filters.forEach(([k, op, v]) => url.searchParams.set(k, `${op}.${v}`));
    if (this.orderBy) url.searchParams.set('order', this.orderBy);
    if (this.limitCount != null) url.searchParams.set('limit', String(this.limitCount));
    return url;
  }

  headers(extra?: Record<string, string>) {
    return { apikey: this.apiKey, Authorization: `Bearer ${this.authToken}`, 'Content-Type': 'application/json', 'Accept-Profile': this.schema, ...extra };
  }

  async select(columns: string) {
    const res = await fetch(this.buildUrl(columns), { headers: this.headers() });
    const data = await res.json();
    return { data: Array.isArray(data) ? data : null, error: res.ok ? null : { message: JSON.stringify(data) } };
  }

  async maybeSingle(columns: string) {
    const res = await fetch(this.buildUrl(columns), { headers: this.headers({ Prefer: 'return=representation' }) });
    const data = await res.json();
    if (!res.ok) return { data: null, error: { message: JSON.stringify(data) } };
    return { data: Array.isArray(data) ? (data[0] ?? null) : data, error: null };
  }

  async single(columns: string) {
    const result = await this.maybeSingle(columns);
    return result;
  }

  async insert(payload: Record<string, unknown> | Array<Record<string, unknown>>, columns?: string) {
    const url = this.buildUrl(columns);
    if (columns) url.searchParams.set('select', columns);
    const res = await fetch(url, { method: 'POST', headers: this.headers({ Prefer: 'return=representation' }), body: JSON.stringify(payload) });
    const data = await res.json();
    return { data: Array.isArray(data) ? data[0] ?? null : data, error: res.ok ? null : { message: JSON.stringify(data) } };
  }

  async update(payload: Record<string, unknown>) {
    const res = await fetch(this.buildUrl(), { method: 'PATCH', headers: this.headers(), body: JSON.stringify(payload) });
    const data = await res.text();
    return { data, error: res.ok ? null : { message: data } };
  }
}

class SupabaseRestClient {

  storage = {
    from: (bucket: string) => ({
      createSignedUrl: async (path: string, expiresIn: number) => {
        const res = await fetch(`${this.baseUrl}/storage/v1/object/sign/${bucket}/${path}`, {
          method: 'POST',
          headers: { apikey: this.apiKey, Authorization: `Bearer ${this.authToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ expiresIn }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: JSON.stringify(data) } };
        const signedUrl = data.signedURL ? `${this.baseUrl}/storage/v1${data.signedURL}` : data.signedUrl;
        return { data: { signedUrl }, error: null };
      },
    }),
  };

  constructor(readonly baseUrl: string, readonly apiKey: string, readonly authToken: string, readonly schemaName = 'public') {}
  schema(name: string) { return new SupabaseRestClient(this.baseUrl, this.apiKey, this.authToken, name); }
  from(table: string) { return new QueryBuilder(this.baseUrl, this.apiKey, this.authToken, table, this.schemaName); }
  auth = {
    getUser: async () => {
      const res = await fetch(`${this.baseUrl}/auth/v1/user`, { headers: { apikey: this.apiKey, Authorization: `Bearer ${this.authToken}` } });
      if (!res.ok) return { data: { user: null } };
      const user = await res.json();
      return { data: { user } };
    },
  };
}

export async function createSupabaseServerClient() {
  const env = getPublicEnv();
  const store = await cookies();
  const token = store.get('zeo_access_token')?.value ?? env.supabaseAnonKey;
  return new SupabaseRestClient(env.supabaseUrl, env.supabaseAnonKey, token);
}

export function createSupabaseServiceClient() {
  const env = getServerEnv();
  return new SupabaseRestClient(env.supabaseUrl, env.supabaseServiceRoleKey, env.supabaseServiceRoleKey);
}
