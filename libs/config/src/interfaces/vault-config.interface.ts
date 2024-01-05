export interface VaultAuthConfigInterface {
  type: string;
  config: {
    roleId: string;
    secretId: string;
  };
}

export interface VaultConfigInterface {
  host: string;
  port: number;
  mountPoint: string;
  isEnabled: boolean;
  auth: VaultAuthConfigInterface;
}
