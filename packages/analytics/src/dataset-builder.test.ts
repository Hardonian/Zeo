import { describe, it, expect } from 'vitest';
import { datasetToCsv } from './dataset-builder.js';

describe('dataset-builder', () => {
  describe('datasetToCsv', () => {
    it('should convert empty dataset to empty string', () => {
      const result = datasetToCsv({ rows: [], schema: { columns: [], provenance: { datasetHash: 'test', rowCount: 0, generatedAt: '2024-01-01', sources: [] } } });
      expect(result).toBe('');
    });

    it('should convert dataset with rows to CSV', () => {
      const dataset = {
        rows: [
          { rowId: '1', timestamp: '2024-01-01', value: 100 },
          { rowId: '2', timestamp: '2024-01-02', value: 200 },
        ],
        schema: {
          columns: [
            { name: 'rowId', type: 'identifier' as const },
            { name: 'timestamp', type: 'timestamp' as const },
            { name: 'value', type: 'numeric' as const },
          ],
          provenance: {
            datasetHash: 'abc123',
            rowCount: 2,
            generatedAt: '2024-01-01',
            sources: ['test'],
          },
        },
      };

      const result = datasetToCsv(dataset);
      expect(result).toContain('rowId');
      expect(result).toContain('timestamp');
      expect(result).toContain('value');
      expect(result).toContain('2024-01-01');
      expect(result).toContain('100');
    });
  });
});
