import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import { wrap, combinedWrapper } from '../lib/wrapper';

// Create metrics instance
const metrics = new Metrics({
  namespace: 'FeatureFlags',
  serviceName: 'feature-flags-backend',
});

// Example handler using the basic wrapper
const basicHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Hello from TypeScript Lambda!',
      requestId: context.awsRequestId,
    }),
  };
};

// Example handler using the combined wrapper with metrics
const advancedHandler = async (
  _event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  // Add custom metrics
  metrics.addMetric('HandlerInvocation', MetricUnit.Count, 1);

  try {
    // Your business logic here
    const result = {
      message: 'Success!',
      timestamp: new Date().toISOString(),
    };

    metrics.addMetric('HandlerSuccess', MetricUnit.Count, 1);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    metrics.addMetric('HandlerError', MetricUnit.Count, 1);
    throw error;
  }
};

// Response schema for validation (optional)
const responseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    headers: { type: 'object' },
    body: { type: 'string' },
  },
  required: ['statusCode', 'body'],
};

// Export wrapped handlers
export const handler = wrap(basicHandler);

export const handlerWithMetrics = combinedWrapper(advancedHandler, {
  metrics,
  responseSchema,
});
