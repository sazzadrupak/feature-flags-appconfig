# Versioned Lambda Layer Deployment Guide

This guide explains how to use versioned Lambda layers with manual version control for production deployments.

## 🎯 Overview

Instead of automatically using the latest layer version, this approach allows you to:

1. **Pin specific layer versions** per environment
2. **Control layer updates** independently from application deployments  
3. **Ensure stability** by using tested layer versions in production
4. **Track layer versions** with proper version management

## 📁 File Structure

```
backend/
├── layer-versions.env          # Layer version configuration
├── deploy-versioned.sh         # Enhanced deployment script
├── deployment-info-*.json      # Deployment tracking files
└── template.yaml              # SAM template with conditional layer support

lambda-layer/
├── package.json               # Layer dependencies
├── template.yaml              # Layer deployment template
└── build.sh                   # Layer build script

.github/workflows/
├── deploy-layer.yml           # Layer deployment with versioning
└── deploy-backend-with-layer.yml  # Backend deployment with version control
```

## 🔧 Configuration

### 1. Layer Version Configuration (`layer-versions.env`)

```bash
# AWS Account ID
AWS_ACCOUNT_ID=123456789012

# Layer Versions per Environment
DEV_LAYER_ARN=arn:aws:lambda:us-east-1:123456789012:layer:feature-flags-deps-dev:3
STAGING_LAYER_ARN=arn:aws:lambda:us-east-1:123456789012:layer:feature-flags-deps-staging:2  
PROD_LAYER_ARN=arn:aws:lambda:us-east-1:123456789012:layer:feature-flags-deps-prod:1
```

### 2. GitHub Actions Workflow

The workflow supports environment-specific layer versions:

```yaml
strategy:
  matrix:
    include:
      - environment: dev
        layer_arn: arn:aws:lambda:us-east-1:ACCOUNT:layer:feature-flags-deps-dev:LATEST
      - environment: staging  
        layer_arn: arn:aws:lambda:us-east-1:ACCOUNT:layer:feature-flags-deps-staging:2
      - environment: prod
        layer_arn: arn:aws:lambda:us-east-1:ACCOUNT:layer:feature-flags-deps-prod:1
```

## 🚀 Deployment Methods

### Method 1: Using Configuration File

```bash
# Deploy with configured layer version
./deploy-versioned.sh dev

# Deploy with specific layer version override
./deploy-versioned.sh prod 5

# Deploy to staging with latest layer
./deploy-versioned.sh staging
```

### Method 2: GitHub Actions

```bash
# Manual deployment with specific layer version
gh workflow run deploy-backend-with-layer.yml \
  -f environment=prod \
  -f layer_version=3

# Deploy with configured layer version
gh workflow run deploy-backend-with-layer.yml \
  -f environment=staging
```

### Method 3: Direct SAM deployment

```bash
# Deploy with explicit layer ARN
sam deploy \
  --parameter-overrides \
    Environment=prod \
    LayerArn=arn:aws:lambda:us-east-1:123456789012:layer:feature-flags-deps-prod:2
```

## 📋 Layer Version Management Workflow

### 1. Layer Development & Deployment

```bash
# 1. Update layer dependencies
cd lambda-layer
vim package.json

# 2. Build and test layer
./build.sh

# 3. Deploy new layer version
sam build && sam deploy
# This creates version N+1

# 4. Get the new layer ARN with version
aws lambda list-layer-versions --layer-name feature-flags-deps-dev
```

### 2. Testing New Layer Version

```bash
# Test with dev environment first
cd backend
./deploy-versioned.sh dev 5  # Use new version 5

# Run integration tests
npm run test:integration

# If tests pass, update dev configuration
vim layer-versions.env
# Update DEV_LAYER_ARN to use version 5
```

### 3. Promoting to Staging

```bash
# Deploy to staging with tested version
./deploy-versioned.sh staging 5

# Run staging tests
npm run test:staging

# If successful, update staging configuration
vim layer-versions.env
# Update STAGING_LAYER_ARN to use version 5
```

### 4. Production Deployment

```bash
# Deploy to production with well-tested version
./deploy-versioned.sh prod 5

# Update production configuration
vim layer-versions.env
# Update PROD_LAYER_ARN to use version 5
```

## 🎛️ Environment-Specific Layer Strategy

| Environment | Layer Strategy | Example Version |
|-------------|----------------|-----------------|
| **Dev** | Latest/experimental | `feature-flags-deps-dev:LATEST` |
| **Staging** | Tested stable | `feature-flags-deps-staging:3` |
| **Production** | Well-tested, proven | `feature-flags-deps-prod:2` |

## 📊 Version Tracking

The deployment script creates tracking files:

```json
{
  "environment": "prod",
  "layerArn": "arn:aws:lambda:us-east-1:123456789012:layer:feature-flags-deps-prod:2",
  "apiUrl": "https://api.example.com/prod",
  "region": "us-east-1",
  "deployedAt": "2025-10-07T10:30:00Z",
  "gitSha": "abc123def456"
}
```

## 🔍 Layer Version Validation

Before deployment, the script validates:

1. ✅ Layer ARN exists and is accessible
2. ✅ Layer version is valid
3. ✅ AWS credentials have necessary permissions
4. ✅ Layer contains expected dependencies

## 🚨 Rollback Strategy

### Quick Rollback

```bash
# Rollback to previous layer version
./deploy-versioned.sh prod 1  # Use previous stable version

# Or rollback using configuration
git checkout HEAD~1 layer-versions.env
./deploy-versioned.sh prod
```

### Emergency Rollback

```bash
# Deploy without layer (using bundled dependencies)
sam deploy --parameter-overrides Environment=prod LayerArn=""
```

## 🔧 Troubleshooting

### Layer Not Found

```bash
# Check if layer exists
aws lambda get-layer-version-by-arn \
  --arn arn:aws:lambda:us-east-1:123456789012:layer:feature-flags-deps-prod:2

# List available layer versions
aws lambda list-layer-versions --layer-name feature-flags-deps-prod
```

### Deployment Fails

```bash
# Check layer permissions
aws lambda get-layer-version-policy \
  --layer-name feature-flags-deps-prod \
  --version-number 2

# Validate SAM template
sam validate --template template.yaml
```

## 💡 Best Practices

1. **Pin Production Versions**: Never use "LATEST" in production
2. **Test Thoroughly**: Test new layer versions in dev → staging → prod  
3. **Version Tracking**: Keep track of what layer version is deployed where
4. **Rollback Plan**: Always have a rollback strategy
5. **Documentation**: Document layer changes and compatibility requirements
6. **Monitoring**: Monitor application metrics after layer updates

## 📈 Benefits

- **Predictable Deployments**: Know exactly which layer version is used
- **Independent Updates**: Update application code without changing dependencies
- **Risk Mitigation**: Test layer changes separately from application changes
- **Compliance**: Meet requirements for production change management
- **Debugging**: Easier to isolate issues between application and dependencies