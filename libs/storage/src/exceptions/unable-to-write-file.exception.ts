import { trimEnd } from 'lodash';

export class UnableToWriteFileException extends Error {
  private location = '';
  private reason = '';

  public static atLocation (location: string, reason = ''): UnableToWriteFileException {
    const e = new UnableToWriteFileException(
      trimEnd(`Unable to write file located at: ${location}. ${reason}`),
    );
    e.location = location;
    e.reason = reason;

    return e;
  }

  public getReason (): string {
    return this.reason;
  }

  public getLocation (): string {
    return this.location;
  }
}
