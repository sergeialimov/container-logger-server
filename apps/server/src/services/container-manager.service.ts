import { DockerService } from '@libs/shared';

import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class ContainerManagerService {
  private readonly executorClients: ClientProxy[];

  constructor (
    private readonly dockerService: DockerService,
  ) {
    // Set up clients for each microservice instance
    this.executorClients = [
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3002 },
      }),
      ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3003 },
      }),
    ];
  }

  public async manageContainerLogs (): Promise<void> {
    const highPriorityContainers = await this.dockerService.fetchHighPriorityContainers();
    const perServiceCount = Math.ceil(highPriorityContainers.length / this.executorClients.length);

    this.executorClients.forEach((client, index) => {
      const assignedContainers = highPriorityContainers.slice(index * perServiceCount, (index + 1) * perServiceCount);
      client.emit('handle_containers', { containers: assignedContainers });
    });
  }
}
