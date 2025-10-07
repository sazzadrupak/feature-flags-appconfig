#!/bin/bash

# Enhanced deployment script with versioned layer support
set -e

ENVIRONMENT=${1:-dev}
LAYER_VERSION=${2:-""}
REGION=${3:-us-east-1}

echo "🚀 Deploying Feature Flags Backend with Versioned Lambda Layer"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"

# Load layer configuration
if [ -f "layer-versions.env" ]; then
    echo "📋 Loading layer version configuration..."
    source layer-versions.env
    export AWS_REGION=$REGION
    
    # Get the appropriate layer ARN for environment
    case $ENVIRONMENT in
        dev)
            CONFIGURED_LAYER_ARN=$(eval echo $DEV_LAYER_ARN)
            ;;
        staging)
            CONFIGURED_LAYER_ARN=$(eval echo $STAGING_LAYER_ARN)
            ;;
        prod)
            CONFIGURED_LAYER_ARN=$(eval echo $PROD_LAYER_ARN)
            ;;
        *)
            echo "❌ Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
else
    echo "⚠️  No layer-versions.env found, using default layer lookup"
    CONFIGURED_LAYER_ARN=""
fi

# Override with specific version if provided
if [ -n "$LAYER_VERSION" ] && [ -n "$CONFIGURED_LAYER_ARN" ]; then
    # Extract layer name and build new ARN with specific version
    LAYER_NAME=$(echo "$CONFIGURED_LAYER_ARN" | sed 's/.*:layer:\([^:]*\):.*/\1/')
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region $REGION)
    LAYER_ARN="arn:aws:lambda:$REGION:$AWS_ACCOUNT_ID:layer:$LAYER_NAME:$LAYER_VERSION"
    echo "🎯 Using specific layer version: $LAYER_ARN"
elif [ -n "$CONFIGURED_LAYER_ARN" ]; then
    LAYER_ARN="$CONFIGURED_LAYER_ARN"
    echo "📌 Using configured layer: $LAYER_ARN"
else
    # Fallback to dynamic lookup
    echo "🔍 Looking up layer ARN from CloudFormation stack..."
    LAYER_ARN=$(aws cloudformation describe-stacks \
        --stack-name "feature-flags-layer-$ENVIRONMENT" \
        --query 'Stacks[0].Outputs[?OutputKey==`LayerArn`].OutputValue' \
        --output text \
        --region "$REGION" 2>/dev/null || echo "")
    
    if [ -z "$LAYER_ARN" ]; then
        echo "❌ Could not find Layer ARN. Options:"
        echo "   1. Update layer-versions.env with correct ARNs"
        echo "   2. Deploy the layer first: cd ../lambda-layer && sam deploy"
        echo "   3. Provide layer ARN manually"
        exit 1
    fi
    echo "✅ Found Layer ARN: $LAYER_ARN"
fi

# Validate layer exists
echo "🔍 Validating layer exists..."
if aws lambda get-layer-version-by-arn --arn "$LAYER_ARN" --region "$REGION" > /dev/null 2>&1; then
    echo "✅ Layer validated successfully"
    LAYER_VERSION_NUM=$(echo "$LAYER_ARN" | sed 's/.*://')
    echo "   Layer Version: $LAYER_VERSION_NUM"
else
    echo "❌ Layer validation failed. Layer ARN may be incorrect or layer doesn't exist."
    echo "   Layer ARN: $LAYER_ARN"
    exit 1
fi

# Build the backend
echo "🏗️  Building backend..."
npm run build

# Deploy with SAM
echo "🚀 Deploying backend with Layer..."
sam build

# Create deployment parameters
PARAMS="Environment=$ENVIRONMENT LayerArn=$LAYER_ARN"

echo "📋 Deployment Parameters:"
echo "   Stack: feature-flags-backend-$ENVIRONMENT"
echo "   Environment: $ENVIRONMENT"
echo "   Layer ARN: $LAYER_ARN"
echo "   Region: $REGION"

sam deploy \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --stack-name "feature-flags-backend-$ENVIRONMENT" \
    --parameter-overrides $PARAMS \
    --capabilities CAPABILITY_IAM \
    --region "$REGION"

echo "✅ Backend deployment completed successfully!"

# Get the API URL
API_URL=$(aws cloudformation describe-stacks \
    --stack-name "feature-flags-backend-$ENVIRONMENT" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
    --output text \
    --region "$REGION")

echo ""
echo "🎉 Deployment Summary:"
echo "   Environment: $ENVIRONMENT"
echo "   Layer ARN: $LAYER_ARN"
echo "   API URL: $API_URL"
echo "   Region: $REGION"

# Save deployment info
cat > "deployment-info-$ENVIRONMENT.json" << EOF
{
  "environment": "$ENVIRONMENT",
  "layerArn": "$LAYER_ARN",
  "apiUrl": "$API_URL",
  "region": "$REGION",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "gitSha": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
}
EOF

echo "📄 Deployment info saved to: deployment-info-$ENVIRONMENT.json"