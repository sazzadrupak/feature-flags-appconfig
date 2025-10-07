// import {
//   AppConfigClient,
//   CreateHostedConfigurationVersionCommand,
//   StartDeploymentCommand,
// } from '@aws-sdk/client-appconfig';
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { ErrorResponse } from '../types';

// const client = new AppConfigClient({ region: process.env.AWS_REGION });

// interface UpdateConfigRequest {
//   config: Record<string, any>;
// }

// export const handler = async (
//   event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> => {
//   try {
//     const { country } = event.pathParameters || {};
//     const userRole =
//       event.headers['x-user-role'] || event.headers['X-User-Role'];

//     if (!country) {
//       return {
//         statusCode: 400,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//         },
//         body: JSON.stringify({
//           error: 'Country parameter is required',
//         }),
//       };
//     }

//     if (!event.body) {
//       return {
//         statusCode: 400,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//         },
//         body: JSON.stringify({
//           error: 'Request body is required',
//         }),
//       };
//     }

//     // Check admin permission
//     if (userRole !== 'admin') {
//       return {
//         statusCode: 403,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//         },
//         body: JSON.stringify({ error: 'Admin access required' }),
//       };
//     }

//     const { config }: UpdateConfigRequest = JSON.parse(event.body);

//     // Get current configuration
//     const currentConfig = await getCurrentConfig();

//     // Update country-specific config
//     const updatedConfig = {
//       ...currentConfig,
//       [country]: config,
//     };

//     // Create new configuration version
//     const createVersionCommand = new CreateHostedConfigurationVersionCommand({
//       ApplicationId: process.env.APPCONFIG_APPLICATION_ID!,
//       ConfigurationProfileId: 'country-ui-config',
//       Content: JSON.stringify(updatedConfig),
//       ContentType: 'application/json',
//     });

//     const versionResponse = await client.send(createVersionCommand);

//     if (!versionResponse.VersionNumber) {
//       throw new Error('Failed to create configuration version');
//     }

//     // Deploy the new version
//     const deployCommand = new StartDeploymentCommand({
//       ApplicationId: process.env.APPCONFIG_APPLICATION_ID!,
//       EnvironmentId: process.env.APPCONFIG_ENVIRONMENT_ID!,
//       ConfigurationProfileId: 'country-ui-config',
//       ConfigurationVersion: versionResponse.VersionNumber.toString(),
//       DeploymentStrategyId: 'immediate-deployment',
//     });

//     await client.send(deployCommand);

//     return {
//       statusCode: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify({
//         message: 'Configuration updated successfully',
//         country,
//         version: versionResponse.VersionNumber,
//       }),
//     };
//   } catch (error) {
//     console.error('Error updating config:', error);

//     const errorResponse: ErrorResponse = {
//       error: 'Failed to update configuration',
//       message: error instanceof Error ? error.message : 'Unknown error',
//     };

//     return {
//       statusCode: 500,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify(errorResponse),
//     };
//   }
// };

// async function getCurrentConfig(): Promise<Record<string, any>> {
//   // Implementation to get current config from AppConfig
//   // This is a simplified version - in production, you'd fetch the actual current config
//   return {};
// }
