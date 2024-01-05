import { LoggerService, MockedLoggerService } from '@libs/logger';

import { Input } from '@libs/console/components/input';
import { CommandExecutionStatus } from '@libs/console/types';

import { DisplayConfigCommand } from '../../../src/commands';
import { ConfigService } from '../../../src/services/config.service';

describe('DisplayConfigCommand', () => {
  let configService: ConfigService;
  let logger: LoggerService;
  let displayConfigCommand: DisplayConfigCommand;

  const configPathMock = 'test.path';
  const inputMock = {
    getOption: jest.fn().mockReturnValue(configPathMock),
  } as unknown as Input;

  beforeEach(async () => {
    configService = {
      get: jest.fn()
        .mockReturnValue({}),
    } as Partial<ConfigService> as ConfigService;

    logger = new MockedLoggerService() as unknown as LoggerService;

    displayConfigCommand = new DisplayConfigCommand(configService, logger);
  });

  describe('#execute', () => {
    it('should get input option --config-key-path', async () => {
      await displayConfigCommand.execute(inputMock);

      expect(inputMock.getOption).toBeCalledWith('config-key-path');
    });

    it('should call get method of configService with provided config path', async () => {
      await displayConfigCommand.execute(inputMock);

      expect(configService.get).toBeCalledWith(configPathMock);
    });

    it('should exit with success status', async () => {
      expect(await displayConfigCommand.execute(inputMock)).toBe(CommandExecutionStatus.SUCCESS);
    });
  });
});
