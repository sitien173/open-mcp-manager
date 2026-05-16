#[tauri::command]
pub fn export_profile(_name: String) -> Result<String, String> { Ok("{}".to_string()) }
#[tauri::command]
pub fn import_profile(_json: String) -> Result<(), String> { Ok(()) }
#[tauri::command]
pub fn list_profiles() -> Result<Vec<String>, String> { Ok(vec![]) }
#[tauri::command]
pub fn save_current_profile(_name: String) -> Result<(), String> { Ok(()) }
#[tauri::command]
pub fn delete_profile(_id: String) -> Result<(), String> { Ok(()) }
