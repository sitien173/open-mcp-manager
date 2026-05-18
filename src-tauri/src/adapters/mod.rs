pub mod traits;
pub mod common_impl;
pub mod claude_desktop;
pub mod claude_code;
pub mod cursor;
pub mod windsurf;
pub mod cline;
pub mod roo_code;
pub mod vscode_copilot;
pub mod copilot_cli;
pub mod codex_cli;
pub mod mcphub;
pub mod gemini_cli;
pub mod custom;
pub mod disabled_store;

use std::path::PathBuf;

use serde_json::{Map, Value};

use crate::models::{ClientInfo, ConfigFormat, ConfigScope, EnvValue, McpServerConfig, ServerSource, Transport};
use traits::ClientAdapter;

pub struct DetectedClient {
    pub info: ClientInfo,
    pub servers: Vec<McpServerConfig>,
}

pub struct ClientManager {
    adapters: Vec<Box<dyn ClientAdapter>>,
}

impl Default for ClientManager {
    fn default() -> Self {
        Self::new()
    }
}

impl ClientManager {
    pub fn new() -> Self {
        Self {
            adapters: vec![
                Box::new(codex_cli::CodexCliAdapter),
                Box::new(claude_code::ClaudeCodeAdapter),
                Box::new(gemini_cli::GeminiCliAdapter),
                Box::new(claude_desktop::ClaudeDesktopAdapter),
                Box::new(cursor::CursorAdapter),
                Box::new(windsurf::WindsurfAdapter),
                Box::new(cline::ClineAdapter),
                Box::new(roo_code::RooCodeAdapter),
                Box::new(vscode_copilot::VsCodeCopilotAdapter),
                Box::new(copilot_cli::CopilotCliAdapter),
                Box::new(mcphub::McpHubAdapter),
                Box::new(custom::CustomAdapter::default()),
            ],
        }
    }

    pub fn detect_all(&self) -> Vec<DetectedClient> {
        let mut out = Vec::new();
        for adapter in &self.adapters {
            if let Some(info) = adapter.detect() {
                let mut servers = info
                    .active_path
                    .as_ref()
                    .map(PathBuf::from)
                    .and_then(|p| adapter.read_servers(&p).ok())
                    .unwrap_or_default();
                if !adapter.supports_disabled_field() {
                    let mut disabled = disabled_store::get_disabled(&info.id);
                    for s in &mut disabled {
                        s.enabled = false;
                    }
                    servers.extend(disabled);
                }
                out.push(DetectedClient { info, servers });
            }
        }
        out
    }

