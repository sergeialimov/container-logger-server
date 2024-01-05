export class UnableToBuildGoogleDrivePathException extends Error {
  constructor (path: string, missingEntry?: string) {
    let message = `Unable to build file path for gDrive: "${path}"`;

    if (missingEntry) {
      message += `. Could not find entry: "${missingEntry}"`;
    }

    super(message);
  }
}
