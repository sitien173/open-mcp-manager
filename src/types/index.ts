export type ToastType = 'success' | 'info' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export type Transport = 'stdio' | 'sse' | 'streamableHttp';

export type EnvValue = 
  | { type: 'PlainText'; value: string }
  | { type: 'VaultRef'; value: string };

export type ServerSource = 'Registry' | 'Manual' | 'Dxt' | 'Import';

export interface McpServerConfig {
  id: string;
  name: string;
  description: string | null;
  transport: Transport;
  command: string | null;
  args: string[];
  url: string | null;
  env: Record<string, EnvValue>;
  enabled: boolean;
  tags: string[];
  source: ServerSource;
  version: string | null;
  installedAt: string;
}

export type ConfigFormat = 'Json' | 'Toml';

export interface ConfigScope {
  label: string;
  path: string;
  format: ConfigFormat;
  rootKey: string;
}

export interface ClientInfo {
  id: string;
  name: string;
  icon: string;
  detected: boolean;
  configPaths: ConfigScope[];
  activePath: string | null;
  servers: string[];
}

export interface EnvRequirement {
  key: string;
  description: string | null;
  required: boolean;
}

export interface InstallManifest {
  command: string;
  args: string[];
  requiredEnv: EnvRequirement[];
  optionalEnv: EnvRequirement[];
  prerequisites: string[];
}

export interface RegistryEntry {
  source: string;
  sourceId: string;
  name: string;
  description: string;
  author: string | null;
  icon: string | null;
  category: string;
  transport: Transport;
  install: InstallManifest;
  categories: string[];
  homepage: string | null;
  repoUrl: string | null;
  downloads: number;
  isDxt: boolean;
  version: string | null;
}

export interface ProfileExport {
  version: string;
  exportedAt: string;
  appVersion: string;
  servers: McpServerConfig[];
  metadata: any;
}

export interface Category {
  id: string;
  label: string;
}

export interface CloudProviderView {
  id: string;
  providerType: string;
  config: Record<string, any>;
}

export interface ProfileInfo {
  id: string;
  name: string;
  serverCount: number;
  clientCount: number;
  createdAt: string;
  description: string;
}
