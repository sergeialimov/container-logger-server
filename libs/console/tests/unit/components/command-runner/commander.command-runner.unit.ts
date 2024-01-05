/* eslint-disable max-len */
import { Test, TestingModule } from '@nestjs/testing';

import { Option } from 'commander';
import { z } from 'zod';

import { NestConsoleApplication } from '../../../../src/components';
import { CommandBase } from '../../../../src/components/command';
import { CommanderCommandRunner } from '../../../../src/components/command-runner';
import { InvalidArgumentException, LogicException } from '../../../../src/components/exception';
import { Input, InputOption, CommanderInput } from '../../../../src/components/input';
import { ConsoleOutput } from '../../../../src/components/output';
import { InputInterface, OutputInterface } from '../../../../src/interfaces';

class TestCommand extends CommandBase {
  protected static defaultName = 'app:test';

  protected configure (): void {
    this
      .addOption(
        'zod-number',
        'z',
        InputOption.VALUE_OPTIONAL,
        'Test number with zod',
        10,
        z.coerce.number().positive()
          .int(),
      )
      .addOption(
        'process-number-1',
        'p',
        InputOption.VALUE_OPTIONAL,
        'Test number with processing function that throws error',
        0,
        () => {
          throw new Error('Test error')
        },
      )
      .addOption(
        'process-number-2',
        'a',
        InputOption.VALUE_OPTIONAL,
        'Test number with processing function that returns value',
        0,
        (v: string) => v,
      );
  }

  protected async execute (input: InputInterface, output: OutputInterface): Promise<number> {
    return 0;
  }
}

