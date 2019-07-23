import { name, autoService } from 'knifecycle';

import { definition as getOpenAPIDefinition } from '../handlers/getOpenAPI';
import { definition as getPingDefinition } from '@whook/whook/dist/handlers/getPing';
import { definition as getDelayDefinition } from '../handlers/getDelay';
import { definition as getDiagnosticDefinition } from '../handlers/getDiagnostic';
import { definition as getTimeDefinition } from '../handlers/getTime';
import { definition as putEchoDefinition } from '../handlers/putEcho';
import { augmentAPIWithCORS } from '@whook/cors';

export default name('API', autoService(initAPI));

// The API service is where you put your handlers
// altogether to form the final API
async function initAPI({
  ENV,
  CONFIG,
  BASE_URL,
  BASE_PATH = '',
  API_VERSION,
  log,
}) {
  log('debug', '🦄 - Initializing the API service!');

  const API = {
    openapi: '3.0.2',
    info: {
      version: API_VERSION,
      title: CONFIG.name,
      description: CONFIG.description,
    },
    servers: [
      {
        url: `${BASE_URL}${BASE_PATH}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          description: 'Bearer authentication with a user API token',
          type: 'http',
          scheme: 'bearer',
        },
        ...(ENV.DEV_MODE
          ? {
              fakeAuth: {
                description: 'A fake authentication for development purpose.',
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
              },
            }
          : {}),
      },
    },
    paths: [
      getOpenAPIDefinition,
      getPingDefinition,
      getDelayDefinition,
      getDiagnosticDefinition,
      getTimeDefinition,
      putEchoDefinition,
    ]
      .map(definition =>
        ENV.DEV_MODE && definition.operation.security
          ? {
              ...definition,
              operation: {
                ...definition.operation,
                security: [
                  ...definition.operation.security,
                  { fakeAuth: ['admin'] },
                ],
              },
            }
          : definition,
      )
      .reduce(
        (paths, definition) => ({
          ...paths,
          [definition.path]: {
            ...(paths[definition.path] || {}),
            [definition.method]: definition.operation,
          },
        }),
        {},
      ),
  };

  // You can apply transformations to your API like
  // here for CORS support (OPTIONS method handling)
  return augmentAPIWithCORS(API);
}
