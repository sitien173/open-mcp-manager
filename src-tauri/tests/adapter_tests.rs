use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use open_mcp_manager::adapters::common_impl::{ClaudeCodeAdapter, CodexCliAdapter};
use open_mcp_manager::adapters::traits::ClientAdapter;
use open_mcp_manager::adapters::{build_server_map, parse_json_servers, parse_server_map};
use open_mcp_manager::models::{EnvValue, McpServerConfig, ServerSource, Transport};

fn server(name: &str) -> McpServerConfig {
    McpServerConfig {
        id: uuid::Uuid::new_v4(),
        name: name.to_string(),
        description: None,
        transport: Transport::Stdio,
        command: Some("npx".to_string()),
        args: vec!["my-mcp".to_string()],
        url: None,
        env: HashMap::new(),
        enabled: true,
        tags: vec![],
        source: ServerSource::Manual,
        version: None,
        installed_at: chrono::Utc::now(),
    }
}

#[test]
fn json_parsing_and_round_trips() {
    let claude = r#"{"mcpServers":{"my-server":{"command":"npx","args":["my-mcp"],"env":{"API_KEY":"sk-123"}}}}"#;
    let out = parse_json_servers(claude, "mcpServers").unwrap();
    assert_eq!(out.len(), 1);
    assert_eq!(out[0].name, "my-server");
    assert_eq!(out[0].command.as_deref(), Some("npx"));
    assert_eq!(out[0].args, vec!["my-mcp"]);
    assert!(matches!(out[0].env.get("API_KEY"), Some(EnvValue::PlainText(v)) if v == "sk-123"));

    let vscode = r#"{"servers":{"my-server":{"command":"node","args":["server.js"]}}}"#;
    let out = parse_json_servers(vscode, "servers").unwrap();
    assert_eq!(out.len(), 1);
    assert_eq!(out[0].command.as_deref(), Some("node"));

    let disabled = parse_json_servers(r#"{"mcpServers":{"s":{"command":"x","disabled":true}}}"#, "mcpServers").unwrap();
    assert!(!disabled[0].enabled);

    let sse = parse_json_servers(r#"{"mcpServers":{"s":{"url":"http://localhost:3000"}}}"#, "mcpServers").unwrap();
    assert!(matches!(sse[0].transport, Transport::Sse));

    let mut cfg = server("roundtrip");
    cfg.env.insert("TOKEN".to_string(), EnvValue::PlainText("abc".to_string()));
    let parsed = parse_server_map(build_server_map(&[cfg.clone()]));
    assert_eq!(parsed.len(), 1);
    assert_eq!(parsed[0].name, cfg.name);
    assert_eq!(parsed[0].command, cfg.command);
    assert_eq!(parsed[0].args, cfg.args);

    let empty = parse_json_servers("{}", "mcpServers").unwrap();
    assert!(empty.is_empty());

    let multi = parse_json_servers(r#"{"mcpServers":{"a":{"command":"x"},"b":{"command":"y"},"c":{"command":"z"}}}"#, "mcpServers").unwrap();
    assert_eq!(multi.len(), 3);
}

#[test]
fn adapter_file_round_trips() {
    let base = std::env::temp_dir().join(format!("mcp-linker-tests-{}", uuid::Uuid::new_v4()));
    fs::create_dir_all(&base).unwrap();

    let codex_path: PathBuf = base.join("codex.toml");
    let mut codex_server = server("codex-s");
    codex_server.command = Some("node".to_string());
    codex_server.args = vec!["server.js".to_string()];
    let codex = CodexCliAdapter;
    codex.write_servers(&codex_path, &[codex_server.clone()]).unwrap();
    let codex_back = codex.read_servers(&codex_path).unwrap();
    assert_eq!(codex_back.len(), 1);
    assert_eq!(codex_back[0].name, codex_server.name);
    assert_eq!(codex_back[0].command, codex_server.command);
    assert_eq!(codex_back[0].args, codex_server.args);

    let claude_path: PathBuf = base.join("claude.json");
    let mut claude_server = server("claude-s");
    claude_server.command = Some("npx".to_string());
    claude_server.args = vec!["pkg".to_string()];
    let claude = ClaudeCodeAdapter;
    claude.write_servers(&claude_path, &[claude_server]).unwrap();
    let wrapped = claude.read_servers(&claude_path).unwrap();
    assert_eq!(wrapped.len(), 1);
    assert_eq!(wrapped[0].command.as_deref(), Some("cmd"));
    assert_eq!(wrapped[0].args, vec!["/c", "npx", "pkg"]);

    let _ = fs::remove_dir_all(&base);
}
