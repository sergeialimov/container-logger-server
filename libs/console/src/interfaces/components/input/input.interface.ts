import { InputDefinition } from '../../../components/input';
import { InputArgumentValueType } from '../../../components/input/input.argument';
import { InputOptionValueType } from '../../../components/input/input.option';

export  interface InputInterface {
  bind(definition: InputDefinition): void;

  getArguments(): Map<string, InputArgumentValueType>;
  getArgument(name: string): InputArgumentValueType;
  hasArgument(name: string): boolean;
  setArgument(name: string, value: InputArgumentValueType): void;

  getOptions(): Map<string, InputOptionValueType>;
  getOption(name: string): InputOptionValueType;
  hasOption(name: string): boolean;
  setOption(name: string, value: InputOptionValueType): void;

  isInteractive(): boolean;
  setIsInteractive(interactive: boolean): void;

  parse(...args): void;
}
