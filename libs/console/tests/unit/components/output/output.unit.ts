import { Output } from '../../../../src/components/output';
import { OutputVerbosityLevels } from '../../../../src/interfaces/components/output/output.interface';

class TestOutput extends Output {
  protected doWrite (message: string, newLine: boolean): void {
    // no body
  }
}

describe('Output', () => {
  describe('getVerbosity', () => {
    it('should return normal verbosity', () => {
      const output = new TestOutput();
      expect(output.getVerbosity()).toEqual(OutputVerbosityLevels.VERBOSITY_NORMAL);
    });

    it('should return the set verbosity', () => {
      const output = new TestOutput(OutputVerbosityLevels.VERBOSITY_VERBOSE);
      expect(output.getVerbosity()).toEqual(OutputVerbosityLevels.VERBOSITY_VERBOSE);
    });
  });

  describe('setVerbosity', () => {
    it('should set verbosity', () => {
      const output = new TestOutput();
      expect(output.getVerbosity()).toEqual(OutputVerbosityLevels.VERBOSITY_NORMAL);

      output.setVerbosity(OutputVerbosityLevels.VERBOSITY_VERY_VERBOSE);
      expect(output.getVerbosity()).toEqual(OutputVerbosityLevels.VERBOSITY_VERY_VERBOSE);
    });
  });

  describe('isDebug', () => {
    it('should return true if verbosity is debug', () => {
      const output = new TestOutput();
      expect(output.isDebug()).toBe(false);

      output.setVerbosity(OutputVerbosityLevels.VERBOSITY_DEBUG);
      expect(output.isDebug()).toBe(true);
    });
  });

  describe('isQuiet', () => {
    it('should return true if verbosity is quiet', () => {
      const output = new TestOutput();
      expect(output.isQuiet()).toBe(false);

      output.setVerbosity(OutputVerbosityLevels.VERBOSITY_QUIET);
      expect(output.isQuiet()).toBe(true);
    });
  });

  describe('isVerbose', () => {
    it('should return true if verbosity is verbose', () => {
      const output = new TestOutput();
      expect(output.isVerbose()).toBe(false);

      output.setVerbosity(OutputVerbosityLevels.VERBOSITY_VERBOSE);
      expect(output.isVerbose()).toBe(true);
    });
  });

  describe('isVeryVerbose', () => {
    it('should return true if verbosity is very verbose', () => {
      const output = new TestOutput();
      expect(output.isVeryVerbose()).toBe(false);

      output.setVerbosity(OutputVerbosityLevels.VERBOSITY_VERY_VERBOSE);
      expect(output.isVeryVerbose()).toBe(true);
    });
  });
});
