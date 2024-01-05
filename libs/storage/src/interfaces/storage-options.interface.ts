import { StorageServiceOptions } from './storage-service-options.interface';
import { StorageServiceType } from './storage-service-type.enum';
import { ElasticsearchAdapterOptions } from './elasticsearch-adapter-options.interface';

export interface StorageOptions {
  [ StorageServiceType.ELASTICSEARCH ]: {
      options: StorageServiceOptions;
      adapter: ElasticsearchAdapterOptions;
    };
  type: StorageServiceType;
}
