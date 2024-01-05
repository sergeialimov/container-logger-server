import { InvalidArgumentException } from '../../../../src/components/exception';
import { InputOption } from '../../../../src/components/input';

describe('InputOption', () => {
  describe('constructor', () => {
    it('should throw on invalid mode', () => {
      expect(() => {
        new InputOption('name', null, 100);
      }).toThrow(new InvalidArgumentException('Option mode "100" is not valid.'));
    });

    it('should throw on invalid name', () => {
      expect(() => {
        new InputOption('Invalid');
      }).toThrow(
        new InvalidArgumentException(
          'Option name "Invalid" is invalid. Name can contain only small letters and numbers separated by dashes.',
        ),
      );
      expect(() => {
        new InputOption('invalid%');
      }).toThrow(
        new InvalidArgumentException(
          'Option name "invalid%" is invalid. Name can contain only small letters and numbers separated by dashes.',
        ),
      );
      expect(() => {
        new InputOption('invalid+');
      }).toThrow(
        new InvalidArgumentException(
          'Option name "invalid+" is invalid. Name can contain only small letters and numbers separated by dashes.',
        ),
      );
    });

    it('should throw on empty name', () => {
      expect(() => {
        new InputOption('');
      }).toThrow(new InvalidArgumentException('An option name cannot be empty.'));
    });

    it('should throw on invalid shortcut', () => {
      expect(() => {
        new InputOption('name', 'ab');
      }).toThrow(
        new InvalidArgumentException(
          'Option shortcut "ab" is invalid. Shortcuts can contain only one letter.',
        ),
      );
      expect(() => {
        new InputOption('name', 'AB');
      }).toThrow(
        new InvalidArgumentException(
          'Option shortcut "AB" is invalid. Shortcuts can contain only one letter.',
        ),
      );
      expect(() => {
        new InputOption('name', '%');
      }).toThrow(
        new InvalidArgumentException(
          'Option shortcut "%" is invalid. Shortcuts can contain only one letter.',
        ),
      );
    });

    it("should throw if option is an array and doesn't accept values", () => {
      expect(() => {
        new InputOption('name', null, InputOption.VALUE_IS_ARRAY);
      }).toThrow(
        new InvalidArgumentException(
          'Impossible to have an option mode VALUE_IS_ARRAY if the option does not accept a value.',
        ),
      );
      expect(() => {
        new InputOption('name', null, InputOption.VALUE_IS_ARRAY | InputOption.VALUE_NONE);
      }).toThrow(
        new InvalidArgumentException(
          'Impossible to have an option mode VALUE_IS_ARRAY if the option does not accept a value.',
        ),
      );
    });

    it('should throw if mode is NONE and attempt to set a default value', () => {
      expect(() => {
        new InputOption('name', null, InputOption.VALUE_NONE, '', 'defaultValue');
      }).toThrow(
        new InvalidArgumentException(
          'Cannot set a default value when using InputOption::VALUE_NONE mode.',
        ),
      );
    });
  });

  describe('getName', () => {
    it('should return the option name', () => {
      const inputOption = new InputOption('name');
      expect(inputOption.getName()).toEqual('name');
    });

    it('should return the option name without dashes', () => {
      const inputOption = new InputOption('--name');
      expect(inputOption.getName()).toEqual('name');
    });
  });

  describe('getShortcut', () => {
    it('should return the shortcut', () => {
      expect(new InputOption('name', 'n').getShortcut()).toEqual('n');
      expect(new InputOption('name', 'N').getShortcut()).toEqual('N');
      expect(new InputOption('name').getShortcut()).toEqual(null);
    });
  });

  describe('getDescription', () => {
    it('should return the description', () => {
      expect(
        new InputOption('name', null, InputOption.VALUE_OPTIONAL, 'description').getDescription(),
      ).toEqual('description');
    });
  });

  describe('getDefault', () => {
    it('should return the default value', () => {
      expect(
        new InputOption('name', null, InputOption.VALUE_OPTIONAL, null, 'defaultValue').getDefault(),
      ).toEqual('defaultValue');
    });
  });

  describe('acceptValue', () => {
    it('should return true if option accepts values', () => {
      expect(
        new InputOption(
          'name',
          null,
          InputOption.VALUE_OPTIONAL,
          null,
          'defaultValue',
        ).acceptValue(),
      ).toBe(true);
      expect(
        new InputOption(
          'name',
          null,
          InputOption.VALUE_REQUIRED,
          null,
          'defaultValue',
        ).acceptValue(),
      ).toBe(true);
      expect(new InputOption('name', null, InputOption.VALUE_NONE).acceptValue()).toBe(false);
    });
  });

  describe('isValueRequired', () => {
    it('should return true if option value is required', () => {
      expect(new InputOption('name', null, InputOption.VALUE_REQUIRED).isValueRequired()).toBe(
        true,
      );
      expect(new InputOption('name', null, InputOption.VALUE_NONE).isValueRequired()).toBe(false);
      expect(new InputOption('name', null, InputOption.VALUE_OPTIONAL).isValueRequired()).toBe(
        false,
      );
    });
  });

  describe('isValueOptional', () => {
    it('should return true if option value is optional', () => {
      expect(new InputOption('name', null, InputOption.VALUE_OPTIONAL).isValueOptional()).toBe(
        true,
      );
      expect(new InputOption('name', null, InputOption.VALUE_REQUIRED).isValueOptional()).toBe(
        false,
      );
      expect(new InputOption('name', null, InputOption.VALUE_NONE).isValueOptional()).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true if option is an array', () => {
      expect(
        new InputOption(
          'name',
          null,
          InputOption.VALUE_IS_ARRAY | InputOption.VALUE_OPTIONAL,
        ).isArray(),
      ).toBe(true);
      expect(new InputOption('name', null, InputOption.VALUE_REQUIRED).isArray()).toBe(false);
      expect(new InputOption('name', null, InputOption.VALUE_NONE).isArray()).toBe(false);
    });
  });

  describe('setDefault', () => {
    it('should set default value', () => {
      const inputOption = new InputOption('name', null, InputOption.VALUE_OPTIONAL);
      inputOption.setDefault('default');

      expect(inputOption.getDefault()).toBe('default');
      expect(new InputOption('name', null, InputOption.VALUE_NONE).getDefault()).toBe(false);
      expect(new InputOption('name', null, InputOption.VALUE_OPTIONAL).getDefault()).toBe(null);
    });

    it('should throw if mode is NONE', () => {
      const inputOption = new InputOption('name');

      expect(() => {
        inputOption.setDefault('default');
      }).toThrow(
        new InvalidArgumentException(
          'Cannot set a default value when using InputOption::VALUE_NONE mode.',
        ),
      );
    });

    it('should throw if mode is ARRAY and default value is not set', () => {
      const inputOption = new InputOption(
        'name',
        null,
        InputOption.VALUE_IS_ARRAY | InputOption.VALUE_REQUIRED,
      );

      expect(() => {
        inputOption.setDefault('default');
      }).toThrow(
        new InvalidArgumentException('A default value for an array option must be an array.'),
      );
    });
  });
});
