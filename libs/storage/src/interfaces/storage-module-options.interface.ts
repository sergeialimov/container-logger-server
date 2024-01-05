import { StorageOptions } from './storage-options.interface';

export interface StorageModuleOptions extends StorageOptions {
  isGlobal?: boolean;
  name?: string;
}
