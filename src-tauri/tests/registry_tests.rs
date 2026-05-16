use open_mcp_manager::registry::RegistryManager;

#[test]
fn registry_new_does_not_panic() {
    let _ = RegistryManager::new();
}

#[test]
fn registry_search_empty_returns_empty_vec() {
    let mgr = RegistryManager::new();
    let out = mgr.search_blocking("").unwrap();
    assert!(out.is_empty());
}

#[test]
fn registry_get_details_nonexistent_errors() {
    let mgr = RegistryManager::new();
    assert!(mgr.get_details_blocking("nonexistent").is_err());
}
