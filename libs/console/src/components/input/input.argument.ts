import { isEmpty } from 'lodash';

import { InvalidArgumentException, LogicException } from '../exception';

export type InputArgumentValueType = string | number | string[] | number[];

export class InputArgument {
  public static REQUIRED = 1;
  public static OPTIONAL = 2;
  public static IS_ARRAY = 4;

  private readonly name: string;
  private readonly mode: number;
  private readonly description: string;
  private defaultValue: InputArgumentValueType;

  constructor (
    name: string,
    mode: number = null,
    description = '',
    defaultValue: InputArgumentValueType = null,
  ) {
    if (isEmpty(name)) {
      throw new InvalidArgumentException('An argument name cannot be empty.');
    }

    if (mode === null) {
      mode = InputArgument.OPTIONAL;
    } else if (mode > 7 || mode < 1) {
      throw new InvalidArgumentException(`Argument mode "${mode}" is not valid.`);
    }

    this.name = name;
    this.mode = mode;
    this.description = description;

    this.validate();
    this.setDefault(defaultValue);
  }

  public getName (): string {
    return this.name;
  }

  public getDefault (): InputArgumentValueType {
    return this.defaultValue;
  }

  public getDescription (): string {
    return this.description;
  }

  public isRequired (): boolean {
    return InputArgument.REQUIRED === (InputArgument.REQUIRED & this.mode);
  }

  public isArray (): boolean {
    return InputArgument.IS_ARRAY === (InputArgument.IS_ARRAY & this.mode);
  }

  public setDefault (defaultValue: InputArgumentValueType = null): void {
    if (this.isRequired() && defaultValue !== null) {
      throw new LogicException(
        'Cannot set a default value except for InputArgument::OPTIONAL mode.',
      );
    }

    if (this.isArray()) {
      if (defaultValue === null) {
        defaultValue = [];
      } else if (!Array.isArray(defaultValue)) {
        throw new LogicException('A default value for an array argument must be an array.');
      }
    }

    this.defaultValue = defaultValue;
  }

  private validate (): void {
    if (!new RegExp(/^[a-z0-9-]+$/).test(this.name)) {
      throw new InvalidArgumentException(
        `Argument name "${this.name}" is invalid. Name can contain only small letters and numbers separated by dashes.`,
      );
    }
  }
}
