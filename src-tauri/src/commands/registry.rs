use std::sync::Mutex;
use tauri::State;
use crate::models::RegistryEntry;
use crate::registry::RegistryManager;

#[tauri::command]
pub fn search_registry(query: String, registry: State<'_, Mutex<RegistryManager>>) -> Result<Vec<RegistryEntry>, String> {
    registry.lock().map_err(|_| "registry lock failed".to_string())?.search_blocking(&query)
}

#[tauri::command]
pub fn get_server_details(id: String, registry: State<'_, Mutex<RegistryManager>>) -> Result<RegistryEntry, String> {
    registry.lock().map_err(|_| "registry lock failed".to_string())?.get_details_blocking(&id)
}
