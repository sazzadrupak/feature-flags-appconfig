# AWS AppConfig Multi-Country Application

A dynamic web application that uses AWS AppConfig to manage country-specific UI configurations. The application consists of a Next.js frontend and a serverless backend built with AWS SAM.

## Architecture

### Backend (AWS SAM)
- **AWS AppConfig**: Stores country-specific UI configurations
- **Lambda Functions**: Handle configuration CRUD operations
- **API Gateway**: REST API endpoints
- **DynamoDB**: User and country mapping
- **IAM Roles**: Access control for admin/user permissions

### Frontend (Next.js)
- **Dynamic UI**: Renders components based on configuration
- **Admin Panel**: Manage configurations for all countries
- **User Dashboard**: Country-specific interface
- **State Management**: Zustand for configuration state
- **TypeScript**: Type-safe development

## Features

- **Country-based Configuration**: Different UI for each country
- **Admin Management**: Full CRUD operations for configurations
- **Dynamic UI Elements**: Show/hide tabs, navigation, inputs, buttons
- **Theme Support**: Light/dark mode per country
- **Real-time Updates**: Configuration changes reflect immediately
- **Role-based Access**: Admin vs regular user permissions
- **CI/CD Pipeline**: GitHub Actions for deployment

## Project Structure

```
appconfig-app/
├── backend/
│   ├── template.yaml              # SAM template
│   ├── src/handlers/              # Lambda functions
│   │   ├── getConfig.js          # Get country config
│   │   ├── updateConfig.js       # Update config (admin)
│   │   ├── getAllConfigs.js      # Get all configs (admin)
│   │   └── auth.js               # User authentication
│   └── .github/workflows/        # Backend CI/CD
└── frontend/
    ├── src/
    │   ├── app/                  # Next.js app router
    │   ├── components/           # React components
    │   │   ├── DynamicUI.tsx    # Main UI component
    │   │   └── AdminPanel.tsx   # Admin interface
    │   ├── lib/                 # Utilities
    │   │   ├── api.ts           # API client
    │   │   └── store.ts         # Zustand store
    │   └── types/               # TypeScript types
    └── .github/workflows/       # Frontend CI/CD
```

## Configuration Schema

```typescript
interface UIConfig {
  showTabs: boolean;
  showNavBar: boolean;
  showInputField: boolean;
  showButton: boolean;
  tabs: string[];
  navItems: string[];
  theme: 'light' | 'dark';
  features: {
    [key: string]: boolean;
  };
}
```

## Setup Instructions

### Backend Deployment

1. **Prerequisites**:
   - AWS CLI configured
   - SAM CLI installed
   - Node.js 18+

2. **Deploy Backend**:
   ```bash
   cd backend
   sam build
   sam deploy --guided
   ```

3. **Environment Variables**:
   - Set API Gateway URL in frontend environment

### Frontend Deployment

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup**:
   ```bash
   # .env.local
   API_BASE_URL=https://your-api-gateway-url
   ```

3. **Build and Deploy**:
   ```bash
   npm run build
   # Deploy to S3/CloudFront or your preferred hosting
   ```

## API Endpoints

- `GET /config/{country}` - Get country-specific configuration
- `PUT /config/{country}` - Update country configuration (admin only)
- `GET /admin/configs` - Get all configurations (admin only)
- `GET /auth/user` - Get user information and country

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## CI/CD Pipeline

The application includes GitHub Actions workflows for:
- **Backend**: Automatic SAM deployment on push to main
- **Frontend**: Build and deploy to S3/CloudFront

### Required Secrets
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME` (frontend)
- `CLOUDFRONT_DISTRIBUTION_ID` (frontend)

## Usage

### For Regular Users
1. Access the application
2. System detects country automatically
3. UI renders based on country configuration
4. Dynamic elements show/hide per configuration

### For Admin Users
1. Toggle to Admin Panel
2. View all country configurations
3. Add new countries
4. Edit existing configurations
5. Changes apply immediately

## Security Considerations

- **IAM Roles**: Least privilege access
- **API Authentication**: User ID and role headers
- **CORS**: Configured for frontend domain
- **Input Validation**: All user inputs validated
- **Admin Access**: Role-based restrictions

## Performance Optimizations

- **AppConfig Caching**: Built-in configuration caching
- **State Management**: Efficient Zustand store
- **Component Optimization**: React best practices
- **API Efficiency**: Minimal API calls with caching

## Monitoring and Logging

- **CloudWatch Logs**: Lambda function logs
- **API Gateway Logs**: Request/response logging
- **AppConfig Metrics**: Configuration retrieval metrics
- **Frontend Analytics**: User interaction tracking

## Troubleshooting

### Common Issues
1. **Configuration not loading**: Check API Gateway URL
2. **Admin access denied**: Verify user role in DynamoDB
3. **Country detection**: Check IP geolocation service
4. **Deployment failures**: Verify AWS permissions

### Debug Steps
1. Check CloudWatch logs for Lambda errors
2. Verify AppConfig deployment status
3. Test API endpoints directly
4. Check browser console for frontend errors