import {
  AppConfigClient,
  CreateHostedConfigurationVersionCommand,
  StartDeploymentCommand,
} from '@aws-sdk/client-appconfig';
import {
  AppConfigDataClient,
  StartConfigurationSessionCommand,
  GetLatestConfigurationCommand,
} from '@aws-sdk/client-appconfigdata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  FeatureFlagsConfig,
  UpdateFeatureFlagsRequest,
  ErrorResponse,
} from '../types';

const appConfigClient = new AppConfigClient({ region: process.env.AWS_REGION });
const appConfigDataClient = new AppConfigDataClient({
  region: process.env.AWS_REGION,
});

export const handler = async (
  event: APIGatewayProxyEvent
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

    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Request body is required',
        }),
      };
    }

    const requestBody: UpdateFeatureFlagsRequest = JSON.parse(event.body);

    // Get current configuration
    const sessionCommand = new StartConfigurationSessionCommand({
      ApplicationIdentifier: process.env.APPLICATION_ID!,
      EnvironmentIdentifier: process.env.ENVIRONMENT_ID!,
      ConfigurationProfileIdentifier: process.env.CONFIGURATION_PROFILE_ID!,
      RequiredMinimumPollIntervalInSeconds: 15,
    });

    const sessionResponse = await appConfigDataClient.send(sessionCommand);

    if (!sessionResponse.InitialConfigurationToken) {
      throw new Error('Failed to start configuration session');
    }

    const getCurrentCommand = new GetLatestConfigurationCommand({
      ConfigurationToken: sessionResponse.InitialConfigurationToken,
    });

    const currentResponse = await appConfigDataClient.send(getCurrentCommand);

    if (!currentResponse.Configuration) {
      throw new Error('No configuration content received');
    }

    const configString = new TextDecoder().decode(
      currentResponse.Configuration
    );
    const currentConfig: FeatureFlagsConfig = JSON.parse(configString);

    // Update country-specific flags
    if (!currentConfig.flags) {
      currentConfig.flags = {};
    }
    if (!currentConfig.values) {
      currentConfig.values = {};
    }

    currentConfig.flags[country] = requestBody;
    currentConfig.values[country] = requestBody;
    currentConfig.version = (parseInt(currentConfig.version) + 1).toString();

    // Create new configuration version
    const createVersionCommand = new CreateHostedConfigurationVersionCommand({
      ApplicationId: process.env.APPLICATION_ID!,
      ConfigurationProfileId: process.env.CONFIGURATION_PROFILE_ID!,
      Content: JSON.stringify(currentConfig),
      ContentType: 'application/json',
    });

    const versionResponse = await appConfigClient.send(createVersionCommand);

    if (!versionResponse.VersionNumber) {
      throw new Error('Failed to create configuration version');
    }

    // Deploy the new version
    const deployCommand = new StartDeploymentCommand({
      ApplicationId: process.env.APPLICATION_ID!,
      EnvironmentId: process.env.ENVIRONMENT_ID!,
      ConfigurationProfileId: process.env.CONFIGURATION_PROFILE_ID!,
      ConfigurationVersion: versionResponse.VersionNumber.toString(),
      DeploymentStrategyId: process.env.DEPLOYMENT_STRATEGY_ID!,
    });

    await appConfigClient.send(deployCommand);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Feature flags updated successfully',
        country,
        version: versionResponse.VersionNumber,
      }),
    };
  } catch (error) {
    console.error('Error updating feature flags:', error);

    const errorResponse: ErrorResponse = {
      error: 'Failed to update feature flags',
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
