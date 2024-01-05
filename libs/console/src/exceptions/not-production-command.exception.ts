export class NotProductionCommandException extends Error {
  constructor () {
    super('The command is not intended to run in a production environment');
  }
}
