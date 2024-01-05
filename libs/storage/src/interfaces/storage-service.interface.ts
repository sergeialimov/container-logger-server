import { Readable } from 'stream';

import { AdapterInterface } from './adapter.interface';

export interface StorageServiceInterface
  extends Omit<AdapterInterface, 'write' | 'copy' | 'move' | 'createDirectory'> {

  write(
    path: string,
    contents: string | Readable | Buffer,
    config: Record<string, unknown>
  ): Promise<void>;

  createIndex(indexName: string, settings: object): Promise<void>;

  indexExists(indexName: string): Promise<boolean>;

  getLastAddedTimestamp(indexName: string): Promise<string>;
}
