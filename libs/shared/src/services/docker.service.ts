import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { LogService } from './log.service';
import { LogDTO } from '../dtos';
import { convertIsoToUnixTimestamp } from '../helpers';

interface Container {
  Id: string;
  Labels: { [key: string]: string };
  // ... other properties if needed
}

const instance = axios.create({
  baseURL: 'http://localhost:2375',
  socketPath: '/var/run/docker.sock',
  headers: { 'Content-Type': 'application/json' },
});

@Injectable()
export class DockerService {
  constructor (
    private readonly logService: LogService,

  ) {}
  private async getContainerLogs (containerId: string, tail = 'all', sinceTimestamp?: string): Promise<string[]> {
    try {
      let queryParams = `stdout=true&stderr=true&tail=${tail}`;
      if (sinceTimestamp) {
        const unixTimestamp = convertIsoToUnixTimestamp(sinceTimestamp);
        queryParams += `&since=${unixTimestamp}`;
      }

      const response = await instance.get(`/containers/${containerId}/logs?${queryParams}`);
      return response.data.split('\n').filter((line: string) => line);
    } catch (error) {
      console.error(`Error fetching logs for container ${containerId}:`, error.message);
      return [];
    }
  }

  public async fetchLogsPaginated (containerId: string, sinceTimestamp?: string, logCountPerPage = 50): Promise<LogDTO[]> {
    let lastTimestamp = sinceTimestamp;
    const allLogs: LogDTO[] = []; // Explicitly type allLogs as LogDTO[]

    while (true) {
      const rawLogs = await this.getContainerLogs(containerId, logCountPerPage.toString(), lastTimestamp);
      const logs = rawLogs
        .map((log) => this.logService.transformLogToDTO(log))
        .filter((dto): dto is LogDTO => dto !== undefined);

      if (logs.length === 0) {
        break;
      }

      allLogs.push(...logs);
      lastTimestamp = logs[logs.length - 1]?.timestamp;

      if (logs.length < logCountPerPage) {
        break;
      }
    }
    return allLogs;
  }

  public async fetchHighPriorityContainers (minPriority: number = 3): Promise<string[]> {
    try {
      const response = await instance.get('/containers/json');
      const allContainers: Container[] = response.data; // Define the type of allContainers

      const highPriorityContainers = allContainers
        .filter((container: Container) => {
          const priority = parseInt(container.Labels['priority'], 10);
          return !isNaN(priority) && priority > minPriority;
        })
        .map((container: Container) => container.Id);

      return highPriorityContainers;
    } catch (error) {
      console.error('Error fetching high priority containers:', error.message);
      return [];
    }
  }

  public async streamContainerLogs (containerId: string): Promise<void> {
    try {
      const queryParams = `stdout=true&stderr=true&follow=true`;
      const stream = await instance.get(`/containers/${containerId}/logs?${queryParams}`, { responseType: 'stream' });

      stream.data.on('data', (chunk) => {
        // Process each chunk of data
        const logLine = chunk.toString();
        console.log(logLine);  // Replace this with your actual log processing logic
      });

      stream.data.on('end', () => {
        console.log(`Stream ended for container ${containerId}`);
      });
    } catch (error) {
      console.error(`Error streaming logs for container ${containerId}:`, error.message);
    }
  }
}
