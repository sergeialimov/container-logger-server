import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';

import { StorageOptions, StorageServiceType } from '../interfaces';

export const setStorageConfig = (
  key = 'storage',
  options: StorageOptions = {
    [StorageServiceType.ELASTICSEARCH]: {
      options: {},
      adapter: {
        index: 'exampleIndex',
        prefix: 'prefix',
        // settings: {},
      },
    },
    type: StorageServiceType.ELASTICSEARCH,
  },
): (() => StorageOptions) & ConfigFactoryKeyHost<StorageOptions> => registerAs(key, () => options);[]
