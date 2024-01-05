import { ConfigService as NestConfigService } from '@nestjs/config';

import { merge } from 'lodash';

import { ENVIRONMENT, ENVIRONMENT_MAPPING } from '../constants';
import { ConfigServiceInterface, VaultServiceInterface } from '../interfaces';

export class ConfigService implements ConfigServiceInterface {
  constructor (
    private readonly decoratedConfigService: NestConfigService,
    private readonly vaultService: VaultServiceInterface,
  ) {
  }

  get<T = unknown> (propertyPath: string, defaultValue?: T): T | undefined {
    let config = this.decoratedConfigService.get<T>(propertyPath, defaultValue);

    if (this.vaultService.has(propertyPath)) {
      const value = this.vaultService.get(propertyPath, defaultValue);

      const values = [
        'string',
        'number',
        'undefined',
        'boolean',
        'bigint',
      ];
      if (values.includes(typeof value) || value === null) {
        config = value;
      } else {
        config = merge(config, value || {});
      }
    }
    return config;
  }

  environment (): ENVIRONMENT {
    return ENVIRONMENT_MAPPING[ process.env[ 'NODE' + '_ENV' ] ];
  }
}
