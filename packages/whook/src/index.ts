import Knifecycle, { constant, Services } from 'knifecycle';
import debug from 'debug';
import {
  initLogService,
  initTimeService,
  initRandomService,
  initDelayService,
  initProcessService,
  DEFAULT_LOG_ROUTING,
  LogService,
  ProcessServiceConfig,
} from 'common-services';
import initHTTPRouter, {
  DEFAULT_ERROR_URI,
  DEFAULT_ERRORS_DESCRIPTORS,
  DEFAULT_DEFAULT_ERROR_CODE,
  ErrorHandlerConfig,
  WhookErrorsDescriptors,
  WhookErrorDescriptor,
  initErrorHandler,
  HTTPRouterConfig,
  HTTPRouterProvider,
  HTTPRouterService,
} from '@whook/http-router';
import initHTTPTransaction, {
  WhookOperation,
  WhookRequest,
  WhookResponse,
  WhookHandler,
  WhookHandlerFunction,
  HTTPTransactionConfig,
  HTTPTransactionService,
  initObfuscatorService,
  ObfuscatorConfig,
  ObfuscatorService,
  initAPMService,
  APMService,
} from '@whook/http-transaction';
import initHTTPServer, {
  HTTPServerConfig,
  HTTPServerProvider,
  HTTPServerService,
  HTTPServerEnv,
} from '@whook/http-server';
import initPort, { PortEnv } from './services/PORT';
import initHost, { HostEnv } from './services/HOST';
import initEnv, { ENVConfig, ENVService } from './services/ENV';
import initConfigs, {
  CONFIGSService,
  WhookConfig,
  CONFIGSConfig,
} from './services/CONFIGS';
import initProjectDir from './services/PROJECT_DIR';
import initWhookPluginsPaths, {
  WhookPluginsService,
  WhookPluginsPathsService,
  WhookPluginsPathsConfig,
} from './services/WHOOK_PLUGINS_PATHS';
import initAPIDefinitions, {
  DEFAULT_IGNORED_FILES_PREFIXES,
  DEFAULT_IGNORED_FILES_SUFFIXES,
  WhookAPIDefinitions,
  WhookAPIOperationAddition,
  WhookAPIOperationConfig,
  WhookAPIOperation,
  WhookAPIHandlerDefinition,
  WhookAPIParameterDefinition,
  WhookAPISchemaDefinition,
} from './services/API_DEFINITIONS';
import initAutoload, {
  HANDLER_REG_EXP,
  AutoloadConfig,
  WhookWrapper,
  WhookServiceMap,
  WhookInitializerMap,
} from './services/_autoload';
import initGetPing, {
  definition as initGetPingDefinition,
} from './handlers/getPing';
import { noop, identity, compose, pipe } from './libs/utils';
import { OpenAPIV3 } from 'openapi-types';
import { BaseURLConfig, BaseURLEnv } from './services/BASE_URL';

export {
  noop,
  identity,
  compose,
  pipe,
  initGetPing,
  initGetPingDefinition,
  initAutoload,
  DEFAULT_IGNORED_FILES_PREFIXES,
  DEFAULT_IGNORED_FILES_SUFFIXES,
  initAPIDefinitions,
  WhookAPIDefinitions,
  WhookAPIOperationAddition,
  WhookAPIOperation,
  WhookAPIHandlerDefinition,
  WhookAPIParameterDefinition,
  WhookAPISchemaDefinition,
  WhookAPIOperationConfig,
  WhookServiceMap,
  WhookInitializerMap,
  ENVService,
  initEnv,
  WhookPluginsService,
  WhookPluginsPathsService,
  CONFIGSService,
  WhookConfig,
  WhookOperation,
  WhookRequest,
  WhookResponse,
  WhookHandler,
  WhookHandlerFunction,
  WhookWrapper,
  HTTPTransactionConfig,
  HTTPTransactionService,
  HTTPRouterConfig,
  HTTPRouterProvider,
  HTTPRouterService,
  DEFAULT_ERROR_URI,
  DEFAULT_ERRORS_DESCRIPTORS,
  DEFAULT_DEFAULT_ERROR_CODE,
  WhookErrorsDescriptors,
  WhookErrorDescriptor,
  HTTPServerConfig,
  HTTPServerProvider,
  HTTPServerService,
  ObfuscatorConfig,
  ObfuscatorService,
  APMService,
};

export type WhookEnv = HTTPServerEnv & BaseURLEnv & HostEnv & PortEnv;

export type WhookConfigs = ProcessServiceConfig &
  HTTPRouterConfig &
  ErrorHandlerConfig &
  HTTPServerConfig &
  HTTPTransactionConfig &
  AutoloadConfig &
  BaseURLConfig &
  CONFIGSConfig &
  ENVConfig &
  WhookPluginsPathsConfig & {
    CONFIG: WhookConfig;
  } & ObfuscatorConfig;

