use std::sync::Mutex;
use tauri::State;
use crate::adapters::ClientManager;
use crate::models::{ClientInfo, McpServerConfig};

#[tauri::command]
pub fn detect_clients(client_manager: State<'_, Mutex<ClientManager>>) -> Result<Vec<ClientInfo>, String> {
    Ok(client_manager.lock().map_err(|_| "client manager lock failed".to_string())?.detect_all().into_iter().map(|d| d.info).collect())
}

#[tauri::command]
pub fn get_client_servers(client_id: String, client_manager: State<'_, Mutex<ClientManager>>) -> Result<Vec<McpServerConfig>, String> {
    let clients = client_manager.lock().map_err(|_| "client manager lock failed".to_string())?.detect_all();
    clients.into_iter().find(|c| c.info.id == client_id).map(|c| c.servers).ok_or_else(|| "client not found".to_string())
}

#[tauri::command]
pub fn install_server_to_clients(server: McpServerConfig, client_ids: Vec<String>, client_manager: State<'_, Mutex<ClientManager>>) -> Result<(), String> {
    client_manager.lock().map_err(|_| "client manager lock failed".to_string())?.install_server_to_clients(&server, &client_ids)
}

#[tauri::command]
pub fn uninstall_server(server_name: String, client_ids: Vec<String>, client_manager: State<'_, Mutex<ClientManager>>) -> Result<(), String> {
    client_manager.lock().map_err(|_| "client manager lock failed".to_string())?.uninstall_server_from_clients(&server_name, &client_ids)
}

#[tauri::command]
pub fn toggle_server(server_name: String, enabled: bool, client_ids: Vec<String>, client_manager: State<'_, Mutex<ClientManager>>) -> Result<(), String> {
    client_manager.lock().map_err(|_| "client manager lock failed".to_string())?.toggle_server_on_clients(&server_name, enabled, &client_ids)
}
