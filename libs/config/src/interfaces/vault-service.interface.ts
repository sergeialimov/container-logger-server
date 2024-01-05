export interface VaultServiceInterface {
  isEnabled(): boolean;

  has(propertyPath: string): boolean;

  get<T = unknown>(propertyPath: string, defaultValue?: T): T | undefined;
}
