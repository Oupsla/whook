[//]: # ( )
[//]: # (This file is automatically generated by the `jsarch`)
[//]: # (module. Do not change it elsewhere, changes would)
[//]: # (be overriden.)
[//]: # ( )
# Architecture Notes



## Server run

Whook exposes a `runServer` function to programmatically spawn
 its server. It is intended to be reusable and injectable so
 that projects can override the whole `whook` default behavior.

[See in context](./src/index.ts#L160-L164)



## Server preparation

Whook exposes a `prepareServer` function to create its server
 configuration. It takes eventually additional injections that
 would be required at a higher level and a
 [Knifecycle](https://github.com/nfroidure/knifecycle)
 containing the bootstrapped environment and allowing
 to complete and run the server.

[See in context](./src/index.ts#L230-L237)



### Root injections

* We need to inject `httpServer` and `process` to bring life to our
 *  server. We also inject `log` for logging purpose and custom other
 *  injected name that were required upfront.

[See in context](./src/index.ts#L251-L255)



## Server environment

The Whook `prepareEnvironment` function aims to provide the complete
 server environment without effectively planning its run. It allows
 to use that environment for CLI or build purposes. It also
 provides a chance to override some services/constants
 before actually preparing the server.

[See in context](./src/index.ts#L268-L274)



### `PWD` env var

The Whook server heavily rely on the process working directory
 to dynamically load contents. We are making it available to
 the DI system as a constant.

[See in context](./src/index.ts#L285-L289)



### `NODE_ENV` env var

Whook has different behaviors depending on the `NODE_ENV` value
 consider setting it to production before shipping.

[See in context](./src/index.ts#L293-L296)



### `WHOOK_PLUGINS` and `PROJECT_SRC`

Whook need to know where to look up for things like
 commands / handlers etc...

[See in context](./src/index.ts#L300-L303)



### Logging

Whook's default logger write to the NodeJS default console
 except for debugging messages where it uses the `debug`
 module so that you can set the `DEBUG` environment
 variable to `whook` and get debug messages in output.

[See in context](./src/index.ts#L306-L311)



### Initializers

Whook's embed a few default initializers proxied from
 `common-services`, `@whook/http-router` or its own
 `src/services` folder. It can be wrapped or overriden,
 at will, later in project's main file.

[See in context](./src/index.ts#L330-L335)



## Base URL

The `BASE_URL` service is intended to provide a base URL where
 the API can be found at. It can be overriden directly via
 injecting it but it is useful to have a usable URL while
 debugging production environnement.

[See in context](./src/services/BASE_URL.ts#L6-L11)



## Environment service

The `ENV` service add a layer of configuration over just using
 node's `process.env` value. Beware that `PWD` and `NODE_ENV` are
 guaranteed to be the exact same than the injected constants.
 It is up to you to decide upstream if you set them via the
 `process.env.NODE_ENV` and `process.cwd()` values or not.

[See in context](./src/services/ENV.ts#L8-L14)



### Environment isolation

Per default, Whook takes the process environment as is
 but since it could lead to leaks when building for
 AWS Lambda or Google Cloud Functions one can isolate
 the process env when building.

[See in context](./src/services/ENV.ts#L69-L74)



### `.env.NODE_ENV` files

You may need to keep some secrets out of your Git
 history. Whook uses `dotenv` to provide your such
 ability.

[See in context](./src/services/ENV.ts#L82-L86)



## `$autoload` service

The default Whook autoloader provides a simple way to
 load the constants, services and handlers of a Whook
 project automatically from the installed whook plugins.

[See in context](./src/services/_autoload.ts#L54-L58)



### Configuration auto loading

Loading the configuration files is done according to the `NODE_ENV`
 environment variable. It basically requires a configuration hash
 where the keys are Knifecycle constants.

Let's load the configuration files as a convenient way
 to create constants on the fly

[See in context](./src/services/_autoload.ts#L188-L195)



### Wrappers auto loading support

We cannot inject the `WRAPPERS` in the auto loader when
 it is dynamically loaded so giving a second chance here
 for `WRAPPERS` to be set.

[See in context](./src/services/_autoload.ts#L131-L135)



### API auto loading

We cannot inject the `API` in the auto loader since
 it is dynamically loaded so doing this during the auto
 loader initialization.

[See in context](./src/services/_autoload.ts#L115-L119)



### Constants

First of all the autoloader looks for constants in the
 previously loaded `CONFIGS` configurations hash.

[See in context](./src/services/_autoload.ts#L203-L206)



### Handlers map

Here, we build the handlers map needed by the router by injecting every
 handler required by the API.

[See in context](./src/services/_autoload.ts#L218-L221)



### Service/handler loading

Finally, we either require the handler/service module if
 none of the previous strategies applyed.

[See in context](./src/services/_autoload.ts#L248-L251)



#### WhookInitializerMap

Whook exports a `WhookInitializerMap` type to help you ensure yours are valid.

[See in context](./src/services/_autoload.ts#L33-L35)



### Service name mapping

In order to be able to substituate easily a service per another
 one can specify a mapping between a service and its substitution.

[See in context](./src/services/_autoload.ts#L175-L178)



#### WhookServiceMap

Whook exports a `WhookServiceMap` type to help you ensure yours are valid.

[See in context](./src/services/_autoload.ts#L29-L31)



### Initializer path mapping

In order to be able to load a service from a given path map
 one can directly specify a path to use for its resolution.

[See in context](./src/services/_autoload.ts#L281-L284)



## IP detection

If no `HOST` configuration is specified in dependencies nor in ENV,
 this service detects the machine host automagically.

[See in context](./src/services/HOST.ts#L6-L9)



## Port detection

If no `PORT` configuration is specified in dependencies nor in ENV,
 this service detects a free port automagically.

[See in context](./src/services/PORT.ts#L6-L9)



## Project dir

Whook needs to know the directory of the project under
 which he is running. It then uses this service to
 automatically detect it.

[See in context](./src/services/PROJECT_DIR.ts#L14-L19)



## Plugins paths

Whook auto loader can look for initializers in a list of
 plugins defined in the `WHOOK_PLUGINS` constant. This
 service computes the path where those plugins source are
 located allowing one to use services/handlers from it.

[See in context](./src/services/WHOOK_PLUGINS_PATHS.ts#L9-L15)



## API definitions loader

The `API_DEFINITIONS` service provide a convenient way to
 gather your various API definitions from the handlers you
 created in the `src/handlers` folder.

[See in context](./src/services/API_DEFINITIONS.ts#L21-L25)

