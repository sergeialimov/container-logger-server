import {
  ElasticsearchAdapter,
} from '../adapter';
import {
  StorageServiceType,
  StorageServiceInterface,
  // ElasticsearchAdapterOptions,
  StorageOptions,
  AdapterInterface,
  AdapterOptions,
} from '../interfaces';
import { StorageService } from '../services';

const getAdapter = (type: StorageServiceType, adapterOptions: AdapterOptions): AdapterInterface => {
  switch (type) {
    case StorageServiceType.ELASTICSEARCH: {
      return new ElasticsearchAdapter();
      // return new ElasticsearchAdapter(adapterOptions as ElasticsearchAdapterOptions);
    }

    default:
      throw new Error('Unknown adapter!');
  }
};

export const getService = (storageOptions: StorageOptions): StorageServiceInterface => {
  const { type } = storageOptions;
  const { options: serviceOptions, adapter: adapterOptions } = storageOptions[type] || {};

  const adapter = getAdapter(type, adapterOptions);

  return new StorageService(adapter, serviceOptions);
};
