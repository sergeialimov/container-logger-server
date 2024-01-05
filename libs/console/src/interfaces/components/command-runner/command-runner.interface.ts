import { CommandBase } from '../../../components/command';
import { InputInterface } from '../input';
import { NestConsoleApplicationInterface } from '../nest-console-application.interface';
import { OutputInterface } from '../output';

export interface CommandRunnerInterface {
  setApplication(application: NestConsoleApplicationInterface);
  setCommands(commands: CommandBase[]): void;

  run(input: InputInterface, output: OutputInterface): Promise<number>;
}
