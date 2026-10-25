import type { WarehouseEnvelope } from '@zeo/contracts';

export const WAREHOUSE_SCHEMA_VERSION = 'warehouse-envelope.v1' as const;

export function normalizeWarehouseRecord<T>(record: WarehouseEnvelope<T>): WarehouseEnvelope<T> & { schemaVersion: typeof WAREHOUSE_SCHEMA_VERSION } {
  if (record.schemaVersion && record.schemaVersion !== WAREHOUSE_SCHEMA_VERSION) {
    throw new Error(`Unsupported warehouse schema version "${record.schemaVersion}". Upgrade Zeo before reading this record.`);
  }
  return { ...record, schemaVersion: WAREHOUSE_SCHEMA_VERSION };
}
