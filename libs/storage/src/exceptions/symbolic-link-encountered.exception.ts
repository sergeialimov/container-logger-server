export class SymbolicLinkEncounteredException extends Error {
  private location = '';

  public static atLocation (pathname: string): SymbolicLinkEncounteredException {
    const e = new SymbolicLinkEncounteredException(
      `Unsupported symbolic link encountered at location ${pathname}`,
    );
    e.location = pathname;

    return e;
  }

  public getLocation (): string {
    return this.location;
  }
}
