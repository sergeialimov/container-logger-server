import { ModuleMetadata, Type } from '@nestjs/common';

import { StorageOptionsFactory } from './storage-options-factory.interface';
import { StorageOptions } from './storage-options.interface';

export interface StorageModuleOptionsAsync extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  isGlobal?: boolean;
  useExisting?: Type<StorageOptionsFactory>;
  useClass?: Type<StorageOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<StorageOptions> | StorageOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
}