    pub fn install_server_to_clients(
        &self,
        server: &McpServerConfig,
        client_ids: &[String],
    ) -> Result<(), String> {
        for adapter in &self.adapters {
            if let Some(info) = adapter.detect() {
                if !client_ids.contains(&info.id) {
                    continue;
                }
                let path = info
                    .active_path
                    .ok_or_else(|| "client path missing".to_string())?;
                let p = PathBuf::from(path);
                let mut servers = adapter.read_servers(&p).map_err(|e| e.to_string())?;
                servers.retain(|s| s.name != server.name);
                servers.push(server.clone());
                adapter.write_servers(&p, &servers).map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }

    pub fn uninstall_server_from_clients(
        &self,
        server_name: &str,
        client_ids: &[String],
    ) -> Result<(), String> {
        for adapter in &self.adapters {
            if let Some(info) = adapter.detect() {
                if !client_ids.contains(&info.id) {
                    continue;
                }
                let path = info
                    .active_path
                    .ok_or_else(|| "client path missing".to_string())?;
                let p = PathBuf::from(path);
                let mut servers = adapter.read_servers(&p).map_err(|e| e.to_string())?;
                servers.retain(|s| s.name != server_name);
                adapter.write_servers(&p, &servers).map_err(|e| e.to_string())?;
                if !adapter.supports_disabled_field() {
                    let _ = disabled_store::remove_disabled(&info.id, server_name);
                }
            }
        }
        Ok(())
    }

    pub fn toggle_server_on_clients(
        &self,
        server_name: &str,
        enabled: bool,
        client_ids: &[String],
    ) -> Result<(), String> {
        for adapter in &self.adapters {
            if let Some(info) = adapter.detect() {
                if !client_ids.contains(&info.id) {
                    continue;
                }
                let path = info
                    .active_path
                    .ok_or_else(|| "client path missing".to_string())?;
                let p = PathBuf::from(path);
                let mut servers = adapter.read_servers(&p).map_err(|e| e.to_string())?;

                if adapter.supports_disabled_field() {
                    for s in &mut servers {
                        if s.name == server_name {
                            s.enabled = enabled;
                        }
                    }
                    adapter.write_servers(&p, &servers).map_err(|e| e.to_string())?;
                } else if enabled {
                    if let Some(mut restored) = disabled_store::remove_disabled(&info.id, server_name).map_err(|e| e.to_string())? {
                        restored.enabled = true;
                        servers.retain(|s| s.name != server_name);
                        servers.push(restored);
                        adapter.write_servers(&p, &servers).map_err(|e| e.to_string())?;
                    }
                } else {
                    if let Some(server) = servers.iter().find(|s| s.name == server_name).cloned() {
                        disabled_store::save_disabled(&info.id, &server).map_err(|e| e.to_string())?;
                        servers.retain(|s| s.name != server_name);
                        adapter.write_servers(&p, &servers).map_err(|e| e.to_string())?;
                    }
                }
            }
        }
        Ok(())
    }

    pub fn sync_servers_between_clients(
        &self,
        source_id: &str,
        target_ids: &[String],
        server_names: Option<&[String]>,
    ) -> Result<(), String> {
        let mut source_servers = None;
        for adapter in &self.adapters {
            if let Some(info) = adapter.detect() {
                if info.id == source_id {
                    if let Some(path) = info.active_path {
                        source_servers = Some(
                            adapter
                                .read_servers(&PathBuf::from(path))
                                .map_err(|e| e.to_string())?,
                        );
                        break;
                    }
                }
            }
        }
        let mut servers_to_sync = source_servers.ok_or_else(|| "source client not found".to_string())?;
        if let Some(names) = server_names {
            servers_to_sync.retain(|s| names.contains(&s.name));
        }
        for adapter in &self.adapters {
            if let Some(info) = adapter.detect() {
                if target_ids.contains(&info.id) {
                    if let Some(path) = info.active_path {
                        let p = PathBuf::from(path);
                        let mut existing = adapter.read_servers(&p).map_err(|e| e.to_string())?;
                        let sync_names: Vec<_> = servers_to_sync.iter().map(|s| s.name.clone()).collect();
                        existing.retain(|s| !sync_names.contains(&s.name));
                        existing.extend(servers_to_sync.clone());
                        adapter
                            .write_servers(&p, &existing)
                            .map_err(|e| e.to_string())?;
                    }
                }
            }
        }
        Ok(())
    }
}

pub fn parse_json_servers(content: &str, root_key: &str) -> anyhow::Result<Vec<McpServerConfig>> {
    let root: Value = serde_json::from_str(content)?;
    let servers_obj = root.get(root_key).and_then(Value::as_object).cloned().unwrap_or_default();
    Ok(parse_server_map(servers_obj))
}

pub fn merge_json_servers(path: &std::path::Path, root_key: &str, server_map: Map<String, Value>) -> anyhow::Result<()> {
    let content = if path.exists() { std::fs::read_to_string(path)? } else { "{}".to_string() };
    let mut root: Value = serde_json::from_str(&content)?;
    let map = root.as_object_mut().ok_or_else(|| anyhow::anyhow!("config is not a JSON object"))?;
    map.insert(root_key.to_string(), Value::Object(server_map));
    if let Some(parent) = path.parent() { std::fs::create_dir_all(parent)?; }
    std::fs::write(path, serde_json::to_string_pretty(&root)?)?;
    Ok(())
}

pub fn parse_server_map(servers_obj: Map<String, Value>) -> Vec<McpServerConfig> {
    servers_obj.into_iter().map(|(name, raw)| {
        let command = raw.get("command").and_then(Value::as_str).map(ToString::to_string);
        let args = raw.get("args").and_then(Value::as_array).map(|a| a.iter().filter_map(Value::as_str).map(ToString::to_string).collect()).unwrap_or_default();
        let url = raw.get("url").and_then(Value::as_str).map(ToString::to_string);
        let transport = if url.is_some() { Transport::Sse } else { Transport::Stdio };
        let enabled = raw.get("disabled").and_then(Value::as_bool).map(|d| !d).unwrap_or(true);
        let mut env = std::collections::HashMap::new();
        if let Some(env_obj) = raw.get("env").and_then(Value::as_object) {
            for (k, v) in env_obj {
                if let Some(s) = v.as_str() {
                    env.insert(k.clone(), EnvValue::PlainText(s.to_string()));
                }
            }
        }
        McpServerConfig {
            id: uuid::Uuid::new_v4(), name, description: None, transport, command, args, url, env,
            enabled, tags: vec![], source: ServerSource::Manual, version: None, installed_at: chrono::Utc::now(),
        }
    }).collect()
}

pub fn build_server_map(servers: &[McpServerConfig]) -> Map<String, Value> {
    let mut out = Map::new();
    for s in servers {
        let mut obj = Map::new();
        if let Some(cmd) = &s.command { obj.insert("command".into(), Value::String(cmd.clone())); }
        if !s.args.is_empty() { obj.insert("args".into(), Value::Array(s.args.iter().cloned().map(Value::String).collect())); }
        if let Some(url) = &s.url { obj.insert("url".into(), Value::String(url.clone())); }
        let mut env = Map::new();
        for (k,v) in &s.env {
            let val = match v { EnvValue::PlainText(x) => x.clone(), EnvValue::VaultRef(r) => format!("${{{}}}", r) };
            env.insert(k.clone(), Value::String(val));
        }
        if !env.is_empty() { obj.insert("env".into(), Value::Object(env)); }
        if !s.enabled { obj.insert("disabled".into(), Value::Bool(true)); }
        out.insert(s.name.clone(), Value::Object(obj));
    }
    out
}

pub fn default_scope(path: String, format: ConfigFormat, root_key: &str) -> ConfigScope {
    ConfigScope { label: "global".into(), path, format, root_key: root_key.into() }
}
