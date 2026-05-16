use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::State;
use uuid::Uuid;

use crate::cloud::CloudManager;
use crate::db::Database;
use crate::models::ProfileExport;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudConfigureInput {
    pub id: Option<String>,
    pub provider_type: String,
    pub config: Value,
    pub secrets: Value,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudProviderRequest {
    pub provider_id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudPushInput {
    pub provider_id: String,
    pub profile: ProfileExport,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CloudProviderView {
    pub id: String,
    pub provider_type: String,
    pub config: Value,
}

fn load_provider(db: &Database, provider_id: &str) -> Result<(String, Value), String> {
    let providers = CloudManager::list_providers(db)?;
    let rec = providers
        .into_iter()
        .find(|p| p.id == provider_id)
        .ok_or_else(|| "provider not found".to_string())?;
    let mut cfg = rec.config;
    if let Some(obj) = cfg.as_object_mut() {
        let secret_key = format!("provider:{provider_id}");
        for key in ["secret_key", "password", "api_key", "token"] {
            if let Some(sec) = crate::vault::get(db, &secret_key, key)? {
                obj.insert(key.to_string(), Value::String(String::from_utf8_lossy(&sec).to_string()));
            }
        }
    }
    Ok((rec.provider_type, cfg))
}

#[tauri::command]
pub fn cloud_test_connection(input: CloudProviderRequest, db: State<'_, Mutex<Database>>) -> Result<bool, String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    let (provider_type, config) = load_provider(&guard, &input.provider_id)?;
    let manager = CloudManager::new()?;
    let provider = manager.build_provider(&provider_type, &config)?;
    provider.test_connection()
}

#[tauri::command]
pub fn cloud_push(input: CloudPushInput, db: State<'_, Mutex<Database>>) -> Result<(), String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    let (provider_type, config) = load_provider(&guard, &input.provider_id)?;
    let manager = CloudManager::new()?;
    let provider = manager.build_provider(&provider_type, &config)?;
    let sanitized = CloudManager::sanitize_profile(&input.profile);
    let bytes = serde_json::to_vec(&sanitized).map_err(|_| "failed to serialize profile".to_string())?;
    provider.push(&bytes)
}

#[tauri::command]
pub fn cloud_pull(input: CloudProviderRequest, db: State<'_, Mutex<Database>>) -> Result<String, String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    let (provider_type, config) = load_provider(&guard, &input.provider_id)?;
    let manager = CloudManager::new()?;
    let provider = manager.build_provider(&provider_type, &config)?;
    let bytes = provider.pull()?;
    String::from_utf8(bytes).map_err(|_| "cloud payload is not valid utf-8".to_string())
}

#[tauri::command]
pub fn cloud_configure_provider(input: CloudConfigureInput, db: State<'_, Mutex<Database>>) -> Result<String, String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    let id = input.id.unwrap_or_else(|| Uuid::new_v4().to_string());
    let secret_scope = format!("provider:{id}");

    for key in ["secret_key", "password", "api_key", "token"] {
        if let Some(v) = input.secrets.get(key).and_then(Value::as_str) {
            crate::vault::store(&guard, &secret_scope, key, v.as_bytes())?;
        }
    }

    let mut cfg = input.config;
    if let Some(obj) = cfg.as_object_mut() {
        for key in ["secret_key", "password", "api_key", "token"] {
            obj.remove(key);
        }
    }

    CloudManager::save_provider(&guard, &id, &input.provider_type, &cfg)?;
    Ok(id)
}

#[tauri::command]
pub fn cloud_list_providers(db: State<'_, Mutex<Database>>) -> Result<Vec<CloudProviderView>, String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    let providers = CloudManager::list_providers(&guard)?;
    Ok(providers
        .into_iter()
        .map(|p| CloudProviderView {
            id: p.id,
            provider_type: p.provider_type,
            config: p.config,
        })
        .collect())
}
