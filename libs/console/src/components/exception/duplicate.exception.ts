export class DuplicateException extends Error {
  constructor (props: string) {
    super(props);
    this.name = 'DuplicateException';
  }
}
