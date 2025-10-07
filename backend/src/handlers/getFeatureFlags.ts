import {
  AppConfigDataClient,
  StartConfigurationSessionCommand,
  GetLatestConfigurationCommand,
} from '@aws-sdk/client-appconfigdata';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { FeatureFlagsConfig, CountryFlags, ErrorResponse } from '../types';
import { wrap } from '../lib/wrapper';

const client = new AppConfigDataClient({ region: process.env.AWS_REGION });

const getFeatureFlagsHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { country } = event.pathParameters || {};

    if (!country) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Country parameter is required',
        }),
      };
    }

    // Start configuration session
    const sessionCommand = new StartConfigurationSessionCommand({
      ApplicationIdentifier: process.env.APPLICATION_ID!,
      EnvironmentIdentifier: process.env.ENVIRONMENT_ID!,
      ConfigurationProfileIdentifier: process.env.CONFIGURATION_PROFILE_ID!,
      RequiredMinimumPollIntervalInSeconds: 15,
    });

    const sessionResponse = await client.send(sessionCommand);

    if (!sessionResponse.InitialConfigurationToken) {
      throw new Error('Failed to start configuration session');
    }

    // Get latest configuration
    const getCommand = new GetLatestConfigurationCommand({
      ConfigurationToken: sessionResponse.InitialConfigurationToken,
    });

    const response = await client.send(getCommand);

    if (!response.Configuration) {
      throw new Error('No configuration content received');
    }

    const configString = new TextDecoder().decode(response.Configuration);
    const configData: FeatureFlagsConfig = JSON.parse(configString);

    // Extract country-specific flags
    const countryFlags: CountryFlags = configData.flags[country] || {};

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        country,
        flags: countryFlags,
      }),
    };
  } catch (error) {
    console.error('Error getting feature flags:', error);

    const errorResponse: ErrorResponse = {
      error: 'Failed to get feature flags',
      message: error instanceof Error ? error.message : 'Unknown error',
    };

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(errorResponse),
    };
  }
};

// Export the wrapped handler
export const handler = wrap(getFeatureFlagsHandler);
