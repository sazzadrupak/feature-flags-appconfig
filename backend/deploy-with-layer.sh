#!/bin/bash

# Deploy script for backend with Lambda layer
set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}

echo "🚀 Deploying Feature Flags Backend with Lambda Layer"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"

# Function to get layer ARN
get_layer_arn() {
    local env=$1
    local layer_stack_name="feature-flags-layer-$env"
    
    echo "🔍 Getting Layer ARN from stack: $layer_stack_name"
    
    LAYER_ARN=$(aws cloudformation describe-stacks \
        --stack-name "$layer_stack_name" \
        --query 'Stacks[0].Outputs[?OutputKey==`LayerArn`].OutputValue' \
        --output text \
        --region "$REGION" 2>/dev/null || echo "")
    
    if [ -z "$LAYER_ARN" ]; then
        echo "❌ Could not find Layer ARN from stack: $layer_stack_name"
        echo "💡 Make sure the layer is deployed first:"
        echo "   cd lambda-layer && sam deploy --stack-name $layer_stack_name --parameter-overrides Environment=$env"
        exit 1
    fi
    
    echo "✅ Found Layer ARN: $LAYER_ARN"
}

# Check if layer ARN file exists (from CI/CD)
LAYER_ARN_FILE="layer-arn-$ENVIRONMENT.txt"
if [ -f "$LAYER_ARN_FILE" ]; then
    echo "📄 Reading Layer ARN from file: $LAYER_ARN_FILE"
    LAYER_ARN=$(cat "$LAYER_ARN_FILE")
    echo "✅ Layer ARN from file: $LAYER_ARN"
else
    # Get layer ARN from CloudFormation stack
    get_layer_arn "$ENVIRONMENT"
fi

# Build the backend
echo "🏗️  Building backend..."
npm run build

# Deploy with SAM
echo "🚀 Deploying backend with Layer..."
sam build

sam deploy \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --stack-name "feature-flags-backend-$ENVIRONMENT" \
    --parameter-overrides \
        Environment="$ENVIRONMENT" \
        LayerArn="$LAYER_ARN" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION"

echo "✅ Backend deployment completed successfully!"

# Get the API URL
API_URL=$(aws cloudformation describe-stacks \
    --stack-name "feature-flags-backend-$ENVIRONMENT" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
    --output text \
    --region "$REGION")

echo "🌐 API Gateway URL: $API_URL"