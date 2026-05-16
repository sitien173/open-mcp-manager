use std::fs;
use std::path::{Path, PathBuf};

use anyhow::Result;

use crate::adapters::{default_scope, parse_json_servers, write_json_servers};
use crate::adapters::traits::ClientAdapter;
use crate::models::{ClientInfo, ConfigFormat, ConfigScope, McpServerConfig};

fn expand(path: &str) -> String {
    let home = std::env::var("USERPROFILE").unwrap_or_default();
    let appdata = std::env::var("APPDATA").unwrap_or_default();
    path.replace("~", &home)
        .replace("%APPDATA%", &appdata)
        .replace("%USERPROFILE%", &home)
}

macro_rules! json_adapter {
    ($name:ident, $client_id:expr, $title:expr, $icon:expr, $path:expr, $root:expr, $wrap:expr) => {
        pub struct $name;
        impl ClientAdapter for $name {
            fn client_name(&self) -> &str { $title }
            fn detect(&self) -> Option<ClientInfo> {
                let p = expand($path);
                if !Path::new(&p).exists() { return None; }
                Some(ClientInfo { id: $client_id.into(), name: $title.into(), icon: $icon.into(), detected: true, config_paths: self.config_paths(), active_path: Some(p), servers: vec![] })
            }
            fn config_paths(&self) -> Vec<ConfigScope> { vec![default_scope(expand($path), ConfigFormat::Json, $root)] }
            fn read_servers(&self, path: &Path) -> Result<Vec<McpServerConfig>> {
                if !path.exists() { return Ok(vec![]); }
                let content = fs::read_to_string(path)?;
                parse_json_servers(&content, $root)
            }
            fn write_servers(&self, path: &Path, servers: &[McpServerConfig]) -> Result<()> {
                let content = write_json_servers($root, servers)?;
                if let Some(parent) = path.parent() { fs::create_dir_all(parent)?; }
                fs::write(path, content)?;
                Ok(())
            }
            fn config_format(&self) -> ConfigFormat { ConfigFormat::Json }
            fn root_key(&self) -> &str { $root }
            fn needs_cmd_wrapper(&self) -> bool { $wrap }
        }
    };
}

json_adapter!(ClaudeDesktopAdapter, "claude_desktop", "Claude Desktop", "message-square", "%APPDATA%/Claude/claude_desktop_config.json", "mcpServers", false);
json_adapter!(CursorAdapter, "cursor", "Cursor", "mouse-pointer-2", "~/.cursor/mcp.json", "mcpServers", false);
json_adapter!(WindsurfAdapter, "windsurf", "Windsurf", "wind", "~/.codeium/windsurf/mcp_config.json", "mcpServers", false);
json_adapter!(ClineAdapter, "cline", "Cline", "square-terminal", "%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json", "mcpServers", false);
json_adapter!(RooCodeAdapter, "roo_code", "Roo Code", "code", "%APPDATA%/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json", "mcpServers", false);
json_adapter!(VsCodeCopilotAdapter, "vscode_copilot", "VS Code / Copilot", "sparkles", "%APPDATA%/Code/User/mcp.json", "servers", false);
json_adapter!(CopilotCliAdapter, "copilot_cli", "GitHub Copilot CLI", "terminal", "~/.copilot/mcp-config.json", "mcpServers", false);
json_adapter!(McpHubAdapter, "mcphub", "MCPHub", "plug", "~/.config/mcphub/servers.json", "mcpServers", false);

pub struct ClaudeCodeAdapter;
impl ClientAdapter for ClaudeCodeAdapter {
    fn client_name(&self) -> &str { "Claude Code" }
    fn detect(&self) -> Option<ClientInfo> {
        let p = expand("~/.claude/settings.json");
        if !Path::new(&p).exists() { return None; }
        Some(ClientInfo { id: "claude_code".into(), name: "Claude Code".into(), icon: "terminal".into(), detected: true, config_paths: self.config_paths(), active_path: Some(p), servers: vec![] })
    }
    fn config_paths(&self) -> Vec<ConfigScope> { vec![default_scope(expand("~/.claude/settings.json"), ConfigFormat::Json, "mcpServers")] }
    fn read_servers(&self, path: &Path) -> Result<Vec<McpServerConfig>> { if !path.exists(){return Ok(vec![])}; parse_json_servers(&fs::read_to_string(path)?, "mcpServers") }
    fn write_servers(&self, path: &Path, servers: &[McpServerConfig]) -> Result<()> {
        let mut adjusted = servers.to_vec();
        for s in &mut adjusted {
            if matches!(s.transport, crate::models::Transport::Stdio) {
                if let Some(cmd) = &s.command {
                    if cmd != "cmd" {
                        let original = cmd.clone();
                        s.command = Some("cmd".to_string());
                        let mut new_args = vec!["/c".to_string(), original];
                        new_args.extend(s.args.clone());
                        s.args = new_args;
                    }
                }
            }
        }
        let content = write_json_servers("mcpServers", &adjusted)?;
        if let Some(parent) = path.parent() { fs::create_dir_all(parent)?; }
        fs::write(path, content)?;
        Ok(())
    }
    fn config_format(&self) -> ConfigFormat { ConfigFormat::Json }
    fn root_key(&self) -> &str { "mcpServers" }
    fn needs_cmd_wrapper(&self) -> bool { true }
}

