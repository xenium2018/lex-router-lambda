# Lex Router Lambda

A router lambda that connects to AWS Lex and routes intents to specific fulfillment lambdas.

## Architecture

```
Lex Bot → Router Lambda → Fulfillment Lambdas
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure intent routing:**
   Edit the `INTENT_ROUTES` object in `index.js` to map your intents to lambda functions.

3. **Deploy:**
   ```bash
   deploy.bat
   ```

## Lex Bot Configuration

1. Create a Lex bot in AWS Console
2. Set the fulfillment Lambda to your deployed router function ARN
3. Configure intents that match your `INTENT_ROUTES` mapping

## Environment Variables

- `BOOKING_LAMBDA`: Name of booking fulfillment lambda
- `STATUS_LAMBDA`: Name of status check lambda  
- `CANCEL_LAMBDA`: Name of cancellation lambda
- `INFO_LAMBDA`: Name of info retrieval lambda

## Intent Routing

The router supports these intents by default:
- `BookAppointment` → booking-fulfillment-lambda
- `CheckStatus` → status-check-lambda
- `CancelOrder` → cancel-order-lambda
- `GetInfo` → info-retrieval-lambda

## Testing

Use the Lex console to test your bot, or invoke the lambda directly with a Lex event payload.