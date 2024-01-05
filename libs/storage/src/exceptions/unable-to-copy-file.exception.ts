import { trimEnd } from 'lodash';

export class UnableToCopyFileException extends Error {
  private source = '';
  private destination = '';
  private reason = '';

  public static fromLocationTo (
    source: string,
    destination: string,
    reason = '',
  ): UnableToCopyFileException {
    const e = new UnableToCopyFileException(
      trimEnd(`Unable to copy file from ${source} to ${destination}. ${reason}`),
    );
    e.source = source;
    e.destination = destination;
    e.reason = reason;

    return e;
  }

  public getReason (): string {
    return this.reason;
  }

  public getSource (): string {
    return this.source;
  }

  public getDestination (): string {
    return this.destination;
  }
}
