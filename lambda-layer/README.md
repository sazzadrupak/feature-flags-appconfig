# Lambda Layer for Feature Flags Dependencies

This directory contains the Lambda layer configuration for the feature flags backend dependencies.

## Structure

```
lambda-layer/
├── package.json          # Layer dependencies
├── template.yaml         # SAM template for layer
├── build.sh             # Build script
├── nodejs/              # Layer content (created during build)
│   └── node_modules/    # Dependencies
└── README.md            # This file
```

## Building the Layer

1. **Install and build the layer:**
   ```bash
   cd lambda-layer
   ./build.sh
   ```

2. **Deploy the layer:**
   ```bash
   sam build
   sam deploy --guided  # First time only
   # or
   sam deploy
   ```

## Using the Layer

After deploying the layer, you'll get a Layer ARN. Use this ARN in your main application's template.yaml:

```yaml
# In backend/template.yaml
YourLambdaFunction:
  Type: AWS::Serverless::Function
  Properties:
    # ... other properties
    Layers:
      - !Ref YourLayerStackLayerArn  # Import from layer stack
    # or hardcode the ARN:
    # Layers:
    #   - arn:aws:lambda:region:account:layer:feature-flags-deps-dev:1
```

## Lambda Layer Structure

Lambda layers must follow a specific directory structure:
- `nodejs/node_modules/` - for Node.js dependencies
- The layer makes dependencies available at `/opt/nodejs/node_modules/` in the Lambda runtime

## Environment-specific Layers

The layer name includes the environment suffix (`-dev`, `-staging`, `-prod`) to allow different versions per environment.