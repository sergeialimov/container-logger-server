export class UnableToCreateDirectoryException extends Error {
  private location = '';

  public static atLocation (dirname: string, errorMessage = ''): UnableToCreateDirectoryException {
    const e = new UnableToCreateDirectoryException(
      `Unable to create a directory at "${dirname}". ${errorMessage}`,
    );
    e.location = dirname;

    return e;
  }

  public getLocation (): string {
    return this.location;
  }
}
