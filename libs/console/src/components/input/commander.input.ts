import { kebabCase } from 'lodash';

import { Input } from './input';
import { InputArgumentValueType } from './input.argument';
import { InputOptionValueType } from './input.option';

export class CommanderInput extends Input {
  public parse (
    args: Array<InputArgumentValueType> = [],
    options: Record<string, InputOptionValueType> = {},
  ): void {
    for (const [ nIndex, mArgumentValue ] of args.entries()) {
      if (this.definition.hasArgument(nIndex)) {
        this.setArgument(this.definition.getArgument(nIndex).getName(), mArgumentValue);
      }
    }

    for (const [ optionName, optionValue ] of Object.entries(options)) {
      const normalizedOptionName = kebabCase(optionName);

      if (this.hasOption(normalizedOptionName)) {
        this.setOption(normalizedOptionName, optionValue);
        continue;
      }

      // Try negatable options
      if (this.hasOption(`no-${normalizedOptionName}`) && typeof optionValue === 'boolean') {
        this.setOption(`no-${normalizedOptionName}`, !optionValue);
      }
    }

    if (this.hasOption('no-interaction') && this.getOption('no-interaction') === true) {
      this.setIsInteractive(false);
    }
  }
}
