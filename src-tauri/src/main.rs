use std::sync::Mutex;

use open_mcp_manager::adapters::ClientManager;
use open_mcp_manager::commands;
use open_mcp_manager::db::Database;
use open_mcp_manager::registry::RegistryManager;

#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(ClientManager::new()))
        .manage(Mutex::new(Database::new().expect("db init failed")))
        .manage(Mutex::new(RegistryManager::new()))
        .invoke_handler(tauri::generate_handler![
            commands::clients::detect_clients,
            commands::clients::get_client_servers,
            commands::clients::install_server_to_clients,
            commands::clients::uninstall_server,
            commands::clients::toggle_server,
            commands::servers::list_servers,
            commands::servers::get_server,
            commands::servers::update_server,
            commands::registry::search_registry,
            commands::registry::get_server_details,
            commands::vault::vault_store,
            commands::vault::vault_get,
            commands::vault::vault_delete,
            commands::vault::vault_list,
            commands::sync::sync_servers_between_clients,
            commands::profiles::export_profile,
            commands::profiles::import_profile,
            commands::profiles::list_profiles,
            commands::profiles::save_current_profile,
            commands::profiles::delete_profile,
            commands::cloud::cloud_test_connection,
            commands::cloud::cloud_push,
            commands::cloud::cloud_pull,
            commands::cloud::cloud_configure_provider,
            commands::cloud::cloud_list_providers,
            commands::dxt::install_dxt
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