/* Architecture Note #1: Server run
Whook exposes a `runServer` function to programmatically spawn
 its server. It is intended to be reusable and injectable so
 that projects can override the whole `whook` default behavior.
*/
export async function runServer<S = Services>(
  aPrepareEnvironment: typeof prepareEnvironment,
  aPrepareServer: typeof prepareServer,
  injectedNames: string[] = [],
): Promise<S> {
  try {
    const $ = await aPrepareEnvironment();
    const { ENV, log, ...services } = await aPrepareServer<{
      ENV: ENVService;
      log: LogService;
      services: any[];
    }>([...new Set([...injectedNames, 'ENV', 'log'])], $);
    if (ENV.DRY_RUN) {
      log('warning', '🌵 - Dry run, shutting down now!');
      await $.destroy();
      return ({} as unknown) as S;
    }

    if (ENV.MERMAID_RUN) {
      const CONFIG_REG_EXP = /^([A-Z0-9_]+)$/;
      const MERMAID_GRAPH_CONFIG = {
        classes: {
          handlers: 'fill:#e7cdd2,stroke:#ebd4cb,stroke-width:1px;',
          config: 'fill:#d4cdcc,stroke:#ebd4cb,stroke-width:1px;',
          others: 'fill:#ebd4cb,stroke:#000,stroke-width:1px;',
        },
        styles: [
          {
            pattern: HANDLER_REG_EXP,
            className: 'handlers',
          },
          {
            pattern: CONFIG_REG_EXP,
            className: 'config',
          },
          {
            pattern: /^(.+)$/,
            className: 'others',
          },
        ],
        shapes: [
          {
            pattern: HANDLER_REG_EXP,
            template: '$0(($0))',
          },
          {
            pattern: CONFIG_REG_EXP,
            template: '$0{$0}',
          },
        ],
      };
      log('warning', '🌵 - Mermaid graph generated, shutting down now!');
      process.stdout.write($.toMermaidGraph(MERMAID_GRAPH_CONFIG));
      await $.destroy();
      return ({} as unknown) as S;
    }

    return ({ ENV, log, $instance: $, ...services } as unknown) as S;
  } catch (err) {
    // eslint-disable-next-line
    console.error('💀 - Cannot launch the process:', err.stack);
    //process.exit(1);
  }
}

/* Architecture Note #2: Server preparation
Whook exposes a `prepareServer` function to create its server
 configuration. It takes eventually additional injections that
 would be required at a higher level and a
 [Knifecycle](https://github.com/nfroidure/knifecycle)
 containing the bootstrapped environment and allowing
 to complete and run the server.
*/
/**
 * Runs the Whook server
 * @param {Array<String>} injectedNames
 * Root dependencies names to instanciate and return
 * @param {Knifecycle} $
 * The Knifecycle instance to use for the server run
 * @returns Object
 * A promise of the injected services
 */
export async function prepareServer<S = Services>(
  injectedNames: string[] = [],
  $: Knifecycle,
): Promise<S> {
  /* Architecture Note #2.1: Root injections
   * We need to inject `httpServer` and `process` to bring life to our
   *  server. We also inject `log` for logging purpose and custom other
   *  injected name that were required upfront.
   */
  const {
    log,
    ...services
  }: { log: LogService; services: any[] } = await $.run([
    ...new Set([...injectedNames, 'log', 'httpServer', 'process']),
  ]);

  log('warning', 'On air 🚀🌕');

  return ({ log, ...services } as unknown) as S;
}

/* Architecture Note #3: Server environment
The Whook `prepareEnvironment` function aims to provide the complete
 server environment without effectively planning its run. It allows
 to use that environment for CLI or build purposes. It also
 provides a chance to override some services/constants
 before actually preparing the server.
 */
/**
 * Prepare the Whook server environment
 * @param {Knifecycle} $
 * The Knifecycle instance to set the various services
 * @returns Promise<Knifecycle>
 * A promise of the Knifecycle instance
 */
export async function prepareEnvironment(
  $: Knifecycle = new Knifecycle(),
): Promise<Knifecycle> {
  /* Architecture Note #3.1: `PWD` env var
  The Whook server heavily rely on the process working directory
   to dynamically load contents. We are making it available to
   the DI system as a constant.
   */
  const PWD = process.cwd();
  $.register(constant('PWD', PWD));

  /* Architecture Note #3.2: `NODE_ENV` env var
  Whook has different behaviors depending on the `NODE_ENV` value
   consider setting it to production before shipping.
   */
  const NODE_ENV = process.env.NODE_ENV || 'development';
  $.register(constant('NODE_ENV', NODE_ENV));

  /* Architecture Note #3.3: `WHOOK_PLUGINS` and `PROJECT_SRC`
  Whook need to know where to look up for things like
   commands / handlers etc...
   */
  $.register(constant('WHOOK_PLUGINS', ['@whook/whook']));

  /* Architecture Note #3.4: Logging
  Whook's default logger write to the NodeJS default console
   except for debugging messages where it uses the `debug`
   module so that you can set the `DEBUG` environment
   variable to `whook` and get debug messages in output.
   */
  $.register(constant('debug', debug('whook')));
  $.register(
    constant('logger', {
      // eslint-disable-next-line
      error: console.error.bind(console),
      // eslint-disable-next-line
      info: console.info.bind(console),
      // eslint-disable-next-line
      warning: console.error.bind(console),
    }),
  );
  $.register(constant('exit', process.exit));

  // Needed to avoid a dead lock
  // TODO: Remove when fixed that issue
  // https://github.com/nfroidure/knifecycle/issues/108
  $.register(constant('LOG_ROUTING', DEFAULT_LOG_ROUTING));

  /* Architecture Note #3.5: Initializers
  Whook's embed a few default initializers proxied from
   `common-services`, `@whook/http-router` or its own
   `src/services` folder. It can be wrapped or overriden,
   at will, later in project's main file.
   */
  [
    initLogService,
    initTimeService,
    initRandomService,
    initDelayService,
    initProcessService,
    initHTTPRouter,
    initHTTPTransaction,
    initHTTPServer,
    initErrorHandler,
    initPort,
    initHost,
    initEnv,
    initConfigs,
    initWhookPluginsPaths,
    initProjectDir,
    initObfuscatorService,
    initAPMService,
  ].forEach($.register.bind($));

  return $;
}
