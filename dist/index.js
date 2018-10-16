"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const awsServerlessExpress = __importStar(require("aws-serverless-express"));
const url = __importStar(require("url"));
function azureFunctionHandler(app) {
    const server = awsServerlessExpress.createServer(app, 
    /*serverListenCallback*/ undefined, 
    /*binaryMimeTypes*/ ['*/*']);
    return (context, req) => {
        // Convert the azure incoming request to the form that aws-serverless-express expects.
        // It's nearly the same, just with some names slightly changed.  One small difference
        // is that azure keeps paths in their full form like `/api/foo/bar?name=baz`.  However,
        // AWS wants to have the `/api/foo/bar` and {'name':'baz'} parts separated.
        const parsedURL = url.parse(req.originalUrl);
        const path = parsedURL.pathname;
        if (path === undefined) {
            throw new Error('Could not determine pathname in: ' + req.originalUrl);
        }
        const awsEvent = {
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
        const awsContext = {
            succeed(awsResponse) {
                // Copy values over.
                context.res.status = awsResponse.statusCode;
                context.res.body = Buffer.from(awsResponse.body, awsResponse.isBase64Encoded ? 'base64' : 'utf8');
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
        awsServerlessExpress.proxy(server, awsEvent, awsContext);
    };
}
exports.default = azureFunctionHandler;
exports.azureFunctionHandler = azureFunctionHandler;
//# sourceMappingURL=index.js.map