# API
## Members

<dl>
<dt><a href="#default">default</a> ⇒ <code>Promise</code></dt>
<dd><p>Initialize an error handler for the
HTTP router</p>
</dd>
<dt><a href="#default">default</a> ⇒ <code>Promise</code></dt>
<dd><p>Initialize an HTTP router</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#flattenOpenAPI">flattenOpenAPI(API)</a> ⇒ <code>Object</code></dt>
<dd><p>Flatten the inputed OpenAPI file
 object</p>
</dd>
<dt><a href="#getOpenAPIOperations">getOpenAPIOperations(API)</a> ⇒ <code>Array</code></dt>
<dd><p>Return a OpenAPI operation in a more
 convenient way to iterate onto its
 operations</p>
</dd>
</dl>

<a name="default"></a>

## default ⇒ <code>Promise</code>
Initialize an error handler for the
HTTP router

**Kind**: global variable  
**Returns**: <code>Promise</code> - A promise of a function to handle errors  

| Param | Type | Description |
| --- | --- | --- |
| services | <code>Object</code> | The services the server depends on |
| services.NODE_ENV | <code>Object</code> | The injected NODE_ENV value |
| [services.DEBUG_NODE_ENVS] | <code>Array</code> | The environnement that activate debugging  (prints stack trace in HTTP errors responses) |
| [services.STRINGIFYERS] | <code>Object</code> | The synchronous body stringifyers |
| [services.ERRORS_DESCRIPTORS] | <code>Object</code> | An hash of the various error descriptors |
| [services.DEFAULT_ERROR_CODE] | <code>Object</code> | A string giving the default error code |

<a name="default"></a>

## default ⇒ <code>Promise</code>
Initialize an HTTP router

**Kind**: global variable  
**Returns**: <code>Promise</code> - A promise of a function to handle HTTP requests.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| services | <code>Object</code> |  | The services the server depends on |
| services.NODE_ENV | <code>Object</code> |  | The injected NODE_ENV value |
| [services.DEBUG_NODE_ENVS] | <code>Array</code> |  | The environnement that activate debugging  (prints stack trace in HTTP errors responses) |
| [services.BUFFER_LIMIT] | <code>String</code> |  | The maximum bufferisation before parsing the  request body |
| [services.BASE_PATH] | <code>String</code> |  | API base path |
| services.HANDLERS | <code>Object</code> |  | The handlers for the operations decribe  by the OpenAPI API definition |
| services.API | <code>Object</code> |  | The OpenAPI definition of the API |
| [services.PARSERS] | <code>Object</code> |  | The synchronous body parsers (for operations  that defines a request body schema) |
| [services.STRINGIFYERS] | <code>Object</code> |  | The synchronous body stringifyers (for  operations that defines a response body  schema) |
| [services.ENCODERS] | <code>Object</code> |  | A map of encoder stream constructors |
| [services.DECODERS] | <code>Object</code> |  | A map of decoder stream constructors |
| [services.QUERY_PARSER] | <code>Object</code> |  | A query parser with the `strict-qs` signature |
| [services.log] | <code>function</code> | <code>noop</code> | A logging function |
| services.httpTransaction | <code>function</code> |  | A function to create a new HTTP transaction |

<a name="flattenOpenAPI"></a>

## flattenOpenAPI(API) ⇒ <code>Object</code>
Flatten the inputed OpenAPI file
 object

**Kind**: global function  
**Returns**: <code>Object</code> - The flattened OpenAPI definition  

| Param | Type | Description |
| --- | --- | --- |
| API | <code>Object</code> | An Object containing a parser OpenAPI JSON |

<a name="getOpenAPIOperations"></a>

## getOpenAPIOperations(API) ⇒ <code>Array</code>
Return a OpenAPI operation in a more
 convenient way to iterate onto its
 operations

**Kind**: global function  
**Returns**: <code>Array</code> - An array of all the OpenAPI operations  

| Param | Type | Description |
| --- | --- | --- |
| API | <code>Object</code> | The flattened OpenAPI defition |

**Example**  
```js
(
  await getOpenAPIOperations(API)
).map((operation) => {
   const { path, method, operationId, parameters } = operation;

  // Do something with that operation
});
```
