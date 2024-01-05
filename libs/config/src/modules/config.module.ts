import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
  ConfigModuleOptions,
} from '@nestjs/config';

// TODO @nestjs/config doesnt export tokens, try to contribute it in nestjs mb?
import {
  CONFIGURATION_TOKEN,
  CONFIGURATION_SERVICE_TOKEN,
} from '@nestjs/config/dist/config.constants';
import _ from 'lodash';

import { DisplayConfigCommand } from '../commands';
import {
  CONFIG_SERVICE_INTERFACE_TOKEN,
  VAULT_SERVICE_INTERFACE_TOKEN,
  CONFIGURATION_TOKEN_LOCAL,
  CONFIGURATION_SERVICE_TOKEN_LOCAL,
} from '../constants';
import { defaultConfigModuleOptions } from '../defaults';
import { loadEnvFiles, processFromEnv } from '../helpers';
import { VaultServiceInterface, ConfigServiceInterface } from '../interfaces';
import { VaultService, ConfigService } from '../services';

/**
 * The order of instantiation
 * ↓ 1. CONFIGURATION_TOKEN_LOCAL
 * ↓ 2. CONFIGURATION_SERVICE_TOKEN_LOCAL
 * ↓ 3. VAULT_SERVICE_INTERFACE_TOKEN point on interface for the VaultService
 *   4. CONFIG_SERVICE_INTERFACE_TOKEN point on interface for the ConfigService, but
 *       note that ConfigService is designed to provide both ConfigService and VaultService data
 *       via ConfigServiceInterface methods
 */
@Module({
  providers: [
    {
      provide: CONFIG_SERVICE_INTERFACE_TOKEN,
      useFactory: (
        nestConfigService,
        vaultService: VaultServiceInterface,
      ): ConfigServiceInterface => new ConfigService(nestConfigService, vaultService),
      inject: [ CONFIGURATION_SERVICE_TOKEN_LOCAL, VAULT_SERVICE_INTERFACE_TOKEN ],
    },
    {
      provide: CONFIGURATION_TOKEN_LOCAL,
      useFactory: (configService: NestConfigService, rawConfiguration): Record<string, unknown> =>
        processFromEnv(rawConfiguration),
      inject: [ CONFIGURATION_SERVICE_TOKEN, CONFIGURATION_TOKEN ], // CONFIGURATION_SERVICE_TOKEN is required to force load the nestjs-config
    },
    {
      provide: CONFIGURATION_SERVICE_TOKEN_LOCAL,
      useFactory: (rawConfiguration): NestConfigService => new NestConfigService(rawConfiguration),
      inject: [ CONFIGURATION_TOKEN_LOCAL ],
    },
    {
      provide: VAULT_SERVICE_INTERFACE_TOKEN,
      useFactory: async (rawConfiguration, configService): Promise<VaultServiceInterface> => {
        const vaultService = new VaultService(rawConfiguration, configService);
        await vaultService.init();

        return vaultService;
      },
      inject: [ CONFIGURATION_TOKEN_LOCAL, CONFIGURATION_SERVICE_TOKEN_LOCAL ],
    },
  ],
  exports: [ CONFIG_SERVICE_INTERFACE_TOKEN, VAULT_SERVICE_INTERFACE_TOKEN ],
})
class ConfigCoreModule {}

/**
 * Please use ConfigService since it contains the VaultService too.
 *
 * @param appName - must be specified, used to understand which .env file to load for the application (.env.${appName})
 */
@Module({})
export class ConfigModule {
  static forRoot (appName: string, options?: ConfigModuleOptions): DynamicModule {
    const envFilePath = loadEnvFiles(appName);
    const nestConfigOptions = _.merge(
      {},
      defaultConfigModuleOptions,
      { envFilePath },
      options,
    );

    // Redo load array merging
    nestConfigOptions.load = [ ..._.get(options, 'load', []), ...defaultConfigModuleOptions.load ];

    return {
      module: ConfigModule,
      global: true,
      imports: [ NestConfigModule.forRoot(nestConfigOptions), ConfigCoreModule ],
      providers: [
        {
          provide: VaultService,
          useFactory: (vaultService: VaultServiceInterface): VaultServiceInterface => vaultService,
          inject: [ VAULT_SERVICE_INTERFACE_TOKEN ],
        },
        {
          provide: ConfigService,
          useFactory: (configService: ConfigServiceInterface): ConfigServiceInterface =>
            configService,
          inject: [ CONFIG_SERVICE_INTERFACE_TOKEN ],
        },
        DisplayConfigCommand,
      ],
      exports: [ ConfigService, VaultService, DisplayConfigCommand ],
    };
  }
}
