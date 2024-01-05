import { flatten, unflatten } from 'flat';
import {
  get,
  isArray,
  isObject,
  merge,
  set,
} from 'lodash';
import * as path from 'path';

import { ENVIRONMENT, ENVIRONMENT_MAPPING, ENV_DIR } from '../constants';

export const processBool = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  switch (value.trim().toLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return value;
  }
};

const getNodeEnv = (): ENVIRONMENT =>
  // https://stackoverflow.com/questions/58090082/process-env-node-env-always-development-when-building-nestjs-app-with-nrwl-nx
  (ENVIRONMENT_MAPPING[process.env['NODE' + '_ENV']] as ENVIRONMENT) || ENVIRONMENT.DEVELOPMENT
;

/**
 * This helper function is useful for performing conditional processing before the `loadEnvFiles` utility function is called.
 * It employs the same technique that `loadEnvFiles` uses to override the value of `NODE_ENV`, so you can use it when you are unsure whether the config module
 * has already been loaded before your current module.
 */
export const getEnvironmentalEntries = <T>(entries: T[],envs: ENVIRONMENT[]): T[] => {
  const resolvedEnv = getNodeEnv();

  return envs.includes(resolvedEnv) ? entries : [];
}

/**
 * Please, read the https://github.com/motdotla/dotenv documentation to know:
 * "We will never modify any environment variables that have already been set.
 * In particular, if there is a variable in your .env file which collides with
 * one that already exists in your environment, then that variable will be skipped"
 *
 * It means, for example, that variables from ".env.prod.local" file will never be
 * overwritten.
 */
export const loadEnvFiles = (appName: string): Array<string> => {

  process.env['NODE' + '_ENV'] = getNodeEnv();

  return [
    path.join(`${ENV_DIR}`, `.env.${appName}.${process.env['NODE' + '_ENV']}.local`),
    path.join(`${ENV_DIR}`, `.env.${appName}.${process.env['NODE' + '_ENV']}`),
    path.join(`${ENV_DIR}`, `.env.${appName}.local`),
    path.join(`${ENV_DIR}`, `.env.${appName}`),
    path.join(`${ENV_DIR}`, `.env.${process.env['NODE' + '_ENV']}.local`),
    path.join(`${ENV_DIR}`, `.env.${process.env['NODE' + '_ENV']}`),
    path.join(`${ENV_DIR}`, '.env.local'),
    path.join(`${ENV_DIR}`, '.env.common'),
  ];
};

/**
 * Populate config param with values from process.env or config['_PROCESS_ENV_VALIDATED']
 * with these rules:
 * 1. JSONs from process.env and config with the same keys will be merged.
 * 2. Strings and arrays with the same keys will be replaced with process.env values.
 * See examples in tests.
 *
 * Good to know:
 * 1. This function calls after the standard NestJS Config already instantiated
 *    and tried to validate validationSchema.
 * 2. The config parameter is a nested JSON, e.g., can have config.app.host
 * 3. Keys inside config['_PROCESS_ENV_VALIDATED'] are not unflatten, they are just
 *    the same as inside process.env
 * 4. Keep in mind that, e.g., JWT_SECRET=value key from an process.env or
 *    config['_PROCESS_ENV_VALIDATED'] files will be converted to jwt.secret=value
 *    object property during processing, so, please, choose names in environment files
 *    carefully and accurate.
 * 5. Keep in mind that, config param will be mutated and returned
 */
export const processFromEnv = (config: Record<string, unknown>): Record<string, unknown> => {
  const envConfig = flatten(
    unflatten(config['_PROCESS_ENV_VALIDATED'] || process.env, {
      delimiter: '_',
      transformKey: (key) => key.toLowerCase(),
    }),
  );
  const flatConfig = flatten(config);
  const flatConfigKeys = Object.keys(flatConfig);

  for (const [ key, value ] of Object.entries(envConfig)) {
    for (const configKey of flatConfigKeys) {
      // if a key from config param starts with a key from _PROCESS_ENV_VALIDATED or process.env
      // then we get (related to key) value from env config, parse it, and replace/populate the value
      if (!configKey.toLowerCase().startsWith(key)) {
        continue;
      }

      let localValue = value;

      if (typeof value === 'string') {
        try {
          localValue = JSON.parse(value);
        } catch (e) {
          localValue = value;
        }
      }
      const partialConfigKey = configKey.substring(0, key.length);
      localValue = processBool(localValue);

      if (isArray(localValue)) {
        localValue = merge([], get(config, partialConfigKey), localValue);
      } else if (isObject(localValue)) {
        localValue = merge({}, get(config, partialConfigKey), localValue);
      }

      set(config, partialConfigKey, localValue);
    }
  }
  return config;
};
