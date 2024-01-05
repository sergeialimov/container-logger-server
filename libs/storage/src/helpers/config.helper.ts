export class ConfigHelper {
  public static OPTION_VISIBILITY = 'visibility';
  public static OPTION_DIRECTORY_VISIBILITY = 'directory_visibility';

  constructor (private readonly options: Record<string, unknown> = {}) {}

  public get<T>(property: string, defaultValue: T | null = null): T {
    const value = this.options[property];
    if (value === undefined || value === null) {
      return defaultValue as T;
    }
    return value as T;
  }

  public all (): Record<string, unknown> {
    return this.options;
  }

  public extend (options: Record<string, unknown>): ConfigHelper {
    return new ConfigHelper({
      ...this.options,
      ...options,
    });
  }

  public withDefaults (defaults: Record<string, unknown>): ConfigHelper {
    return new ConfigHelper({
      ...defaults,
      ...this.options,
    });
  }
}
