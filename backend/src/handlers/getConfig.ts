// import {
//   AppConfigDataClient,
//   StartConfigurationSessionCommand,
//   GetLatestConfigurationCommand,
// } from '@aws-sdk/client-appconfigdata';
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { ErrorResponse } from '../types';

// const client = new AppConfigDataClient({ region: process.env.AWS_REGION });

// interface CountryConfig {
//   [key: string]: any;
// }

// interface ConfigData {
//   [country: string]: CountryConfig;
// }

// export const handler = async (
//   event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> => {
//   try {
//     const { country } = event.pathParameters || {};

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

//     // Start configuration session
//     const sessionCommand = new StartConfigurationSessionCommand({
//       ApplicationIdentifier: process.env.APPCONFIG_APPLICATION_ID!,
//       EnvironmentIdentifier: process.env.APPCONFIG_ENVIRONMENT_ID!,
//       ConfigurationProfileIdentifier: 'country-ui-config',
//       RequiredMinimumPollIntervalInSeconds: 15,
//     });

//     const sessionResponse = await client.send(sessionCommand);

//     if (!sessionResponse.InitialConfigurationToken) {
//       throw new Error('Failed to start configuration session');
//     }

//     const command = new GetLatestConfigurationCommand({
//       ConfigurationToken: sessionResponse.InitialConfigurationToken,
//     });

//     const response = await client.send(command);

//     if (!response.Configuration) {
//       throw new Error('No configuration content received');
//     }

//     const configString = new TextDecoder().decode(response.Configuration);
//     const configData: ConfigData = JSON.parse(configString);

//     // Filter config based on country
//     const countryConfig: CountryConfig = configData[country] || {};

//     return {
//       statusCode: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//       body: JSON.stringify({
//         country,
//         config: countryConfig,
//       }),
//     };
//   } catch (error) {
//     console.error('Error fetching config:', error);

//     const errorResponse: ErrorResponse = {
//       error: 'Failed to fetch configuration',
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
