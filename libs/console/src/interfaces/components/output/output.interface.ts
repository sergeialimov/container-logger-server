export enum OutputVerbosityLevels {
  VERBOSITY_QUIET = 16,
  VERBOSITY_NORMAL = 32,
  VERBOSITY_VERBOSE = 64,
  VERBOSITY_VERY_VERBOSE = 128,
  VERBOSITY_DEBUG = 256,
}

export  interface OutputInterface {
  getVerbosity(): number;
  setVerbosity(level: number): void;

  isQuiet(): boolean;
  isVerbose(): boolean;
  isVeryVerbose(): boolean;
  isDebug(): boolean;

  write (message: string): void;

  writeLn (message: string): void;
}
