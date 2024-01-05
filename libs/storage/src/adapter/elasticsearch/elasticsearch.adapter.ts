import { LogDTO } from '@libs/shared';

import { Client } from '@elastic/elasticsearch';

import { ConfigHelper } from '../../helpers';
import { AbstractAdapter } from '../abstract.adapter';

export class ElasticsearchAdapter extends AbstractAdapter {
  private client: Client;

  constructor () {
    super();
    this.client = new Client({
      node: 'http://elasticsearch:9200',
      auth: {
        username: 'elastic',
        password: 'YourElasticPassword',
      },
    });
  }

  public async write (
    indexName: string,
    bulkContents: string,
    config: ConfigHelper,
  ): Promise<void> {
    // Split the bulkContents into individual operations and parse each as JSON
    const operations = bulkContents.split('\n').filter((line) => line);
    const body = operations.map((line) => JSON.parse(line));

    await this.client.bulk({
      refresh: config.get('refresh', false), // Use 'refresh' from config, or default to false
      body: body,
    });
  }

  public async read (path: string): Promise<string> {
    const result = await this.client.search({
      index: path,
    });

    return JSON.stringify(result);
  }

  public async getLastAddedTimestamp (index: string): Promise<string> {
    const result = await this.client.search({
      index,
      body: {
        size: 1,
        sort: [
          {
            timestamp: {
              order: 'desc',
            },
          },
        ],
      },
    });
    const hits = result.hits.hits;
    if (hits.length === 0) {
      return '';
    }
    const source = hits[0]['_source'] as LogDTO;
    if (source) {
      return source.timestamp;
    }
    return '';
  }

  public async indexExists (index: string): Promise<boolean> {
    return this.client.indices.exists({ index });
  }

  public async createIndex (indexName: string, settings: object = {}): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      if (!exists) {
        await this.client.indices.create({
          index: indexName,
          body: settings, // Include settings and mappings for the index
        });
      }
    } catch (error) {
      console.error('Error creating Elasticsearch index:', error);
      throw error;
    }
  }
}
