import { InputArgument } from './input.argument';
import { InputOptionValueType, InputOption } from './input.option';
import { DuplicateException, InvalidArgumentException, LogicException } from '../exception';

export class InputDefinition {
  private options: Map<string, InputOption>;
  private arguments: Map<string, InputArgument>;
  private addedOptionsLiterals: Set<string> = new Set<string>();

  constructor (definition: Array<InputOption | InputArgument> = []) {
    this.options = new Map();
    this.arguments = new Map();

    this.setDefinition(definition);
  }

  public setDefinition (definition: Array<InputOption | InputArgument>): void {
    const args = [];
    const options = [];

    for (const type of definition) {
      if (type instanceof InputOption) {
        options.push(type);
      } else {
        args.push(type);
      }
    }

    this.setArguments(args);
    this.setOptions(options);
  }

  public addOption (option: InputOption): void {
    this.validateOption(option);
    this.options.set(option.getName(), option);
  }

  private validateOption (option: InputOption): void {
    const shortcut = option.getShortcut();
    const name = option.getName();

    if (this.addedOptionsLiterals.has(name)) {
      throw new DuplicateException(`Option "--${name}" already used in command`);
    }

    this.addedOptionsLiterals.add(name);

    if (typeof shortcut === 'string') {
      if (this.addedOptionsLiterals.has(shortcut)) {
        const addedOption = Array.from(this.options.values())
          .find((o) => shortcut === o.getShortcut());

        throw new DuplicateException(
          `Shortcut "-${shortcut}" for "--${name}" already used for "--${addedOption.getName()}" option`,
        );
      }

      this.addedOptionsLiterals.add(shortcut);
    }
  }

  public getOption (name: string): InputOption {
    if (!this.hasOption(name)) {
      throw new InvalidArgumentException(`The "${name}" option does not exist.`);
    }

    return this.options.get(name);
  }

  public hasOption (name: string): boolean {
    return this.options.has(name);
  }

  public getOptions (): Map<string, InputOption> {
    return this.options;
  }

  public setOptions (options: Array<InputOption>): void {
    this.options = new Map<string, InputOption>();

    this.addOptions(options);
  }

  public addOptions (options: Array<InputOption>): void {
    for (const option of options) {
      this.addOption(option);
    }
  }

  public getOptionDefaults (): Record<string, InputOptionValueType> {
    const defaults = {};

    for (const [ optionName, option ] of this.options.entries()) {
      defaults[optionName] = option.getDefault();
    }

    return defaults;
  }

  public addArgument (argument: InputArgument): void {
    if (this.hasArgument(argument.getName())) {
      throw new LogicException(`An argument with name "${argument.getName()}" already exists.`);
    }

    this.arguments.set(argument.getName(), argument);
  }

  public getArgument (name: string | number): InputArgument {
    if (!this.hasArgument(name)) {
      throw new InvalidArgumentException(`The "${name}" argument does not exist.`);
    }

    if (typeof name === 'number') {
      return this.arguments.get(Array.from(this.arguments.keys())[name]);
    }

    return this.arguments.get(name);
  }

  public hasArgument (name: string | number): boolean {
    if (typeof name === 'number') {
      return typeof Array.from(this.arguments.keys())[name] !== 'undefined';
    }

    return this.arguments.has(name);
  }

  public getArguments (): Map<string, InputArgument> {
    return this.arguments;
  }

  public setArguments (args: Array<InputArgument>): void {
    this.arguments = new Map<string, InputArgument>();

    this.addArguments(args);
  }

  public addArguments (args: Array<InputArgument>): void {
    for (const argument of args) {
      this.addArgument(argument);
    }
  }

  public getArgumentDefaults (): Record<string, string | string[] | null> {
    const defaults = {};

    for (const [ argumentName, argument ] of this.arguments.entries()) {
      defaults[argumentName] = argument.getDefault();
    }

    return defaults;
  }
}
