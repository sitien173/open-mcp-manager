use std::path::Path;

use anyhow::Result;

use crate::models::{ClientInfo, ConfigFormat, ConfigScope, McpServerConfig};

pub trait ClientAdapter: Send + Sync {
    fn client_name(&self) -> &str;
    fn detect(&self) -> Option<ClientInfo>;
    fn config_paths(&self) -> Vec<ConfigScope>;
    fn read_servers(&self, path: &Path) -> Result<Vec<McpServerConfig>>;
    fn write_servers(&self, path: &Path, servers: &[McpServerConfig]) -> Result<()>;
    fn config_format(&self) -> ConfigFormat;
    fn root_key(&self) -> &str;
    fn needs_cmd_wrapper(&self) -> bool;
    fn supports_disabled_field(&self) -> bool { true }
}
