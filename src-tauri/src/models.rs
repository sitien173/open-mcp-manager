use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum Transport {
    Stdio,
    Sse,
    StreamableHttp,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "value")]
pub enum EnvValue {
    PlainText(String),
    VaultRef(String),
}

#[derive(Serialize, Deserialize, Clone)]
pub enum ServerSource {
    Registry,
    Manual,
    Dxt,
    Import,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct McpServerConfig {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub transport: Transport,
    pub command: Option<String>,
    pub args: Vec<String>,
    pub url: Option<String>,
    pub env: HashMap<String, EnvValue>,
    pub enabled: bool,
    pub tags: Vec<String>,
    pub source: ServerSource,
    pub version: Option<String>,
    pub installed_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Clone)]
pub enum ConfigFormat {
    Json,
    Toml,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ConfigScope {
    pub label: String,
    pub path: String,
    pub format: ConfigFormat,
    pub root_key: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ClientInfo {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub detected: bool,
    pub config_paths: Vec<ConfigScope>,
    pub active_path: Option<String>,
    pub servers: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct EnvRequirement {
    pub key: String,
    pub description: Option<String>,
    pub required: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct InstallManifest {
    pub command: String,
    pub args: Vec<String>,
    pub required_env: Vec<EnvRequirement>,
    pub optional_env: Vec<EnvRequirement>,
    pub prerequisites: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct RegistryEntry {
    pub source: String,
    pub source_id: String,
    pub name: String,
    pub description: String,
    pub author: Option<String>,
    pub icon: Option<String>,
    pub category: String,
    pub transport: Transport,
    pub install: InstallManifest,
    pub categories: Vec<String>,
    pub homepage: Option<String>,
    pub repo_url: Option<String>,
    pub downloads: u64,
    pub is_dxt: bool,
    pub version: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProfileExport {
    pub version: String,
    pub exported_at: DateTime<Utc>,
    pub app_version: String,
    pub servers: Vec<McpServerConfig>,
    pub metadata: serde_json::Value,
}
