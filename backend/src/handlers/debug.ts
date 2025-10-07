/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as fs from 'fs';

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Debug handler invoked');

  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env,
    layerPaths: [],
    availableModules: [],
  };

  // Check if we can access layer modules
  try {
    // Check common Node.js module paths
    const modulePaths = [
      '/var/task/node_modules',
      '/opt/nodejs/node_modules',
      '/opt/node_modules',
      '/var/runtime/node_modules',
    ];

    // Also check if layer directory exists
    const layerPaths = ['/opt', '/opt/nodejs'];
    for (const layerPath of layerPaths) {
      try {
        if (fs.existsSync(layerPath)) {
          debugInfo.layerPaths.push({
            path: layerPath,
            exists: true,
            contents: fs.readdirSync(layerPath),
          });
        }
      } catch (error) {
        debugInfo.layerPaths.push({
          path: layerPath,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    for (const modulePath of modulePaths) {
      try {
        if (fs.existsSync(modulePath)) {
          debugInfo.layerPaths.push({
            path: modulePath,
            exists: true,
            contents: fs.readdirSync(modulePath).slice(0, 10), // First 10 items
          });
        } else {
          debugInfo.layerPaths.push({
            path: modulePath,
            exists: false,
          });
        }
      } catch (error) {
        debugInfo.layerPaths.push({
          path: modulePath,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Try to require some modules
    const testModules = [
      '@aws-lambda-powertools/logger',
      '@aws-lambda-powertools/metrics',
      '@aws-sdk/client-appconfig',
    ];

    for (const moduleName of testModules) {
      try {
        require.resolve(moduleName);
        debugInfo.availableModules.push({
          module: moduleName,
          available: true,
        });
      } catch (error) {
        debugInfo.availableModules.push({
          module: moduleName,
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  } catch (error) {
    debugInfo.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(debugInfo, null, 2),
  };
};
