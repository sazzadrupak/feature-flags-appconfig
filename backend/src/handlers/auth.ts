import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UserInfo, ErrorResponse } from '../types';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.headers['x-user-id'] || event.headers['X-User-Id'];

    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'User ID required' }),
      };
    }

    const command = new GetItemCommand({
      TableName: process.env.USER_TABLE!,
      Key: {
        userId: { S: userId },
      },
    });

    const response = await client.send(command);

    if (!response.Item) {
      // Default user info if not found
      const defaultUser: UserInfo = {
        userId,
        role: 'user',
        permissions: ['read'],
        country: getCountryFromIP(
          event.requestContext.identity?.sourceIp || ''
        ),
      };

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(defaultUser),
      };
    }

    const userInfo: UserInfo = {
      userId,
      role: response.Item.role?.S || 'user',
      permissions: response.Item.permissions?.SS || ['read'],
      country:
        response.Item.country?.S ||
        getCountryFromIP(event.requestContext.identity?.sourceIp || ''),
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(userInfo),
    };
  } catch (error) {
    console.error('Error fetching user info:', error);

    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch user information',
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

function getCountryFromIP(ip: string): string {
  // Simplified country detection - in production, use a proper IP geolocation service
  const countryMap: Record<string, string> = {
    '127.0.0.1': 'US',
    localhost: 'US',
  };
  return countryMap[ip] || 'US';
}
