# ============================================================================
# NEXUS ENTERPRISE PLATFORM — Install Remaining Modules
# Runs every script in this folder in order, then migrates the DB.
# Idempotent. Safe to re-run.
# ============================================================================

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $here

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  INSTALLING REMAINING MODULES" -ForegroundColor Cyan
Write-Host "  Root: $root" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$scripts = @(
  '01-schema-patch.ps1',
  '02-funding.ps1',
  '03-exam-builder.ps1',
  '04-biometric.ps1',
  '05-automation.ps1',
  '06-tests.ps1'
)

foreach ($s in $scripts) {
  $path = Join-Path $here $s
  if (-not (Test-Path $path)) {
    Write-Host "  [SKIP] $s (not present)" -ForegroundColor Yellow
    continue
  }
  Write-Host ""
  Write-Host "  >> Running $s" -ForegroundColor Cyan
  & powershell -ExecutionPolicy Bypass -File $path
  if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
    Write-Host "  [FAIL] $s returned $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
  }
}

# ---- Migrate database -----------------------------------------------------
Write-Host ""
Write-Host "  >> Applying Prisma migration" -ForegroundColor Cyan
Push-Location (Join-Path $root "backend")
try {
  npx prisma migrate dev --name remaining-modules --schema=..\database\prisma\schema.prisma
  npx prisma generate --schema=..\database\prisma\schema.prisma
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  ALL REMAINING MODULES INSTALLED" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "   1. In the backend window: Ctrl+C, then npm run dev"
Write-Host "   2. Open http://localhost:5173/"
Write-Host "   3. New modules appear in the sidebar:"
Write-Host "      - People -> Onboarding (already exists, now fully migrated)"
Write-Host "      - Revenue -> Funding"
Write-Host "      - Operations -> Exams -> New Exam"
Write-Host "      - Settings -> Biometric Devices"
Write-Host "      - Command -> Automation"
Write-Host ""