use std::sync::Mutex;
use tauri::State;
use crate::adapters::ClientManager;

#[tauri::command]
pub fn sync_servers_between_clients(source_id: String, target_ids: Vec<String>, server_names: Option<Vec<String>>, client_manager: State<'_, Mutex<ClientManager>>) -> Result<(), String> {
    client_manager.lock().map_err(|_| "client manager lock failed".to_string())?.sync_servers_between_clients(&source_id, &target_ids, server_names.as_deref())
}
