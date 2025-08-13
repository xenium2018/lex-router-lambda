const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

// Intent to Lambda function mapping
const INTENT_ROUTES = {
    'BookAppointment': process.env.BOOKING_LAMBDA || 'booking-fulfillment-lambda',
    'CheckStatus': process.env.STATUS_LAMBDA || 'status-check-lambda',
    'CancelOrder': process.env.CANCEL_LAMBDA || 'cancel-order-lambda',
    'GetInfo': process.env.INFO_LAMBDA || 'info-retrieval-lambda'
};

exports.handler = async (event) => {
    console.log('Router Lambda received:', JSON.stringify(event, null, 2));
    
    try {
        const { currentIntent, sessionAttributes = {}, inputTranscript } = event;
        const intentName = currentIntent.name;
        
        // Get target lambda for this intent
        const targetLambda = INTENT_ROUTES[intentName];
        
        if (!targetLambda) {
            return buildLexResponse(sessionAttributes, 'Failed', 
                `I don't know how to handle "${intentName}" intent.`);
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