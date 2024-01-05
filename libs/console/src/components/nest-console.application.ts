import { INestApplicationContext } from '@nestjs/common';

import { RegistryService } from '@libs/shared/backend';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { isEmpty } from 'lodash';

import { CommandBase } from './command';
import { LogicException } from './exception';
import { InputDefinition, InputOption } from './input';
import { CoreCommandDecorator } from '../decorators';
import { NestConsoleApplicationInterface, InputInterface, OutputInterface } from '../interfaces';
import { CommandRunnerInterface } from '../interfaces/components/command-runner';

export type NestConsoleApplicationOptions = NestApplicationContextOptions & {
  name?: string;
  version?: string;
};

export class NestConsoleApplication implements NestConsoleApplicationInterface {
  private name: string;
  private options: NestConsoleApplicationOptions;
  private version: string;
  private definition: InputDefinition;
  private commands: Map<string, CommandBase>;
  private autoExit = true;

  constructor (
    private readonly nestApplicationContext: INestApplicationContext,
    private readonly opts?: NestConsoleApplicationOptions,
  ) {
    this.options = {
      ...{
        name: 'CLI',
        version: '1.0.0',
      },
      ...(opts || {}),
    };
    this.name = this.options.name;
    this.version = this.options.version;
  }

  public getName (): string {
    return this.name;
  }

  public setName (name: string): void {
    this.name = name;
  }

  public getVersion (): string {
    return this.version;
  }

  public setVersion (version: string): void {
    this.version = version;
  }

  public getApplicationContext (): INestApplicationContext {
    return this.nestApplicationContext;
  }

  public getDefinition (): InputDefinition {
    if (!this.definition) {
      this.definition = this.getDefaultInputDefinition();
    }

    return this.definition;
  }

  public setDefinition (definition: InputDefinition): void {
    this.definition = definition;
  }

  public isAutoExitEnabled (): boolean {
    return this.autoExit;
  }

  public setAutoExit (autoExit: boolean): void {
    this.autoExit = autoExit;
  }

  public getCommands (namespace: string = null): Map<string, CommandBase> {
    this.registerCommands();

    if (!namespace) {
      return this.commands;
    }

    const namespaceCommands = new Map<string, CommandBase>();

    for (const [ commandName, command ] of this.commands.entries()) {
      if (namespace === this.extractNamespace(commandName, namespace.split(':').length)) {
        namespaceCommands.set(commandName, command);
      }
    }

    return namespaceCommands;
  }

  public addCommand (command: CommandBase): CommandBase | null {
    this.registerCommands();

    command.setApplication(this);

    if (!command.isEnabled()) {
      command.setApplication(null);

      return null;
    }

    if (!command.getName()) {
      throw new LogicException(
        `The command defined in "${command.constructor.name}" cannot have an empty name.`,
      );
    }

    command.mergeApplicationDefinition();

    this.commands.set(command.getName(), command);

    for (const commandAlias of command.getAliases()) {
      this.commands.set(commandAlias, command);
    }

    return command;
  }

  public extractNamespace (name: string, limit: number = null): string {
    const parts = name.split(':');

    return (limit === null ? parts.slice(0, parts.length - 1) : parts.slice(0, limit)).join(':');
  }

  public async run (input: InputInterface = null, output: OutputInterface = null): Promise<number> {
    this.registerCommands();

    const commandRunner =
      this.nestApplicationContext.get<CommandRunnerInterface>('CommandRunnerInterface');

    commandRunner.setApplication(this);
    commandRunner.setCommands(Array.from(this.getCommands().values()));

    if (!input) {
      input = this.nestApplicationContext.get<InputInterface>('InputInterface');
    }

    if (!output) {
      output = this.nestApplicationContext.get<OutputInterface>('OutputInterface');
    }

    let exitCode = await commandRunner.run(input, output);

    if (this.autoExit && exitCode >= 0) {
      if (exitCode > 255) {
        exitCode = 255;
      }

      await this.nestApplicationContext.close();

      process['exit'](exitCode);
    }

    return exitCode;
  }

  protected registerCommands (): void {
    if (this.commands) {
      return;
    }
    const registryService = this.nestApplicationContext.get(RegistryService);

    this.commands = new Map<string, CommandBase>();

    const commandServicesMap = registryService
      .getMetaDataMap<CommandBase, boolean>(CoreCommandDecorator);

    for (const [ command ] of commandServicesMap.entries()) {
      if (isEmpty(command.getName())) {
        throw new LogicException(
          `Name for "${command.constructor.name}" command is invalid or not set.`,
        );
      }

      if (this.commands.has(command.getName())) {
        throw new LogicException(
          `Name "${command.getName()}" for "${
            command.constructor.name
          }" is already registered.`,
        );
      }
      this.addCommand(command);
    }
  }

  protected getDefaultInputDefinition (): InputDefinition {
    return new InputDefinition([
      new InputOption('quiet', 'q', InputOption.VALUE_NONE, 'Do not output any message'),
      new InputOption(
        'verbose',
        'v',
        InputOption.VALUE_NONE,
        'Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug',
        null,
        (arg, previous) => parseInt((previous as string) || '0') + 1,
      ),
      new InputOption(
        'no-interaction',
        'n',
        InputOption.VALUE_NONE,
        'Do not ask any interactive question',
      ),
    ]);
  }
}
