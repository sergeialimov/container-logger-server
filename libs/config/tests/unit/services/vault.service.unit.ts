/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService as NestConfigService } from '@nestjs/config';

import VaultClient from 'node-vault-client';

import { TestConfigService } from '../../../src/helpers';
import { VaultConfigInterface } from '../../../src/interfaces';
import { VaultService } from '../../../src/services/vault.service';

describe('VaultService', () => {
  const vaultConfig: VaultConfigInterface = {
    isEnabled: true,
    host: 'vaultHost',
    port: 30000,
    mountPoint: 'vaultMountPoint',
    auth: {
      type: 'type',
      config: {
        roleId: 'testRoleId',
        secretId: 'testSecretId',
      },
    },
  };
  const expectedAuthSection: Record<string, unknown> = {
    type: vaultConfig.auth.type,
    config: {
      'role_id': vaultConfig.auth.config.roleId,
      'secret_id': vaultConfig.auth.config.secretId,
    },
  };

  describe('test processValue and getFromVault', () => {
    let service: VaultService;
    let vaultClientSpy: jest.SpyInstance;
    let isEnabledSpy: jest.SpyInstance;
    let getFromVaultSpy: jest.SpyInstance;
    let formatVaultPathSpy: jest.SpyInstance;
    let processValueSpy: jest.SpyInstance = jest.spyOn(
      VaultService.prototype as any,
      'processValue',
    );

    beforeAll(async () => {
      service = new VaultService(
        {
          test: '{{foo/bar/baz/test}}',
          testObjectProperty: '{{foo/bar/object.testProp}}',
          multipleValues: 'db://{{username}}:{{object.db.password}}@{{host}}',
          null: '{{null}}',
        },
        // bad everywhere but fine here, cuz we are going to use ConfigServiceInterface only
        new TestConfigService({
          app: { debug: true },
          vault: vaultConfig,
        }) as NestConfigService,
      );
      vaultClientSpy = jest.spyOn(VaultClient, 'boot').mockImplementation(() => ({
        read: (path: string): { getData: () => unknown } => ({
          getData: (): unknown => {
            const data = {
              'foo/bar/baz/test': path,
              'foo/bar/object': { testProp: 'testPropValue' },
              username: 'username',
              host: 'host',
              object: { db: { password: 'password' }},
              null: null,
              notFound: undefined,
            };

            return { data: data[path.replace('vaultMountPoint/data/', '')] };
          },
        }),
      }));
      isEnabledSpy = jest.spyOn(service, 'isEnabled');
      processValueSpy = jest.spyOn(VaultService.prototype as any, 'processValue');
      getFromVaultSpy = jest.spyOn(VaultService.prototype as any, 'getFromVault');
      formatVaultPathSpy = jest.spyOn(VaultService.prototype as any, 'formatVaultPath');

      await service.init();
    });

    afterAll(() => {
      vaultClientSpy.mockRestore();
    });

    it('should instantiate VaultClient with proper arguments', () => {
      expect(isEnabledSpy).toBeCalled();
      expect(processValueSpy).toBeCalled();
      expect(getFromVaultSpy).toBeCalled();
      expect(formatVaultPathSpy).toBeCalled();
      expect(vaultClientSpy).toBeCalledWith('services', {
        api: { url: `${vaultConfig.host}:${vaultConfig.port}` },
        auth: expectedAuthSection,
        // eslint-disable-next-line no-console
        logger: console.log,
      });
    });

    it('should return a properly formatted Vault path', () => {
      expect(service.has('test')).toBeTruthy();
      expect(service.get('test')).toEqual('vaultMountPoint/data/foo/bar/baz/test');
    });

    it('should return an object property stored in Vault', () => {
      expect(service.has('testObjectProperty')).toBeTruthy();
      expect(service.get('testObjectProperty')).toEqual('testPropValue');
    });

    it('should return undefined', () => {
      expect(service.has('undefined')).toBeFalsy();
      expect(service.get('undefined')).toBeUndefined();
    });

    it('should return default value', () => {
      expect(service.get('undefined', 'defaultValue')).toBe('defaultValue');
    });

    it('should return null', () => {
      expect(service.has('null')).toBeTruthy();
      expect(service.get('null')).toBeNull();
    });

    it('should return multiple paths', () => {
      expect(service.has('multipleValues')).toBeTruthy();
      expect(service.get('multipleValues')).toEqual('db://username:password@host');
    });
  });

  describe('test errors', () => {
    let vaultBootSpy: jest.SpyInstance;

    beforeEach(() => {
      VaultService['vaultClient'] = null;
    });

    afterEach(() => {
      vaultBootSpy.mockRestore();
    });

    it("should throw a 'Key not found' error", async () => {
      const service = new VaultService(
        { notFound: '{{notFound}}' },
        new TestConfigService({
          app: { debug: true },
          vault: vaultConfig,
        }) as NestConfigService,
      );

      vaultBootSpy = jest.spyOn(VaultClient, 'boot').mockImplementation(() => ({ read: (path: string): { getData: () => unknown } => ({ getData: (): unknown => ({ data: path.indexOf('notFound') !== -1 ? undefined : path }) }) }));

      await expect(service.init()).rejects.toThrow(
        'Key vaultMountPoint/data/notFound was not found',
      );
    });

    it('should throw an error if the replacement is an object', async () => {
      const service = new VaultService(
        { test: 'db://{{test.object}}' },
        new TestConfigService({ vault: { isEnabled: true }}) as NestConfigService,
      );
      vaultBootSpy = jest.spyOn(VaultClient, 'boot').mockImplementation(() => ({ read: (): { getData: () => unknown } => ({ getData: (): unknown => ({ data: { object: {}}}) }) }));

      await expect(service.init()).rejects.toThrow(
        'Replacement must not be an Object or an Array when using multiple vault variables inside the same value',
      );
    });

    it('should throw an error if the replacement is an array', async () => {
      const service = new VaultService(
        { test: 'db://{{test.array}}' },
        new TestConfigService({ vault: { isEnabled: true }}) as NestConfigService,
      );
      vaultBootSpy = jest.spyOn(VaultClient, 'boot').mockImplementation(() => ({ read: (): { getData: () => unknown } => ({ getData: (): unknown => ({ data: { array: [] }}) }) }));

      await expect(service.init()).rejects.toThrow(
        'Replacement must not be an Object or an Array when using multiple vault variables inside the same value',
      );
    });
  });

  it('should return the same instance of VaultClient across multiple instances of VaultService', async () => {
    VaultService['vaultClient'] = null;

    const vaultBootSpy = jest.spyOn(VaultClient, 'boot').mockImplementation(() => ({ read: (path: string): { getData: () => unknown } => ({ getData: (): unknown => ({ data: path }) }) }));
    const service1 = new VaultService(
      { test: '{{test}}' },
      new TestConfigService({ vault: { isEnabled: true }}) as NestConfigService,
    );
    await service1.init();

    const service2 = new VaultService(
      { test: '{{test}}' },
      new TestConfigService({ vault: { isEnabled: true }}) as NestConfigService,
    );
    await service2.init();

    const service3 = new VaultService(
      { test: '{{test}}' },
      new TestConfigService({ vault: { isEnabled: true }}) as NestConfigService,
    );
    await service3.init();

    expect(vaultBootSpy).toBeCalledTimes(1);

    vaultBootSpy.mockRestore();
  });
});
