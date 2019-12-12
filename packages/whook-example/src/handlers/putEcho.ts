import { autoHandler } from 'knifecycle';
import YHTTPError from 'yhttperror';
import { WhookDefinition } from '@whook/whook';
import { OpenAPIV3 } from 'openapi-types';
import { LogService } from 'common-services';

const echoSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  required: ['echo'],
  additionalProperties: false,
  properties: {
    echo: {
      type: 'string',
    },
  },
};

export const definition: WhookDefinition = {
  path: '/echo',
  method: 'put',
  operation: {
    operationId: 'putEcho',
    summary: 'Echoes what it takes.',
    tags: ['system'],
    requestBody: {
      description: 'The input sentence',
      content: {
        'application/json': {
          schema: echoSchema,
          example: {
            echo: 'Repeat this!',
          },
        },
      },
    },
    responses: {
      200: {
        description: 'The actual echo',
        content: {
          'application/json': {
            schema: echoSchema,
          },
        },
      },
    },
  },
};

export default autoHandler(putEcho);

async function putEcho({ log }: { log: LogService }, { body }) {
  if (body.echo.includes('Voldemort')) {
    throw new YHTTPError(400, 'E_MUST_NOT_BE_NAMED', body.echo);
  }

  log('warning', `📢 - Echoing "${body.echo}"`);

  return {
    status: 200,
    body,
  };
}
