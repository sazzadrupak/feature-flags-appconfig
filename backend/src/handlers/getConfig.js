const { AppConfigDataClient, GetConfigurationCommand } = require('@aws-sdk/client-appconfigdata');

const client = new AppConfigDataClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
    const { country } = event.pathParameters;
    const userId = event.headers['x-user-id'] || 'anonymous';
    
    const command = new GetConfigurationCommand({
      Application: process.env.APPCONFIG_APPLICATION_ID,
      Environment: process.env.APPCONFIG_ENVIRONMENT_ID,
      Configuration: 'country-ui-config',
      ClientId: `${userId}-${country}`
    });

    const response = await client.send(command);
    const configData = JSON.parse(response.Content.toString());
    
    // Filter config based on country
    const countryConfig = configData[country] || {};

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        country,
        config: countryConfig
      })
    };
  } catch (error) {
    console.error('Error fetching config:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to fetch configuration',
        message: error.message
      })
    };
  }
};