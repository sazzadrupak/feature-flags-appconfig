# Feature Flags Backend (TypeScript)

This backend has been converted from JavaScript to TypeScript for better type safety and development experience.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── handlers/         # Lambda function handlers (TypeScript)
│   │   ├── auth.ts
│   │   ├── getConfig.ts
│   │   ├── getAllConfigs.ts
│   │   ├── getFeatureFlags.ts
│   │   ├── updateConfig.ts
│   │   ├── updateFeatureFlags.ts
│   │   └── __tests__/    # Test files
│   └── types/            # TypeScript type definitions
│       └── index.ts
├── dist/                 # Compiled JavaScript output (generated)
├── template.yaml         # SAM template
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest test configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- AWS SAM CLI
- AWS CLI configured

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build TypeScript:**
   ```bash
   npm run build
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Build and deploy (automated script):**
   ```bash
   ./build.sh
   sam build
   sam deploy --guided
   ```

## 📝 Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

## 🏗️ TypeScript Features

### Type Safety
- **Strong typing** for AWS SDK responses
- **Interface definitions** for API requests/responses
- **Type checking** at compile time

### Key Types
- `FeatureFlagsConfig` - Structure for feature flag configurations
- `UserInfo` - User authentication information
- `ApiResponse<T>` - Standardized API response format
- `ErrorResponse` - Error response structure

### Environment Variables
All handlers use typed environment variables:
- `APPLICATION_ID` - AppConfig Application ID
- `ENVIRONMENT_ID` - AppConfig Environment ID  
- `CONFIGURATION_PROFILE_ID` - AppConfig Configuration Profile ID
- `DEPLOYMENT_STRATEGY_ID` - AppConfig Deployment Strategy ID

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Build SAM application
sam build

# Start local API
sam local start-api
```

### Adding New Handlers

1. Create TypeScript file in `src/handlers/`
2. Add type definitions in `src/types/index.ts` if needed
3. Update `template.yaml` to reference compiled JS in `dist/handlers/`
4. Build and test

## 🚀 Deployment

The GitHub Actions workflow automatically:
1. Installs dependencies
2. Compiles TypeScript
3. Builds SAM application
4. Deploys to AWS

### Manual Deployment
```bash
./build.sh
sam build
sam deploy
```

## 🧪 Testing

Tests are written in TypeScript using Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📚 API Endpoints

- `GET /feature-flags/{country}` - Get feature flags for a country
- `POST /feature-flags/{country}` - Update feature flags for a country
- `GET /config/{country}` - Get UI configuration for a country
- `POST /config/{country}` - Update UI configuration for a country
- `GET /configs` - Get all configurations (admin only)

## 🔒 Authentication

All endpoints support user authentication via headers:
- `x-user-id` or `X-User-Id` - User identifier
- `x-user-role` or `X-User-Role` - User role (admin/user)

## ⚡ Benefits of TypeScript Conversion

1. **Type Safety** - Catch errors at compile time
2. **Better IDE Support** - IntelliSense, autocomplete, refactoring
3. **Self-Documenting Code** - Types serve as documentation
4. **Easier Refactoring** - Confident code changes
5. **Better Testing** - Typed test scenarios

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed with `npm install`
2. **Type Errors**: Check `tsconfig.json` configuration
3. **Runtime Errors**: Verify compiled JavaScript exists in `dist/` folder
4. **SAM Build Issues**: Ensure TypeScript is compiled before running `sam build`