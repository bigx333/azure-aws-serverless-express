/// <reference types="node" />
import * as http from 'http';
export default function azureFunctionHandler(app: (request: http.IncomingMessage, response: http.ServerResponse) => void): (context: any, req: any) => void;
export { azureFunctionHandler };
