# azure-aws-serverless-express

Wrapper library to use aws-serverless-express with Azure Functions

## Installation

```sh
npm install azure-aws-serverless-express --save
```

## Usage

```javascript
import express from 'express';
import azureFunctionHandler from 'azure-aws-serverless-express';

const app = express();

app.get('/hello-world/', (req, res) => res.send('Hello World!'));

module.exports = azureFunctionHandler(app);
```

```
$ curl http://localhost:7071/api/hello-world/
Hello World!
```

## Todo

Check for more content-type edge cases
Tests
