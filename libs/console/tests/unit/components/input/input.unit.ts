import { InvalidArgumentException } from '../../../../src/components/exception';
import {
  Input,
  InputDefinition,
  InputOption,
  InputArgument,
} from '../../../../src/components/input';

class TestInput extends Input {
  parse (): void {
    //
  }
}

describe('Input', () => {
  describe('constructor', () => {
    it('should automatically create an InputDefinition', () => {
      const input = new TestInput();
      expect(input['definition']).toBeInstanceOf(InputDefinition);
    });
  });

  describe('bind', () => {
    it('should reset the input definition', () => {
      const input = new TestInput(new InputDefinition([ new InputOption('name') ]));
      expect(input.hasOption('name')).toBe(true);

      input.bind(new InputDefinition());
      expect(input.hasOption('name')).toBe(false);
    });
  });

  describe('getOption', () => {
    it('should get option value by name', () => {
      const input = new TestInput(new InputDefinition([ new InputOption('name') ]));
      expect(input.getOption('name')).toEqual(false);

      input.setOption('name', 'my-name');
      expect(input.getOption('name')).toEqual('my-name');
    });

    it('should get default option value by name', () => {
      const io = new InputOption('name', null, InputOption.VALUE_OPTIONAL, '', 'default-value');
      const input = new TestInput(new InputDefinition([ io ]));
      expect(input.getOption('name')).toEqual('default-value');
    });

    it('should throw if the option is not present in the definition', () => {
      const input = new TestInput(new InputDefinition());
      expect(() => input.getOption('name')).toThrow(
        new InvalidArgumentException('The "name" option does not exist.'),
      );
    });
  });

  describe('setOption', () => {
    it('should set option value by name', () => {
      const input = new TestInput(new InputDefinition([ new InputOption('name') ]));
      input.setOption('name', 'my-name');
      expect(input.getOption('name')).toEqual('my-name');
    });

    it('should throw if the option is not present in the definition', () => {
      const input = new TestInput(new InputDefinition());
      expect(() => input.setOption('name', 'my-name')).toThrow(
        new InvalidArgumentException('The "name" option does not exist.'),
      );
    });
  });

  describe('getOptions', () => {
    it('should retrieve all options', () => {
      const input = new TestInput(
        new InputDefinition([
          new InputOption('name'),
          new InputOption('default', null, InputOption.VALUE_OPTIONAL, '', 'default-value'),
        ]),
      );
      input.setOption('name', 'my-name');
      expect(input.getOptions().size).toEqual(2);
      expect(Array.from(input.getOptions().keys())).toEqual([ 'name', 'default' ]);
      expect(Array.from(input.getOptions().values())).toEqual([ 'my-name', 'default-value' ]);
    });
  });

  describe('hasOption', () => {
    it('should check if option is defined', () => {
      const input = new TestInput(new InputDefinition([ new InputOption('name') ]));
      expect(input.hasOption('name')).toBe(true);
      expect(input.hasOption('no-existing')).toBe(false);
    });
  });

  describe('getArgument', () => {
    it('should get argument value by name', () => {
      const input = new TestInput(new InputDefinition([ new InputArgument('name') ]));
      expect(input.getArgument('name')).toEqual(null);

      input.setArgument('name', 'my-name');
      expect(input.getArgument('name')).toEqual('my-name');
    });

    it('should get default argument value by name', () => {
      const input = new TestInput(
        new InputDefinition([ new InputArgument('name', null, '', 'default-value') ]),
      );
      expect(input.getArgument('name')).toEqual('default-value');
    });

    it('should throw if the argument is not present in the definition', () => {
      const input = new TestInput(new InputDefinition());
      expect(() => input.getArgument('name')).toThrow(
        new InvalidArgumentException('The "name" argument does not exist.'),
      );
    });
  });

  describe('setArgument', () => {
    it('should set argument value by name', () => {
      const input = new TestInput(new InputDefinition([ new InputArgument('name') ]));
      input.setArgument('name', 'my-name');
      expect(input.getArgument('name')).toEqual('my-name');
    });

    it('should throw if the argument is not present in the definition', () => {
      const input = new TestInput(new InputDefinition());
      expect(() => input.setArgument('name', 'my-name')).toThrow(
        new InvalidArgumentException('The "name" argument does not exist.'),
      );
    });
  });

  describe('getArguments', () => {
    it('should retrieve all arguments', () => {
      const input = new TestInput(
        new InputDefinition([
          new InputArgument('name'),
          new InputArgument('default', null, '', 'default-value'),
        ]),
      );
      input.setArgument('name', 'my-name');
      expect(input.getArguments().size).toEqual(2);
      expect(Array.from(input.getArguments().keys())).toEqual([ 'name', 'default' ]);
      expect(Array.from(input.getArguments().values())).toEqual([ 'my-name', 'default-value' ]);
    });
  });

  describe('hasArgument', () => {
    it('should check if argument is defined', () => {
      const input = new TestInput(new InputDefinition([ new InputArgument('name') ]));
      expect(input.hasArgument('name')).toBe(true);
      expect(input.hasArgument('no-existing')).toBe(false);
    });
  });

  describe('isInteractive', () => {
    it('should return true if input is interactive', () => {
      const input = new TestInput(new InputDefinition([]));
      expect(input.isInteractive()).toBe(true);
      input.setIsInteractive(false);
      expect(input.isInteractive()).toBe(false);
    });
  });
});
