exports.handler = async (event) => {
    console.log('Booking Lambda received:', JSON.stringify(event, null, 2));
    
    const { currentIntent, sessionAttributes = {} } = event;
    const slots = currentIntent.slots;
    
    // Extract slot values
    const service = slots.Service;
    const date = slots.Date;
    const time = slots.Time;
    
    // Validate required slots
    if (!service || !date || !time) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitSlot',
                message: {
                    contentType: 'PlainText',
                    content: 'Please provide the service, date, and time for your appointment.'
                },
                intentName: currentIntent.name,
                slots,
                slotToElicit: !service ? 'Service' : !date ? 'Date' : 'Time'
            }
        };
    }
    
    // Process booking
    const bookingId = 'BK' + Date.now();
    
    return {
        sessionAttributes: { ...sessionAttributes, bookingId },
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message: {
                contentType: 'PlainText',
                content: `Your ${service} appointment is booked for ${date} at ${time}. Booking ID: ${bookingId}`
            }
        }
    };
};