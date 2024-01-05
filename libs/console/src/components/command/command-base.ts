import { Schema } from 'zod';

import { NestConsoleApplicationInterface, InputInterface, OutputInterface } from '../../interfaces';
import { CommandExecutionStatus } from '../../types';
import { InvalidArgumentException } from '../exception';
import { InputArgument, InputDefinition, InputOption } from '../input';
import { InputArgumentValueType } from '../input/input.argument';
import { InputOptionValueType, ProcessingFnType } from '../input/input.option';

export abstract class CommandBase {
  private name: string;
  private description = '';
  private hidden = false;
  private processTitle: string;

  private aliases: Array<string> = [];
  private application: NestConsoleApplicationInterface;
  private definition: InputDefinition;

  /**
   * This is used to have the name set in case the command is constructed by DI (as a provider)
   * @protected
   */
  protected static defaultName: string;

  constructor (name: string = null) {
    this.definition = new InputDefinition();

    name = name || this.constructor['getDefaultName']();
    if (name) {
      this.setName(name);
    }

    this.configure();
  }

  public static getDefaultName (): string {
    return this.defaultName;
  }

  public getName (): string {
    return this.name;
  }

  public setName (name: string): this {
    this.validateName(name);
    this.name = name;

    return this;
  }

  public getDescription (): string {
    return this.description;
  }

  public setDescription (description: string): this {
    this.description = description;

    return this;
  }

  /**
   * Set this flag to `true` to hide a command from the list of commands at runtime
   */
  public isHidden (): boolean {
    return this.hidden;
  }

  public setIsHidden (hidden: boolean): this {
    this.hidden = hidden;
    return this;
  }

  /**
   * Conditionally enable/or disable a command at runtime
   */
  public isEnabled (): boolean {
    return true;
  }

  /**
   * Add aliases to ease the migration to a new name
   */
  public getAliases (): Array<string> {
    return this.aliases;
  }

  public setAliases (aliases: string[]): this {
    for (const alias of aliases) {
      this.validateName(alias);

      this.aliases.push(alias);
    }

    return this;
  }

  /**
   * Used to set the process title so that the process can be identified easier at runtime
   */
  public setProcessTitle (title: string): this {
    this.processTitle = title;
    return this;
  }

  public getDefinition (): InputDefinition {
    return this.definition;
  }

  public setDefinition (definition: InputDefinition | Array<InputOption | InputArgument>): this {
    if (definition instanceof InputDefinition) {
      this.definition = definition;
    } else {
      this.definition.setDefinition(definition);
    }

    return this;
  }

  /**
    * Used to add option with optional processing function
  */
  public addOption (
    name: string,
    shortcut?: string,
    mode?: number,
    description?: string,
    defaultValue?: InputOptionValueType,
    processingFn?: ProcessingFnType,
  ): this

  /**
    * Used to add an option with zod schema
  */
  public addOption (
    name: string,
    shortcut?: string,
    mode?: number,
    description?: string,
    defaultValue?: InputOptionValueType,
    zodSchema?: Schema,
  ): this

  public addOption (
    name: string,
    shortcut: string = null,
    mode: number = null,
    description = '',
    defaultValue: InputOptionValueType = null,
    processingFnOrZodSchema: ProcessingFnType | Schema = null,
  ): this {
    let processingFn: ProcessingFnType = null;
    if (processingFnOrZodSchema instanceof Schema) {
      processingFn = (arg: string): InputOptionValueType => {
        const result = processingFnOrZodSchema.safeParse(arg);
        if (!result.success) {
          throw new InvalidArgumentException(`Invalid value for option ${name}`);
        }
        return result.data;
      };
    } else if (processingFnOrZodSchema) {
      const wrappedWithArgError =
      (arg: string, previous: InputOptionValueType): InputOptionValueType => {
        try {
          return processingFnOrZodSchema(arg, previous);
        } catch (e) {
          throw new InvalidArgumentException(e.message);
        }
      };
      processingFn = wrappedWithArgError;
    }

    this.definition.addOption(new InputOption(
      name,
      shortcut,
      mode,
      description,
      defaultValue,
      processingFn,
    ));

    return this;
  }

  public addArgument (
    name: string,
    mode: number = null,
    description = '',
    defaultValue: InputArgumentValueType = null,
  ): this {
    this.definition.addArgument(new InputArgument(name, mode, description, defaultValue));

    return this;
  }

  public async run (input: InputInterface, output: OutputInterface): Promise<number> {
    await this.initialize(input, output);

    if (this.processTitle) {
      process.title = this.processTitle;
    }

    if (input.isInteractive()) {
      await this.interact(input, output);
    }

    const statusCode = await this.execute(input, output);

    if (!(typeof statusCode === 'number')) {
      throw new TypeError(
        `Return value of "${
          this.constructor.name
        }::execute()" must be of the type number, "${typeof statusCode}" returned.`,
      );
    }

    return statusCode;
  }

  public getApplication (): NestConsoleApplicationInterface {
    return this.application;
  }

  public setApplication (application: NestConsoleApplicationInterface = null): void {
    this.application = application;
  }

  public mergeApplicationDefinition (mergeArgs = true): void {
    if (this.application === null) {
      return;
    }

    this.definition.addOptions(Array.from(this.application.getDefinition().getOptions()
      .values()));

    if (mergeArgs) {
      this.definition.addArguments(
        Array.from(this.application.getDefinition().getArguments()
          .values()),
      );
    }
  }

  protected async initialize (input: InputInterface, output: OutputInterface): Promise<void> {
    // no body
  }

  protected async interact (input: InputInterface, output: OutputInterface): Promise<void> {
    // no body
  }

  protected configure (): void {
    // no body
  }

  protected abstract execute (input: InputInterface, output: OutputInterface):
  Promise<CommandExecutionStatus>;

  private validateName (name: string): void {
    if (!new RegExp(/^[a-z0-9:-]+$/).test(name)) {
      throw new InvalidArgumentException(`Command name "${name}" is invalid.`);
    }
  }
}
