import { Logger } from '@nestjs/common';

import { NestFactory } from '@libs/console/components/nest-factory';

import { ConsoleModule } from './modules';

// All interactions with date/time should be in UTC timezone
process.env.TZ = 'UTC';

async function bootstrap (): Promise<void> {
  const app = await NestFactory.createConsoleApplication(ConsoleModule as never, {
    abortOnError: false,
    bufferLogs: true,
  });

  // const loggerService = app.getApplicationContext().get(LoggerService);

  // app.getApplicationContext().useLogger(loggerService);

  await app.run().catch((e) => {
    Logger.log(e);
  });
}

bootstrap();
