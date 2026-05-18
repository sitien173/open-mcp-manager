use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use anyhow::Result;

use crate::models::McpServerConfig;

type StoreMap = HashMap<String, HashMap<String, McpServerConfig>>;

fn store_path() -> PathBuf {
    let appdata = std::env::var("APPDATA").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(appdata).join("open-mcp-manager").join("disabled_servers.json")
}

fn read_store() -> StoreMap {
    let path = store_path();
    if !path.exists() {
        return HashMap::new();
    }
    fs::read_to_string(&path)
        .ok()
        .and_then(|c| serde_json::from_str(&c).ok())
        .unwrap_or_default()
}

fn write_store(store: &StoreMap) -> Result<()> {
    let path = store_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(path, serde_json::to_string_pretty(store)?)?;
    Ok(())
}

pub fn save_disabled(client_id: &str, server: &McpServerConfig) -> Result<()> {
    let mut store = read_store();
    let entry = store.entry(client_id.to_string()).or_default();
    entry.insert(server.name.clone(), server.clone());
    write_store(&store)
}

pub fn remove_disabled(client_id: &str, server_name: &str) -> Result<Option<McpServerConfig>> {
    let mut store = read_store();
    let removed = store.get_mut(client_id).and_then(|m| m.remove(server_name));
    if let Some(client_map) = store.get(client_id) {
        if client_map.is_empty() {
            store.remove(client_id);
        }
    }
    write_store(&store)?;
    Ok(removed)
}

pub fn get_disabled(client_id: &str) -> Vec<McpServerConfig> {
    let store = read_store();
    store
        .get(client_id)
        .map(|m| m.values().cloned().collect())
        .unwrap_or_default()
}
