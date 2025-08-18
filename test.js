// Mock AWS SDK before requiring the handler
jest.mock('aws-sdk', () => {
  const mockInvoke = jest.fn();
  return {
    Lambda: jest.fn(() => ({
      invoke: mockInvoke
    })),
    __mockInvoke: mockInvoke
  };
});

const AWS = require('aws-sdk');
const { handler, INTENT_ROUTES } = require('./index');

describe('Lex Router', () => {
  beforeEach(() => {
    // Clear previous mocks
    AWS.__mockInvoke.mockClear();
    
    // Set up test route
    INTENT_ROUTES.TestIntent = 'test-lambda';
  });

  test('routes intent to configured lambda', async () => {
    const mockResponse = { dialogAction: { type: 'Close' } };
    
    AWS.__mockInvoke.mockReturnValue({
      promise: () => Promise.resolve({
        StatusCode: 200,
        Payload: JSON.stringify(mockResponse)
      })
    });

    const event = { currentIntent: { name: 'TestIntent' } };
    const result = await handler(event);
    
    expect(AWS.__mockInvoke).toHaveBeenCalledWith({
      FunctionName: 'test-lambda',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(event)
    });
    expect(result).toEqual(mockResponse);
  });

  test('handles unknown intent', async () => {
    delete INTENT_ROUTES.TestIntent;
    
    const event = { currentIntent: { name: 'UnknownIntent' } };
    const result = await handler(event);
    
    expect(result.dialogAction.fulfillmentState).toBe('Failed');
    expect(result.dialogAction.message.content).toContain('not configured');
  });

  test('handles lambda invocation error', async () => {
    AWS.__mockInvoke.mockReturnValue({
      promise: () => Promise.reject(new Error('Lambda error'))
    });

    const event = { currentIntent: { name: 'TestIntent' } };
    const result = await handler(event);
    
    expect(result.dialogAction.fulfillmentState).toBe('Failed');
    expect(result.dialogAction.message.content).toBe('The requested service is currently unavailable.');
  });
});