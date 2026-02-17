import { describe, expect, it } from 'vitest';
import { isEnterpriseHostedEnabled } from './enterprise-hosted';

describe('isEnterpriseHostedEnabled', () => {
  it.each([
    ['0', false],
    ['1', true],
    ['false', false],
    ['true', true],
  ])('parses %s as %s', (input, expected) => {
    expect(isEnterpriseHostedEnabled(input)).toBe(expected);
  });
});
