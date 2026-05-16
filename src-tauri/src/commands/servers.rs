use std::sync::Mutex;
use tauri::State;
use crate::db::Database;
use crate::models::McpServerConfig;

#[tauri::command]
pub fn list_servers(_db: State<'_, Mutex<Database>>) -> Result<Vec<McpServerConfig>, String> { Ok(vec![]) }
#[tauri::command]
pub fn get_server(_id: String, _db: State<'_, Mutex<Database>>) -> Result<Option<McpServerConfig>, String> { Ok(None) }
#[tauri::command]
pub fn update_server(_server: McpServerConfig, _db: State<'_, Mutex<Database>>) -> Result<(), String> { Ok(()) }
