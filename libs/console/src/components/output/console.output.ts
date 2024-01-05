import { Output } from './output';

export class ConsoleOutput extends Output {
  protected doWrite (message: string, newLine: boolean): void {
    process.stdout.write(message + (newLine ? '\n' : ''));
  }
}
