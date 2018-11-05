# azure-aws-serverless-express

Wrapper library to use aws-serverless-express with Azure Functions

## Installation

```sh
npm install azure-aws-serverless-express --save
```

## Usage

```javascript
const express = require('express');
const azureFunctionHandler = require('azure-aws-serverless-express');

const app = express();

app.get('/api/hello-world/', (req, res) => res.send('Hello World!'));

module.exports = azureFunctionHandler(app);
```

```
$ curl http://localhost:7071/api/hello-world/
Hello World!
```

## Todo

Tests
