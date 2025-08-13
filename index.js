const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

// Channel-based Intent to Lambda function mapping
const CHANNEL_ROUTES = {
    'web': {
        'BookAppointment': process.env.WEB_BOOKING_LAMBDA || 'web-booking-lambda',
        'CheckStatus': process.env.WEB_STATUS_LAMBDA || 'web-status-lambda',
        'CancelOrder': process.env.WEB_CANCEL_LAMBDA || 'web-cancel-lambda',
        'GetInfo': process.env.WEB_INFO_LAMBDA || 'web-info-lambda'
    },
    'mobile': {
        'BookAppointment': process.env.MOBILE_BOOKING_LAMBDA || 'mobile-booking-lambda',
        'CheckStatus': process.env.MOBILE_STATUS_LAMBDA || 'mobile-status-lambda',
        'CancelOrder': process.env.MOBILE_CANCEL_LAMBDA || 'mobile-cancel-lambda',
        'GetInfo': process.env.MOBILE_INFO_LAMBDA || 'mobile-info-lambda'
    },
    'voice': {
        'BookAppointment': process.env.VOICE_BOOKING_LAMBDA || 'voice-booking-lambda',
        'CheckStatus': process.env.VOICE_STATUS_LAMBDA || 'voice-status-lambda',
        'CancelOrder': process.env.VOICE_CANCEL_LAMBDA || 'voice-cancel-lambda',
        'GetInfo': process.env.VOICE_INFO_LAMBDA || 'voice-info-lambda'
    },
    'default': {
        'BookAppointment': process.env.BOOKING_LAMBDA || 'booking-fulfillment-lambda',
        'CheckStatus': process.env.STATUS_LAMBDA || 'status-check-lambda',
        'CancelOrder': process.env.CANCEL_LAMBDA || 'cancel-order-lambda',
        'GetInfo': process.env.INFO_LAMBDA || 'info-retrieval-lambda'
    }
};

exports.handler = async (event) => {
    console.log('Router Lambda received:', JSON.stringify(event, null, 2));
    
    try {
        const { currentIntent, sessionAttributes = {}, inputTranscript, requestAttributes = {} } = event;
        const intentName = currentIntent.name;
        const channel = getChannel(event);
        
        // Get target lambda for this intent and channel
        const targetLambda = getTargetLambda(intentName, channel);
        
        if (!targetLambda) {
            return buildLexResponse(sessionAttributes, 'Failed', 
                `I don't know how to handle "${intentName}" intent for ${channel} channel.`);
        }
        
        // Route to fulfillment lambda
        const response = await routeToFulfillmentLambda(targetLambda, event);
        return response;
        
    } catch (error) {
        console.error('Router error:', error);
        return buildLexResponse({}, 'Failed', 
            'Sorry, there was an error processing your request.');
    }
};

async function routeToFulfillmentLambda(functionName, lexEvent) {
    const params = {
        FunctionName: functionName,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(lexEvent)
    };
    
    try {
        const result = await lambda.invoke(params).promise();
        
        if (result.StatusCode !== 200) {
            throw new Error(`Lambda returned status: ${result.StatusCode}`);
        }
        
        return JSON.parse(result.Payload);
        
    } catch (error) {
        console.error(`Error calling ${functionName}:`, error);
        return buildLexResponse({}, 'Failed', 
            'The requested service is currently unavailable.');
    }
}

function getChannel(event) {
    // Check request attributes for channel info
    const { requestAttributes = {} } = event;
    if (requestAttributes.channel) {
        return requestAttributes.channel.toLowerCase();
    }
    
    // Check session attributes for channel info
    const { sessionAttributes = {} } = event;
    if (sessionAttributes.channel) {
        return sessionAttributes.channel.toLowerCase();
    }
    
    // Default channel
    return 'default';
}

function getTargetLambda(intentName, channel) {
    const channelRoutes = CHANNEL_ROUTES[channel] || CHANNEL_ROUTES['default'];
    return channelRoutes[intentName];
}

function buildLexResponse(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message: {
                contentType: 'PlainText',
                content: message
            }
        }
    };
}