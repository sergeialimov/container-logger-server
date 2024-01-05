import { Readable } from 'stream';

import { ConfigHelper } from '../helpers';
import { AdapterInterface } from '../interfaces';

export abstract class AbstractAdapter implements AdapterInterface {
  constructor () {}

  public abstract write (
    path: string,
    contents: string | Readable | Buffer,
    config: ConfigHelper
  ): Promise<void>;

  public abstract read (path: string): Promise<string>;

  public abstract createIndex (indexName: string, settings: object): Promise<void>;

  public abstract indexExists (indexName: string): Promise<boolean>;

  public abstract getLastAddedTimestamp (indexName: string): Promise<string>;

}
