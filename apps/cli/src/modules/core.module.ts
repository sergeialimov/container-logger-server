import { ConfigModule, ConfigService } from '@libs/config';
import { LOGS_STORAGE_SERVICE_TOKEN } from '@libs/shared';
import { setStorageConfig, StorageModule } from '@libs/storage';

import { Global, Module } from '@nestjs/common';
// import { ConfigType } from '@nestjs/config';

import { appConfig } from '../config';
import { APP_NAME } from '../constants';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(APP_NAME, {
      load: [
        appConfig,
        setStorageConfig('storage.logs'),
      ],
    }),
    StorageModule.forRootAsync({
      name: LOGS_STORAGE_SERVICE_TOKEN,
      useFactory: (config: ConfigService) => config.get('storage.logs'),
      inject: [ ConfigService ],
    }),
  ],
  providers: [],
  exports: [ StorageModule ],
})
export class CoreModule {
}
