import { registerAs } from '@nestjs/config';

export const appConfig = registerAs(
  'app',
  () => ({
    port: 30000,
    host: '0.0.0.0',
    frontendUrl: '',
    origin: '',
    version: '0.0.0',
  }),
);
