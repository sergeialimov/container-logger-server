import { PathTraversalDetectedException } from '../exceptions';

export class PathNormalizerHelper {
  public normalizePath (path: string): string {
    return this.normalizeRelativePath(path.replace(/\\/g, '/'));
  }

  private normalizeRelativePath (path: string): string {
    const parts = [];

    for (const part of path.split('/')) {
      switch (part) {
        case '':
        case '.':
          break;
        case '..':
          if (parts.length === 0) {
            throw PathTraversalDetectedException.forPath(path);
          }
          parts.pop();
          break;
        default:
          parts.push(part);
          break;
      }
    }

    return parts.join('/');
  }
}
