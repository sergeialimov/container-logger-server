import { DockerService, LogService, LOGS_STORAGE_SERVICE_TOKEN } from '@libs/shared';
import { StorageServiceInterface } from '@libs/storage';

import { Inject, Logger } from '@nestjs/common';

import { CommandBase } from '@libs/console/components/command';
import { InputOption } from '@libs/console/components/input';
import { Command } from '@libs/console/decorators';
import { InputInterface, OutputInterface } from '@libs/console/interfaces';
import { CommandExecutionStatus } from '@libs/console/types';

@Command()
export class GetContainerLogsCommand extends CommandBase {
  constructor (
    @Inject(LOGS_STORAGE_SERVICE_TOKEN)
    private readonly storageService: StorageServiceInterface,
    private readonly dockerService: DockerService,
    private readonly logService: LogService,
    // private readonly logger: Logger,
  ) {
    super();
  }

  protected configure (): void {
    this.setName('log:get-container-logs')
      .setDescription('Get container logs')
      .setProcessTitle('log:get-container-logs')
      .addOption('container', 'c', InputOption.VALUE_REQUIRED, 'Container name');
  }
  protected async execute (input: InputInterface, output: OutputInterface): Promise<number> {
    try {
      const containerName = input.getOption('container') as string;

      Logger.log(`Getting logs for container ${containerName}`);

      let lastAddedTimestamp = '';

      const doesIndexExist = await this.storageService.indexExists(containerName);

      if (doesIndexExist) {
        Logger.log(`Index ${containerName} is found on ElasticSearch`);

        lastAddedTimestamp = await this.storageService.getLastAddedTimestamp(containerName);
      }

      const logs = await this.dockerService.fetchLogsPaginated(containerName, lastAddedTimestamp);

      if (logs.length === 0) {
        Logger.log(`No new logs found for container ${containerName}`);
        return CommandExecutionStatus.SUCCESS;
      }

      if (!doesIndexExist) {
        Logger.log('Index is not found on ElasticSearch. It will be created');
        await this.storageService.createIndex(containerName, {});
        Logger.log(`Index is created on ElasticSearch`);
      }

      const batchSize = 100;
      for (let i = 0; i < logs.length; i += batchSize) {
        const batch = logs.slice(i, i + batchSize);
        let bulkRequestBody = '';

        for (const logEntry of batch) {
          const actionMetaData = `{ "index" : { "_index" : "${containerName}" } }\n`;
          bulkRequestBody += actionMetaData;
          bulkRequestBody += JSON.stringify(logEntry) + '\n';
        }

        await this.storageService.write(containerName, bulkRequestBody, {});
      }
      return CommandExecutionStatus.SUCCESS;
    } catch (error) {
      console.log('-- error.message', error.message);
      Logger.log(error.message);
      return CommandExecutionStatus.FAILURE;
    }
  }
}
