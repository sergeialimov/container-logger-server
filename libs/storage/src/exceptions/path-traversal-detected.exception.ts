export class PathTraversalDetectedException extends Error {
  private path: string;

  public static forPath (path: string): PathTraversalDetectedException {
    const e = new PathTraversalDetectedException(`Path traversal detected: ${path}`);
    e.path = path;

    return e;
  }

  public getPath (): string {
    return this.path;
  }
}
