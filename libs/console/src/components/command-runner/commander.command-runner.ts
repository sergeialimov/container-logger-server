import { Logger, LogLevel } from '@nestjs/common';

import { Command as CommanderCommand, Option } from 'commander';

import { NestConsoleApplicationInterface, InputInterface, OutputInterface } from '../../interfaces';
import { CommandRunnerInterface } from '../../interfaces/components/command-runner';
import { OutputVerbosityLevels } from '../../interfaces/components/output/output.interface';
import { CommandBase } from '../command/command-base';
import { LogicException } from '../exception';
import { InputOption } from '../input';

export class CommanderCommandRunner implements CommandRunnerInterface {
  private application: NestConsoleApplicationInterface;
  private commands: CommandBase[] = [];
  private exitCode = 0;

  public async run (input: InputInterface, output: OutputInterface): Promise<number> {
    if (!this.application) {
      throw new LogicException('CommanderCommandRunner needs an application');
    }
    const program = new CommanderCommand()
      .name(this.application.getName())
      .version(this.application.getVersion());

    const commanderCommands = this.prepareCommands(this.commands, input, output);

    for (const commanderCommand of commanderCommands) {
      program.addCommand(commanderCommand);
    }
    await program.parseAsync();
    return this.exitCode;
  }

  public setApplication (application: NestConsoleApplicationInterface): void {
    this.application = application;
  }

  public setCommands (commands: CommandBase[]): void {
    this.commands = commands;
  }

  private prepareCommands (
    commands: CommandBase[],
    input: InputInterface,
    output: OutputInterface,
  ): CommanderCommand[] {
    const commanderCommands = [];

    for (const command of commands) {
      const commanderCommand = new CommanderCommand(command.getName());

      commanderCommand['_hidden'] = command.isHidden();

      const commandOptions = command
        .getDefinition()
        .getOptions();

      for (const [ , option ] of commandOptions) {
        commanderCommand.addOption(this.prepareOption(option));
      }

      const commandArguments = command
        .getDefinition()
        .getArguments()
        .values();

      for (const arg of commandArguments) {
        const argName = arg.isRequired()
          ? `<${arg.getName()}${arg.isArray() ? '...' : ''}>`
          : `[${arg.getName()}${arg.isArray() ? '...' : ''}]`;

        commanderCommand.argument(argName, arg.getDescription());
      }

      commanderCommand.description(command.getDescription());

      commanderCommand.action(async (...args) => {
        args.pop(); // the last argument is the commander command
        const commanderOptions = args.pop();

        input.bind(command.getDefinition());
        input.parse(args, commanderOptions);
        if (input.hasOption('quiet') && input.getOption('quiet')) {
          output.setVerbosity(OutputVerbosityLevels.VERBOSITY_QUIET);
          Logger.overrideLogger(false);
        } else if (input.hasOption('verbose') && input.getOption('verbose') === false) {
          output.setVerbosity(OutputVerbosityLevels.VERBOSITY_NORMAL);

          Logger.overrideLogger([ 'error', 'warn', 'info' ] as LogLevel[]);
        } else if (input.hasOption('verbose') && typeof input.getOption('verbose') === 'number') {
          const verbosityLevel = parseInt(input.getOption('verbose') as string, 10);

          if (verbosityLevel >= 3) {
            output.setVerbosity(OutputVerbosityLevels.VERBOSITY_DEBUG);
            Logger.overrideLogger([
              'error',
              'warn',
              'log',
              'info',
              'verbose',
              'debug',
            ] as LogLevel[]);
          } else if (verbosityLevel === 2) {
            output.setVerbosity(OutputVerbosityLevels.VERBOSITY_VERY_VERBOSE);
            Logger.overrideLogger([
              'error',
              'warn',
              'log',
              'info',
              'verbose',
            ] as LogLevel[]);
          } else if (verbosityLevel === 1) {
            output.setVerbosity(OutputVerbosityLevels.VERBOSITY_VERBOSE);
            Logger.overrideLogger([ 'error', 'warn', 'log', 'info' ] as LogLevel[]);
          }
        }

        this.exitCode = await command.run(input, output);
      });

      commanderCommands.push(commanderCommand);
    }

    return commanderCommands;
  }

  private prepareOption (inputOption: InputOption): Option {
    const flags = [];

    if (inputOption.getShortcut() !== null) {
      flags.push(`-${inputOption.getShortcut()}`);
    }

    if (inputOption.acceptValue()) {
      if (inputOption.isValueRequired()) {
        flags.push(
          `--${inputOption.getName()} <${inputOption.getName()}${
            inputOption.isArray() ? '...' : ''
          }>`,
        );
      } else if (inputOption.isValueOptional()) {
        flags.push(
          `--${inputOption.getName()} [${inputOption.getName()}${
            inputOption.isArray() ? '...' : ''
          }]`,
        );
      }
    } else {
      flags.push(`--${inputOption.getName()}`);
    }

    const commanderOption = new Option(flags.join(', '), inputOption.getDescription());

    if (inputOption.getDefault() !== null) {
      commanderOption.default(inputOption.getDefault());
    }

    commanderOption.makeOptionMandatory(inputOption.isValueRequired());

    if (inputOption.getProcessingFn()) {
      commanderOption.argParser(inputOption.getProcessingFn());
    }

    return commanderOption as Option;
  }
}
