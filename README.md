# azure-aws-serverless-express

Wrapper library to use aws-serverless-express with Azure Functions

This library is basically a refactor of the code from @pulumi (https://github.com/pulumi/pulumi-cloud/blob/master/azure/httpServer.ts) in a ready to use library

## Installation

```sh
npm install azure-aws-serverless-express --save
```

## Usage

```typescript
import express from 'express';
import { azureFunctionHandler } from 'azure-aws-serverless-express';

const app = express();

app.get('/hello-world/', (req, res) => res.send('Hello World!'));

module.exports = azureFunctionHandler(app);
```
