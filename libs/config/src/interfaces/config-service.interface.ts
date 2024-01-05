export interface ConfigServiceInterface {
  get<T = unknown>(propertyPath: string, defaultValue?: T): T | undefined;
}
