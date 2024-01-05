import { InvalidArgumentException, LogicException } from '../../../../src/components/exception';
import { InputDefinition, InputOption, InputArgument } from '../../../../src/components/input';

describe('InputDefinition', () => {
  describe('addOption', () => {
    it('should add the option in stack', () => {
      const inputDefinition = new InputDefinition();
      inputDefinition.addOption(new InputOption('name'));

      expect(inputDefinition['options'].size).toEqual(1);
      expect(Array.from(inputDefinition['options'].keys())).toEqual([ 'name' ]);
    });
  });

  describe('getOption', () => {
    it('should retrieve the option from the stack', () => {
      const inputDefinition = new InputDefinition();
      const inputOption = new InputOption('name');

      inputDefinition.addOption(inputOption);

      expect(inputDefinition.getOption('name')).toStrictEqual(inputOption);
    });

    it('should throw if option is not present in stack', () => {
      expect(() => {
        new InputDefinition().getOption('non-existing');
      }).toThrow(new InvalidArgumentException('The "non-existing" option does not exist.'));
    });
  });

  describe('hasOption', () => {
    it('should return true if option exists in stack', () => {
      const inputDefinition = new InputDefinition();
      const inputOption = new InputOption('name');

      inputDefinition.addOption(inputOption);

      expect(inputDefinition.hasOption('name')).toBe(true);
    });

    it("should return false if option doesn't exists in stack", () => {
      const inputDefinition = new InputDefinition();
      expect(inputDefinition.hasOption('name')).toBe(false);
    });
  });

  describe('getOptions', () => {
    it('should return all the options existing in stack', () => {
      const inputDefinition = new InputDefinition();
      expect(inputDefinition.getOptions().size).toBe(0);

      inputDefinition.addOption(new InputOption('name'));
      inputDefinition.addOption(new InputOption('name2'));

      expect(inputDefinition.getOptions().size).toBe(2);
    });
  });

  describe('setOptions', () => {
    it('should set options in stack and remove previously set ones', () => {
      const inputDefinition = new InputDefinition();
      inputDefinition.addOption(new InputOption('name'));
      inputDefinition.addOption(new InputOption('name2'));
      expect(inputDefinition.hasOption('name')).toBe(true);
      expect(inputDefinition.hasOption('name2')).toBe(true);

      expect(inputDefinition.getOptions().size).toBe(2);

      inputDefinition.setOptions([ new InputOption('name3') ]);

      expect(inputDefinition.getOptions().size).toBe(1);
      expect(inputDefinition.hasOption('name3')).toBe(true);
      expect(inputDefinition.hasOption('name')).toBe(false);
    });
  });

  describe('addOptions', () => {
    it('should add options in stack and not remove previously set ones', () => {
      const inputDefinition = new InputDefinition();
      inputDefinition.addOption(new InputOption('name'));
      inputDefinition.addOption(new InputOption('name2'));
      expect(inputDefinition.hasOption('name')).toBe(true);
      expect(inputDefinition.hasOption('name2')).toBe(true);

      expect(inputDefinition.getOptions().size).toBe(2);

      inputDefinition.addOptions([ new InputOption('name3') ]);

      expect(inputDefinition.getOptions().size).toBe(3);
      expect(inputDefinition.hasOption('name3')).toBe(true);
      expect(inputDefinition.hasOption('name')).toBe(true);
      expect(inputDefinition.hasOption('name2')).toBe(true);
    });
  });

  describe('getOptionDefaults', () => {
    it('should return all the defaults for all options existing in stack', () => {
      const inputDefinition = new InputDefinition();
      expect(inputDefinition.getOptions().size).toBe(0);

      inputDefinition.addOption(
        new InputOption('name', null, InputOption.VALUE_OPTIONAL, '', 'default'),
      );
      inputDefinition.addOption(
        new InputOption('name2', null, InputOption.VALUE_OPTIONAL, '', 'default2'),
      );
      inputDefinition.addOption(new InputOption('name3'));
      inputDefinition.addOption(new InputOption('name4', null, InputOption.VALUE_OPTIONAL));

      expect(inputDefinition.getOptionDefaults()).toEqual({
        name: 'default',
        name2: 'default2',
        name3: false,
        name4: null,
      });
    });
  });

  describe('addArgument', () => {
    it('should add the argument in stack', () => {
      const inputDefinition = new InputDefinition();
      inputDefinition.addArgument(new InputArgument('name'));

      expect(inputDefinition['arguments'].size).toEqual(1);
      expect(Array.from(inputDefinition['arguments'].keys())).toEqual([ 'name' ]);
    });

    it('should throw if argument already exists', () => {
      const inputDefinition = new InputDefinition([ new InputArgument('name') ]);
      expect(() => inputDefinition.addArgument(new InputArgument('name'))).toThrow(
        new LogicException('An argument with name "name" already exists.'),
      );
    });
  });

  describe('getArgument', () => {
    it('should retrieve the argument from the stack', () => {
      const inputDefinition = new InputDefinition();
      const inputArgument = new InputArgument('name');

      inputDefinition.addArgument(inputArgument);

      expect(inputDefinition.getArgument('name')).toStrictEqual(inputArgument);
    });

    it('should retrieve the argument from the stack by numerical index', () => {
      const inputDefinition = new InputDefinition();
      const inputArgument = new InputArgument('name');

      inputDefinition.addArgument(inputArgument);

      expect(inputDefinition.getArgument(0)).toStrictEqual(inputArgument);
    });

    it('should throw if argument is not present in stack', () => {
      expect(() => {
        new InputDefinition().getArgument('non-existing');
      }).toThrow(new InvalidArgumentException('The "non-existing" argument does not exist.'));
    });
  });

  describe('hasArgument', () => {
    it('should return true if argument exists in stack', () => {
      const inputDefinition = new InputDefinition();
      const inputArgument = new InputArgument('name');

      inputDefinition.addArgument(inputArgument);

      expect(inputDefinition.hasArgument('name')).toBe(true);
    });

    it("should return false if argument doesn't exists in stack", () => {
      const inputDefinition = new InputDefinition();
      expect(inputDefinition.hasArgument('name')).toBe(false);
    });
  });

  describe('getArguments', () => {
    it('should return all the arguments existing in stack', () => {
      const inputDefinition = new InputDefinition();
      expect(inputDefinition.getArguments().size).toBe(0);

      inputDefinition.addArgument(new InputArgument('name'));
      inputDefinition.addArgument(new InputArgument('name2'));

      expect(inputDefinition.getArguments().size).toBe(2);
    });
  });

  describe('setArguments', () => {
    it('should set arguments in stack and remove previously set ones', () => {
      const inputDefinition = new InputDefinition();
      inputDefinition.addArgument(new InputArgument('name'));
      inputDefinition.addArgument(new InputArgument('name2'));
      expect(inputDefinition.hasArgument('name')).toBe(true);
      expect(inputDefinition.hasArgument('name2')).toBe(true);

      expect(inputDefinition.getArguments().size).toBe(2);

      inputDefinition.setArguments([ new InputArgument('name3') ]);

      expect(inputDefinition.getArguments().size).toBe(1);
      expect(inputDefinition.hasArgument('name3')).toBe(true);
      expect(inputDefinition.hasArgument('name')).toBe(false);
    });
  });

  describe('addArguments', () => {
    it('should add arguments in stack and not remove previously set ones', () => {
      const inputDefinition = new InputDefinition();
      inputDefinition.addArgument(new InputArgument('name'));
      inputDefinition.addArgument(new InputArgument('name2'));
      expect(inputDefinition.hasArgument('name')).toBe(true);
      expect(inputDefinition.hasArgument('name2')).toBe(true);

      expect(inputDefinition.getArguments().size).toBe(2);

      inputDefinition.addArguments([ new InputArgument('name3') ]);

      expect(inputDefinition.getArguments().size).toBe(3);
      expect(inputDefinition.hasArgument('name3')).toBe(true);
      expect(inputDefinition.hasArgument('name')).toBe(true);
      expect(inputDefinition.hasArgument('name2')).toBe(true);
    });
  });

  describe('getArgumentDefaults', () => {
    it('should return all the defaults for all arguments existing in stack', () => {
      const inputDefinition = new InputDefinition();
      expect(inputDefinition.getArguments().size).toBe(0);

      inputDefinition.addArgument(new InputArgument('name', null, '', 'default'));
      inputDefinition.addArgument(
        new InputArgument('name2', InputArgument.OPTIONAL, '', 'default2'),
      );
      inputDefinition.addArgument(new InputArgument('name3', InputArgument.REQUIRED));
      inputDefinition.addArgument(new InputArgument('name4'));

      expect(inputDefinition.getArgumentDefaults()).toEqual({
        name: 'default',
        name2: 'default2',
        name3: null,
        name4: null,
      });
    });
  });
});
