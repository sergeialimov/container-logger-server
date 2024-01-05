import { registerAs } from '@nestjs/config';

import { VaultConfigInterface } from '../interfaces';

export const vaultConfig = registerAs<VaultConfigInterface>(
  'vault',
  (): VaultConfigInterface => ({
    host: 'localhost',
    port: 30000,
    mountPoint: 'mountPoint',
    isEnabled: false,
    auth: {
      type: 'appRole',
      config: {
        roleId: '~',
        secretId: '~',
      },
    },
  }),
);
