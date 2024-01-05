import { NestApplicationContext } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { NestConsoleApplication } from '../../../src/components';
import { CommandBase } from '../../../src/components/command';
import { LogicException } from '../../../src/components/exception';
import { InputDefinition } from '../../../src/components/input';
import { Command } from '../../../src/decorators';
import { OutputInterface, InputInterface } from '../../../src/interfaces';
import { ConsoleModule } from '../../../src/modules/index';

@Command()
class LocalTestCommand extends CommandBase {
  protected static defaultName = 'app:test';

  protected async execute (input: InputInterface, output: OutputInterface): Promise<number> {
    return 0;
  }
}

@Command()
class TestWithoutNameCommand extends CommandBase {
  protected async execute (input: InputInterface, output: OutputInterface): Promise<number> {
    return 0;
  }
}

describe('NestConsoleApplication', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [ ConsoleModule ],
    }).compile();
  });

  describe('getName', () => {
    it('should return the default name', () => {
      const consoleApp = new NestConsoleApplication(app);
      expect(consoleApp.getName()).toBe('CLI');
    });

    it('should return the custom name', () => {
      const name = 'TestCli';
      const consoleApp = new NestConsoleApplication(app, { name });
      expect(consoleApp.getName()).toBe(name);
    });
  });

  describe('setName', () => {
    it('should set a new name', () => {
      const consoleApp = new NestConsoleApplication(app);
      const newName = 'NewAppName';
      expect(consoleApp.getName()).toBe('CLI');

      consoleApp.setName(newName);
      expect(consoleApp.getName()).toBe(newName);
    });
  });

  describe('getVersion', () => {
    it('should return the default version if none specified', () => {
      const consoleApp = new NestConsoleApplication(app);
      expect(consoleApp.getVersion()).toBe('1.0.0');
    });

    it('should return the custom version', () => {
      const version = '1.0.1';
      const consoleApp = new NestConsoleApplication(app, { version });
      expect(consoleApp.getVersion()).toBe(version);
    });
  });

  describe('setVersion', () => {
    it('should set a new version', () => {
      const consoleApp = new NestConsoleApplication(app);
      const newVersion = '1.0.1';
      expect(consoleApp.getVersion()).toBe('1.0.0');

      consoleApp.setVersion(newVersion);
      expect(consoleApp.getVersion()).toBe(newVersion);
    });
  });

  describe('getApplicationContext', () => {
    it('should return the app context instance', () => {
      const consoleApp = new NestConsoleApplication(app);
      expect(consoleApp.getApplicationContext()).toStrictEqual(app);
      expect(consoleApp.getApplicationContext()).toBeInstanceOf(NestApplicationContext);
    });
  });

  describe('getDefinition', () => {
    it('should return default input definition if none specified', () => {
      const consoleApp = new NestConsoleApplication(app);
      expect(consoleApp.getDefinition()).toBeInstanceOf(InputDefinition);
      expect(Array.from(consoleApp.getDefinition().getOptions()
        .keys())).toEqual([ 'quiet', 'verbose', 'no-interaction' ]);
      expect(Array.from(consoleApp.getDefinition().getArguments()
        .keys())).toEqual([]);
    });
  });

  describe('setDefinition', () => {
    it('should override default definition', () => {
      const consoleApp = new NestConsoleApplication(app);
      consoleApp.setDefinition(new InputDefinition());
      expect(consoleApp.getDefinition()).toBeInstanceOf(InputDefinition);

      expect(Array.from(consoleApp.getDefinition().getOptions()
        .keys())).toEqual([]);
      expect(Array.from(consoleApp.getDefinition().getArguments()
        .keys())).toEqual([]);
    });
  });

  describe('isAutoExitEnabled', () => {
    it('should have AutoExitEnabled by default', () => {
      const consoleApp = new NestConsoleApplication(app);
      expect(consoleApp.isAutoExitEnabled()).toBe(true);
    });
  });

  describe('setAutoExit', () => {
    it('should change the default AutoExitEnabled to false', () => {
      const consoleApp = new NestConsoleApplication(app);
      expect(consoleApp.isAutoExitEnabled()).toBe(true);
      consoleApp.setAutoExit(false);
      expect(consoleApp.isAutoExitEnabled()).toBe(false);
    });
  });

  describe('all', () => {
    it('should return no commands by default', () => {
      const consoleApp = new NestConsoleApplication(app);
      expect(consoleApp.getCommands().size).toBe(1);
    });

    it('should take namespace into consideration', () => {
      const consoleApp = new NestConsoleApplication(app);
      consoleApp.addCommand(new LocalTestCommand('test:command1'));
      consoleApp.addCommand(new LocalTestCommand('test2:command2'));
      expect(consoleApp.getCommands().size).toBe(3);
      expect(consoleApp.getCommands('test').size).toBe(1);
      expect(consoleApp.getCommands('test2').size).toBe(1);
    });
  });

  describe('add', () => {
    it('should add only enabled commands', () => {
      const consoleApp = new NestConsoleApplication(app);
      const command = new LocalTestCommand('test:command1');
      command.isEnabled = jest.fn().mockImplementation(() => false);
      consoleApp.addCommand(command);
      consoleApp.addCommand(new LocalTestCommand('test2:command2'));

      expect(consoleApp.getCommands().size).toBe(2);
      expect(consoleApp.getCommands('test').size).toBe(0);
      expect(consoleApp.getCommands('test2').size).toBe(1);
    });

    it('should add aliases and take namespaces into consideration', () => {
      const consoleApp = new NestConsoleApplication(app);
      const command = new LocalTestCommand('test:command1');
      command.setAliases([ 'testnamespace:testcmd', 'testnamespace:testcmd2' ]);

      consoleApp.addCommand(command);

      expect(consoleApp.getCommands().size).toBe(4);
      expect(consoleApp.getCommands('test').size).toBe(1);
      expect(consoleApp.getCommands('testnamespace').size).toBe(2);
    });

    it('should throw if command name is missing', () => {
      const consoleApp = new NestConsoleApplication(app);

      expect(() => consoleApp.addCommand(new TestWithoutNameCommand())).toThrow(
        new LogicException(
          'The command defined in "TestWithoutNameCommand" cannot have an empty name.',
        ),
      );
    });
  });

  describe('run', () => {
    //
  });

  describe('registerCommands', () => {
    it('should discover the commands', async () => {
      const customApp = await Test
        .createTestingModule({
          imports: [ ConsoleModule ],
          providers: [ LocalTestCommand ],
        })
        .compile();

      const consoleApp = new NestConsoleApplication(customApp);
      expect(consoleApp.getCommands().size).toEqual(2);
      expect(consoleApp['commands'].get('app:test')).toBeInstanceOf(LocalTestCommand);
    });

    it('should throw if command name is empty', async () => {
      const customApp = await Test
        .createTestingModule({
          imports: [ ConsoleModule ],
          providers: [ TestWithoutNameCommand ],
        })
        .compile();

      const consoleApp = new NestConsoleApplication(customApp);
      try {
        consoleApp.getCommands();
        expect(true).toBe(false); // make sure test is failing if the all() is not throwing
      } catch (error) {
        expect(error).toBeInstanceOf(LogicException);
        expect(error).toHaveProperty(
          'message',
          'Name for "TestWithoutNameCommand" command is invalid or not set.',
        );
      }
    });
  });

  describe('getDefaultInputDefinition', () => {
    // @TODO
  });
});
