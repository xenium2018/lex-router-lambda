const { handler } = require('../fulfillment-examples/booking-lambda');

describe('Booking Lambda', () => {
  describe('Slot Validation', () => {
    test('should elicit Service slot when missing', async () => {
      const event = {
        currentIntent: {
          name: 'BookAppointment',
          slots: { Date: '2024-01-15', Time: '14:00' }
        },
        sessionAttributes: {}
      };

      const result = await handler(event);
      
      expect(result.dialogAction.type).toBe('ElicitSlot');
      expect(result.dialogAction.slotToElicit).toBe('Service');
      expect(result.dialogAction.message.content).toContain('service');
    });

    test('should elicit Date slot when missing', async () => {
      const event = {
        currentIntent: {
          name: 'BookAppointment',
          slots: { Service: 'haircut', Time: '14:00' }
        },
        sessionAttributes: {}
      };

      const result = await handler(event);
      
      expect(result.dialogAction.type).toBe('ElicitSlot');
      expect(result.dialogAction.slotToElicit).toBe('Date');
    });

    test('should elicit Time slot when missing', async () => {
      const event = {
        currentIntent: {
          name: 'BookAppointment',
          slots: { Service: 'haircut', Date: '2024-01-15' }
        },
        sessionAttributes: {}
      };

      const result = await handler(event);
      
      expect(result.dialogAction.type).toBe('ElicitSlot');
      expect(result.dialogAction.slotToElicit).toBe('Time');
    });
  });

  describe('Successful Booking', () => {
    test('should create booking when all slots provided', async () => {
      const event = {
        currentIntent: {
          name: 'BookAppointment',
          slots: {
            Service: 'haircut',
            Date: '2024-01-15',
            Time: '14:00'
          }
        },
        sessionAttributes: {}
      };

      const result = await handler(event);
      
      expect(result.dialogAction.type).toBe('Close');
      expect(result.dialogAction.fulfillmentState).toBe('Fulfilled');
      expect(result.dialogAction.message.content).toContain('haircut');
      expect(result.dialogAction.message.content).toContain('2024-01-15');
      expect(result.dialogAction.message.content).toContain('14:00');
      expect(result.sessionAttributes.bookingId).toMatch(/^BK\d+$/);
    });

    test('should preserve existing session attributes', async () => {
      const event = {
        currentIntent: {
          name: 'BookAppointment',
          slots: {
            Service: 'massage',
            Date: '2024-01-20',
            Time: '10:00'
          }
        },
        sessionAttributes: { userId: 'user123', preference: 'morning' }
      };

      const result = await handler(event);
      
      expect(result.sessionAttributes.userId).toBe('user123');
      expect(result.sessionAttributes.preference).toBe('morning');
      expect(result.sessionAttributes.bookingId).toBeDefined();
    });
  });

  describe('Booking ID Generation', () => {
    test('should generate unique booking IDs', async () => {
      const event = {
        currentIntent: {
          name: 'BookAppointment',
          slots: {
            Service: 'consultation',
            Date: '2024-01-25',
            Time: '16:00'
          }
        },
        sessionAttributes: {}
      };

      const result1 = await handler(event);
      const result2 = await handler(event);
      
      expect(result1.sessionAttributes.bookingId).not.toBe(result2.sessionAttributes.bookingId);
      expect(result1.sessionAttributes.bookingId).toMatch(/^BK\d+$/);
      expect(result2.sessionAttributes.bookingId).toMatch(/^BK\d+$/);
    });
  });
});