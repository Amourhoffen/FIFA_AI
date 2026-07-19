#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "   Evexa Buddy - Cloud Run Deployment        "
echo "============================================="

# 1. Enable required Google APIs
echo "Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# 2. Deploy to Cloud Run directly from source
echo "Deploying 'evexa-buddy' to Cloud Run..."
gcloud run deploy evexa-buddy \
  --source . \
  --region us-central1 \
  --allow-unauthenticated

echo "============================================="
echo "   Deployment triggered successfully!        "
echo "============================================="
