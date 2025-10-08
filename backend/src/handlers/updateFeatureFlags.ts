/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// import {
//   AppConfigClient,
//   CreateHostedConfigurationVersionCommand,
//   StartDeploymentCommand,
// } from '@aws-sdk/client-appconfig';
// import {
//   AppConfigDataClient,
//   StartConfigurationSessionCommand,
//   GetLatestConfigurationCommand,
// } from '@aws-sdk/client-appconfigdata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import {
//   FeatureFlagsConfig,
//   UpdateFeatureFlagsRequest,
//   ErrorResponse,
// } from '../types';

// const appConfigClient = new AppConfigClient({ region: process.env.AWS_REGION });
// const appConfigDataClient = new AppConfigDataClient({
//   region: process.env.AWS_REGION,
// });

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({}),
  };
};
