const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

// Intent to Lambda function mapping
const INTENT_ROUTES = {};

// Export for testing
module.exports.INTENT_ROUTES = INTENT_ROUTES;

exports.handler = async (event) => {
    try {
        const { currentIntent, sessionAttributes = {} } = event;
        const intentName = currentIntent.name;
        
        const targetLambda = INTENT_ROUTES[intentName];
        
        if (!targetLambda) {
            return buildLexResponse(sessionAttributes, 'Failed', 
                `Intent "${intentName}" not configured.`);
        }
        
        return await routeToFulfillmentLambda(targetLambda, event);
        
    } catch (error) {
        console.error('Router error:', error);
        return buildLexResponse({}, 'Failed', 
            'Sorry, there was an error processing your request.');
    }
};

async function routeToFulfillmentLambda(functionName, lexEvent) {
    try {
        const result = await lambda.invoke({
            FunctionName: functionName,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(lexEvent)
        }).promise();
        
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