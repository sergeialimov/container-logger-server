export class CouldNotReadStorageIdException extends Error {
  constructor (storageAlias: string) {
    super(
      [
        `Could not read storage ID for storage "${storageAlias}" or it's not a number.`,
        `Should be configured via STORAGE_STORAGES_${storageAlias}_ID key in env.`,
      ].join('\n'),
    );
  }
}
