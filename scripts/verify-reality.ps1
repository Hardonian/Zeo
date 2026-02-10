$ErrorActionPreference = "Stop"

function Run-Step ($name, $cmd) {
    Write-Host ">>> Running: $name" -ForegroundColor Cyan
    Invoke-Expression $cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Step failed: $name"
        exit 1
    }
    Write-Host ">>> Passed: $name" -ForegroundColor Green
}

# 1. Build Core (Foundational)
Run-Step "Build @zeo/core" "pnpm --filter @zeo/core run build"

# 2. Build Audit (Depends on Core)
Run-Step "Build @zeo/audit" "pnpm --filter @zeo/audit run build"

# 3. Build CLI (Depends on Core, Audit)
Run-Step "Build apps/cli" "pnpm --filter apps/cli run build"

# 4. Run Core Tests
Run-Step "Test @zeo/core" "pnpm --filter @zeo/core run test"

# 5. Run Audit Tests
Run-Step "Test @zeo/audit" "pnpm --filter @zeo/audit run test"

Write-Host "`nAll verification steps passed successfully!" -ForegroundColor Green
