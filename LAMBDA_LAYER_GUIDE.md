# Lambda Layer Deployment Guide

This guide explains how to use Lambda layers for the Feature Flags backend dependencies.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────────┐
│   Lambda Layer  │    │   Backend Lambda    │
│   (Dependencies)│    │   (Application Code)│
│                 │    │                     │
│ • AWS SDK       │◄───┤ • Handler functions │
│ • Powertools    │    │ • Business logic    │
│ • Middy         │    │ • Types             │
│ • Other deps    │    │                     │
└─────────────────┘    └─────────────────────┘
```

## Directory Structure

```
project/
├── lambda-layer/              # Lambda layer (dependencies only)
│   ├── package.json          # Layer dependencies
│   ├── template.yaml         # SAM template for layer
│   ├── build.sh             # Build script
│   └── README.md            # Layer documentation
├── backend/                  # Backend application (code only)
│   ├── src/                 # Source code
│   ├── template.yaml        # SAM template (references layer)
│   └── deploy-with-layer.sh # Deployment script
└── .github/workflows/       # CI/CD workflows
    ├── deploy-layer.yml     # Deploy layer
    └── deploy-backend-with-layer.yml  # Deploy backend
```

## Deployment Steps

### 1. Deploy the Lambda Layer First

```bash
# Navigate to layer directory
cd lambda-layer

# Build the layer
./build.sh

# Deploy the layer
sam build
sam deploy --guided  # First time only
```

### 2. Deploy the Backend

```bash
# Navigate to backend directory
cd ../backend

# Deploy backend with layer
./deploy-with-layer.sh dev
```

## CI/CD Workflow

### Layer Deployment Workflow

The layer workflow (`deploy-layer.yml`) runs when:
- Changes are made to `lambda-layer/**` files
- Manual trigger via GitHub Actions

### Backend Deployment Workflow

The backend workflow (`deploy-backend-with-layer.yml`) runs when:
- Changes are made to `backend/**` files
- Manual trigger via GitHub Actions
- **Depends on**: Layer being deployed first

## Benefits of Lambda Layers

1. **Reduced Package Size**: Application code is smaller (only business logic)
2. **Faster Deployments**: Dependencies don't change often, only app code
3. **Shared Dependencies**: Multiple functions can use the same layer
4. **Version Control**: Layer versions are managed separately
5. **Cold Start**: Potentially faster cold starts due to smaller packages

## Layer Management

### Updating Dependencies

1. Update `lambda-layer/package.json`
2. Run `cd lambda-layer && ./build.sh`
3. Deploy: `sam build && sam deploy`
4. Update backend to use new layer version

### Environment-Specific Layers

Each environment gets its own layer:
- `feature-flags-deps-dev`
- `feature-flags-deps-staging`
- `feature-flags-deps-prod`

## Local Development

For local development, keep using the regular approach:

```bash
cd backend
npm install  # Install all dependencies locally
npm run build
sam local start-api
```

## Troubleshooting

### Layer ARN Not Found
```bash
# Check if layer exists
aws lambda list-layers --region us-east-1

# Check CloudFormation stack
aws cloudformation describe-stacks --stack-name feature-flags-layer-dev
```

### Missing Dependencies
```bash
# Verify layer contents
aws lambda get-layer-version --layer-name feature-flags-deps-dev --version-number 1
```

### Backend Deployment Fails
```bash
# Check layer ARN parameter
sam deploy --parameter-overrides LayerArn=arn:aws:lambda:...
```

## Cost Considerations

- **Layer Storage**: Small cost for storing layer versions
- **Function Size**: Reduced function package size
- **Transfer**: Faster deployments due to smaller packages
- **Overall**: Usually cost-neutral or cost-saving