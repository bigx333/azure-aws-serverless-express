import * as awsServerlessExpress from 'aws-serverless-express';
import * as url from 'url';
import * as http from 'http';

interface AWSEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string>;
  body: string;
  isBase64Encoded: boolean;
}

// The response that the library produces once the http request it made completes.  This is the
// response form that APIGateway expects.
interface AWSResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  isBase64Encoded: boolean;
}

// This is the shape of the 'context' object that "aws-serverless-express" expects.  It does nothing
// with it except call "succeed" with an appropriate result once it completes. When we get that
// response we'll translate it to an Azure specific result type and return that to our caller.
interface AWSContext {
  succeed: (awsResponse: AWSResponse) => void;
}

export default function azureFunctionHandler(
  app: (request: http.IncomingMessage, response: http.ServerResponse) => void
) {
  const server = awsServerlessExpress.createServer(
    app,
    /*serverListenCallback*/ undefined,
    /*binaryMimeTypes*/ ['*/*']
  );
  return (context: any, req: any) => {
    // Convert the azure incoming request to the form that aws-serverless-express expects.
    // It's nearly the same, just with some names slightly changed.  One small difference
    // is that azure keeps paths in their full form like `/api/foo/bar?name=baz`.  However,
    // AWS wants to have the `/api/foo/bar` and {'name':'baz'} parts separated.
    const parsedURL = url.parse(req.originalUrl);
    const path = parsedURL.pathname;
    if (path === undefined) {
      throw new Error('Could not determine pathname in: ' + req.originalUrl);
    }

    const awsEvent: AWSEvent = {
      path: path.replace('/api', ''),
      httpMethod: req.method,
      headers: req.headers || {},
      queryStringParameters: req.query || {},
      body: req.body,
      isBase64Encoded: false
    };

    // Now create the context object to pass to the library.  The context is object is very
    // simple.  We just listen for the 'succeed' call, and we then map the AWS response object
    // back to the form Azure wants.  As above, this is very simple and is effectively only name
    // changes.
    const awsContext: AWSContext = {
      succeed(awsResponse) {
        // Copy values over.
        context.res.status = awsResponse.statusCode;
        context.res.body = Buffer.from(
          awsResponse.body,
          awsResponse.isBase64Encoded ? 'base64' : 'utf8'
        );
        context.res.isRaw = true;

        // Merge any headers produced by the lib.
        const headers = context.res.headers || {};
        Object.assign(headers, awsResponse.headers);
        context.res.headers = headers;

        // Signal that we're done.
        context.done();
      }
    };

    // Now, call into the library to actually handle the translated Azure-to-AWS request.
    awsServerlessExpress.proxy(server, awsEvent, <any>awsContext);
  };
}

export { azureFunctionHandler };
