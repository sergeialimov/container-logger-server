import { trimEnd } from 'lodash';

export class UnableToSetVisibilityException extends Error {
  private location = '';
  private reason = '';

  public static atLocation (location: string, reason = ''): UnableToSetVisibilityException {
    const e = new UnableToSetVisibilityException(
      trimEnd(`Unable to set visibility for file located at: ${location}. ${reason}`),
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
