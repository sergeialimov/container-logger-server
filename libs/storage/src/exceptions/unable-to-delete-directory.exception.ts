import { trimEnd } from 'lodash';

export class UnableToDeleteDirectoryException extends Error {
  private location = '';
  private reason = '';

  public static atLocation (location: string, reason = ''): UnableToDeleteDirectoryException {
    const e = new UnableToDeleteDirectoryException(
      trimEnd(`Unable to delete directory located at: ${location}, ${reason}`),
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
