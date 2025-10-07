// import {
//   AppConfigDataClient,
//   StartConfigurationSessionCommand,
//   GetLatestConfigurationCommand,
// } from '@aws-sdk/client-appconfigdata';
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { Logger } from '@aws-lambda-powertools/logger';
// import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';

// import { METRICS } from '../lib/metrics-constant';
// import { ErrorResponse } from '../types';
// import { combinedWrapper } from '../lib/wrapper';

// const client = new AppConfigDataClient({ region: process.env.AWS_REGION });
// const { service_name } = process.env;

// const metrics = new Metrics({
//   namespace: 'RestaurantService',
//   serviceName: service_name,
// });

// const logger = new Logger({
//   serviceName: service_name,
// });

// interface AllConfigsResponse {
//   configs: Record<string, any>;
// }

// // Response schema for validation (optional)
// const responseSchema = {
//   type: 'object',
//   properties: {
//     statusCode: { type: 'number' },
//     headers: { type: 'object' },
//     body: { type: 'string' },
//   },
//   required: ['statusCode', 'body'],
// };

// export const handler = combinedWrapper(
//   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     metrics.addMetric(METRICS.GET_RESTAURANTS.INVOCATION, MetricUnit.Count, 1);

//     try {
//       const userRole =
//         event.headers['x-user-role'] || event.headers['X-User-Role'];

//       // Check admin permission
//       if (userRole !== 'admin') {
//         return {
//           statusCode: 403,
//           headers: {
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Origin': '*',
//           },
//           body: JSON.stringify({ error: 'Admin access required' }),
//         };
//       }

//       // Start configuration session
//       const sessionCommand = new StartConfigurationSessionCommand({
//         ApplicationIdentifier: process.env.APPCONFIG_APPLICATION_ID!,
//         EnvironmentIdentifier: process.env.APPCONFIG_ENVIRONMENT_ID!,
//         ConfigurationProfileIdentifier: 'country-ui-config',
//         RequiredMinimumPollIntervalInSeconds: 15,
//       });

//       const sessionResponse = await client.send(sessionCommand);

//       if (!sessionResponse.InitialConfigurationToken) {
//         throw new Error('Failed to start configuration session');
//       }

//       const command = new GetLatestConfigurationCommand({
//         ConfigurationToken: sessionResponse.InitialConfigurationToken,
//       });

//       const response = await client.send(command);

//       if (!response.Configuration) {
//         throw new Error('No configuration content received');
//       }

//       const configString = new TextDecoder().decode(response.Configuration);
//       const configData: Record<string, any> = JSON.parse(configString);

//       const responseBody: AllConfigsResponse = {
//         configs: configData,
//       };

//       return {
//         statusCode: 200,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//         },
//         body: JSON.stringify(responseBody),
//       };
//     } catch (error) {
//       const errorResponse: ErrorResponse = {
//         error: 'Failed to fetch configurations',
//         message: error instanceof Error ? error.message : 'Unknown error',
//       };
//       logger.error('Error fetching all configs:', errorResponse.message);

//       return {
//         statusCode: 500,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//         },
//         body: JSON.stringify(errorResponse),
//       };
//     }
//   },
//   {
//     metrics,
//     responseSchema,
//   }
// );
