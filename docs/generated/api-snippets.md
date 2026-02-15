# API snippets

| Method | Route | Summary | Source |
|---|---|---|---|
| GET | /health | Health check | vendor/readylayer/sdk/openapi.json |
| GET | /ready | Readiness check | vendor/readylayer/sdk/openapi.json |
| GET | /repos | List repositories | vendor/readylayer/sdk/openapi.json |
| POST | /repos | Create repository | vendor/readylayer/sdk/openapi.json |
| GET | /repos/{repoId} | Get repository | vendor/readylayer/sdk/openapi.json |
| PUT | /repos/{repoId} | Update repository | vendor/readylayer/sdk/openapi.json |
| DELETE | /repos/{repoId} | Delete repository | vendor/readylayer/sdk/openapi.json |
| POST | /repos/{repoId}/test-connection | Test repository connection | vendor/readylayer/sdk/openapi.json |
| GET | /policies | List policy packs | vendor/readylayer/sdk/openapi.json |
| POST | /policies | Create policy pack | vendor/readylayer/sdk/openapi.json |
| GET | /policies/{packId} | Get policy pack | vendor/readylayer/sdk/openapi.json |
| PUT | /policies/{packId} | Update policy pack | vendor/readylayer/sdk/openapi.json |
| DELETE | /policies/{packId} | Delete policy pack | vendor/readylayer/sdk/openapi.json |
| GET | /policies/{packId}/rules | List policy rules | vendor/readylayer/sdk/openapi.json |
| POST | /policies/{packId}/rules | Add policy rule | vendor/readylayer/sdk/openapi.json |
| PUT | /policies/{packId}/rules/{ruleId} | Update policy rule | vendor/readylayer/sdk/openapi.json |
| DELETE | /policies/{packId}/rules/{ruleId} | Delete policy rule | vendor/readylayer/sdk/openapi.json |
| POST | /policies/validate | Validate policy syntax | vendor/readylayer/sdk/openapi.json |
| GET | /policies/templates | List policy templates | vendor/readylayer/sdk/openapi.json |
| GET | /reviews | List reviews | vendor/readylayer/sdk/openapi.json |
| POST | /reviews | Create review | vendor/readylayer/sdk/openapi.json |
| GET | /reviews/{reviewId} | Get review | vendor/readylayer/sdk/openapi.json |
| GET | /waivers | List waivers | vendor/readylayer/sdk/openapi.json |
| POST | /waivers | Create waiver | vendor/readylayer/sdk/openapi.json |
| GET | /waivers/{waiverId} | Get waiver | vendor/readylayer/sdk/openapi.json |
| DELETE | /waivers/{waiverId} | Revoke waiver | vendor/readylayer/sdk/openapi.json |
| GET | /evidence | List evidence bundles | vendor/readylayer/sdk/openapi.json |
| GET | /evidence/{bundleId} | Get evidence bundle | vendor/readylayer/sdk/openapi.json |
| GET | /evidence/{bundleId}/export | Export evidence | vendor/readylayer/sdk/openapi.json |
| GET | /runs | List test runs | vendor/readylayer/sdk/openapi.json |
| POST | /runs | Create test run | vendor/readylayer/sdk/openapi.json |
| GET | /runs/{runId} | Get test run | vendor/readylayer/sdk/openapi.json |
| POST | /runs/sandbox | Create sandbox run | vendor/readylayer/sdk/openapi.json |
| GET | /billing/tier | Get billing tier | vendor/readylayer/sdk/openapi.json |
| POST | /billing/checkout | Create checkout session | vendor/readylayer/sdk/openapi.json |
| GET | /metrics | Get metrics | vendor/readylayer/sdk/openapi.json |
| GET | /api-keys | List API keys | vendor/readylayer/sdk/openapi.json |
| POST | /api-keys | Create API key | vendor/readylayer/sdk/openapi.json |
| DELETE | /api-keys/{keyId} | Revoke API key | vendor/readylayer/sdk/openapi.json |
