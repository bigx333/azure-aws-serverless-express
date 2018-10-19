import awsServerlessExpress from 'aws-serverless-express';
import url from 'url';

export default function azureFunctionHandler(app) {
  const server = awsServerlessExpress.createServer(app, undefined, ['*/*']);

  return (context, req) => {
    const path = url.parse(req.originalUrl).pathname;

    const event = {
      path: path,
      httpMethod: req.method,
      headers: req.headers || {},
      queryStringParameters: req.query || {},
      // Azure automatically converts body to a JSON object if the content-type is application/json,
      // since aws-serverless-express expects a raw object we convert it back to string before proxying it
      body:
        req.headers['content-type'] === 'application/json'
          ? JSON.stringify(req.body)
          : req.body,
      isBase64Encoded: false
    };

    const awsContext = {
      succeed(awsResponse) {
        context.res.status = awsResponse.statusCode;
        context.res.body = Buffer.from(
          awsResponse.body,
          awsResponse.isBase64Encoded ? 'base64' : 'utf8'
        );
        context.res.isRaw = true;

        context.done();
      }
    };
    awsServerlessExpress.proxy(server, event, awsContext);
  };
}
