import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './modules';
import { ContainerManagerService } from './services';

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // If you're also creating a microservice within this app
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3001,
    },
  });

  // Start the microservice
  // await app.startAllMicroservices();

  const containerManagerService = app.get<ContainerManagerService>(ContainerManagerService);

  containerManagerService.manageContainerLogs();

  // Start the HTTP server
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
