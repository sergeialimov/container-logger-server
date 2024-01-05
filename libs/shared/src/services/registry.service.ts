import { Injectable } from '@nestjs/common';
import { DiscoverableDecorator, DiscoveryService, Reflector } from '@nestjs/core'

import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { isObject } from 'lodash';

@Injectable()
export class RegistryService {
  constructor (
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  getMetaDataMap<T = unknown, K = unknown>(decorator: DiscoverableDecorator<K>): Map<T, K> {
    return this.discoveryService.getProviders()
      .reduce((map, instanceWrapper) => {
        if (!this.isSearchable(instanceWrapper)) {
          return map;
        }
        const metaData = this.reflector.get<K>(decorator.KEY, instanceWrapper.instance.constructor);
        if (metaData) {
          map.set(instanceWrapper.instance as T, metaData);
        }
        return map;
      }, new Map<T, K>());
  }

  private isSearchable (instanceWrapper: InstanceWrapper): boolean {
    return instanceWrapper.isDependencyTreeStatic() && isObject(instanceWrapper.instance);
  }
}
