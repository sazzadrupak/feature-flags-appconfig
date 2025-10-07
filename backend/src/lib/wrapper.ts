/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import middy, { MiddyfiedHandler, Request } from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

import { METRICS } from './metrics-constant';

// Type definitions
interface WrapperOptions {
  withSSM?: boolean;
  metrics?: Metrics;
  responseSchema?: any;
}

interface CombinedWrapperConfig {
  metrics?: Metrics;
  responseSchema?: any;
}

type MiddyRequest = Request<
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Error,
  Context & { cloudfrontUrl?: string }
>;

type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

const logger = new Logger({ serviceName: process.env.service_name });

// Add a flag to track cold starts at module level
let isColdStart = true;

const metricsMiddleware = (metricsInstance: Metrics) => {
  return {
    before: async (_request: MiddyRequest): Promise<void> => {
      // Capture cold start metric
      if (isColdStart && metricsInstance) {
        metricsInstance.addMetric(METRICS.COLD_START, MetricUnit.Count, 1);
        isColdStart = false;
      }
    },
    after: async (_request: MiddyRequest): Promise<void> => {
      // Auto-publish metrics if not already done
      if (
        metricsInstance &&
        typeof metricsInstance.publishStoredMetrics === 'function'
      ) {
        await metricsInstance.publishStoredMetrics();
      }
    },
    onError: async (_request: MiddyRequest): Promise<void> => {
      // Ensure metrics are published even on error
      if (
        metricsInstance &&
        typeof metricsInstance.publishStoredMetrics === 'function'
      ) {
        await metricsInstance.publishStoredMetrics();
      }
    },
  };
};

// Custom middleware to stringify body after validation
const stringifyBodyMiddleware = () => ({
  after: async (request: MiddyRequest): Promise<void> => {
    // Only stringify if we have a response with a body
    if (
      request.response &&
      request.response.body &&
      typeof request.response.body !== 'string'
    ) {
      request.response.body = JSON.stringify(request.response.body);
    }
  },
});

const dynamicCorsMiddleware = () => {
  // origins: ['https://de6oro7mrzc2z.cloudfront.net'],
  // there are several ways to make the CORS origin dynamic instead of hardcoding it:
  // 1. Use Environment Variable
  // 2. Store in SSM Parameter
  // 3. Dynamic Origin Based on Request
  // 4. Combination: Environment Variable with Fallback to SSM
  // 5. Best Practice: Reference CloudFront Distribution
  return {
    after: async (request: MiddyRequest): Promise<void> => {
      const origin =
        request.event.headers?.origin || request.event.headers?.Origin;
      const cloudfrontUrl = request.context?.cloudfrontUrl;

      const allowedOrigins = [cloudfrontUrl].filter(Boolean) as string[];

      const allowOrigin = allowedOrigins.includes(origin || '')
        ? origin || '*'
        : cloudfrontUrl || '*';

      // Ensure headers object exists
      if (!request.response) {
        request.response = {
          statusCode: 200,
          headers: {},
          body: '',
        };
      }

      request.response.headers = request.response.headers || {};

      // Add CORS headers
      request.response.headers = {
        ...request.response.headers,
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      };
    },
  };
};

const ensureContentTypeMiddleware = () => ({
  before: async (request: MiddyRequest): Promise<void> => {
    // If no Content-Type header and there's a body, assume JSON
    if (
      request.event.body &&
      !request.event.headers?.['content-type'] &&
      !request.event.headers?.['Content-Type']
    ) {
      request.event.headers = {
        ...request.event.headers,
        'content-type': 'application/json',
      };
    }
  },
});

const baseWrap = (
  handler: LambdaHandler,
  options: WrapperOptions = {}
): MiddyfiedHandler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Error,
  Context
> => {
  const { metrics, responseSchema } = options;

  let middyHandler = middy(handler)
    .before(async (request: MiddyRequest): Promise<void> => {
      logger.info('Incoming event:', JSON.stringify(request.event, null, 2));
    })
    .use(ensureContentTypeMiddleware())
    .use(
      httpJsonBodyParser({
        disableContentTypeError: true,
      })
    );

  // Conditionally add SSM middleware
  //   if (withSSM) {
  //     middyHandler = middyHandler.use(
  //       ssm({
  //         cache: true,
  //         cacheExpiry: 1 * 60 * 1000, // 1 mins
  //         setToContext: true,
  //         fetchData: {
  //           serviceQuotas: `/${service_name}/${ssm_stage_name}/serviceQuotas`,
  //           secretString: `/${service_name}/${ssm_stage_name}/search-restaurants/secretString`,
  //           cloudfrontUrl: `/${service_name}/${ssm_stage_name}/cloudfront/url`,
  //         },
  //       })
  //     );
  //   }

  // Add metrics middleware early if provided
  if (metrics) {
    middyHandler = middyHandler.use(metricsMiddleware(metrics));
  }

  // Add response validation BEFORE serialization
  if (responseSchema) {
    middyHandler = middyHandler.use(
      validator({
        responseSchema: responseSchema,
      })
    );
  }

  // Add stringification AFTER validation
  middyHandler = middyHandler.use(stringifyBodyMiddleware());

  // Add CORS last
  middyHandler = middyHandler.use(dynamicCorsMiddleware());

  // Add global error handler
  return middyHandler.onError(async (request: MiddyRequest): Promise<void> => {
    if (request.error) {
      logger.error('Global error handler:', request.error);

      // Log validation errors for debugging
      const errorWithCause = request.error as Error & {
        cause?: { package?: string; data?: any };
      };
      if (errorWithCause?.cause?.package === '@middy/validator') {
        logger.error(
          'Validation errors:',
          JSON.stringify(errorWithCause.cause.data, null, 2)
        );
      }
    }

    // Ensure a response is set
    if (!request.response) {
      request.response = {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: request.error?.message || 'Internal server error',
          stack:
            process.env.NODE_ENV !== 'production'
              ? request.error?.stack
              : undefined,
        }),
      };
    }
  });
};

// Wrapper with SSM
export const wrap = (
  handler: LambdaHandler,
  options: WrapperOptions = {}
): MiddyfiedHandler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Error,
  Context
> => {
  return baseWrap(handler, { ...options, withSSM: false });
};

// Wrapper without SSM
// export const wrapWithoutSSM = (handler: LambdaHandler, options: WrapperOptions = {}): MiddyfiedHandler<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context> => {
//   return baseWrap(handler, { ...options, withSSM: false });
// };

// Export a version that includes metrics (with SSM)
export const combinedWrapper = (
  handler: LambdaHandler,
  config: CombinedWrapperConfig = {}
): MiddyfiedHandler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Error,
  Context
> => {
  return wrap(handler, {
    metrics: config.metrics,
    responseSchema: config.responseSchema,
  });
};

// Export a version that includes metrics (without SSM)
// export const combinedWrapperWithoutSSM = (handler: LambdaHandler, config: CombinedWrapperConfig = {}): MiddyfiedHandler<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context> => {
//   return wrapWithoutSSM(handler, {
//     metrics: config.metrics,
//     responseSchema: config.responseSchema,
//   });
// };
