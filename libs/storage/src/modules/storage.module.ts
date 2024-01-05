// import { Module, DynamicModule, Provider } from '@nestjs/common';
import { Module, DynamicModule, Provider, InjectionToken } from '@nestjs/common';

import { Type } from '@nestjs/common/interfaces';

import { STORAGE_OPTIONS_TOKEN, STORAGE_SERVICE_TOKEN } from '../constants';
import { getService } from '../helpers';
import {
  StorageOptionsFactory,
  StorageModuleOptions,
  StorageModuleOptionsAsync,
  StorageServiceInterface,
} from '../interfaces';

@Module({})
export class StorageModule {
  public static forRoot (options: StorageModuleOptions): DynamicModule {
    const serviceProvider = StorageModule.createServiceProvider(options);

    return {
      module: StorageModule,
      global: options.isGlobal,
      providers: [
        { provide: STORAGE_OPTIONS_TOKEN, useValue: options },
        serviceProvider,
      ],
      exports: [ serviceProvider ],
    };
  }

  public static forRootAsync (options: StorageModuleOptionsAsync): DynamicModule {
    const asyncProviders = StorageModule.createAsyncProviders(options);
    const serviceProvider = StorageModule.createServiceProvider(options);

    return {
      module: StorageModule,
      imports: options.imports,
      global: options.isGlobal,
      providers: [ ...asyncProviders, serviceProvider ],
      exports: [ serviceProvider ],
    };
  }

  private static createAsyncProviders (options: StorageModuleOptionsAsync): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [ StorageModule.createAsyncOptionsProvider(options) ];
    }

    if (options.useClass) {
      return [
        StorageModule.createAsyncOptionsProvider(options),
        { provide: options.useClass, useClass: options.useClass },
      ];
    }

    // Handle the case where options.useClass is undefined
    // throw new Error('useClass is undefined');
    return [];
  }

  // private static createAsyncOptionsProvider (options: StorageModuleOptionsAsync): Provider {
  //   if (options.useFactory) {
  //     return {
  //       provide: STORAGE_OPTIONS_TOKEN,
  //       useFactory: options.useFactory,
  //       inject: options.inject || [],
  //     };
  //   }

  //   return {
  //     provide: STORAGE_OPTIONS_TOKEN,
  //     useFactory: async (optionsFactory: StorageOptionsFactory): Promise<StorageModuleOptions> =>
  //       await optionsFactory.createStorageOptions(),
  //     inject: [ options.useClass || options.useExisting ],
  //   };
  // }

  // private static createAsyncOptionsProvider(options: StorageModuleOptionsAsync): Provider {
  //   const injectTokens = [options.useClass, options.useExisting].filter(token => token !== undefined);

  //   if (options.useFactory) {
  //     return {
  //       provide: STORAGE_OPTIONS_TOKEN,
  //       useFactory: options.useFactory,
  //       inject: options.inject || [],
  //     };
  //   }

  //   return {
  //     provide: STORAGE_OPTIONS_TOKEN,
  //     useFactory: async (optionsFactory: StorageOptionsFactory): Promise<StorageModuleOptions> =>
  //       await optionsFactory.createStorageOptions(),
  //     inject: injectTokens.length > 0 ? injectTokens : undefined, // Only use injectTokens if it's not empty
  //   };
  // }

  private static createAsyncOptionsProvider (options: StorageModuleOptionsAsync): Provider {
    const injectTokens: (Type<StorageOptionsFactory> | InjectionToken)[] = [];

    // Add tokens to injectTokens only if they are defined
    if (options.useClass) {
      injectTokens.push(options.useClass);
    }
    if (options.useExisting) {
      injectTokens.push(options.useExisting);
    }

    if (options.useFactory) {
      return {
        provide: STORAGE_OPTIONS_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: STORAGE_OPTIONS_TOKEN,
      useFactory: async (optionsFactory: StorageOptionsFactory): Promise<StorageModuleOptions> =>
        await optionsFactory.createStorageOptions(),
      inject: injectTokens, // This array will only contain defined tokens
    };
  }

  private static createServiceProvider (
    options: StorageModuleOptions | StorageModuleOptionsAsync,
  ): Provider {
    return {
      provide: options.name || STORAGE_SERVICE_TOKEN,
      useFactory: (storageOptions: StorageModuleOptions): StorageServiceInterface =>
        getService(storageOptions),
      inject: [ STORAGE_OPTIONS_TOKEN ],
    };
  }
}
