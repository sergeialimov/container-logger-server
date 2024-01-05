import { ConfigModuleOptions } from '@nestjs/config';

import * as Joi from 'joi';

import { vaultConfig } from './config';
import { ENVIRONMENT } from './constants';

export const defaultConfigModuleOptions: ConfigModuleOptions = {
  isGlobal: false,
  load: [ vaultConfig ],
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid(...Object.values(ENVIRONMENT))
      .default(ENVIRONMENT.DEVELOPMENT),
  }),
};
