import { INestApplicationContext } from '@nestjs/common';

import { InputInterface } from './input';
import { OutputInterface } from './output';
import { CommandBase } from '../../components/command';
import { InputDefinition } from '../../components/input';

export  interface NestConsoleApplicationInterface {
  getName(): string;
  setName(name: string);

  getVersion(): string;
  setVersion(version: string): void;

  getApplicationContext(): INestApplicationContext;

  getDefinition(): InputDefinition;
  setDefinition(definition: InputDefinition): void;

  isAutoExitEnabled(): boolean;
  setAutoExit(autoExit: boolean): void;

  getCommands(namespace: string): Map<string, CommandBase>;
  addCommand(command: CommandBase): CommandBase | null;

  extractNamespace(name: string, limit: number): string;

  run(input?: InputInterface, output?: OutputInterface): Promise<number>;
}
