import { CommandBase } from '../components/command';
import { Command } from '../decorators';
import { CommandExecutionStatus } from '../types';

@Command()
export class TestCommand extends CommandBase {
  protected override configure (): void {
    super.configure();
    this
      .setName('console:test')
      .setDescription('Test Command for console library');
  }

  protected async execute (): Promise<number> {
    return CommandExecutionStatus.SUCCESS;
  }
}
