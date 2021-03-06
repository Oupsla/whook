[//]: # ( )
[//]: # (This file is automatically generated by a `metapak`)
[//]: # (module. Do not change it  except between the)
[//]: # (`content:start/end` flags, your changes would)
[//]: # (be overridden.)
[//]: # ( )
# @whook/gcp-functions
> Build and deploy to GCP Cloud Functions with Whook.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/nfroidure/whook/blob/master/packages/whook-gcp-functions/LICENSE)
[![NPM version](https://badge.fury.io/js/%40whook%2Fgcp-functions.svg)](https://npmjs.org/package/@whook/gcp-functions)


[//]: # (::contents:start)

This module is aimed to help you to build and deploy your
 [Whook](https://github.com/nfroidure/whook) server
 to [Google Cloud Functions](https://cloud.google.com/functions).

You can find a complete setup with a Terraform deployment example in
 [this pull request](https://github.com/nfroidure/whook/pull/66).

## Quick setup

Install this module and its peer dependencies :
```sh
npm i @whook/gcp-functions;
npm i --save-dev @whook/http-transaction babel-loader babel-plugin-knifecycle webpack
```

Add this module to your Whook plugins and tweak the 2 build functions
 in your `index.ts` main file:
```diff
+import {
+  runBuild as runBaseBuild,
+  prepareBuildEnvironment as prepareBaseBuildEnvironment,
+} from '@whook/gcp-functions';

// (...)

export async function prepareEnvironment(
  $: Knifecycle = new Knifecycle(),
): Promise<Knifecycle> {

  // (...)

  // Setup your own whook plugins or avoid whook defaults by leaving it empty
-  $.register(constant('WHOOK_PLUGINS', ['@whook/cli', '@whook/whook']));
+  $.register(constant('WHOOK_PLUGINS', [
+    '@whook/gcp-functions',
+    '@whook/cli',
+    '@whook/whook',
+  ]));

  // (...)

}

// (...)

// The `runBuild` function is intended to build the
// project
export async function runBuild(
  innerPrepareEnvironment = prepareBuildEnvironment,
): Promise<void> {
-  throw new YError('E_NO_BUILD_IMPLEMENTED');

  // Usually, here you call the installed build
-  // return runBaseBuild(innerPrepareEnvironment);
+   return runBaseBuild(innerPrepareEnvironment);
}

// (...)

// The `prepareBuildEnvironment` create the build
//  environment
export async function prepareBuildEnvironment(
  $: Knifecycle = new Knifecycle(),
): Promise<Knifecycle> {
  $ = await prepareEnvironment($);

  // (...)

-  // Usually, here you call the installed build env
-  // $ = await prepareBaseBuildEnvironment($);
+  // Calling the GCP specific build
+  $ = await prepareBaseBuildEnvironment($);


  // The build often need to know were initializer
  //  can be found to create a static build and
  //  remove the need to create an injector
  $.register(
    constant('INITIALIZER_PATH_MAP', {
      ENV: require.resolve('@whook/whook/dist/services/ProxyedENV'),
      apm: require.resolve('@whook/http-transaction/dist/services/apm'),
      obfuscator: require.resolve(
        '@whook/http-transaction/dist/services/obfuscator',
      ),
-      log: require.resolve('common-services/dist/log'),
+      log: require.resolve('@whook/gcp-functions/dist/services/log'),
      time: require.resolve('common-services/dist/time'),
      delay: require.resolve('common-services/dist/delay'),
    }),
  );

  // (...)

} 
```

And add the GCP Functions config (usually in `src/config/common/config.js`):
```diff
+ import type {
+   WhookCompilerConfig,
+   WhookAPIOperationGCPFunctionConfig,
+ } from '@whook/gcp-functions';

// ...

export type AppConfigs = WhookConfigs &
+  WhookCompilerConfig &
  APIConfig;

const CONFIG: AppConfigs = {
  // ...
+  COMPILER_OPTIONS: {
+    externalModules: [],
+    ignoredModules: [],
+    extensions: ['.ts', '.mjs', '.js', '.json'],
+    mainFields: ['browser', 'module', 'main'],
+    target: '12.13',
+  },
};

// Export custom handlers definitions
export type APIHandlerDefinition = WhookAPIHandlerDefinition<
+  WhookAPIOperationGCPFunctionConfig &
  WhookAPIOperationSwaggerConfig
>;

export default CONFIG;
```

# Build

To build your functions :
```sh
# Build all functions
npm run compile && npm run build
# Build only one function
npm run compile && npm run build -- getPing
```

# Debug

You can easily test your function builds by adding `@whook/gcp-functions`
 to your `WHOOK_PLUGINS` list. It provides you some commands like
 the `testHTTPFunction` one:
```sh
npx whook testHTTPFunction --name getPing
```

To get more insights when errors happens:
```sh
npm run whook-dev -- testHTTPFunction --name getPing
```

## Deployment

We recommend using [Terraform](https://terraform.io) to deploy your
 functions.

There is a complete example on how to deploy your functions
 [in this pull request](https://github.com/nfroidure/whook/pull/54).

[//]: # (::contents:end)

# API

# Authors
- [Nicolas Froidure](http://insertafter.com/en/index.html)

# License
[MIT](https://github.com/nfroidure/whook/blob/master/packages/whook-gcp-functions/LICENSE)
