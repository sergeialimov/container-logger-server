import { Readable } from 'stream';

import { ConfigHelper } from '../helpers';

export interface AdapterInterface {
  write(path: string, contents: string | Readable | Buffer, config: ConfigHelper): Promise<void>;

  read(path: string): Promise<string>;

  createIndex(indexName: string, settings: object): Promise<void>;

  indexExists(indexName: string): Promise<boolean>;

  getLastAddedTimestamp(indexName: string): Promise<string>;
}
