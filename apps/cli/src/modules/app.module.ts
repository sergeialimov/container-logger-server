import { DockerService, LogService } from '@libs/shared';

import { Module } from '@nestjs/common';

// import { AppController } from './app.controller';
import { CoreModule } from './core.module';

@Module({
  imports: [ CoreModule ],
  // controllers: [AppController],
  providers: [ DockerService, LogService ],
})
export class AppModule {}
