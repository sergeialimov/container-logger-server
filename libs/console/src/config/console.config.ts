import { registerAs } from '@nestjs/config';

export const consoleConfig = registerAs('console', () => ({
  autoExit: true,
}));
