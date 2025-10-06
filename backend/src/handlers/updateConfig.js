const { AppConfigClient, CreateHostedConfigurationVersionCommand, StartDeploymentCommand } = require('@aws-sdk/client-appconfig');

const client = new AppConfigClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
    const { country } = event.pathParameters;
    const { config } = JSON.parse(event.body);
    const userRole = event.headers['x-user-role'];
    
    // Check admin permission
    if (userRole !== 'admin') {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Admin access required' })
      };
    }

    // Get current configuration
    const currentConfig = await getCurrentConfig();
    
    // Update country-specific config
    const updatedConfig = {
      ...currentConfig,
      [country]: config
    };

    // Create new configuration version
    const createVersionCommand = new CreateHostedConfigurationVersionCommand({
      ApplicationId: process.env.APPCONFIG_APPLICATION_ID,
      ConfigurationProfileId: 'country-ui-config',
      Content: JSON.stringify(updatedConfig),
      ContentType: 'application/json'
    });

    const versionResponse = await client.send(createVersionCommand);

    // Deploy the new version
    const deployCommand = new StartDeploymentCommand({
      ApplicationId: process.env.APPCONFIG_APPLICATION_ID,
      EnvironmentId: process.env.APPCONFIG_ENVIRONMENT_ID,
      ConfigurationProfileId: 'country-ui-config',
      ConfigurationVersion: versionResponse.VersionNumber.toString(),
      DeploymentStrategyId: 'immediate-deployment'
    });

    await client.send(deployCommand);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Configuration updated successfully',
        country,
        version: versionResponse.VersionNumber
      })
    };
  } catch (error) {
    console.error('Error updating config:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to update configuration',
        message: error.message
      })
    };
  }
};

async function getCurrentConfig() {
  // Implementation to get current config from AppConfig
  // This is a simplified version - in production, you'd fetch the actual current config
  return {};
}