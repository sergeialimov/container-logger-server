import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { ExecutorService } from '../services/';

@Controller()
export class ExecutorController {
  constructor (private readonly executorService: ExecutorService) {}

  @MessagePattern('handle_containers')
  async handleContainers (data: { containers: string[] }) {
    await this.executorService.processContainers(data.containers);
  }
}
