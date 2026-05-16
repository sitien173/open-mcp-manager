use std::collections::HashMap;

use open_mcp_manager::adapters::build_server_map;
use open_mcp_manager::models::{EnvValue, McpServerConfig, ProfileExport, ServerSource, Transport};

#[test]
fn profile_export_json_round_trip_preserves_fields() {
    let mut env = HashMap::new();
    env.insert("API_KEY".to_string(), EnvValue::PlainText("sk-1".to_string()));

    let server = McpServerConfig {
        id: uuid::Uuid::new_v4(),
        name: "svc".to_string(),
        description: Some("desc".to_string()),
        transport: Transport::Stdio,
        command: Some("node".to_string()),
        args: vec!["server.js".to_string()],
        url: None,
        env,
        enabled: true,
        tags: vec!["tools".to_string()],
        source: ServerSource::Import,
        version: Some("1.0.0".to_string()),
        installed_at: chrono::Utc::now(),
    };

    let profile = ProfileExport {
        version: "1".to_string(),
        exported_at: chrono::Utc::now(),
        app_version: "0.1.0".to_string(),
        servers: vec![server.clone()],
        metadata: serde_json::json!({"k":"v","n":1}),
    };

    let json = serde_json::to_string(&profile).unwrap();
    let back: ProfileExport = serde_json::from_str(&json).unwrap();

    assert_eq!(back.version, profile.version);
    assert_eq!(back.app_version, profile.app_version);
    assert_eq!(back.servers.len(), 1);
    assert_eq!(back.servers[0].name, server.name);
    assert_eq!(back.metadata, profile.metadata);
}

#[test]
fn build_server_map_vault_ref_is_placeholder() {
    let mut env = HashMap::new();
    env.insert("SECRET".to_string(), EnvValue::VaultRef("vault://secret".to_string()));

    let server = McpServerConfig {
        id: uuid::Uuid::new_v4(),
        name: "svc".to_string(),
        description: None,
        transport: Transport::Stdio,
        command: Some("node".to_string()),
        args: vec![],
        url: None,
        env,
        enabled: true,
        tags: vec![],
        source: ServerSource::Manual,
        version: None,
        installed_at: chrono::Utc::now(),
    };

    let map = build_server_map(&[server]);
    let env_val = map
        .get("svc").and_then(|v| v.get("env")).and_then(|v| v.get("SECRET")).and_then(|v| v.as_str())
        .unwrap();
    assert_eq!(env_val, "${vault://secret}");
}
