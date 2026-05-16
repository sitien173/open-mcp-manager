use std::sync::Mutex;
use tauri::State;
use crate::db::Database;

#[tauri::command]
pub fn vault_store(server_id: String, env_key: String, value: String, db: State<'_, Mutex<Database>>) -> Result<(), String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    crate::vault::store(&guard, &server_id, &env_key, value.as_bytes())
}
#[tauri::command]
pub fn vault_get(server_id: String, env_key: String, db: State<'_, Mutex<Database>>) -> Result<Option<String>, String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    Ok(crate::vault::get(&guard, &server_id, &env_key)?.map(|v| String::from_utf8_lossy(&v).to_string()))
}
#[tauri::command]
pub fn vault_delete(server_id: String, env_key: String, db: State<'_, Mutex<Database>>) -> Result<(), String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    crate::vault::delete(&guard, &server_id, &env_key)
}
#[tauri::command]
pub fn vault_list(server_id: String, db: State<'_, Mutex<Database>>) -> Result<Vec<String>, String> {
    let guard = db.lock().map_err(|_| "db lock failed".to_string())?;
    crate::vault::list_keys(&guard, &server_id)
}
