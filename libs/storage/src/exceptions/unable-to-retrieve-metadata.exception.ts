import { trimEnd } from 'lodash';

import { StorageAttributesEnum } from '../interfaces/storage-attributes.interface';

export class UnableToRetrieveMetadataException extends Error {
  private location = '';
  private reason = '';

  public static visibility (location: string, reason = ''): UnableToRetrieveMetadataException {
    return UnableToRetrieveMetadataException.create(
      location,
      StorageAttributesEnum.ATTRIBUTE_VISIBILITY,
      reason,
    );
  }

  public static mimeType (location: string, reason = ''): UnableToRetrieveMetadataException {
    return UnableToRetrieveMetadataException.create(
      location,
      StorageAttributesEnum.ATTRIBUTE_MIME_TYPE,
      reason,
    );
  }

  public static lastModified (location: string, reason = ''): UnableToRetrieveMetadataException {
    return UnableToRetrieveMetadataException.create(
      location,
      StorageAttributesEnum.ATTRIBUTE_LAST_MODIFIED,
      reason,
    );
  }

  public static fileSize (location: string, reason = ''): UnableToRetrieveMetadataException {
    return UnableToRetrieveMetadataException.create(
      location,
      StorageAttributesEnum.ATTRIBUTE_FILE_SIZE,
      reason,
    );
  }

  public static create (
    location: string,
    type: string,
    reason = '',
  ): UnableToRetrieveMetadataException {
    const e = new UnableToRetrieveMetadataException(
      trimEnd(`Unable to retrieve the ${type} for file located at: ${location}, ${reason}`),
    );
    e.location = location;
    e.reason = reason;

    return e;
  }
}
