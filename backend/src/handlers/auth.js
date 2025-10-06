const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
    const userId = event.headers['x-user-id'];
    
    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'User ID required' })
      };
    }

    const command = new GetItemCommand({
      TableName: process.env.USER_TABLE,
      Key: {
        userId: { S: userId }
      }
    });

    const response = await client.send(command);
    
    if (!response.Item) {
      // Default user info if not found
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          userId,
          role: 'user',
          country: getCountryFromIP(event.requestContext.identity.sourceIp)
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        userId,
        role: response.Item.role?.S || 'user',
        country: response.Item.country?.S || getCountryFromIP(event.requestContext.identity.sourceIp)
      })
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to fetch user information',
        message: error.message
      })
    };
  }
};

function getCountryFromIP(ip) {
  // Simplified country detection - in production, use a proper IP geolocation service
  const countryMap = {
    '127.0.0.1': 'US',
    'localhost': 'US'
  };
  return countryMap[ip] || 'US';
}