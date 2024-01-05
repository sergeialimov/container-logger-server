# Config library


Please use this library whenever possible when dealing with environment variables instead of just accessing process.env.

## Overview

* Automatically resolves configs in both `env` files and vault (if enabled)
* Prevents fetching wrong values from environment variables if this these variables are supposed
   to be fetched from the vault
* Makes testing easier by only mocking the services or the injected configs instead just overriding
   process.env variables
* Gets data from the environment of the node.js process, from `.env` files, and from Vault service.
* Environment files are saved in a dedicated directory `./env/`.
* Provides two main methods: `.has()` and `.get()`. Depending on the data, the response of `.get()`
  could be an object with values of primitive types or a nested object.

In all environments, the following files are loaded if they exist, the latter taking precedence over the former:

- `./env/.env` contains default values for the environment variables needed by the app

- `./env/.env.local` uncommitted file with local overrides

- `./env/.env.$NODE_ENV` committed environment-specific defaults

- `./env/.env.$NODE_ENV.local` uncommitted environment-specific overrides

Real environment variables win over `.env` files.

### List of currently used NODE_ENV values
* `dev` (development)
* `prod` (production)
* `test`
* `staging`

### How the lib works in general

1. Reads `process.env` via `@nestjs/config`
2. Reads `.env` files, parses the contents, assigns it to `process.env`, and returns an Object with a parsed key containing the loaded content or an error key if it failed
3. Reads from Vault
4. In case a required value is an object both in Vault and Config, they will be merged by the `merge` method of Lodash


#### In order for Vault to replace values it must have the following keys configured:

```
{
	vault: {
		isEnabled: true, // If set to false, will not replace values with data from Vault
		host: 'host', // Vault service host
		port: 'port', // Vault service port
		auth: { } // Object containing auth info
		debug: false // Optional field, enables logging
	},
}
```

### Sources of config data

1. `.env` files
2. `process.env` (environment variables)
3. Vault
4. `rawConfiguration` object passed to the module

### Example of how config object is constructed

#### Example files

Example `rawConfiguration` object:

```
{
	database: {
		password: 'password',
		db: 'db',
	},
}
```

Example `.env` file:

```
FOO=bar
DATABASE_USERNAME="{{database/username}}"
DATABASE_PASSWORD="{{secrets/db.password}}"
SOMESERVICE_LINK='s3://{{someService/data.username}}:{{secrets/someService.password}}@{{someService/data.host}}'
EXAMPLE_JSON='{  "example": "json" }'
```

Example `.env.local` file:

```
FOO=baz
```

Example environment variable (set through command line (`ARG=value npm start`) or any other way, not including `.env` files):

```
DATABASE_USERNAME=example_user
```

#### Steps to produce config object

1. Data from `.env` files gets loaded into `process.env`
2. Keys from `process.env` get modified to a path-friendly format (e.g. `DATABASE_USERNAME` => `database.username`)
3. Modified data gets loaded into `@nestjs/config` `ConfigService`, where `rawConfiguration` is stored, and values with the same keys are overwritten by the environment values.
   1. At this step, each value is also checked to see if its a JSON string, and if it is, it gets converted to an object
4. Each value is tested against a RegExp to see if it is a Vault path 5. If it is, the value is replaced with the data fetched from Vault

#### Final config object

```
{
	foo: 'baz', // Overwritten by .env.local file
	database: {
		username: 'example_user' // Overwritten by command line argument
		password: 'vaultValue' // Value from Vault stored at 'secrets/db.password'
		db: 'db' // Value from 'rawConfiguration' object,
	},
	someService: {
		link: 's3://vaultValue1:vaultValue2@vaultValue3' // Multiple values from Vault
	},
	example: {
		json: {
			example: 'json',
		},
	},
}
```

### Helpers in `environment.helper.ts`

There are several helpers to process `.env` files and `env`. Detailed descriptions provided in places of definition

1. `loadEnvFiles` – Loading `.env` files
2. `processFromEnv`– Processing config and `process.env` variable
3. `processBool` – Type checking and identifying if `string`

### Resolving config without NestJs application context

In some cases you might want to resolve configs before running the actual application or using config outside nestjs context

You can use the static `resolve` method in the config module to resolve configs

1. Creates a standalone nest application and injects the requested config
2. Resolves the configs
3. Closes the created application

## Example of how to resolve config without NestJs application context

```ts
const appConfig = registerAs(APP_CONFIG_PATH, () => ({
  port: 3000,
  host: "0.0.0.0",
  jwt: {
    secret: "",
  },
  session: {
    secret: "",
  },
}));

const appConfigs = await ConfigModule.resolve("app", appConfig);
```


## Common library usage

1. Import `ConfigModule` in the root app module
   1. A `load` field of the config options should be filled with default config objects
   2. These defaults should be overwritten by the config library later

```
import { Module } from '@nestjs/common';

import { ConfigModule } from '@libs/config';
import { databaseConfig } from '@libs/db';

import { app } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [app, databaseConfig] }),
  ],
})
class AppModule {}
```

2. Use a `ConfigService` for fetching configurations
   1. A config module is global by default so `ConfigService` can be used everywhere in the app where the `ConfigModule` is imported once

```
import { Module } from '@nestjs/common';

import { ConfigService } from '@libs/config';

import { app } from './config';

@Module({
  imports: [
    ImportedModule.forRoot({
	  useFactory: (configService: ConfigService) =>
	    configService.get('config.path'),
	  inject: [ConfigService],
	}),
  ],
})
class SomeModule {}
```

2.  Single configuration can be injected and used inside a service

```ts
import { ConfigType } from "@nestjs/config";
import { Inject } from "@nestjs/common";

class SomeService {
  constructor(
    @Inject(dataBaseConfig.KEY)
    private readonly dbConfig: ConfigType<typeof dataBaseConfig>
  ) {}
}
```

## Using TestConfigService

For writing unit tests for apps or libs which depend on config lib, use `TestConfigService` instead of `ConfigService` and `VaultService`. Its constructor receives a flat mock object of config parameters as an argument.

Example of usage:

```ts
import { CONFIG_SERVICE_INTERFACE_TOKEN, ConfigModule, ConfigServiceInterface } from '@libs/config';
import SomeService from './SomeService.ts';

@Module({
  providers: [
    {
      provide: CONFIG_SERVICE_INTERFACE_TOKEN,
      useFactory: () => {
        return new TestConfigService({ someKey: 'someValue' }),
      }
    },
    {
      provide: SomeService,
      useFactory: (configService: ConfigServiceInterface): SomeService => {
        return new SomeService(configService.get('someKey'));
      },
      inject: [CONFIG_SERVICE_INTERFACE_TOKEN],
    },
  ],
})
class SomeModule {}

```

Mock methods of `TestConfigService` and implement missing ones

```ts
vaultServiceMock.has = jest
  .fn()
  .mockImplementation(function (path: string): boolean {
    return {}.hasOwnProperty.call(this.config, path);
  });

jest.spyOn(vaultServiceMock, "get");
jest.spyOn(nestConfigServiceMock, "get");
```


