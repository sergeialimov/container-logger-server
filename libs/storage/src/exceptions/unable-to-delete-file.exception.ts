import { trimEnd } from 'lodash';

export class UnableToDeleteFileException extends Error {
  private location = '';
  private reason = '';

  public static atLocation (location: string, reason = ''): UnableToDeleteFileException {
    const e = new UnableToDeleteFileException(
      trimEnd(`Unable to delete file located at: ${location}, ${reason}`),
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
