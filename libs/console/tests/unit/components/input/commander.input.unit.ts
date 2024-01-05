import {
  CommanderInput,
  InputDefinition,
  InputArgument,
  InputOption,
} from '../../../../src/components/input';

describe('CommanderInput', () => {
  describe('parse', () => {
    it('should set arguments', () => {
      const commanderInput = new CommanderInput(new InputDefinition([ new InputArgument('name') ]));
      commanderInput.parse([ 'my-name' ]);

      expect(commanderInput.getArgument('name')).toEqual('my-name');
    });

    it('should set options', () => {
      const commanderInput = new CommanderInput(new InputDefinition([ new InputOption('name') ]));
      commanderInput.parse([], { name: 'my-name' });

      expect(commanderInput.getOption('name')).toEqual('my-name');
    });

    it('should set negatable options', () => {
      const commanderInput = new CommanderInput(
        new InputDefinition([ new InputOption('no-interaction', 'n', InputOption.VALUE_NONE) ]),
      );
      commanderInput.parse([], { interaction: false });

      expect(commanderInput.getOption('no-interaction')).toBe(true);
      expect(commanderInput.isInteractive()).toBe(false);
    });
  });
});
