import { merge } from 'lodash';

import { ENVIRONMENT } from '../../../src/constants';
import { processBool, processFromEnv, getEnvironmentalEntries } from '../../../src/helpers';

describe('processBool', () => {
  it('should recognize booleans', () => {
    expect(processBool('true')).toBe(true);
    expect(processBool('false')).toBe(false);
    expect(processBool(' true ')).toBe(true);
    expect(processBool(' True ')).toBe(true);
    expect(processBool(' TRUE ')).toBe(true);
    expect(processBool(' false')).toBe(false);
  });

  it('should not recognize mistyped values as booleans', () => {
    expect(processBool('tue')).not.toBe(true);
    expect(processBool('flse')).not.toBe(false);
  });

  it('should properly process string values', () => {
    expect(processBool('tue')).toBe('tue');
    expect(processBool('flse')).toBe('flse');
    expect(processBool(' TRU ')).toBe(' TRU ');
  });

  it('should properly process explicit booleans', () => {
    expect(processBool(true)).toBe(true);
    expect(processBool(false)).toBe(false);
  });
});

describe('processFromEnv', () => {
  // fine way to clone due to process.env is flat and wo methods
  const initialProcessEnvBackup = { ...process.env };

  // these values with different types will be replaced
  const configParamFixtures = {
    string: 'old_string',
    path: '{{path/to/old/place}}',
    stringBool: 'f',
    booleanBool: false,
    array: [
      'old_value',
      'old_value1',
      'old_value2',
      'old_value3',
    ],
    json: { 'old_foo': 'old_bar' },
    // TODO update processEnv to be able to resolve this case with arrayWithJSON
    // arrayWithJSON: [{ url: 'old/url' }, { defaultUrl: 'older/url' }],
    nested: {
      postgres: {
        host: 'old_host',
        port: 'old_but_fine_port',
      },
    },
  };

  // with these values (if keys from the config start with keys below)
  const processEnvFixtures = {
    sTring: 'new_string',
    PATH: '{{path/to/new/place}}',
    STRINGBOOL: 'true',
    BOOLEANBOOL: 'true',
    ARRAY: '[1, "2", true]',
    JSON: '{"new_foo": "new_bar"}',
    // arrayWithJSON_url1: 'new/url',
    'nested_postgres_host': 'new_host',
    'nested_postgres_pass': 'pass_shouldnt_be_added_to_config',
    // just to mention why key naming is important, this pints to "nested.path.postgres.pass"
    'nested_path_postgres_pass': 'pass_shouldnt_be_added_to_config',
  };

  // so we will have this
  const expectedConfigParamFixtures = {
    string: processEnvFixtures.sTring,
    path: processEnvFixtures.PATH,
    stringBool: JSON.parse(processEnvFixtures.STRINGBOOL),
    booleanBool: JSON.parse(processEnvFixtures.BOOLEANBOOL),
    array: merge(configParamFixtures.array, JSON.parse(processEnvFixtures.ARRAY)),
    json: {
      'old_foo': 'old_bar',
      ...JSON.parse(processEnvFixtures.JSON),
    },
    // arrayWithJSON: one new url and one default url
    nested: {
      postgres: {
        host: processEnvFixtures.nested_postgres_host,
        port: 'old_but_fine_port',
      },
    },
  };

  // means when an app starts with validationSchema in ConfigModuleOptions
  // simulate process.env values inside _PROCESS_ENV_VALIDATED then
  const testConfigValidated = {
    _PROCESS_ENV_VALIDATED: { ...processEnvFixtures },
    ...configParamFixtures,
  };

  // means when an app starts without validationSchema in ConfigModuleOptions
  // and takes env variables from process.env directly
  const testConfigWithoutValidation = { ...configParamFixtures };

  afterEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...initialProcessEnvBackup }; // Restore old environment
  });

  it('should populate config values when process.env came only', () => {
    // alter the process.env
    process.env = { ...processEnvFixtures };
    const res = processFromEnv(testConfigWithoutValidation);
    expect(res).toStrictEqual(expectedConfigParamFixtures);
  });

  it('should populate config values when config params has _PROCESS_ENV_VALIDATED property', () => {
    // no changes in the process.env due to config param has _PROCESS_ENV_VALIDATED to process
    const res = processFromEnv(testConfigValidated);
    expect(res).toStrictEqual({
      _PROCESS_ENV_VALIDATED: { ...processEnvFixtures },
      ...expectedConfigParamFixtures,
    });
  });
});

describe('getEnvironmentalEntries', () => {

  const TestEntry1 = jest.fn();
  const TestEntry2 = jest.fn();
  const initialEnv = process.env['NODE' +'_ENV'];

  afterEach(() => {
    process.env['NODE' + '_ENV'] = initialEnv;
  });

  it('should return expected commands when environment matches', () => {
    process.env['NODE' +'_ENV'] = ENVIRONMENT.DEVELOPMENT;

    const commands = getEnvironmentalEntries(
      [ TestEntry1 , TestEntry2 ],
      [ ENVIRONMENT.DEVELOPMENT, ENVIRONMENT.STAGING ],
    );

    expect(commands).toEqual([
      TestEntry1,
      TestEntry2,
    ]);
  });

  it('should return expected dev commands when node environment is internally undefined', () => {
    process.env['NODE' +'_ENV'] = undefined;

    const commands = getEnvironmentalEntries(
      [ TestEntry1 , TestEntry2 ],
      [ ENVIRONMENT.DEVELOPMENT, ENVIRONMENT.STAGING ],
    );

    expect(commands).toEqual([
      TestEntry1,
      TestEntry2,
    ]);
  });

  it('should return empty array when environment doesn\'t match', () => {
    process.env['NODE' +'_ENV'] = ENVIRONMENT.PRODUCTION;

    const commands = getEnvironmentalEntries(
      [ TestEntry1 , TestEntry2 ],
      [ ENVIRONMENT.DEVELOPMENT, ENVIRONMENT.STAGING ],
    );

    expect(commands).toEqual([]);
  });
})
