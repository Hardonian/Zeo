import { assertEnterpriseServerEnv, isEnterpriseHostedEnabled as isEnterpriseHostedEnabledFromEnv } from '@zeo/env';

export const enterpriseHostedEnabled = isEnterpriseHostedEnabledFromEnv(process.env);

export function assertEnterpriseHostedServerReady(): void {
  if (!enterpriseHostedEnabled) {
    throw new Error('Enterprise-hosted mode is disabled. Set ENTERPRISE_HOSTED_ENABLED=1 to enable hosted integrations.');
  }
  assertEnterpriseServerEnv(process.env);
}
