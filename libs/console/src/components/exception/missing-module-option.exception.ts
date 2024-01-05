export class MissingArgumentException extends Error {
  constructor (argumentName: string) {
    super(`Missing "${argumentName}"`);
  }
}
