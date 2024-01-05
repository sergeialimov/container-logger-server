export class CouldNotFindAdapterClassException extends Error {
  constructor (storageAlias: string, adapterName: string, possibleValues: string[]) {
    const supportedAdapters = possibleValues.join(', ');

    super(
      [
        `Could not find adapter class "${adapterName}" for storage "${storageAlias}"`,
        `Please, specify it by passing a STORAGE_STORAGES_${storageAlias}_ADAPTER option to env`,
        `Supported adapters: ${supportedAdapters}`,
      ].join('\n'),
    );
  }
}
