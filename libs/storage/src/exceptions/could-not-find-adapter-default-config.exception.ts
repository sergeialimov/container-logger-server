export class CouldNotFindAdapterDefaultConfigException extends Error {
  constructor (adapterName: string) {
    super(
      [
        `Could not find default config for adapter "${adapterName}"`,
        'Please, make sure adapter is correctly implemented. ' +
          'It should have a static field with default config',
      ].join('\n'),
    );
  }
}
