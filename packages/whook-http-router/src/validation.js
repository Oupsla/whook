import camelCase from 'camel-case';
import YError from 'yerror';
import HTTPError from 'yhttperror';
import Stream from 'stream';
import { pickupOperationSecuritySchemes } from './utils';

/* Architecture Note #1.1: Validators
For performance reasons, the validators are
 created once for all at startup from the
 API definition.

One could argue that it would have been
 better for performances to generate
 the code statically. This is true. It
 may be done later but it won't change
 the way it works so, moving fast for
 now but keeping it in mind.

Also, looking closely to Prepack that
 could improve significantly this
 project performances with close to no
 time costs:
 https://github.com/facebook/prepack/issues/522#issuecomment-300706099
*/

export function applyValidators(operation, validators, parameters) {
  (operation.parameters || []).forEach(({ name, in: isIn }) => {
    if ('header' === isIn) {
      return validators[name](parameters[camelCase(name)]);
    }
    return validators[name](parameters[name]);
  });
}

export function prepareBodyValidator(ajv, operation) {
  if (!(operation.requestBody && operation.requestBody.content)) {
    return _rejectAnyRequestBody.bind(null, operation);
  }

  const validators = Object.keys(operation.requestBody.content).reduce(
    (validators, mediaType) => {
      const mediaTypeObject = operation.requestBody.content[mediaType];
      const hasNoSchema = !mediaTypeObject.schema;

      if (hasNoSchema) {
        return validators;
      }

      const isBinaryContent =
        mediaTypeObject.schema.type === 'string' &&
        mediaTypeObject.schema.format === 'binary';

      if (isBinaryContent) {
        return validators;
      }

      return {
        ...validators,
        [mediaType]: ajv.compile(mediaTypeObject.schema),
      };
    },
    {},
  );

  return _validateRequestBody.bind(null, validators);
}

function _validateRequestBody(validators, operation, contentType, value) {
  if (operation.requestBody.required && 'undefined' === typeof value) {
    throw new HTTPError(
      400,
      'E_REQUIRED_REQUEST_BODY',
      operation.operationId,
      typeof value,
      value instanceof Stream ? 'Stream' : value,
    );
  }
  // Streamed contents, let it pass
  if (!validators[contentType]) {
    return;
  }
  if ('undefined' !== typeof value && !validators[contentType](value)) {
    throw new HTTPError(
      400,
      'E_BAD_REQUEST_BODY',
      operation.operationId,
      typeof value,
      value instanceof Stream ? 'Stream' : value,
      validators[contentType].errors,
    );
  }
}

function _rejectAnyRequestBody(operation, value) {
  if ('undefined' !== typeof body) {
    throw new HTTPError(
      400,
      'E_NO_REQUEST_BODY',
      operation.operationId,
      typeof value,
      value instanceof Stream ? 'Stream' : value,
    );
  }
}

// Supporting only mainstream schemes
// https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml
const SUPPORTED_HTTP_SCHEMES = ['basic', 'bearer', 'digest'];

export function extractOperationSecurityParameters(openAPI, operation) {
  const operationSecuritySchemes = pickupOperationSecuritySchemes(
    openAPI,
    operation,
  );
  const securitySchemes = Object.keys(operationSecuritySchemes).map(
    schemeKey => operationSecuritySchemes[schemeKey],
  );

  return extractParametersFromSecuritySchemes(securitySchemes);
}

export function extractParametersFromSecuritySchemes(securitySchemes) {
  const hasOAuth = securitySchemes.some(securityScheme =>
    ['oauth2', 'openIdConnect'].includes(securityScheme.type),
  );
  const httpSchemes = [
    ...new Set([
      ...securitySchemes
        .filter(securityScheme => securityScheme.type === 'http')
        .map(securityScheme => {
          if (!SUPPORTED_HTTP_SCHEMES.includes(securityScheme.scheme)) {
            throw new YError(
              'E_UNSUPPORTED_HTTP_SCHEME',
              securityScheme.scheme,
            );
          }
          return securityScheme.scheme;
        }),
      ...(hasOAuth ? ['bearer'] : []),
    ]),
  ];
  let hasAuthorizationApiKey = false;
  let hasAccessTokenApiKey = false;

  return securitySchemes
    .filter(securityScheme => securityScheme.type === 'apiKey')
    .map(securityScheme => {
      if (securityScheme.in === 'cookie') {
        throw new YError(
          'E_UNSUPPORTED_API_KEY_SOURCE',
          'cookie',
          securityScheme.name,
        );
      }
      // This overlaps with OAuth/HTTP schemes
      if (
        securityScheme.in === 'header' &&
        securityScheme.name.toLowerCase() === 'authorization'
      ) {
        hasAuthorizationApiKey = true;
      }
      // This overlaps with OAuth schemes
      if (
        securityScheme.in === 'query' &&
        securityScheme.name === 'access_token'
      ) {
        hasAccessTokenApiKey = true;
      }

      return {
        in: securityScheme.in,
        name:
          securityScheme.in === 'header'
            ? securityScheme.name.toLowerCase()
            : securityScheme.name,
        schema: {
          type: 'string',
        },
      };
    })
    .concat(
      httpSchemes.length && !hasAuthorizationApiKey
        ? [
            {
              in: 'header',
              name: 'authorization',
              schema: {
                type: 'string',
                pattern: `(${httpSchemes.join('|')}) .*`,
              },
            },
          ]
        : [],
    )
    .concat(
      hasOAuth && !hasAccessTokenApiKey
        ? [
            {
              in: 'query',
              name: 'access_token',
              schema: {
                type: 'string',
              },
            },
          ]
        : [],
    );
}

export function prepareParametersValidators(ajv, operationId, parameters) {
  return parameters.reduce((validators, parameter) => {
    if ('string' !== typeof parameter.name) {
      throw new YError('E_BAD_PARAMETER_NAME', operationId);
    }

    if (parameter.content) {
      throw new YError(
        'E_UNSUPPORTED_PARAMETER_DEFINITION',
        operationId,
        'content',
      );
    }

    if (parameter.style && 'simple' !== parameter.style) {
      throw new YError(
        'E_UNSUPPORTED_PARAMETER_DEFINITION',
        operationId,
        'style',
        parameter.style,
      );
    }

    if (!['query', 'header', 'path'].includes(parameter.in)) {
      throw new YError(
        'E_UNSUPPORTED_PARAMETER_DEFINITION',
        operationId,
        'in',
        parameter.in,
      );
    }

    validators[parameter.name] = _validateParameter.bind(
      null,
      parameter,
      ajv.compile(parameter.schema),
    );
    return validators;
  }, {});
}

export function _validateParameter(parameter, validator, value) {
  if (parameter.required && 'undefined' === typeof value) {
    throw new HTTPError(
      400,
      'E_REQUIRED_PARAMETER',
      parameter.name,
      typeof value,
      value,
    );
  }
  if ('undefined' !== typeof value && !validator(value)) {
    throw new HTTPError(
      400,
      'E_BAD_PARAMETER',
      parameter.name,
      typeof value,
      value,
      validator.errors,
    );
  }
}

export function filterHeaders(parameters, headers) {
  return (parameters || [])
    .filter(parameter => 'header' === parameter.in)
    .reduce((filteredHeaders, parameter) => {
      if (headers[parameter.name.toLowerCase()]) {
        filteredHeaders[camelCase(parameter.name)] =
          headers[parameter.name.toLowerCase()];
      }
      return filteredHeaders;
    }, {});
}
