const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');

// Mock AWS before requiring the handler
AWSMock.setSDKInstance(AWS);

const { handler } = require('../index');

describe('Lex Router Lambda', () => {
  beforeEach(() => {
    AWSMock.restore('Lambda');
    process.env.BOOKING_LAMBDA = 'booking-test-lambda';
    process.env.STATUS_LAMBDA = 'status-test-lambda';
  });

  afterEach(() => {
    AWSMock.restore();
  });

  describe('Channel-based Intent Routing', () => {
    test('should route to web lambda when channel is web', async () => {
      process.env.WEB_BOOKING_LAMBDA = 'web-booking-test-lambda';
      
      const mockResponse = {
        sessionAttributes: {},
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Fulfilled',
          message: { contentType: 'PlainText', content: 'Web booking confirmed' }
        }
      };

      AWSMock.mock('Lambda', 'invoke', (params, callback) => {
        expect(params.FunctionName).toBe('web-booking-test-lambda');
        callback(null, {
          StatusCode: 200,
          Payload: JSON.stringify(mockResponse)
        });
      });

      const event = {
        currentIntent: { name: 'BookAppointment', slots: {} },
        sessionAttributes: {},
        requestAttributes: { channel: 'web' },
        inputTranscript: 'Book appointment'
      };

      const result = await handler(event);
      expect(result).toEqual(mockResponse);
    });

    test('should route to mobile lambda when channel is mobile', async () => {
      process.env.MOBILE_BOOKING_LAMBDA = 'mobile-booking-test-lambda';
      
      const mockResponse = {
        sessionAttributes: {},
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Fulfilled',
          message: { contentType: 'PlainText', content: 'Mobile booking confirmed' }
        }
      };

      AWSMock.mock('Lambda', 'invoke', (params, callback) => {
        expect(params.FunctionName).toBe('mobile-booking-test-lambda');
        callback(null, {
          StatusCode: 200,
          Payload: JSON.stringify(mockResponse)
        });
      });

      const event = {
        currentIntent: { name: 'BookAppointment', slots: {} },
        sessionAttributes: { channel: 'mobile' },
        inputTranscript: 'Book appointment'
      };

      const result = await handler(event);
      expect(result).toEqual(mockResponse);
    });

    test('should route to default lambda when no channel specified', async () => {
      const mockResponse = {
        sessionAttributes: {},
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Fulfilled',
          message: { contentType: 'PlainText', content: 'Default booking confirmed' }
        }
      };

      AWSMock.mock('Lambda', 'invoke', (params, callback) => {
        expect(params.FunctionName).toBe('booking-test-lambda');
        callback(null, {
          StatusCode: 200,
          Payload: JSON.stringify(mockResponse)
        });
      });

      const event = {
        currentIntent: { name: 'BookAppointment', slots: {} },
        sessionAttributes: {},
        inputTranscript: 'Book appointment'
      };

      const result = await handler(event);
      expect(result).toEqual(mockResponse);
    });

    test('should route CheckStatus intent to status lambda', async () => {
      const mockResponse = {
        sessionAttributes: {},
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Fulfilled',
          message: { contentType: 'PlainText', content: 'Status retrieved' }
        }
      };

      AWSMock.mock('Lambda', 'invoke', (params, callback) => {
        expect(params.FunctionName).toBe('status-test-lambda');
        callback(null, {
          StatusCode: 200,
          Payload: JSON.stringify(mockResponse)
        });
      });

      const event = {
        currentIntent: { name: 'CheckStatus', slots: {} },
        sessionAttributes: {},
        inputTranscript: 'Check status'
      };

      const result = await handler(event);
      expect(result).toEqual(mockResponse);
    });

    test('should handle unknown intent gracefully', async () => {
      const event = {
        currentIntent: { name: 'UnknownIntent', slots: {} },
        sessionAttributes: {},
        inputTranscript: 'Unknown request'
      };

      const result = await handler(event);
      
      expect(result.dialogAction.fulfillmentState).toBe('Failed');
      expect(result.dialogAction.message.content).toContain('UnknownIntent');
    });
  });

  describe('Error Handling', () => {
    test('should handle lambda invocation failure', async () => {
      AWSMock.mock('Lambda', 'invoke', (params, callback) => {
        callback(new Error('Lambda invocation failed'));
      });

      const event = {
        currentIntent: { name: 'BookAppointment', slots: {} },
        sessionAttributes: {},
        inputTranscript: 'Book appointment'
      };

      const result = await handler(event);
      
      expect(result.dialogAction.fulfillmentState).toBe('Failed');
      expect(result.dialogAction.message.content).toBe('The requested service is currently unavailable.');
    });

    test('should handle non-200 status code from lambda', async () => {
      AWSMock.mock('Lambda', 'invoke', (params, callback) => {
        callback(null, { StatusCode: 500 });
      });

      const event = {
        currentIntent: { name: 'BookAppointment', slots: {} },
        sessionAttributes: {},
        inputTranscript: 'Book appointment'
      };

      const result = await handler(event);
      
      expect(result.dialogAction.fulfillmentState).toBe('Failed');
      expect(result.dialogAction.message.content).toBe('The requested service is currently unavailable.');
    });

    test('should handle malformed event', async () => {
      const event = {}; // Missing required properties

      const result = await handler(event);
      
      expect(result.dialogAction.fulfillmentState).toBe('Failed');
      expect(result.dialogAction.message.content).toBe('Sorry, there was an error processing your request.');
    });
  });

  describe('Session Attributes', () => {
    test('should preserve session attributes', async () => {
      const mockResponse = {
        sessionAttributes: { userId: '123', step: 'confirmation' },
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Fulfilled',
          message: { contentType: 'PlainText', content: 'Success' }
        }
      };

      AWSMock.mock('Lambda', 'invoke', (params, callback) => {
        callback(null, {
          StatusCode: 200,
          Payload: JSON.stringify(mockResponse)
        });
      });

      const event = {
        currentIntent: { name: 'BookAppointment', slots: {} },
        sessionAttributes: { userId: '123' },
        inputTranscript: 'Book appointment'
      };

      const result = await handler(event);
      expect(result.sessionAttributes).toEqual({ userId: '123', step: 'confirmation' });
    });
  });
});