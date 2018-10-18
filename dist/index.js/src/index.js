'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = azureFunctionHandler;

var _awsServerlessExpress = require('aws-serverless-express');

var _awsServerlessExpress2 = _interopRequireDefault(_awsServerlessExpress);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function azureFunctionHandler(app) {
  var server = _awsServerlessExpress2.default.createServer(app, undefined, ['*/*']);

  return function (context, req) {
    var path = _url2.default.parse(req.originalUrl).pathname.replace('/api', '');

    // Azure automatically converts body to a JSON object if the content-type is application/json,
    // since aws-serverless-express expects a raw object we convert it back to string before proxying it
    if (req.headers['content-type'] === 'application/json') req.body = JSON.stringify(req.body);

    var event = {
      path: path,
      httpMethod: req.method,
      headers: req.headers || {},
      queryStringParameters: req.query || {},
      body: req.body,
      isBase64Encoded: false
    };

    var awsContext = {
      succeed: function succeed(awsResponse) {
        // Copy values over.
        context.res.status = awsResponse.statusCode;
        context.res.body = Buffer.from(awsResponse.body, awsResponse.isBase64Encoded ? 'base64' : 'utf8');
        context.res.isRaw = true;

        context.res.headers = _extends({}, context.res.headers, awsResponse.headers);
      }
    };
    _awsServerlessExpress2.default.proxy(server, event, awsContext);
  };
}