import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { RegistryService } from '@libs/shared/backend';

import { TestCommand } from '../commands';
import { CommanderCommandRunner } from '../components/command-runner';
import { CommanderInput } from '../components/input';
import { ConsoleOutput } from '../components/output';
import {
  INPUT_INTERFACE_TOKEN,
  OUTPUT_INTERFACE_TOKEN,
  COMMAND_RUNNER_INTERFACE_TOKEN,
} from '../constants';

@Module({
  imports: [ DiscoveryModule ],
  providers: [
    {
      provide: INPUT_INTERFACE_TOKEN,
      useClass: CommanderInput,
    },
    {
      provide: OUTPUT_INTERFACE_TOKEN,
      useClass: ConsoleOutput,
    },
    {
      provide: COMMAND_RUNNER_INTERFACE_TOKEN,
      useClass: CommanderCommandRunner,
    },
    RegistryService,
    TestCommand,
  ],
  exports: [
    INPUT_INTERFACE_TOKEN,
    OUTPUT_INTERFACE_TOKEN,
    COMMAND_RUNNER_INTERFACE_TOKEN,
  ],
})
export class ConsoleModule {
}
