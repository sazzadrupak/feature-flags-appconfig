const { AppConfigDataClient, GetConfigurationCommand } = require('@aws-sdk/client-appconfigdata');

const client = new AppConfigDataClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
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

    const command = new GetConfigurationCommand({
      Application: process.env.APPCONFIG_APPLICATION_ID,
      Environment: process.env.APPCONFIG_ENVIRONMENT_ID,
      Configuration: 'country-ui-config',
      ClientId: 'admin-client'
    });

    const response = await client.send(command);
    const configData = JSON.parse(response.Content.toString());

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        configs: configData
      })
    };
  } catch (error) {
    console.error('Error fetching all configs:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to fetch configurations',
        message: error.message
      })
    };
  }
};