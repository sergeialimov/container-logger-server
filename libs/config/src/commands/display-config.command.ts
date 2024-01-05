import { Inject, Optional, Logger } from '@nestjs/common';

import { CommandBase } from '@libs/console/components/command';
import { InputOption , Input } from '@libs/console/components/input';
import { Command } from '@libs/console/decorators';
import { CommandExecutionStatus } from '@libs/console/types';

import { ConfigService } from '../services';

@Command()
export class DisplayConfigCommand extends CommandBase {
  constructor (
    private readonly configService: ConfigService,
  ) {
    super();
  }

  protected override configure (): void {
    super.configure();
    this.setName('config:display')
      .setDescription('Command for displaying populated config object')
      .setProcessTitle('config:display')
      .addOption(
        'config-key-path',
        'p',
        InputOption.VALUE_REQUIRED,
        "Path for config to display (e.g. 'app.host', 'logger')",
      );
  }

  override async execute (input: Input): Promise<number> {
    const pathToDisplay = input.getOption('config-key-path') as string;
    const config = this.configService.get(pathToDisplay);

    if (!config) {
      Logger.log(`No config is stored by provided path "${pathToDisplay}"`);
      return CommandExecutionStatus.SUCCESS;
    }

    Logger.log({
      message: `Config.${pathToDisplay}`,
      config,
    });

    return CommandExecutionStatus.SUCCESS;
  }
}
