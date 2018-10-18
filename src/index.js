import awsServerlessExpress from 'aws-serverless-express';
import url from 'url';

export default function azureFunctionHandler(app) {
  const server = awsServerlessExpress.createServer(app, undefined, ['*/*']);

  return (context, req) => {
    const path = url.parse(req.originalUrl).pathname.replace('/api', '');

    // Azure automatically converts body to a JSON object if the content-type is application/json,
    // since aws-serverless-express expects a raw object we convert it back to string before proxying it
    if (req.headers['content-type'] === 'application/json')
      req.body = JSON.stringify(req.body);

    const event = {
      path: path,
      httpMethod: req.method,
      headers: req.headers || {},
      queryStringParameters: req.query || {},
      body: req.body,
      isBase64Encoded: false
    };

    const awsContext = {
      succeed(awsResponse) {
        // Copy values over.
        context.res.status = awsResponse.statusCode;
        context.res.body = Buffer.from(
          awsResponse.body,
          awsResponse.isBase64Encoded ? 'base64' : 'utf8'
        );
        context.res.isRaw = true;

        context.res.headers = {
          ...context.res.headers,
          ...awsResponse.headers
        };
      }
    };
    awsServerlessExpress.proxy(server, event, awsContext);
  };
}
