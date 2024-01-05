import { Injectable } from '@nestjs/common';

import { Readable } from 'stream';

import { ConfigHelper, PathNormalizerHelper } from '../helpers';
import {
  StorageServiceInterface,
  AdapterInterface,
  StorageServiceOptions,
} from '../interfaces';

@Injectable()
export class StorageService implements StorageServiceInterface {
  constructor (
    private readonly adapter: AdapterInterface,
    private readonly storageOptions: StorageServiceOptions,
    private readonly pathNormalizer = new PathNormalizerHelper(),
  ) {}

  public async write (
    path: string,
    contents: string | Readable | Buffer,
    config: Record<string, unknown> = {},
  ): Promise<void> {
    return this.adapter.write(
      this.pathNormalizer.normalizePath(path),
      contents,
      new ConfigHelper(config),
    );
  }

  public async getLastAddedTimestamp (indexName: string): Promise<string> {
    return this.adapter.getLastAddedTimestamp(indexName);
  }

  public async read (path: string): Promise<string> {
    return this.adapter.read(this.pathNormalizer.normalizePath(path));
  }

  public async createIndex (indexName: string, settings: object = {}): Promise<void> {
    return this.adapter.createIndex(indexName, settings);
  }

  public async indexExists (indexName: string): Promise<boolean> {
    return this.adapter.indexExists(indexName);
  }

}
