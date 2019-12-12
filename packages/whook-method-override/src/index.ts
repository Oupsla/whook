import { reuseSpecialProps, alsoInject, ServiceInitializer } from 'knifecycle';
import { HTTPTransactionService } from '@whook/whook';
import { LogService } from 'common-services';
import { WhookHTTPTransaction } from '@whook/http-transaction';
import { ServerResponse, IncomingMessage } from 'http';

/**
 * Wrap the Whook transaction service to handle method
 *  overriding (often needed for using the `patch` method).
 * @param {Function} initHandler The handler initializer
 * @returns {Function} The handler initializer wrapped
 */
export default function wrapHTTPTransactionWithMethodOverride<D>(
  initHTTPTransaction: ServiceInitializer<D, HTTPTransactionService>,
): ServiceInitializer<D, HTTPTransactionService> {
  return alsoInject(
    ['log'],
    reuseSpecialProps(
      initHTTPTransaction,
      initHTTPTransactionWithMethodOverride.bind(null, initHTTPTransaction),
    ),
  );
}

async function initHTTPTransactionWithMethodOverride<D>(
  initHTTPTransaction: ServiceInitializer<D, HTTPTransactionService>,
  services: { log: LogService } & D,
): Promise<HTTPTransactionService> {
  const { log } = services;

  log('debug', '🔧 - Wrapping transactions with methods override.');

  const httpTransaction = await initHTTPTransaction(services);

  return async (
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<WhookHTTPTransaction> => {
    const { request, transaction } = await httpTransaction(req, res);

    return {
      request: {
        ...request,
        method: request.headers['x-http-method-override']
          ? request.headers['x-http-method-override'].toLowerCase()
          : request.method,
        headers: Object.keys(request.headers)
          .filter(headerName => 'x-http-method-override' === headerName)
          .reduce((newHeaders, headerName) => {
            newHeaders[headerName] = request.headers[headerName];
            return newHeaders;
          }, {}),
      },
      transaction,
    };
  };
}
