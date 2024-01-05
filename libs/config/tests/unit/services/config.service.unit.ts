import { ConfigService as NestConfigService } from '@nestjs/config';

import { TestConfigService } from '../../../src/helpers';
import { ConfigService, VaultService } from '../../../src/services';

/**
 * We going to test ConfigService.
 * It consists of two configServices:
 * 1. NestConfigService - standard NestJS config service
 * 2. VaultService - service that support VaultServiceInterface
 *
 * We can mock both these services with TestConfigService, because
 * we don't need to test them. The only why we need them - we use
 * them.
 *
 */

describe('ConfigService', () => {
  // this is what we going to test
  let configService: ConfigService;
  // this is what we will mock
  let nestConfigServiceMock: NestConfigService;
  let vaultServiceMock: VaultService;

  const vaultServiceMockStorageRecords = {
    isEnabled: true, // Test of this property is in vault.service.test.ts
    vault: 'vault',
    both: 'vault',
    toMerge: {
      vaultString: 'vault',
      vaultNumber: 2,
      vaultBoolean: false,
      vaultUndefined: undefined,
      // vaultBigInt: 10000n, cannot be tested when targeting lower than ES2020
    },
  };
  const nestServiceMockStorageRecords = {
    nestConfig: 'nestConfig',
    both: 'nestConfig',
    toMerge: {
      nestConfigString: 'nestConfig',
      nestConfigNumber: 1,
      nestConfigBoolean: true,
      nestConfigUndefined: undefined,
      // nestConfigBigInt: 10000n, cannot be tested when targeting lower than ES2020
    },
  };

  const unifiedMockStorageRecords = {
    both: 'vault',
    merged: {
      nestConfigString: 'nestConfig',
      nestConfigBoolean: true,
      nestConfigNumber: 1,
      vaultString: 'vault',
      vaultNumber: 2,
      vaultBoolean: false,
    },
  };

  beforeAll(async () => {
    // instantiate ConfigService's two constructor parameters
    nestConfigServiceMock = new TestConfigService(
      nestServiceMockStorageRecords,
    ) as NestConfigService;
    vaultServiceMock = new TestConfigService(vaultServiceMockStorageRecords) as VaultService;

    // VaultService should have the 'has' method that we'll use;
    // we dont need to implement it, we will not use it, we trust it;
    // just declare this method
    vaultServiceMock.has = jest.fn().mockImplementation(function (path: string): boolean {
      return {}.hasOwnProperty.call(this.config, path);
    });
    // we'll need to spy this methods call during tests
    jest.spyOn(vaultServiceMock, 'get');
    jest.spyOn(nestConfigServiceMock, 'get');

    // instantiate test target
    configService = new ConfigService(nestConfigServiceMock, vaultServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return default value when both ConfigService and VaultService can't resolve the path", () => {
    const undefinedPath = 'undefinedPath';
    const defaultValue = 'defaultValue';

    // test getting undefinedPath
    expect(configService.get(undefinedPath, defaultValue)).toBe(defaultValue);

    // check that standard nest config service was questioned
    expect(nestConfigServiceMock.get).toHaveBeenCalledTimes(1);
    expect(nestConfigServiceMock.get).toHaveBeenCalledWith(undefinedPath, defaultValue);

    // check that vault tries to find a path
    expect(vaultServiceMock.has).toHaveBeenCalledTimes(1);
    expect(vaultServiceMock.has).toHaveBeenCalledWith(undefinedPath);

    // check that vault should not try to get a path, cuz there is no such path
    expect(vaultServiceMock.get).toHaveBeenCalledTimes(0);
    // so we got default value from the configService, not from the vaultService, just as we should
  });

  it('should return value from vaultService', () => {
    const path = 'vault';
    const expectedValue = vaultServiceMockStorageRecords.vault;

    expect(configService.get(path)).toBe(expectedValue);

    expect(nestConfigServiceMock.get).toHaveBeenCalledTimes(1);
    expect(nestConfigServiceMock.get).toHaveBeenCalledWith(path, undefined);

    expect(vaultServiceMock.get).toHaveBeenCalledTimes(1);
    expect(vaultServiceMock.get).toHaveBeenCalledWith(path, undefined);

    expect(vaultServiceMock.has).toHaveBeenCalledTimes(1);
    expect(vaultServiceMock.has).toHaveBeenCalledWith(path);
  });

  it('should return value from configService', () => {
    const path = 'nestConfig';
    const expectedValue = nestServiceMockStorageRecords.nestConfig;

    expect(configService.get(path)).toBe(expectedValue);

    expect(nestConfigServiceMock.get).toHaveBeenCalledTimes(1);
    expect(nestConfigServiceMock.get).toHaveBeenCalledWith(path, undefined);

    expect(vaultServiceMock.get).toHaveBeenCalledTimes(0);

    expect(vaultServiceMock.has).toHaveBeenCalledTimes(1);
    expect(vaultServiceMock.has).toHaveBeenCalledWith(path);
  });

  it('should return vaultService value over configService', () => {
    const path = 'both';
    const expectedValue = unifiedMockStorageRecords.both;

    expect(configService.get(path)).toBe(expectedValue);

    expect(nestConfigServiceMock.get).toHaveBeenCalledTimes(1);
    expect(nestConfigServiceMock.get).toHaveBeenCalledWith(path, undefined);

    expect(vaultServiceMock.has).toHaveBeenCalledTimes(1);
    expect(vaultServiceMock.has).toHaveBeenCalledWith(path);

    expect(vaultServiceMock.get).toHaveBeenCalledTimes(1);
    expect(vaultServiceMock.get).toHaveBeenCalledWith(path, undefined);
  });

  it('should merge values from vaultService and configService', () => {
    const path = 'toMerge';
    const expectedValue = unifiedMockStorageRecords.merged;

    expect(configService.get(path)).toEqual(expectedValue);

    expect(nestConfigServiceMock.get).toHaveBeenCalledTimes(1);
    expect(nestConfigServiceMock.get).toHaveBeenCalledWith(path, undefined);

    expect(vaultServiceMock.has).toHaveBeenCalledTimes(1);
    expect(vaultServiceMock.has).toHaveBeenCalledWith(path);

    expect(vaultServiceMock.get).toHaveBeenCalledTimes(1);
    expect(vaultServiceMock.get).toHaveBeenCalledWith(path, undefined);
  });

  it('should check with missing path', () => {
    const path = 'missing path';
    const expectedValue = undefined;

    expect(configService.get(path)).toBe(expectedValue);
    expect(configService.get(undefined)).toBe(expectedValue);
  });
});
