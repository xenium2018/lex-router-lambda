exports.handler = async (event) => {
    console.log('Status Lambda received:', JSON.stringify(event, null, 2));
    
    const { currentIntent, sessionAttributes = {} } = event;
    const slots = currentIntent.slots;
    const orderId = slots.OrderId;
    
    if (!orderId) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'ElicitSlot',
                message: {
                    contentType: 'PlainText',
                    content: 'Please provide your order ID to check status.'
                },
                intentName: currentIntent.name,
                slots,
                slotToElicit: 'OrderId'
            }
        };
    }
    
    // Mock status check
    const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message: {
                contentType: 'PlainText',
                content: `Your order ${orderId} status is: ${status}`
            }
        }
    };
};