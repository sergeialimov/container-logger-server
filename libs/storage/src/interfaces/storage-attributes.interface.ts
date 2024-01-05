export enum StorageAttributesEnum {
  ATTRIBUTE_TYPE = 'type',
  ATTRIBUTE_FILE_SIZE = 'file_size',
  ATTRIBUTE_VISIBILITY = 'visibility',
  ATTRIBUTE_LAST_MODIFIED = 'last_modified',
  ATTRIBUTE_MIME_TYPE = 'mime_type',
  ATTRIBUTE_EXTRA_METADATA = 'extra_metadata',
  ATTRIBUTE_ALL = 'all',
}

export enum StorageAttributesTypesEnum {
  TYPE_FILE = 'file',
  TYPE_DIRECTORY = 'dir',
}

export interface StorageAttributesInterface {
  getPath(): string;
  getType(): string;
  getFileSize(): number | null;
  getVisibility(): string | null;
  getLastModified(): number | null;
  getExtraMetadata(): Record<string, unknown>;
  getExtension(): string;

  isFile(): boolean;
  isDir(): boolean;
  withPath(path: string): StorageAttributesInterface;
}
