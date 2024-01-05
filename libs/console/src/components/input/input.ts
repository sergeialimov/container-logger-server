import { InputArgumentValueType } from './input.argument';
import { InputDefinition } from './input.definition';
import { InputOptionValueType } from './input.option';
import { InputInterface } from '../../interfaces';
import { InvalidArgumentException } from '../exception';

export abstract class Input implements InputInterface {
  protected definition: InputDefinition;
  private interactive = true;

  private arguments: Map<string, InputArgumentValueType>;
  private options: Map<string, InputOptionValueType>;

  constructor (definition: InputDefinition = null) {
    this.definition = definition || new InputDefinition();
    this.arguments = new Map();
    this.options = new Map();
  }

  bind (definition: InputDefinition): void {
    this.definition = definition;

    this.arguments = new Map();
    this.options = new Map();
  }

  public abstract parse (): void;

  getOption (name: string): InputOptionValueType {
    if (!this.definition.hasOption(name)) {
      throw new InvalidArgumentException(`The "${name}" option does not exist.`);
    }

    return this.options.has(name)
      ? this.options.get(name)
      : this.definition.getOption(name).getDefault();
  }

  setOption (name: string, value: InputOptionValueType | null): void {
    if (!this.definition.hasOption(name)) {
      throw new InvalidArgumentException(`The "${name}" option does not exist.`);
    }

    this.options.set(name, value);
  }

  getOptions (): Map<string, InputOptionValueType> {
    return new Map([ ...Object.entries(this.definition.getOptionDefaults()), ...this.options ]);
  }

  hasOption (name: string): boolean {
    return this.definition.hasOption(name);
  }

  getArgument (name: string): InputArgumentValueType {
    if (!this.definition.hasArgument(name)) {
      throw new InvalidArgumentException(`The "${name}" argument does not exist.`);
    }

    return this.arguments.has(name)
      ? this.arguments.get(name)
      : this.definition.getArgument(name).getDefault();
  }

  setArgument (name: string, value: InputArgumentValueType): void {
    if (!this.definition.hasArgument(name)) {
      throw new InvalidArgumentException(`The "${name}" argument does not exist.`);
    }

    this.arguments.set(name, value);
  }

  getArguments (): Map<string, InputArgumentValueType> {
    return new Map([ ...Object.entries(this.definition.getArgumentDefaults()), ...this.arguments ]);
  }

  hasArgument (name: string | number): boolean {
    return this.definition.hasArgument(name);
  }

  isInteractive (): boolean {
    return this.interactive;
  }

  setIsInteractive (interactive: boolean): void {
    this.interactive = interactive;
  }
}
