@echo off
echo Deploying Lex Router Lambda...

REM Install dependencies
npm install

REM Package and deploy using SAM
cd deployment
sam build
sam deploy --guided

echo Deployment complete!