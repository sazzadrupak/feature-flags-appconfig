// import { handler } from '../getConfig';
// import { APIGatewayProxyEvent } from 'aws-lambda';

// // Mock AWS SDK
// jest.mock('@aws-sdk/client-appconfigdata', () => ({
//   AppConfigDataClient: jest.fn(() => ({
//     send: jest.fn(),
//   })),
//   StartConfigurationSessionCommand: jest.fn(),
//   GetLatestConfigurationCommand: jest.fn(),
// }));

// describe('getConfig handler', () => {
//   let mockSend: jest.Mock;

//   beforeEach(() => {
//     // Set up environment variables
//     process.env.APPCONFIG_APPLICATION_ID = 'test-app-id';
//     process.env.APPCONFIG_ENVIRONMENT_ID = 'test-env-id';

//     mockSend = jest.fn();

//     // Reset module and mock the client
//     jest.resetModules();
//     jest.doMock('@aws-sdk/client-appconfigdata', () => ({
//       AppConfigDataClient: jest.fn().mockImplementation(() => ({
//         send: mockSend,
//       })),
//       StartConfigurationSessionCommand: jest.fn(),
//       GetLatestConfigurationCommand: jest.fn(),
//     }));
//   });

//   it('should return country-specific configuration', async () => {
//     const mockConfig = {
//       US: {
//         showTabs: true,
//         showNavBar: true,
//         theme: 'light',
//       },
//     };

//     // Mock session response first, then configuration response
//     mockSend
//       .mockResolvedValueOnce({
//         InitialConfigurationToken: 'mock-token',
//       })
//       .mockResolvedValueOnce({
//         Configuration: new TextEncoder().encode(JSON.stringify(mockConfig)),
//       });

//     const event: Partial<APIGatewayProxyEvent> = {
//       pathParameters: { country: 'US' },
//       headers: { 'x-user-id': 'test-user' },
//     };

//     const result = await handler(event as APIGatewayProxyEvent);

//     expect(mockSend).toHaveBeenCalledTimes(2);
//     expect(result.statusCode).toBe(200);
//     const body = JSON.parse(result.body);
//     expect(body.country).toBe('US');
//     expect(body.config).toEqual(mockConfig.US);
//   });

//   it('should handle missing country configuration', async () => {
//     mockSend
//       .mockResolvedValueOnce({
//         InitialConfigurationToken: 'mock-token',
//       })
//       .mockResolvedValueOnce({
//         Configuration: new TextEncoder().encode(JSON.stringify({})),
//       });

//     const event: Partial<APIGatewayProxyEvent> = {
//       pathParameters: { country: 'XX' },
//       headers: { 'x-user-id': 'test-user' },
//     };

//     const result = await handler(event as APIGatewayProxyEvent);

//     expect(result.statusCode).toBe(200);
//     const body = JSON.parse(result.body);
//     expect(body.config).toEqual({});
//   });

//   it('should handle missing country parameter', async () => {
//     const event: Partial<APIGatewayProxyEvent> = {
//       pathParameters: null,
//       headers: { 'x-user-id': 'test-user' },
//     };

//     const result = await handler(event as APIGatewayProxyEvent);

//     expect(result.statusCode).toBe(400);
//     const body = JSON.parse(result.body);
//     expect(body.error).toBe('Country parameter is required');
//   });

//   it('should handle errors gracefully', async () => {
//     mockSend.mockRejectedValue(new Error('AWS Error'));

//     const event: Partial<APIGatewayProxyEvent> = {
//       pathParameters: { country: 'US' },
//       headers: { 'x-user-id': 'test-user' },
//     };

//     const result = await handler(event as APIGatewayProxyEvent);

//     expect(result.statusCode).toBe(500);
//     const body = JSON.parse(result.body);
//     expect(body.error).toBe('Failed to fetch configuration');
//   });
// });
