import { StorageOptions } from './storage-options.interface';

export interface StorageOptionsFactory {
  createStorageOptions(): Promise<StorageOptions> | StorageOptions;
}
