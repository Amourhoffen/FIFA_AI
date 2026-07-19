# Self-execution policy bypass recommendation: powershell -ExecutionPolicy Bypass -File .\deploy.ps1

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Evexa Buddy - Cloud Run Deployment        " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Enable required Google APIs
Write-Host "Enabling required Google Cloud APIs..." -ForegroundColor Green
gcloud services enable `
  run.googleapis.com `
  cloudbuild.googleapis.com `
  artifactregistry.googleapis.com

# 2. Deploy to Cloud Run directly from source
Write-Host "Deploying 'evexa-buddy' to Cloud Run..." -ForegroundColor Green
gcloud run deploy evexa-buddy `
  --source . `
  --region us-central1 `
  --allow-unauthenticated

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Deployment triggered successfully!        " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
