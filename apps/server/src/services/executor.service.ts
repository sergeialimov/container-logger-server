import { DockerService, LOGS_STORAGE_SERVICE_TOKEN } from '@libs/shared';
import { StorageServiceInterface } from '@libs/storage';

import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExecutorService {
  constructor (
    @Inject(LOGS_STORAGE_SERVICE_TOKEN)
    private readonly storageService: StorageServiceInterface,
    private readonly dockerService: DockerService,
  ) {}

  public async processContainers (containerIds: string[]): Promise<void> {
    for (const containerId of containerIds) {
      this.dockerService.streamContainerLogs(containerId)
        .catch((error) =>
          console.error(`Error streaming logs for container ${containerId}:`, error.message));
    }
  }

  public async processContainerLogs (containerId: string): Promise<void> {
    try {
      // Step 1: Backfill missed logs
      let lastAddedTimestamp = '';
      const doesIndexExist = await this.storageService.indexExists(containerId);
      if (doesIndexExist) {
        Logger.log(`Index ${containerId} is found on ElasticSearch`);
        lastAddedTimestamp = await this.storageService.getLastAddedTimestamp(containerId);
      }
      const missedLogs = await this.dockerService.fetchLogsPaginated(containerId, lastAddedTimestamp);

      if (!doesIndexExist) {
        Logger.log('Index is not found on ElasticSearch. It will be created');
        await this.storageService.createIndex(containerId, {});
        Logger.log(`Index is created on ElasticSearch`);
      }

      const batchSize = 100;
      for (let i = 0; i < missedLogs.length; i += batchSize) {
        const batch = missedLogs.slice(i, i + batchSize);
        let bulkRequestBody = '';

        for (const logEntry of batch) {
          const actionMetaData = `{ "index" : { "_index" : "${containerId}" } }\n`;
          bulkRequestBody += actionMetaData;
          bulkRequestBody += JSON.stringify(logEntry) + '\n';
        }

        await this.storageService.write(containerId, bulkRequestBody, {});
      }

      // Step 2: Start streaming ongoing logs
      await this.dockerService.streamContainerLogs(containerId);
    } catch (error) {
      console.error(`Error processing logs for container ${containerId}:`, error.message);
    }
  }
}
