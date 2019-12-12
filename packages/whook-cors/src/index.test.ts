import { wrapHandlerWithCORS, optionsWithCORS, augmentAPIWithCORS } from '.';
import { handler } from 'knifecycle';
import { OpenAPIV3 } from 'openapi-types';

describe('wrapHandlerWithCORS', () => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': [
      'Accept',
      'Accept-Encoding',
      'Accept-Language',
      'Referrer',
      'Content-Type',
      'Content-Encoding',
      'Authorization',
      'Keep-Alive',
      'User-Agent',
    ].join(','),
    Vary: 'Origin',
  };

  it('should work', async () => {
    const wrappedOptionsWithCORS = wrapHandlerWithCORS<any, any>(
      optionsWithCORS,
    );
    const wrappedHandler = await wrappedOptionsWithCORS({
      CORS,
    });
    const response = await wrappedHandler();

    expect({
      response,
    }).toMatchSnapshot();
  });

  it('should add CORS to errors', async () => {
    const wrappedGetError = wrapHandlerWithCORS<any, any>(
      handler(
        async function getError() {
          throw new Error();
        },
        'getError',
        [],
      ),
    );
    const wrappedHandler = await wrappedGetError({
      CORS,
    });

    try {
      await wrappedHandler();
      throw new Error('E_UNEXPECTED_SUCCESS');
    } catch (err) {
      expect({
        headers: err.headers,
      }).toMatchSnapshot();
    }
  });
});

describe('augmentAPIWithCORS()', () => {
  it('should work', async () => {
    expect(
      await augmentAPIWithCORS({
        openapi: '3.0.2',
        info: {
          version: '1.0.0',
          title: 'Sample OpenAPI',
          description: 'A sample OpenAPI file for testing purpose.',
        },
        components: {
          securitySchemes: {
            oAuth2: {
              type: 'oauth2',
              flows: {},
            },
          },
        },
        paths: {
          '/ping': {
            options: {
              operationId: 'optionsPing',
              summary: 'Provides ping options.',
              responses: {
                '200': {
                  description: 'Ping options',
                },
              },
            },
            get: {
              operationId: 'getPing',
              summary: "Checks API's availability.",
              responses: {
                '200': {
                  description: 'Pong',
                },
              },
            },
          },
          '/users/{userid}': {
            head: {
              operationId: 'getUser',
              summary: 'Return a user.',
              security: [
                {
                  oAuth2: ['user'],
                },
              ],
              parameters: [
                {
                  in: 'path',
                  name: 'userId',
                  required: true,
                  schema: {
                    type: 'number',
                  },
                },
                {
                  in: 'query',
                  name: 'full',
                  required: true,
                  schema: {
                    type: 'boolean',
                  },
                },
                {
                  in: 'query',
                  name: 'retry',
                  required: false,
                  schema: {
                    type: 'boolean',
                  },
                },
              ],
              responses: {
                '200': {
                  description: 'The user',
                },
              },
            },
          },
          '/crons/tokens': {
            post: {
              operationId: 'ping',
              'x-whook': {
                type: 'cron',
              },
              summary: "Checks API's availability.",
              responses: {
                '200': {
                  description: 'Pong',
                },
              },
            } as OpenAPIV3.OperationObject,
          },
        },
      }),
    ).toMatchSnapshot();
  });
});
