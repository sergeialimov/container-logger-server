import { get } from 'lodash';

import { ConfigServiceInterface } from '../interfaces';

export class TestConfigService implements ConfigServiceInterface {
  public constructor (private readonly config?: Record<string, unknown>) {
    this.config = config || {};
  }

  get<T = unknown>(propertyPath: string, defaultValue?: T): T | undefined {
    return get(this.config, propertyPath, defaultValue) as T;
  }
}
