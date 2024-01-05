import { trimEnd } from 'lodash';

export class UnableToReadFileException extends Error {
  private location = '';
  private reason = '';

  public static fromLocation (location: string, reason = ''): UnableToReadFileException {
    const e = new UnableToReadFileException(
      trimEnd(`Unable to read file from location: ${location}, ${reason}`),
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
