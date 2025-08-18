const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const { handler } = require('./index');

AWSMock.setSDKInstance(AWS);

describe('Lex Router', () => {
  beforeEach(() => {
    AWSMock.restore('Lambda');
    // Set up test route
    const router = require('./index');
    router.INTENT_ROUTES = { TestIntent: 'test-lambda' };
  });

  afterEach(() => {
    AWSMock.restore();
  });

  test('routes intent to configured lambda', async () => {
    const mockResponse = { dialogAction: { type: 'Close' } };
    
    AWSMock.mock('Lambda', 'invoke', (params, callback) => {
      expect(params.FunctionName).toBe('test-lambda');
      callback(null, { StatusCode: 200, Payload: JSON.stringify(mockResponse) });
    });

    const event = { currentIntent: { name: 'TestIntent' } };
    const result = await handler(event);
    
    expect(result).toEqual(mockResponse);
  });

  test('handles unknown intent', async () => {
    const event = { currentIntent: { name: 'UnknownIntent' } };
    const result = await handler(event);
    
    expect(result.dialogAction.fulfillmentState).toBe('Failed');
    expect(result.dialogAction.message.content).toContain('not configured');
  });

  test('handles lambda invocation error', async () => {
    AWSMock.mock('Lambda', 'invoke', (params, callback) => {
      callback(new Error('Lambda error'));
    });

    const event = { currentIntent: { name: 'TestIntent' } };
    const result = await handler(event);
    
    expect(result.dialogAction.fulfillmentState).toBe('Failed');
    expect(result.dialogAction.message.content).toBe('The requested service is currently unavailable.');
  });
});