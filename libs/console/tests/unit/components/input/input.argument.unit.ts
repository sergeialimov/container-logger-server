import { InvalidArgumentException } from '../../../../src/components/exception';
import { InputArgument } from '../../../../src/components/input';

describe('InputArgument', () => {
  describe('constructor', () => {
    it('should throw on invalid mode', () => {
      expect(() => {
        new InputArgument('name', 100);
      }).toThrow(new InvalidArgumentException('Argument mode "100" is not valid.'));
    });

    it('should throw on invalid name', () => {
      expect(() => {
        new InputArgument('Invalid');
      }).toThrow(
        new InvalidArgumentException(
          'Argument name "Invalid" is invalid. Name can contain only small letters and numbers separated by dashes.',
        ),
      );
      expect(() => {
        new InputArgument('invalid%');
      }).toThrow(
        new InvalidArgumentException(
          'Argument name "invalid%" is invalid. Name can contain only small letters and numbers separated by dashes.',
        ),
      );
      expect(() => {
        new InputArgument('invalid+');
      }).toThrow(
        new InvalidArgumentException(
          'Argument name "invalid+" is invalid. Name can contain only small letters and numbers separated by dashes.',
        ),
      );
    });

    it('should throw on empty name', () => {
      expect(() => {
        new InputArgument('');
      }).toThrow(new InvalidArgumentException('An argument name cannot be empty.'));
    });
  });

  describe('getName', () => {
    it('should return the argument name', () => {
      const inputArgument = new InputArgument('name');
      expect(inputArgument.getName()).toEqual('name');
    });
  });

  describe('getDefault', () => {
    it('should return the default value', () => {
      expect(
        new InputArgument('name', InputArgument.OPTIONAL, '', 'defaultValue').getDefault(),
      ).toEqual('defaultValue');
    });
  });

  describe('getDescription', () => {
    it('should return the description', () => {
      expect(new InputArgument('name', null, 'description').getDescription()).toEqual(
        'description',
      );
    });
  });

  describe('isRequired', () => {
    it('should return true if argument is required', () => {
      expect(new InputArgument('name', InputArgument.REQUIRED).isRequired()).toBe(true);
      expect(new InputArgument('name', InputArgument.OPTIONAL).isRequired()).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true if argument is an array', () => {
      expect(new InputArgument('name', InputArgument.IS_ARRAY).isArray()).toBe(true);
      expect(new InputArgument('name', InputArgument.REQUIRED).isArray()).toBe(false);
    });
  });

  describe('setDefault', () => {
    it('should set default value', () => {
      const inputArgument = new InputArgument('name', InputArgument.OPTIONAL);
      inputArgument.setDefault('default');

      expect(inputArgument.getDefault()).toBe('default');
    });

    it('should throw if mode is REQUIRED and default value is provided', () => {
      expect(() => {
        new InputArgument('name', InputArgument.REQUIRED, '', 'default');
      }).toThrow(
        new InvalidArgumentException(
          'Cannot set a default value except for InputArgument::OPTIONAL mode.',
        ),
      );
    });

    it('should throw if mode is ARRAY and default value is not', () => {
      const inputArgument = new InputArgument(
        'name',
        InputArgument.IS_ARRAY | InputArgument.OPTIONAL,
      );

      expect(() => {
        inputArgument.setDefault('default');
      }).toThrow(
        new InvalidArgumentException('A default value for an array argument must be an array.'),
      );
    });
  });
});
