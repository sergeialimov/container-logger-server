import { DockerService, LogService } from '@libs/shared';

import { Module, OnModuleDestroy, Logger } from '@nestjs/common';

import { ConsoleModule as CoreConsoleModule } from '@libs/console/modules';

import { CoreModule } from './core.module';
import {
  GetContainerLogsCommand,
} from '../commands';

@Module({
  imports: [ CoreModule, CoreConsoleModule ],
  providers: [
    GetContainerLogsCommand,
    DockerService,
    LogService,
  ],
})
export class ConsoleModule implements OnModuleDestroy {
  // constructor (
  //   @Optional()
  //   @Inject(LoggerService)
  //   private readonly logger?: LoggerInterface,
  // ) {}

  async onModuleDestroy (): Promise<void> {
    Logger.log('Shutdown scripts CLI');
  }
}
