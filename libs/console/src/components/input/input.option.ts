import { isEmpty } from 'lodash';

import { InvalidArgumentException, LogicException } from '../exception';

export type InputOptionValueType = string | number | string[] | number[] | boolean;
export type ProcessingFnType =
(arg: string, previous: InputOptionValueType) => InputOptionValueType;

export class InputOption {
  public static VALUE_NONE = 0b0001;
  public static VALUE_REQUIRED = 0b0010;
  public static VALUE_OPTIONAL = 0b0100;
  public static VALUE_IS_ARRAY = 0b1000;

  private readonly name: string;
  private readonly shortcut: string;
  private readonly mode: number;
  private readonly description: string;
  private readonly processingFn: ProcessingFnType;

  private defaultValue: InputOptionValueType;

  constructor (
    name: string,
    shortcut: string = null,
    mode: number = null,
    description = '',
    defaultValue: InputOptionValueType = null,
    processingFn: (arg: string, previous: InputOptionValueType) => InputOptionValueType = null,
  ) {
    if (isEmpty(name)) {
      throw new InvalidArgumentException('An option name cannot be empty.');
    }

    if (isEmpty(shortcut)) {
      shortcut = null;
    }

    if (name.startsWith('--')) {
      name = name.substr(2);
    }

    if (null === mode) {
      mode = InputOption.VALUE_NONE;
    } else if (mode > 15 || mode < 1) {
      throw new InvalidArgumentException(`Option mode "${mode}" is not valid.`);
    }

    this.name = name;
    this.shortcut = shortcut;
    this.mode = mode;
    this.description = description;
    this.processingFn = processingFn;

    if (this.isArray() && !this.acceptValue()) {
      throw new InvalidArgumentException(
        'Impossible to have an option mode VALUE_IS_ARRAY if the option does not accept a value.',
      );
    }

    this.validate();
    this.setDefault(defaultValue);
  }

  public getName (): string {
    return this.name;
  }

  public getShortcut (): string {
    return this.shortcut;
  }

  public getDefault (): InputOptionValueType {
    return this.defaultValue;
  }

  public getDescription (): string {
    return this.description;
  }

  public getProcessingFn (): ProcessingFnType {
    return this.processingFn;
  }

  public acceptValue (): boolean {
    return this.isValueRequired() || this.isValueOptional();
  }

  public isValueRequired (): boolean {
    return InputOption.VALUE_REQUIRED === (InputOption.VALUE_REQUIRED & this.mode);
  }

  public isValueOptional (): boolean {
    return InputOption.VALUE_OPTIONAL === (InputOption.VALUE_OPTIONAL & this.mode);
  }

  public isArray (): boolean {
    return InputOption.VALUE_IS_ARRAY === (InputOption.VALUE_IS_ARRAY & this.mode);
  }

  public setDefault (defaultValue: InputOptionValueType): void {
    if (InputOption.VALUE_NONE === (InputOption.VALUE_NONE & this.mode) && defaultValue !== null) {
      throw new LogicException(
        'Cannot set a default value when using InputOption::VALUE_NONE mode.',
      );
    }

    if (this.isArray()) {
      if (defaultValue === null) {
        defaultValue = [];
      } else if (!Array.isArray(defaultValue)) {
        throw new LogicException('A default value for an array option must be an array.');
      }
    }

    this.defaultValue = this.acceptValue() ? defaultValue : false;
  }

  private validate (): void {
    if (this.shortcut !== null && !new RegExp(/^[a-zA-Z]$/).test(this.shortcut)) {
      throw new InvalidArgumentException(
        `Option shortcut "${this.shortcut}" is invalid. Shortcuts can contain only one letter.`,
      );
    }

    if (!new RegExp(/^[a-z0-9-]+$/).test(this.name)) {
      throw new InvalidArgumentException(
        `Option name "${this.name}" is invalid. Name can contain only small letters and numbers separated by dashes.`,
      );
    }
  }
}