class TestInput extends Input {
  public parse (): void {
    return void 0;
  }
}
describe('CommanderCommandRunner', () => {
  let commanderCommandRunner: CommanderCommandRunner;
  let app: TestingModule;
  let consoleApp: NestConsoleApplication;

  jest.spyOn(process, 'exit').mockReturnValue(null as never); // included that spy to avoid process.exit() calls to not terminate the test process
  jest.spyOn(process.stderr, 'write').mockReturnValue(null); // included that spy to avoid process.stderr() calls to not print to the console

  beforeEach(async () => {
    commanderCommandRunner = new CommanderCommandRunner();
    app = await Test.createTestingModule({}).compile();
    consoleApp = new NestConsoleApplication(app);
  });

  describe('run', () => {
    it('should throw if application not set', async () => {
      commanderCommandRunner.setCommands([ new TestCommand() ]);
      try {
        await commanderCommandRunner.run(new TestInput(), new ConsoleOutput());
      } catch (e) {
        expect(e).toBeInstanceOf(LogicException);
        expect(e).toHaveProperty('message', 'CommanderCommandRunner needs an application');
      }
    });

    it('should run the command', async () => {
      commanderCommandRunner.setCommands([ new TestCommand() ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test' ];
      expect(await commanderCommandRunner.run(new TestInput(), new ConsoleOutput())).toBe(0);
    });

    it('should set verbosity level verbose from command line', async () => {
      const command = new TestCommand();
      const consoleOutput = new ConsoleOutput();

      command.setApplication(consoleApp);
      command.mergeApplicationDefinition();
      commanderCommandRunner.setCommands([ command ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test', '--verbose' ];

      expect(
        await commanderCommandRunner.run(new CommanderInput(command.getDefinition()), consoleOutput),
      ).toBe(0);
      expect(consoleOutput.isVerbose()).toBe(true);
      expect(consoleOutput.isVeryVerbose()).toBe(false);
      expect(consoleOutput.isDebug()).toBe(false);
      expect(consoleOutput.isQuiet()).toBe(false);
    });

    it('should set verbosity level very verbose from command line', async () => {
      const command = new TestCommand();
      const consoleOutput = new ConsoleOutput();

      command.setApplication(consoleApp);
      command.mergeApplicationDefinition();
      commanderCommandRunner.setCommands([ command ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test', '--verbose', '--verbose' ];

      expect(
        await commanderCommandRunner.run(new CommanderInput(command.getDefinition()), consoleOutput),
      ).toBe(0);
      expect(consoleOutput.isVerbose()).toBe(true);
      expect(consoleOutput.isVeryVerbose()).toBe(true);
      expect(consoleOutput.isDebug()).toBe(false);
      expect(consoleOutput.isQuiet()).toBe(false);
    });

    it('should set verbosity level debug from command line', async () => {
      const command = new TestCommand();
      const consoleOutput = new ConsoleOutput();

      command.setApplication(consoleApp);
      command.mergeApplicationDefinition();
      commanderCommandRunner.setCommands([ command ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test', '--verbose', '--verbose', '--verbose' ];

      expect(
        await commanderCommandRunner.run(new CommanderInput(command.getDefinition()), consoleOutput),
      ).toBe(0);
      expect(consoleOutput.isVerbose()).toBe(true);
      expect(consoleOutput.isVeryVerbose()).toBe(true);
      expect(consoleOutput.isDebug()).toBe(true);
      expect(consoleOutput.isQuiet()).toBe(false);
    });

    it('should set quiet from command line', async () => {
      const command = new TestCommand();
      const consoleOutput = new ConsoleOutput();

      command.setApplication(consoleApp);
      command.mergeApplicationDefinition();
      commanderCommandRunner.setCommands([ command ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test', '--quiet' ];

      expect(
        await commanderCommandRunner.run(new CommanderInput(command.getDefinition()), consoleOutput),
      ).toBe(0);
      expect(consoleOutput.isVerbose()).toBe(false);
      expect(consoleOutput.isVeryVerbose()).toBe(false);
      expect(consoleOutput.isDebug()).toBe(false);
      expect(consoleOutput.isQuiet()).toBe(true);
    });

    it('should set normal verbosity', async () => {
      const command = new TestCommand();
      const consoleOutput = new ConsoleOutput();

      command.setApplication(consoleApp);
      command.mergeApplicationDefinition();
      commanderCommandRunner.setCommands([ command ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test' ];

      expect(
        await commanderCommandRunner.run(new CommanderInput(command.getDefinition()), consoleOutput),
      ).toBe(0);
      expect(consoleOutput.isVerbose()).toBe(false);
      expect(consoleOutput.isVeryVerbose()).toBe(false);
      expect(consoleOutput.isDebug()).toBe(false);
      expect(consoleOutput.isQuiet()).toBe(false);
    });

    it('should throw error when the passed option does not follow the provided zod schema', async () => {
      commanderCommandRunner.setCommands([ new TestCommand() ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test', '--zod-number', 'test' ];
      try {
        await commanderCommandRunner.run(new TestInput(), new ConsoleOutput());
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidArgumentException);
        expect(e).toHaveProperty('message', 'Invalid value for option zod-number');
      }
    });

    it('should pass when the passed option follows the provided zod schema', async () => {
      commanderCommandRunner.setCommands([ new TestCommand() ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test', '--zod-number', '1' ];
      expect(await commanderCommandRunner.run(new TestInput(), new ConsoleOutput())).toBe(0);
    })

    it('should throw error when the passed option has processing function that throws error', async () => {
      commanderCommandRunner.setCommands([ new TestCommand() ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test', '--process-number-1', 'test' ];
      try {
        await commanderCommandRunner.run(new TestInput(), new ConsoleOutput());
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidArgumentException);
        expect(e).toHaveProperty('message', 'Test error');
      }
    });

    it('should pass when the passed option has processing function that success', async () => {
      commanderCommandRunner.setCommands([ new TestCommand() ]);
      commanderCommandRunner.setApplication(consoleApp);
      process.argv = [ '', '', 'app:test', '--process-number-2', 'test' ];
      expect(await commanderCommandRunner.run(new TestInput(), new ConsoleOutput())).toBe(0);
    });
  });

  describe('prepareOption', () => {
    it('should create required CommanderOption from InputOption', () => {
      const inputOption: InputOption = new InputOption(
        'test-option',
        't',
        InputOption.VALUE_REQUIRED,
        'test description',
        5,
      );
      const commanderOption: Option = commanderCommandRunner['prepareOption'](inputOption);
      expect(commanderOption).toBeInstanceOf(Option);
      expect(commanderOption.required).toBe(true);
      expect(commanderOption.optional).toBe(false);
      expect(commanderOption.description).toBe('test description');
      expect(commanderOption.flags).toBe('-t, --test-option <test-option>');
      expect(commanderOption.name()).toBe('test-option');
      expect(commanderOption.short).toBe('-t');
      expect(commanderOption.defaultValue).toBe(5);
    });

    it('should create optional CommanderOption from InputOption', () => {
      const inputOption: InputOption = new InputOption(
        'test-option',
        't',
        InputOption.VALUE_OPTIONAL,
        'test description',
        5,
      );
      const commanderOption: Option = commanderCommandRunner['prepareOption'](inputOption);
      expect(commanderOption).toBeInstanceOf(Option);
      expect(commanderOption.required).toBe(false);
      expect(commanderOption.optional).toBe(true);
      expect(commanderOption.description).toBe('test description');
      expect(commanderOption.flags).toBe('-t, --test-option [test-option]');
      expect(commanderOption.name()).toBe('test-option');
      expect(commanderOption.short).toBe('-t');
      expect(commanderOption.defaultValue).toBe(5);
    });

    it('should create non-value CommanderOption from InputOption', () => {
      const inputOption: InputOption = new InputOption(
        'test-option',
        't',
        InputOption.VALUE_NONE,
        'test description',
      );
      const commanderOption: Option = commanderCommandRunner['prepareOption'](inputOption);
      expect(commanderOption).toBeInstanceOf(Option);
      expect(commanderOption.required).toBe(false);
      expect(commanderOption.optional).toBe(false);
      expect(commanderOption.description).toBe('test description');
      expect(commanderOption.flags).toBe('-t, --test-option');
      expect(commanderOption.name()).toBe('test-option');
      expect(commanderOption.short).toBe('-t');
    });

    it('should create variadic required CommanderOption from InputOption', () => {
      const inputOption: InputOption = new InputOption(
        'test-option',
        't',
        InputOption.VALUE_IS_ARRAY | InputOption.VALUE_REQUIRED,
        'test description',
        [ 5, 5 ],
      );
      const commanderOption: Option = commanderCommandRunner['prepareOption'](inputOption);
      expect(commanderOption).toBeInstanceOf(Option);
      expect(commanderOption.required).toBe(true);
      expect(commanderOption.optional).toBe(false);
      expect(commanderOption.description).toBe('test description');
      expect(commanderOption.flags).toBe('-t, --test-option <test-option...>');
      expect(commanderOption.name()).toBe('test-option');
      expect(commanderOption.short).toBe('-t');
      expect(commanderOption.defaultValue).toEqual([ 5, 5 ]);
    });

    it('should create variadic optional CommanderOption from InputOption', () => {
      const inputOption: InputOption = new InputOption(
        'test-option',
        't',
        InputOption.VALUE_IS_ARRAY | InputOption.VALUE_OPTIONAL,
        'test description',
        [ 5, 5 ],
      );
      const commanderOption: Option = commanderCommandRunner['prepareOption'](inputOption);
      expect(commanderOption).toBeInstanceOf(Option);
      expect(commanderOption.required).toBe(false);
      expect(commanderOption.optional).toBe(true);
      expect(commanderOption.description).toBe('test description');
      expect(commanderOption.flags).toBe('-t, --test-option [test-option...]');
      expect(commanderOption.name()).toBe('test-option');
      expect(commanderOption.short).toBe('-t');
      expect(commanderOption.defaultValue).toEqual([ 5, 5 ]);
    });
  });
});
