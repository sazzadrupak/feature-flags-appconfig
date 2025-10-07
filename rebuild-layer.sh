#!/bin/bash

echo "🔄 Force rebuilding and redeploying layer..."

cd lambda-layer

# Clean everything
echo "🧹 Cleaning all previous builds..."
rm -rf nodejs node_modules package-lock.json

# Fresh install
echo "📦 Fresh npm install..."
npm install --production

# Build layer structure
echo "📁 Creating layer structure..."
mkdir -p nodejs
mv node_modules nodejs/

# Verify structure
echo "📋 Verifying layer structure:"
ls -la nodejs/
echo "📋 Sample modules in layer:"
ls -la nodejs/node_modules/ | head -10

# Deploy with SAM
echo "🚀 Deploying layer..."
sam build -t template.yaml
sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --stack-name multi-country-feature-flags-lambda-layer-dev --parameter-overrides Environment=dev --capabilities CAPABILITY_IAM --region us-east-1

# Get layer info
LAYER_ARN=$(aws cloudformation describe-stacks --stack-name multi-country-feature-flags-lambda-layer-dev --query 'Stacks[0].Outputs[?OutputKey==`LayerArn`].OutputValue' --output text --region us-east-1)
echo "✅ Layer deployed: $LAYER_ARN"

cd ../backend
echo "🚀 Redeploying backend with new layer..."

# Redeploy backend
sam build -t template.yaml
sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --stack-name multi-country-feature-flags-backend-dev --parameter-overrides Environment=dev LayerArn="$LAYER_ARN" --capabilities CAPABILITY_NAMED_IAM --region us-east-1

echo "✅ Done! Test your function now."