#!/bin/bash

# Test script for Lambda layer setup
set -e

echo "🧪 Testing Lambda Layer Setup"
echo "================================"

# Test 1: Build layer
echo "📦 Test 1: Building Lambda Layer"
cd lambda-layer
if ./build.sh; then
    echo "✅ Layer build successful"
else
    echo "❌ Layer build failed"
    exit 1
fi

# Test 2: Check layer structure
echo ""
echo "📁 Test 2: Checking layer structure"
if [ -d "nodejs/node_modules" ]; then
    echo "✅ Layer structure is correct"
    echo "📋 Layer contents:"
    find nodejs -maxdepth 2 -type d | head -10
else
    echo "❌ Layer structure is incorrect"
    exit 1
fi

# Test 3: Verify key dependencies
echo ""
echo "🔍 Test 3: Verifying key dependencies"
REQUIRED_DEPS=(
    "@aws-lambda-powertools/logger"
    "@aws-lambda-powertools/metrics"
    "@aws-sdk/client-appconfig"
    "@middy/core"
)

for dep in "${REQUIRED_DEPS[@]}"; do
    if [ -d "nodejs/node_modules/$dep" ]; then
        echo "✅ $dep found"
    else
        echo "❌ $dep missing"
        exit 1
    fi
done

# Test 4: Backend build without dependencies
echo ""
echo "🏗️  Test 4: Testing backend build (without layer dependencies)"
cd ../backend

# Temporarily remove dependencies to simulate layer usage
if [ -f "package.json.backup" ]; then
    rm package.json.backup
fi

# Create a package.json without layer dependencies for testing
node -e "
const pkg = require('./package.json');
const layerDeps = [
    '@aws-lambda-powertools/logger',
    '@aws-lambda-powertools/metrics',
    '@aws-sdk/client-appconfig',
    '@aws-sdk/client-appconfigdata',
    '@middy/core',
    '@middy/http-cors',
    '@middy/http-json-body-parser',
    '@middy/validator'
];
layerDeps.forEach(dep => delete pkg.dependencies[dep]);
require('fs').writeFileSync('package-test.json', JSON.stringify(pkg, null, 2));
"

echo "📦 Installing reduced dependencies (simulating layer usage)"
cp package.json package.json.backup
cp package-test.json package.json
npm install

echo "🔨 Building TypeScript"
if npm run build; then
    echo "✅ Backend builds successfully without layer dependencies"
else
    echo "❌ Backend build failed"
    # Restore original package.json
    mv package.json.backup package.json
    rm -f package-test.json
    exit 1
fi

# Restore original package.json
mv package.json.backup package.json
rm -f package-test.json
npm install

echo ""
echo "🎉 All tests passed! Lambda layer setup is working correctly."
echo ""
echo "📋 Next steps:"
echo "1. Deploy the layer: cd lambda-layer && sam build && sam deploy"
echo "2. Deploy the backend: cd backend && ./deploy-with-layer.sh dev"