import * as p from 'path';

import { Visibility, StorageAttributesInterface, StorageAttributesTypesEnum } from '../interfaces';

export class FileAttributesHelper implements StorageAttributesInterface {
  private readonly type = StorageAttributesTypesEnum.TYPE_FILE;

  constructor (
    private readonly path: string,
    private readonly fileSize?: number,
    private readonly visibility?: Visibility,
    private readonly lastModified?: number,
    private readonly mimeType?: string,
    private readonly extraMetadata?: Record<string, unknown>,
  ) {}

  public getPath (): string {
    return this.path;
  }

  public getFileSize (): number | null {
    return this.fileSize || null;
  }

  public getVisibility (): Visibility | null {
    return this.visibility || null;
  }

  public getLastModified (): number | null {
    return this.lastModified || null;
  }

  public getExtraMetadata (): Record<string, unknown> {
    return this.extraMetadata || {};
  }

  public getExtension (): string {
    return p.extname(p.basename(this.path));
  }

  public getType (): string {
    return this.type;
  }

  public isDir (): boolean {
    return false;
  }

  public isFile (): boolean {
    return true;
  }

  public withPath (path: string): StorageAttributesInterface {
    const clone = Object.create(this);
    clone.path = path;

    return clone;
  }

}
