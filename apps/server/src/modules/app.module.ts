import { DockerService, LogService } from '@libs/shared';

import { Module } from '@nestjs/common';

import { CoreModule } from './core.module';
import { ExecutorController } from '../controllers';
import { ContainerManagerService, ExecutorService } from '../services';

@Module({
  imports: [ CoreModule ],
  controllers: [ ExecutorController ],
  providers: [
    ContainerManagerService,
    ExecutorService,
    DockerService,
    LogService,
  ],
})
export class AppModule {}
