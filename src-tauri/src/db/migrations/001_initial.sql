CREATE TABLE IF NOT EXISTS servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  config_json TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL,
  version TEXT,
  installed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS installs (
  id TEXT PRIMARY KEY,
  server_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  config_path TEXT NOT NULL,
  installed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  detected INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  active_path TEXT,
  metadata_json TEXT
);

CREATE TABLE IF NOT EXISTS vault_entries (
  id TEXT PRIMARY KEY,
  server_id TEXT NOT NULL,
  env_key TEXT NOT NULL,
  encrypted_value BLOB NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  profile_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS registry_cache (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  query TEXT,
  payload_json TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_providers (
  id TEXT PRIMARY KEY,
  provider_type TEXT NOT NULL,
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
