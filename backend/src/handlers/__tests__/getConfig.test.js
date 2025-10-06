const { handler } = require('../getConfig');

// Mock AWS SDK
jest.mock('@aws-sdk/client-appconfigdata', () => ({
  AppConfigDataClient: jest.fn(() => ({
    send: jest.fn()
  })),
  GetConfigurationCommand: jest.fn()
}));

describe('getConfig handler', () => {
  const mockSend = jest.fn();
  const { AppConfigDataClient, GetConfigurationCommand } = require('@aws-sdk/client-appconfigdata');
  
  beforeEach(() => {
    AppConfigDataClient.mockImplementation(() => ({
      send: mockSend
    }));
    jest.clearAllMocks();
  });

  it('should return country-specific configuration', async () => {
    const mockConfig = {
      US: {
        showTabs: true,
        showNavBar: true,
        theme: 'light'
      }
    };

    mockSend.mockResolvedValue({
      Content: Buffer.from(JSON.stringify(mockConfig))
    });

    const event = {
      pathParameters: { country: 'US' },
      headers: { 'x-user-id': 'test-user' }
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.country).toBe('US');
    expect(body.config).toEqual(mockConfig.US);
  });

  it('should handle missing country configuration', async () => {
    mockSend.mockResolvedValue({
      Content: Buffer.from(JSON.stringify({}))
    });

    const event = {
      pathParameters: { country: 'XX' },
      headers: { 'x-user-id': 'test-user' }
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.config).toEqual({});
  });

  it('should handle errors gracefully', async () => {
    mockSend.mockRejectedValue(new Error('AWS Error'));

    const event = {
      pathParameters: { country: 'US' },
      headers: { 'x-user-id': 'test-user' }
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Failed to fetch configuration');
  });
});