pub struct CodexCliAdapter;
impl ClientAdapter for CodexCliAdapter {
    fn client_name(&self) -> &str { "Codex CLI" }
    fn detect(&self) -> Option<ClientInfo> {
        let p = expand("~/.codex/config.toml");
        if !Path::new(&p).exists() { return None; }
        Some(ClientInfo { id: "codex_cli".into(), name: "Codex CLI".into(), icon: "square-chevron-right".into(), detected: true, config_paths: self.config_paths(), active_path: Some(p), servers: vec![] })
    }
    fn config_paths(&self) -> Vec<ConfigScope> { vec![default_scope(expand("~/.codex/config.toml"), ConfigFormat::Toml, "mcp_servers")] }
    fn read_servers(&self, path: &Path) -> Result<Vec<McpServerConfig>> {
        if !path.exists() { return Ok(vec![]); }
        let content = fs::read_to_string(path)?;
        let value: toml::Value = toml::from_str(&content)?;
        let mut out = Vec::new();
        if let Some(table) = value.get("mcp_servers").and_then(toml::Value::as_table) {
            for (name, entry) in table {
                let cmd = entry.get("command").and_then(toml::Value::as_str).map(ToString::to_string);
                let args = entry.get("args").and_then(toml::Value::as_array).map(|a| a.iter().filter_map(toml::Value::as_str).map(ToString::to_string).collect()).unwrap_or_default();
                out.push(crate::models::McpServerConfig { id: uuid::Uuid::new_v4(), name: name.clone(), description: None, transport: crate::models::Transport::Stdio, command: cmd, args, url: None, env: std::collections::HashMap::new(), enabled: true, tags: vec![], source: crate::models::ServerSource::Manual, version: None, installed_at: chrono::Utc::now() });
            }
        }
        Ok(out)
    }
    fn write_servers(&self, path: &Path, servers: &[McpServerConfig]) -> Result<()> {
        let mut root = toml::value::Table::new();
        let mut mcp = toml::value::Table::new();
        for s in servers {
            let mut t = toml::value::Table::new();
            if let Some(cmd) = &s.command { t.insert("command".into(), toml::Value::String(cmd.clone())); }
            if !s.args.is_empty() { t.insert("args".into(), toml::Value::Array(s.args.iter().cloned().map(toml::Value::String).collect())); }
            if !s.env.is_empty() {
                let mut env_table = toml::value::Table::new();
                for (k, v) in &s.env {
                    let val = match v {
                        crate::models::EnvValue::PlainText(x) => x.clone(),
                        crate::models::EnvValue::VaultRef(r) => format!("${{{}}}", r),
                    };
                    env_table.insert(k.clone(), toml::Value::String(val));
                }
                t.insert("env".into(), toml::Value::Table(env_table));
            }
            mcp.insert(s.name.clone(), toml::Value::Table(t));
        }
        root.insert("mcp_servers".into(), toml::Value::Table(mcp));
        if let Some(parent) = path.parent() { fs::create_dir_all(parent)?; }
        fs::write(path, toml::to_string_pretty(&toml::Value::Table(root))?)?;
        Ok(())
    }
    fn config_format(&self) -> ConfigFormat { ConfigFormat::Toml }
    fn root_key(&self) -> &str { "mcp_servers" }
    fn needs_cmd_wrapper(&self) -> bool { false }
}

#[derive(Default)]
pub struct CustomAdapter { pub path: Option<PathBuf>, pub root_key_name: Option<String> }
impl ClientAdapter for CustomAdapter {
    fn client_name(&self) -> &str { "Custom" }
    fn detect(&self) -> Option<ClientInfo> { None }
    fn config_paths(&self) -> Vec<ConfigScope> { vec![] }
    fn read_servers(&self, path: &Path) -> Result<Vec<McpServerConfig>> { if !path.exists(){return Ok(vec![])}; parse_json_servers(&fs::read_to_string(path)?, self.root_key()) }
    fn write_servers(&self, path: &Path, servers: &[McpServerConfig]) -> Result<()> { fs::write(path, write_json_servers(self.root_key(), servers)?)?; Ok(()) }
    fn config_format(&self) -> ConfigFormat { ConfigFormat::Json }
    fn root_key(&self) -> &str { self.root_key_name.as_deref().unwrap_or("mcpServers") }
    fn needs_cmd_wrapper(&self) -> bool { false }
}
