import { OutputInterface } from '../../interfaces';
import { OutputVerbosityLevels } from '../../interfaces/components/output/output.interface';

export  abstract class Output implements OutputInterface {
  private verbosity: OutputVerbosityLevels;

  constructor (verbosity: OutputVerbosityLevels = OutputVerbosityLevels.VERBOSITY_NORMAL) {
    this.verbosity = verbosity === null ? OutputVerbosityLevels.VERBOSITY_NORMAL : verbosity;
  }

  getVerbosity (): OutputVerbosityLevels {
    return this.verbosity;
  }

  setVerbosity (level: OutputVerbosityLevels): void {
    this.verbosity = level;
  }

  isDebug (): boolean {
    return OutputVerbosityLevels.VERBOSITY_DEBUG === this.verbosity;
  }

  isQuiet (): boolean {
    return OutputVerbosityLevels.VERBOSITY_QUIET === this.verbosity;
  }

  isVerbose (): boolean {
    return OutputVerbosityLevels.VERBOSITY_VERBOSE <= this.verbosity;
  }

  isVeryVerbose (): boolean {
    return OutputVerbosityLevels.VERBOSITY_VERY_VERBOSE <= this.verbosity;
  }

  public write (message: string): void {
    this.doWrite(message, false);
  }

  public writeLn (message: string): void {
    this.doWrite(message, true);
  }

  protected abstract doWrite (message: string, newLine: boolean): void;
}
