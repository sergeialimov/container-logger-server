import { Test } from '@nestjs/testing';

import { NestConsoleApplication } from '../../../../src/components';
import { CommandBase } from '../../../../src/components/command';
import { InvalidArgumentException } from '../../../../src/components/exception';
import { Input, InputDefinition, InputOption } from '../../../../src/components/input';
import { Output } from '../../../../src/components/output';
import { InputInterface, OutputInterface } from '../../../../src/interfaces';

class TestCommand extends CommandBase {
  protected static defaultName = 'app:test';

  protected execute (input: InputInterface, output: OutputInterface): Promise<number> {
    return Promise.resolve(0);
  }

  public isEnabled (): boolean {
    if (!super.isEnabled()) {
      return false;
    }

    return this.getName() !== 'app:test-disabled';
  }
}

class TestInput extends Input {
  parse (): void {
    // no body
  }
}

class TestOutput extends Output {
  protected doWrite (message: string, newLine: boolean): void {
    // no body
  }
}

describe('Command', () => {
  describe('getName', () => {
    it('should return the default name', () => {
      expect(new TestCommand().getName()).toEqual('app:test');
    });

    it('should return the name from constructor', () => {
      expect(new TestCommand('app:test-constructor').getName()).toEqual('app:test-constructor');
    });
  });

  describe('setName', () => {
    it('should set the name', () => {
      const command = new TestCommand();
      command.setName('app:test-custom');
      expect(command.getName()).toEqual('app:test-custom');
    });

    it('should throw if name is invalid', () => {
      expect(() => new TestCommand().setName('Invalid')).toThrow(
        new InvalidArgumentException('Command name "Invalid" is invalid.'),
      );
    });
  });

  describe('getDescription/setDescription', () => {
    it('should return the description', () => {
      const command = new TestCommand();
      expect(command.getDescription()).toEqual('');

      command.setDescription('description');
      expect(command.getDescription()).toEqual('description');
    });
  });

  describe('isHidden/setIsHidden', () => {
    it('should return the description', () => {
      const command = new TestCommand();
      expect(command.isHidden()).toBe(false);

      command.setIsHidden(true);
      expect(command.isHidden()).toBe(true);
    });
  });

  describe('isEnabled', () => {
    it('should return the command enabled status', () => {
      expect(new TestCommand().isEnabled()).toBe(true);
      expect(new TestCommand('app:test-disabled').isEnabled()).toBe(false);
    });
  });

  describe('getAliases/setAliases', () => {
    it('should retrieve aliases for command', () => {
      const command = new TestCommand();

      expect(command.getAliases()).toEqual([]);

      command.setAliases([ 'app:test-alias' ]);

      expect(command.getAliases()).toEqual([ 'app:test-alias' ]);
    });

    it('should throw if alias name is invalid', () => {
      expect(() => new TestCommand().setAliases([ 'Invalid' ])).toThrow(
        new InvalidArgumentException('Command name "Invalid" is invalid.'),
      );
    });
  });

  describe('setProcessTitle', () => {
    it('should set process title', () => {
      const command = new TestCommand();
      command.setProcessTitle('process-title');
      expect(command['processTitle']).toEqual('process-title');
    });
  });

  describe('getDefinition', () => {
    it('should retrieve InputDefinition', () => {
      expect(new TestCommand().getDefinition()).toBeInstanceOf(InputDefinition);
    });
  });

  describe('setDefinition', () => {
    it('should set new InputDefinition', () => {
      const command = new TestCommand();
      const existingDefinition = command.getDefinition();
      command.setDefinition(new InputDefinition());
      expect(existingDefinition).not.toBe(command.getDefinition());
    });

    it('should use existing InputDefinition', () => {
      const command = new TestCommand();
      const existingDefinition = command.getDefinition();
      command.setDefinition([ new InputOption('name') ]);
      expect(existingDefinition).toBe(command.getDefinition());
    });
  });

  describe('addOption', () => {
    it('should add a new Option', () => {
      const command = new TestCommand();
      command.addOption('name');

      expect(command.getDefinition().hasOption('name')).toBe(true);
    });
  });

  describe('addArgument', () => {
    it('should add a new Argument', () => {
      const command = new TestCommand();
      command.addArgument('name');

      expect(command.getDefinition().hasArgument('name')).toBe(true);
    });
  });

  describe('run', () => {
    it('should run application', async () => {
      const command = new TestCommand();
      const input = new TestInput();
      const output = new TestOutput();

      command['initialize'] = jest.fn();
      command['interact'] = jest.fn();
      command['execute'] = jest.fn().mockReturnValue(0);

      expect(await command.run(input, output)).toBe(0);
      expect(command['initialize']).toBeCalledTimes(1);
      expect(command['interact']).toBeCalledTimes(1);
      expect(command['execute']).toBeCalledTimes(1);
      expect(command['execute']).toReturnWith(0);
      expect(command['execute']).toBeCalledWith(input, output);
    });

    it('should throw non-numerical', async () => {
      const command = new TestCommand();
      const input = new TestInput();
      const output = new TestOutput();

      command['initialize'] = jest.fn();
      command['interact'] = jest.fn();
      command['execute'] = jest.fn().mockReturnValue('non-numeric');

      try {
        await command.run(input, output);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect(error).toHaveProperty(
          'message',
          'Return value of "TestCommand::execute()" must be of the type number, "string" returned.',
        );
      }
    });

    it('should set process title if defined', async () => {
      const command = new TestCommand();
      const input = new TestInput();
      const output = new TestOutput();

      jest.mock('process', () => ({ title: undefined }));

      command.setProcessTitle('custom-process-title');

      await command.run(input, output);

      expect(process.title).toBe('custom-process-title');
    });
  });

  describe('getApplication/setApplication', () => {
    it('should return the current application', async () => {
      const command = new TestCommand();
      expect(command.getApplication()).toBeUndefined();

      const app = await Test.createTestingModule({
        providers: [
          TestCommand,
          { provide: 'SecondCommand', useExisting: TestCommand },
        ],
      }).compile();

      const consoleApp = new NestConsoleApplication(app);
      command.setApplication(consoleApp);

      expect(command.getApplication()).toBe(consoleApp);
    });
  });

  describe('mergeApplicationDefinition', () => {
    it('should merge application definition', async () => {
      const command = new TestCommand();
      expect(command.getApplication()).toBeUndefined();

      const app = await Test.createTestingModule({
        providers: [
          TestCommand,
          { provide: 'SecondCommand', useExisting: TestCommand },
        ],
      }).compile();

      const consoleApp = new NestConsoleApplication(app);
      command.setApplication(consoleApp);

      expect(command.getDefinition().hasOption('verbose')).toBe(false);

      command.mergeApplicationDefinition();
      expect(command.getDefinition().hasOption('verbose')).toBe(true);
    });
  });
});
