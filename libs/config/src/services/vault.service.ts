import { ConfigService as NestConfigService } from '@nestjs/config';

import { flatten } from 'flat';
import _ from 'lodash';
import VaultClient from 'node-vault-client';
import Lease from 'node-vault-client/src/Lease';

import { VaultAuthConfigInterface, VaultServiceInterface } from '../interfaces';

export class VaultService implements VaultServiceInterface {
  private readonly vaultPaths: Map<string, unknown>;
  private readonly internalConfig: Record<string, unknown>;

  private static vaultClient: VaultClient = null;

  private static evaluateRegEx = /{{([\s\S]+?)}}/g;
  private static interpolateRegEx = /{{([\s\S]+?)}}/g;

  constructor (
    private readonly rawConfiguration: Record<string, unknown>,
    private readonly configService: NestConfigService,
  ) {
    this.vaultPaths = new Map();
    this.internalConfig = {};
  }

  isEnabled (): boolean {
    return this.configService.get<boolean>('vault.isEnabled') as boolean;
  }

  /**
   * Resolve all Vault secrets by its paths to populate internal config object with them
   */
  async init (): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const promises: Array<Promise<{ key: string; value: unknown }>> = [];
    const flatConfig = flatten(this.rawConfiguration);

    // if we found something like {{keyword}} then have found a path to a secret stored inside the Vault
    // we create a stack of promises to resolve further
    for (const [ key, value ] of Object.entries(flatConfig)) {
      if (
        !key.startsWith('_PROCESS_ENV_VALIDATED') &&
        typeof value === 'string' &&
        new RegExp(VaultService.evaluateRegEx).test(value)
      ) {
        promises.push(
          this.processValue(value).then((vaultValue) => ({
            key,
            value: vaultValue,
          })),
        );
      }
    }

    // then we resolve those bunch of promises
    const vaultProcessedValues = await Promise.all(promises);

    // and populate internalConfig with values from the Vault
    for (const { key, value } of vaultProcessedValues) {
      _.set(this.internalConfig, key, value);
    }
  }

  has (propertyPath: string): boolean {
    return _.has(this.internalConfig, propertyPath);
  }

  get<T = unknown>(propertyPath: string, defaultValue?: T): T | undefined {
    return _.get(this.internalConfig, propertyPath, defaultValue) as T;
  }

  /**
   * Split the "value" part of a key-value from an .env.* file, lets call it "path"
   * by {{keyword}}s, e.g. "db://{{host}}@{{username}}:{{password}}"
   * and replace these {{keyword}}'s with its values from the Vault.
   * Then, return populated above "value" part, e.g. "db://local/user:pass"
   */
  private async processValue (path: string): Promise<Record<string, unknown> | string | null> {
    const regexp = new RegExp(VaultService.interpolateRegEx);

    let tmpResult;
    // to be set of key-value responses from getFromVault:
    const values: Record<string, Record<string, unknown> | string | null> = {};

    // one env-file value (path) can consists of more that one {{keyword}}s,
    // e.g. "db://{{host}}@{{username}}:{{password}}"
    // tp parse them the while and regexp.exec used
    // for the example above the while will return these, per each iteration:
    // 1: ["{{host}}", "host"]
    // 2: ["{{username}}", "username"]
    // 3: ["{{password}}", "password"]
    // 4 iteration: null (will be skipped)
    while ((tmpResult = regexp.exec(path)) !== null) {
      values[tmpResult[0]] = await this.getFromVault(tmpResult[1]);
    }

    // Full path replacement with the value
    // 1. in case of one {{keyword}} which equals to the "path" argument, e.g. {{secret}}
    // we can just return this secret value from the Vault right now
    if (Object.keys(values).length === 1 && Object.keys(values)[0] === path) {
      return Object.values(values)[0];
    }

    // 2. in other cases for, e.g. db://{{host}}@{{username}}:{{password}}
    // we need to
    // 1. replace every {{keyword}} in this path with its values from the Vault
    // 2. keep all strings around {{keyword}} of the path
    for (const [ key, replacement ] of Object.entries(values)) {
      if (replacement === null) {
        path = path.replace(new RegExp(key, 'g'), '');
        continue;
      }

      // some values cannot be stringified as a part of the path we
      // are building, but can be stored inside the Vault like
      // e.g. { "hosts": ["10.20.1.111", "10.20.1.112", "10.20.1.113"], port: "2181" }
      if (_.isObject(replacement) || _.isArray(replacement)) {
        throw new Error(
          'Replacement must not be an Object or an Array when using multiple vault variables inside the same value',
        );
      }

      path = path.replace(new RegExp(key, 'g'), String(replacement));
    }

    return path;
  }

  /**
   * Make two things:
   * 1. Request the Vault service for a secret value according to its Vault path
   * 2. Resolve received from the Vault value by the inner object path,
   *    e.g. you will get db.mysql.hosts value from the {{example-service/db}} Vault value
   *    in case you requested "{{example-service/db.mysql.hosts}}" path as an argument
   *
   * It is able to return a part of the JSON object as well, not just a string.
   */
  private async getFromVault (path: string): Promise<Record<string, unknown> | string | null> {
    // e.g. we have the {{verb-storage-service/app.jwt.secret}} path
    // from an .env.* file; to get the value from the Valve we need to
    // get the key-value JSON object by path "verb-storage-service/app"
    // and then get jwt.secret property from it
    const tmpValue: Array<string> = path.split('.');
    const vaultPath = this.formatVaultPath(tmpValue[0]);
    const objectPath = (tmpValue.length > 1 && tmpValue.splice(1).join('.')) || null;

    let value: Lease = null;

    // collect all JSON objects from the Vault by getting them via sVaultPaths to store them
    if (!this.vaultPaths.has(vaultPath)) {
      try {
        value = (await this.getVaultClient().read(vaultPath)) as Lease;
        value = value.getData('data')['data'];
      } catch (e) {
        value = undefined;
      }

      if (typeof value === 'undefined') {
        throw new Error(`Key ${vaultPath} was not found`);
      }

      this.vaultPaths.set(vaultPath, value);
    }

    // get the value which can be an object, a string, or null
    value = this.vaultPaths.get(vaultPath);

    if (value === null) {
      return null;
    }

    // return simple string value in case of it
    if (objectPath === null || typeof value !== 'object') {
      return value;
    }

    // in JSON case we get the final value by objectPath inside JSON object (mValue) to return
    // https://lodash.com/docs/#get
    return _.get(value, objectPath);
  }

  /**
   * Instantiate and return the Vault Client
   */
  private getVaultClient (): VaultClient {
    if (VaultService.vaultClient !== null) {
      return VaultService.vaultClient;
    }

    const formattedAuthConfigSection = this.formatAuthConfigSection(
      this.configService.get('vault.auth'),
    );

    VaultService.vaultClient = VaultClient.boot('services', {
      api: { url: `${this.configService.get('vault.host')}:${this.configService.get('vault.port')}` },
      auth: formattedAuthConfigSection,
      // eslint-disable-next-line no-console
      logger: this.configService.get('app.debug') ? console.log : false,
    });

    return VaultService.vaultClient;
  }

  private formatAuthConfigSection (authConfig: VaultAuthConfigInterface): Record<string, unknown> {
    return {
      ...(authConfig || {}),
      config: _.mapKeys(_.get(authConfig, 'config', {}), (value, key) => _.snakeCase(key)),
    };
  }

  private formatVaultPath (path: string): string {
    return [ this.configService.get('vault.mountPoint'), 'data', ...path.split('/') ].join('/');
  }
}
