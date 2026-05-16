# Phase 10: Tests + Build Configuration

## Overview
Write Rust unit tests for adapters, vault, registry, and profiles. Configure production build.

## Files to Create
1. `src-tauri/tests/adapter_tests.rs`
2. `src-tauri/tests/vault_tests.rs`
3. `src-tauri/tests/registry_tests.rs`
4. `src-tauri/tests/profile_tests.rs`

## Files to Modify
5. `src-tauri/tauri.conf.json` — add bundle/installer config
6. `package.json` — add `tauri:build` script

## Task 1: Adapter Tests (`src-tauri/tests/adapter_tests.rs`)

Test the JSON and TOML parsing/serializing round-trips. These tests do NOT need actual files on disk — test the pure functions `parse_json_servers`, `write_json_servers`, `parse_server_map`, `build_server_map` from `open_mcp_manager::adapters`.

Also test `CodexCliAdapter::read_servers` and `write_servers` using temp files (via `tempfile` crate or `std::env::temp_dir()`).

### Key functions to test (in `src-tauri/src/adapters/mod.rs`):
- `parse_json_servers(content: &str, root_key: &str) -> Result<Vec<McpServerConfig>>`
- `write_json_servers(root_key: &str, servers: &[McpServerConfig]) -> Result<String>`
- `parse_server_map(servers_obj: Map<String, Value>) -> Vec<McpServerConfig>`
- `build_server_map(servers: &[McpServerConfig]) -> Map<String, Value>`

### Test cases:
1. Parse Claude Desktop style JSON: `{"mcpServers":{"my-server":{"command":"npx","args":["my-mcp"],"env":{"API_KEY":"sk-123"}}}}` → verify name, command, args, env
2. Parse VS Code Copilot style JSON: `{"servers":{"my-server":{"command":"node","args":["server.js"]}}}` → verify root_key="servers" works
3. Parse JSON with disabled server: `{"mcpServers":{"s":{"command":"x","disabled":true}}}` → verify enabled=false
4. Parse JSON with URL (SSE transport): `{"mcpServers":{"s":{"url":"http://localhost:3000"}}}` → verify transport=Sse
5. Round-trip: create McpServerConfig → build_server_map → parse_server_map → verify fields match
6. TOML round-trip for Codex CLI: write servers to temp file via CodexCliAdapter, read back, verify
7. ClaudeCodeAdapter cmd wrapper: write a server with command="npx" to temp file, read back, verify command becomes "cmd" with args=["/c","npx",...]
8. Empty config: parse `{}` → verify empty vec
9. Multiple servers: parse JSON with 3 servers → verify count=3

### Important:
- The crate name is `open-mcp-manager` which becomes `open_mcp_manager` in Rust
- Use `use open_mcp_manager::adapters::{parse_json_servers, write_json_servers, parse_server_map, build_server_map};`
- Use `use open_mcp_manager::models::*;`
- Use `use open_mcp_manager::adapters::common_impl::{ClaudeCodeAdapter, CodexCliAdapter};`
- Use `use open_mcp_manager::adapters::traits::ClientAdapter;`
- For temp file tests, use `std::env::temp_dir()` and unique file names

## Task 2: Vault Tests (`src-tauri/tests/vault_tests.rs`)

Test DPAPI encrypt/decrypt round-trip. These use real Windows DPAPI (no mocking needed — tests run on Windows).

### Functions (in `src-tauri/src/vault.rs`):
- `pub fn encrypt(data: &[u8]) -> Result<Vec<u8>, String>`
- `pub fn decrypt(data: &[u8]) -> Result<Vec<u8>, String>`

### Test cases:
1. Round-trip: encrypt "hello world" → decrypt → verify matches
2. Round-trip various lengths: empty string, 1 byte, 1KB, 10KB
3. Verify encrypted data differs from plaintext (not identity)
4. Verify encrypting same data twice produces different ciphertext (DPAPI adds entropy)
5. Verify decrypt of garbage data returns Err

### Important:
- `use open_mcp_manager::vault::{encrypt, decrypt};`
- These are real DPAPI calls, will work on Windows CI

## Task 3: Registry Tests (`src-tauri/tests/registry_tests.rs`)

The registry module is mostly stubs (`search_blocking` returns empty vec). Write minimal tests verifying the stubs return expected values without panicking.

### Test cases:
1. `RegistryManager::new()` doesn't panic
2. `search_blocking("")` returns Ok(empty vec)
3. `get_details_blocking("nonexistent")` returns Err

### Important:
- `use open_mcp_manager::registry::RegistryManager;`

## Task 4: Profile Tests (`src-tauri/tests/profile_tests.rs`)

Profile commands are stubs. Test that `ProfileExport` model serializes/deserializes correctly.

### Test cases:
1. Serialize ProfileExport to JSON → deserialize back → verify fields match
2. Verify servers list preserved in round-trip
3. Verify metadata (serde_json::Value) preserved
4. Verify env values with VaultRef become placeholder strings in build_server_map

### Important:
- `use open_mcp_manager::models::{ProfileExport, McpServerConfig, Transport, ServerSource, EnvValue};`
- `use open_mcp_manager::adapters::build_server_map;`

## Task 5: Production Build Config

### tauri.conf.json additions:
Add `bundle` section for Windows installers:
```json
{
  "bundle": {
    "active": true,
    "targets": ["msi", "nsis"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.ico"
    ],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  }
}
```

### package.json:
Add script: `"tauri:build": "tauri build"`

### Icons:
Create placeholder icon files if they don't exist. At minimum create `src-tauri/icons/icon.ico` as a minimal valid .ico file (can be a 1x1 pixel placeholder).

## Important Notes
- The lib target may not be configured. Check if `src-tauri/src/lib.rs` exists. If not, you need to create it to re-export modules for integration tests. The tests/ directory needs the crate as a library dependency.
- If lib.rs doesn't exist, create one that re-exports: `pub mod models; pub mod adapters; pub mod vault; pub mod registry; pub mod db; pub mod cloud;`
- Also ensure Cargo.toml has `[lib]` section if needed.
- Do NOT add `tempfile` as a dependency — use `std::env::temp_dir()` with unique names.
- Run `cd src-tauri && cargo test` to verify all tests pass.
- Run `npm run build` to verify frontend still builds.
