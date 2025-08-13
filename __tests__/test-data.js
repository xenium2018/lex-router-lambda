// Test event payloads for manual testing
const testEvents = {
  bookingIntent: {
    currentIntent: {
      name: 'BookAppointment',
      slots: {
        Service: 'haircut',
        Date: '2024-01-15',
        Time: '14:00'
      }
    },
    sessionAttributes: {},
    inputTranscript: 'Book a haircut for January 15th at 2pm'
  },

  webBookingIntent: {
    currentIntent: {
      name: 'BookAppointment',
      slots: {
        Service: 'massage',
        Date: '2024-01-20',
        Time: '10:00'
      }
    },
    sessionAttributes: {},
    requestAttributes: { channel: 'web' },
    inputTranscript: 'Book a massage via web'
  },

  mobileBookingIntent: {
    currentIntent: {
      name: 'BookAppointment',
      slots: {
        Service: 'consultation',
        Date: '2024-01-25',
        Time: '16:00'
      }
    },
    sessionAttributes: { channel: 'mobile' },
    inputTranscript: 'Book consultation via mobile app'
  },

  statusIntent: {
    currentIntent: {
      name: 'CheckStatus',
      slots: {
        BookingId: 'BK1234567890'
      }
    },
    sessionAttributes: {},
    inputTranscript: 'Check status of booking BK1234567890'
  },

  incompleteBooking: {
    currentIntent: {
      name: 'BookAppointment',
      slots: {
        Service: 'massage'
        // Missing Date and Time
      }
    },
    sessionAttributes: {},
    inputTranscript: 'Book a massage'
  },

  unknownIntent: {
    currentIntent: {
      name: 'WeatherIntent',
      slots: {}
    },
    sessionAttributes: {},
    inputTranscript: 'What is the weather today'
  }
};

module.exports = testEvents;