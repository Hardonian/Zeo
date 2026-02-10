$ErrorActionPreference = "Stop"

$env:ZEO_HOME = "c:\Users\scott\Documents\GitHub\Zeo\apps\cli"

function Run-Zeo {
    param([string]$Cmd)
    Write-Host "Running: zeo $Cmd"
    $CliScript = Join-Path $env:ZEO_HOME "dist\apps\cli\src\index.js"
    # PowerShell splitting on spaces handles arguments poorly if quoted.
    # But here we pass simple strings.
    # Using specific array creation to be safe.
    $ArgsArray = $Cmd -split " "
    node $CliScript $ArgsArray
    if ($LASTEXITCODE -ne 0) { throw "Command failed with exit code $LASTEXITCODE" }
}

$TestDir = Join-Path $env:ZEO_HOME "test_workspace"
if (Test-Path $TestDir) { Remove-Item -Recurse -Force $TestDir }
New-Item -ItemType Directory -Path $TestDir | Out-Null
Set-Location $TestDir

try {
    # 1. Start Decision
    Run-Zeo "start --title 'Test Decision' --json"

    # 2. Add Note (decision ID is deterministic from title "Test Decision")
    # Hash of {"title":"Test Decision"} -> "dec_..."
    # If the hash is consistent, it should be predictable?
    # Actually, let's grep the output or use a known title.
    # Or rely on the fact that start creates a directory.
    # Let's list the directory to find the ID.
    $DecDir = Get-ChildItem ".zeo/decisions" | Select-Object -First 1
    $DecId = $DecDir.Name
    Write-Host "Decision ID: $DecId"

    Run-Zeo "add-note --decision $DecId --text 'Market is volatile today' --asserted-at 2025-01-01 --json"

    # 3. Run Decision
    Run-Zeo "run --decision $DecId --as-of 2025-01-02 --json"

    # 4. View Executive Lens
    Run-Zeo "view executive --decision $DecId --json"

    # 5. Graph Show
    # Need transcript hash from run. It's inside decision.json.
    # Or just use the decision ID which workflow-cli resolves to latest run.
    Run-Zeo "graph show --decision $DecId --json"

    # 6. Agents Recommend
    Run-Zeo "agents recommend --task summarization --json"

    # 7. Review Weekly
    Run-Zeo "review weekly --json"

    # 8. Fragility
    Run-Zeo "graph fragility --json"

    Write-Host "Smoke test passed!"
} catch {
    Write-Error "Test failed: $_"
    exit 1
} finally {
    Set-Location $env:ZEO_HOME
}
