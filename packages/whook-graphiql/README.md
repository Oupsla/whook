[//]: # ( )
[//]: # (This file is automatically generated by a `metapak`)
[//]: # (module. Do not change it  except between the)
[//]: # (`content:start/end` flags, your changes would)
[//]: # (be overridden.)
[//]: # ( )
# @whook/graphiql
> A wrapper for the Whook HTTP Router to provide GraphIQL for local dev

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nfroidure/whook/blob/master/packages/whook-graphiql/LICENSE)
[![NPM version](https://badge.fury.io/js/%40whook%2Fgraphiql.svg)](https://npmjs.org/package/@whook/graphiql)


[//]: # (::contents:start)

To use it, just wrap the HTTP router with this module and
 register it again with the `Knifecycle` instance inside the
 `runServer` function (usually in `src/index.ts`):
```diff
+ import initHTTPRouter from '@whook/http-router';
+ import wrapHTTPRouterWithGraphIQL from '@whook/graphiql';

// (...)

// It is important to do this in the runServer function since it really
//  make sense only when actually running the server
export async function runServer(injectedNames = [], $ = new Knifecycle()) {

  // (...)

+   // Add support for GraphIQL UI
+   $.register(
+     wrapHTTPRouterWithGraphIQL(initHTTPRouter),
+   );

  return await runBaseServer(injectedNames, $);
}
```

[//]: # (::contents:end)

# API
<a name="wrapHTTPRouterWithGraphIQL"></a>

## wrapHTTPRouterWithGraphIQL(initHTTPRouter) ⇒ <code>function</code>
Wraps the `httpRouter` initializer to also serve the
GraphIQL UI for development purpose.

**Kind**: global function  
**Returns**: <code>function</code> - The `httpRouter` initializer wrapped  

| Param | Type | Description |
| --- | --- | --- |
| initHTTPRouter | <code>function</code> | The `httpRouter` initializer |


# Authors
- [Nicolas Froidure](http://insertafter.com/en/index.html)

# License
[MIT](https://github.com/nfroidure/whook/blob/master/packages/whook-graphiql/LICENSE)