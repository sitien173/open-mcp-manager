# Open MCP Manager — Implementation Plan

**Design:** `docs/plans/2026-05-16-open-mcp-manager-design.md`
**Prototype:** `docs/design/` (Claude Design handoff)
**Stack:** Tauri v2 + React 18 + TypeScript + Vite
**Platform:** Windows 10/11 only

---

## Phase 1: Project Scaffold + Tauri Shell

**Owner:** `codex`

**Goal:** Bootable Tauri v2 app with React/TS frontend, Vite dev server, and empty window that renders.

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/build.rs`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `index.html`
- Create: `.gitignore`

**Tasks:**
1. Initialize Tauri v2 project with `create-tauri-app` scaffolding (React + TS + Vite template). Configure `tauri.conf.json` for Windows-only: app name "Open MCP Manager", identifier `com.open-mcp.manager`, window title, 1200x800 default size, dark theme.
2. Add Rust dependencies to `Cargo.toml`: `tauri` v2, `serde`, `serde_json`, `rusqlite` (with `bundled` feature), `uuid`, `chrono`, `toml`, `reqwest` (with `rustls-tls`), `zip`, `windows` crate for DPAPI.
3. Add frontend dependencies to `package.json`: `react`, `react-dom`, `@tauri-apps/api` v2, `@tauri-apps/plugin-shell`, `lucide-react`, `zustand`. Dev deps: `typescript`, `@types/react`, `@types/react-dom`, `vite`, `@vitejs/plugin-react`.
4. Verify `cargo tauri dev` opens a window rendering "Open MCP Manager" from React.

**Acceptance Criteria:**
- `cargo tauri dev` launches a Tauri window with React content
- Vite HMR works in dev mode
- `cargo tauri build` produces a Windows `.exe` / `.msi`

**Reviewer Checklist:**
- Tauri v2 (not v1) APIs used throughout
- `tauri.conf.json` targets Windows only
- No placeholder monetization or tier code
- Rust `edition = "2021"` or newer

**Integration Checks:**
- `cd src-tauri && cargo check`
- `npm run build`
- `cargo tauri build`

---

## Phase 2: Design System + Layout Shell + Sidebar

**Owner:** `gemini`

**Goal:** Pixel-match the Linear-inspired dark theme, layout skeleton (sidebar + content), and sidebar navigation from the handoff prototype.

**Files:**
- Create: `src/styles/tokens.css` (design tokens from Section 12.1)
- Create: `src/styles/global.css` (reset, scrollbar, animations)
- Create: `src/styles/fonts.css` (SF Pro Display/Text @font-face, JetBrains Mono)
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Toggle.tsx`
- Create: `src/components/ui/Btn.tsx`
- Create: `src/components/ui/SearchInput.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/ui/ModalShell.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Copy: `docs/design/fonts/*` → `public/fonts/`

**Tasks:**
1. Create CSS token files matching Section 12.1 exactly: color tokens, spacing scale, border-radius scale, typography tokens, font-face declarations. Import JetBrains Mono from Google Fonts. Add global reset, scrollbar styles, and keyframe animations (slideIn, toastIn, spin, modalIn) from Section 12.6.
2. Build shared UI components pixel-matching the handoff: `Toggle`, `Badge`, `Btn` (4 variants), `SearchInput`, `EmptyState`, `Toast` + `ToastContainer`, `ModalShell`. All props typed in TypeScript. Match exact dimensions, colors, transitions from Section 12.5.
3. Build `Sidebar` component matching Section 12.2: 220px width, `#0a0b0f` bg, brand area with 28px icon + name + version, section labels (uppercase 10.5px), nav items with Lucide icons + counts + badges, active/hover states, footer with status dot. Wire `view` state and `onNavigate` callback.
4. Build `AppLayout` — flex container holding Sidebar + content slot. Wire view routing in `App.tsx` with placeholder content per view. Verify all 6 navigation targets render.

**Acceptance Criteria:**
- App renders dark theme matching the handoff prototype visually
- Sidebar navigates between 6 views
- All shared components render correctly with proper hover/active states
- Fonts load (SF Pro Display, SF Pro Text, JetBrains Mono)

**Reviewer Checklist:**
- Color tokens match Section 12.1 hex values exactly
- Sidebar width is 220px, bg is `#0a0b0f`
- Typography uses correct font families per token (display vs text vs mono)
- Animations match Section 12.6 durations and easing
- No hardcoded colors — all via CSS custom properties
- Lucide icons via `lucide-react` (not raw SVG or CDN)

**Integration Checks:**
- `npm run build` (no TS errors)
- `cargo tauri dev` (visual verification)

---

## Phase 3: Rust Core — Data Models + SQLite + Client Adapters

**Owner:** `codex`

**Goal:** Rust backend with data models, SQLite database, and all 11 client adapters that can detect installed clients and read/write their MCP configs.

**Files:**
- Create: `src-tauri/src/models.rs`
- Create: `src-tauri/src/db/mod.rs`
- Create: `src-tauri/src/db/schema.rs`
- Create: `src-tauri/src/db/migrations/001_initial.sql`
- Create: `src-tauri/src/adapters/mod.rs`
- Create: `src-tauri/src/adapters/traits.rs`
- Create: `src-tauri/src/adapters/claude_desktop.rs`
- Create: `src-tauri/src/adapters/claude_code.rs`
- Create: `src-tauri/src/adapters/cursor.rs`
- Create: `src-tauri/src/adapters/windsurf.rs`
- Create: `src-tauri/src/adapters/cline.rs`
- Create: `src-tauri/src/adapters/roo_code.rs`
- Create: `src-tauri/src/adapters/vscode_copilot.rs`
- Create: `src-tauri/src/adapters/copilot_cli.rs`
- Create: `src-tauri/src/adapters/codex_cli.rs`
- Create: `src-tauri/src/adapters/mcphub.rs`
- Create: `src-tauri/src/adapters/custom.rs`
- Modify: `src-tauri/src/main.rs`

**Tasks:**
1. Define Rust data models in `models.rs` matching Section 2: `McpServerConfig`, `Transport` enum, `EnvValue` enum (PlainText/VaultRef), `ServerSource` enum, `ClientInfo`, `ConfigScope`, `ConfigFormat`, `RegistryEntry`, `InstallManifest`, `ProfileExport`. Derive `Serialize`, `Deserialize`, `Clone` on all.
2. Implement SQLite database layer: create DB at `%APPDATA%/open-mcp-manager/open-mcp-manager.db`. Schema migration for tables: `servers`, `installs`, `clients`, `vault_entries`, `profiles`, `registry_cache`, `sync_providers`. Use `rusqlite` with bundled SQLite.
3. Implement `ClientAdapter` trait and all 11 adapters per Section 2 config paths table. Each adapter: `detect()` checks if config path exists, `read_servers()` parses native format → canonical model, `write_servers()` converts canonical → native format. Handle root key differences (`mcpServers` vs `servers` vs `[mcp_servers]`). Codex CLI adapter uses `toml` crate. VS Code adapter uses `servers` key. Claude Code adapter adds `cmd /c` wrapper on Windows.
4. Register adapters in a `ClientManager` that runs `detect()` on all adapters at startup, returns list of detected clients with their config paths and current server configs.

**Acceptance Criteria:**
- All Rust models compile and serialize/deserialize correctly
- SQLite database creates on first launch with correct schema
- Each adapter correctly parses sample config files for its client
- Codex CLI adapter reads/writes TOML format
- VS Code adapter uses `servers` root key
- `ClientManager::detect_all()` returns accurate client detection results

**Reviewer Checklist:**
- Config paths match Section 2 table exactly (verified via web research)
- Codex CLI uses TOML, not JSON
- VS Code/Copilot uses `servers` key, not `mcpServers`
- Claude Code adapter wraps commands with `cmd /c` on Windows
- No panics on missing config files — graceful `None` returns
- All file I/O uses proper error handling, no `unwrap()` on user paths

**Integration Checks:**
- `cd src-tauri && cargo test`
- `cd src-tauri && cargo check`

---

## Phase 4: Rust Core — Tauri Commands + Vault + Registry

**Owner:** `codex`

**Goal:** Expose all backend operations as Tauri invoke commands. Implement encrypted vault (DPAPI) and registry source fetching.

**Files:**
- Create: `src-tauri/src/commands/mod.rs`
- Create: `src-tauri/src/commands/clients.rs`
- Create: `src-tauri/src/commands/servers.rs`
- Create: `src-tauri/src/commands/registry.rs`
- Create: `src-tauri/src/commands/vault.rs`
- Create: `src-tauri/src/commands/sync.rs`
- Create: `src-tauri/src/commands/profiles.rs`
- Create: `src-tauri/src/commands/cloud.rs`
- Create: `src-tauri/src/commands/dxt.rs`
- Create: `src-tauri/src/vault.rs`
- Create: `src-tauri/src/registry/mod.rs`
- Create: `src-tauri/src/registry/smithery.rs`
- Create: `src-tauri/src/registry/github_index.rs`
- Create: `src-tauri/src/registry/npm.rs`
- Create: `src-tauri/src/registry/pypi.rs`
- Modify: `src-tauri/src/main.rs` (register commands)

**Tasks:**
1. Implement Tauri command handlers for client operations: `detect_clients`, `get_client_servers`, `install_server_to_clients`, `uninstall_server`, `toggle_server`, `toggle_client_server`. Each command calls into `ClientManager` + adapters, reads/writes config files, updates SQLite state.
2. Implement encrypted vault using Windows DPAPI via the `windows` crate: `vault_store(server_id, key, value)`, `vault_get(server_id, key)`, `vault_delete(server_id, key)`, `vault_list(server_id)`. Encrypt with `CryptProtectData`, decrypt with `CryptUnprotectData`. Store encrypted blobs in `vault_entries` SQLite table.
3. Implement `RegistrySource` trait and 4 built-in sources: Smithery (REST API to smithery.ai), GitHub JSON Index (fetch raw JSON from configurable GitHub repo URL), npm (query registry.npmjs.org for `mcp-server` keyword), PyPI (query pypi.org JSON API). Each returns `Vec<RegistryEntry>`. Cache results in `registry_cache` table with 24h TTL. Expose via `search_registry`, `get_server_details` Tauri commands.
4. Implement sync commands: `sync_servers_between_clients(source_id, target_ids)` — reads from source adapter, writes to each target adapter with format translation. Implement profile commands: `export_profile`, `import_profile`, `list_profiles`, `save_current_profile`, `delete_profile`. Implement DXT command: `install_dxt(path)` — unzip `.dxt`, parse `manifest.json`, extract server config, install via Claude Desktop adapter.

**Acceptance Criteria:**
- All Tauri commands callable from frontend via `invoke()`
- Vault encrypts/decrypts env vars using DPAPI
- Registry fetches return server listings from at least Smithery + npm
- Sync correctly translates configs between clients with different formats
- DXT install extracts manifest and writes to Claude Desktop config
- Profile export/import round-trips correctly (secrets as placeholders)

**Reviewer Checklist:**
- DPAPI calls use correct `windows` crate bindings
- Registry HTTP calls use `reqwest` with timeout (10s)
- No secrets in logs or error messages
- Sync handles root key translation (mcpServers ↔ servers ↔ mcp_servers)
- DXT zip extraction validates manifest.json exists before proceeding
- All commands return `Result<T, String>` for Tauri error propagation

**Integration Checks:**
- `cd src-tauri && cargo test`
- `cd src-tauri && cargo check`

---

## Phase 5: Frontend — Marketplace + Server Detail Panel

**Owner:** `gemini`

**Goal:** Pixel-match Marketplace view (grid + compact modes) and Server Detail slide-in panel. Wire to Tauri backend for real registry data.

**Files:**
- Create: `src/components/marketplace/MarketplaceView.tsx`
- Create: `src/components/marketplace/ServerCard.tsx`
- Create: `src/components/marketplace/ServerCardCompact.tsx`
- Create: `src/components/marketplace/CategoryPills.tsx`
- Create: `src/components/detail/DetailPanel.tsx`
- Create: `src/stores/registryStore.ts`
- Create: `src/stores/clientStore.ts`
- Create: `src/stores/installedStore.ts`
- Create: `src/hooks/useTauriCommand.ts`
- Create: `src/types/index.ts`
- Modify: `src/App.tsx`

**Tasks:**
1. Create TypeScript types mirroring all Rust models: `McpServerConfig`, `Transport`, `RegistryEntry`, `ClientInfo`, `InstallManifest`, etc. Create `useTauriCommand` hook wrapping `@tauri-apps/api` invoke with loading/error state.
2. Build `MarketplaceView` matching Section 12.3: header with title + search input, category pills row (All + 5 categories), responsive card grid (`minmax(300px, 1fr)`). Two card modes: default `ServerCard` (icon, name, DXT badge, author/version, 2-line description, category badge, download count) and `ServerCardCompact` (single-row compact). Wire to `registryStore` (zustand) that calls `search_registry` Tauri command.
3. Build `DetailPanel` matching Section 12.4: slide-in from right (480px, slideIn animation), dark backdrop, header with close button + icon + name + badges, body with description + details table + syntax-highlighted config JSON + client checkboxes. Footer: Uninstall (danger) + Cancel + Install/Update (primary). Wire install action to `install_server_to_clients` command.
4. Wire zustand stores: `registryStore` (server catalog, search, category filter), `clientStore` (detected clients), `installedStore` (installed servers, toggle, install, uninstall). Connect stores to Tauri commands. Load data on app mount.

**Acceptance Criteria:**
- Marketplace displays server cards from registry data
- Category filter and search work
- Clicking a card opens Detail Panel with slide animation
- Install button writes config to selected clients via backend
- Toggle/uninstall work and update UI immediately

**Reviewer Checklist:**
- Card grid matches `minmax(300px, 1fr)` from handoff
- ServerCard dimensions, padding, typography match Section 12.3
- DetailPanel width is 480px, config block uses monospace with syntax colors (#828fff keys, #27ae60 strings, #f2c94c numbers)
- Client checkboxes 16px with primary bg when checked
- DXT badge renders on DXT servers
- Empty state shown when no search results

**Integration Checks:**
- `npm run build`
- `cargo tauri dev` (visual verification against handoff prototype)

---

## Phase 6: Frontend — Installed + Clients + Sync Dialog

**Owner:** `gemini`

**Goal:** Pixel-match Installed Servers view, Clients view, Add Client modal, Config Viewer modal, and Sync dialog.

**Files:**
- Create: `src/components/installed/InstalledView.tsx`
- Create: `src/components/installed/InstalledRow.tsx`
- Create: `src/components/clients/ClientsView.tsx`
- Create: `src/components/clients/ClientCard.tsx`
- Create: `src/components/modals/AddClientModal.tsx`
- Create: `src/components/modals/ConfigViewerModal.tsx`
- Create: `src/components/modals/SyncDialog.tsx`
- Modify: `src/App.tsx`
- Modify: `src/stores/clientStore.ts`

**Tasks:**
1. Build `InstalledView` matching Section 12.3: header with enabled/total counts, list rows with sm toggle + 32px icon + name + version/transport mono + client avatar squares (22px, initials) + hover actions (settings + trash). Wire toggle to `toggle_server` command, trash to `uninstall_server`.
2. Build `ClientsView`: header with detected/configured counts + "Add client" button. Card grid (`minmax(340px, 1fr)`). `ClientCard`: 36px icon + name + config path mono + detected status (green/gray dot) + server list with per-server toggles + Sync/View config ghost buttons.
3. Build `AddClientModal` (440px): name input, config path input (mono), icon picker (6 Lucide options in 36px squares). Build `ConfigViewerModal` (560px): config path display, syntax-highlighted JSON with copy button. Both use `ModalShell`.
4. Build `SyncDialog` (440px): source client name bold, target client checkboxes with detected status, select all/deselect all, sync button with count. Wire to `sync_servers_between_clients` command.

**Acceptance Criteria:**
- Installed view shows all installed servers with working toggles
- Client cards show detection status and per-server toggles
- Add Client modal creates custom clients
- Config Viewer shows correct JSON for each client
- Sync dialog copies servers from source to selected targets

**Reviewer Checklist:**
- InstalledRow hover shows settings + trash icons
- Client avatar squares show 2-letter initials
- Sync dialog "Select all" toggles work correctly
- Config Viewer syntax highlighting matches handoff colors
- AddClientModal icon picker highlights selected icon with primary bg
- All modals close on ESC and backdrop click

**Integration Checks:**
- `npm run build`
- `cargo tauri dev` (visual verification)

---

## Phase 7: Frontend — Cloud Sync + Profiles + Settings

**Owner:** `gemini`

**Goal:** Pixel-match Cloud Sync view (full), Profiles view, and Settings view. Wire to Tauri backend.

**Files:**
- Create: `src/components/cloud-sync/CloudSyncView.tsx`
- Create: `src/components/cloud-sync/ProviderSelector.tsx`
- Create: `src/components/cloud-sync/SyncStatusCard.tsx`
- Create: `src/components/cloud-sync/SyncSettingsCard.tsx`
- Create: `src/components/cloud-sync/DevicesCard.tsx`
- Create: `src/components/cloud-sync/SyncHistoryCard.tsx`
- Create: `src/components/profiles/ProfilesView.tsx`
- Create: `src/components/profiles/ProfileCard.tsx`
- Create: `src/components/settings/SettingsView.tsx`
- Create: `src/stores/cloudSyncStore.ts`
- Create: `src/stores/profileStore.ts`
- Modify: `src/App.tsx`

**Tasks:**
1. Build `CloudSyncView` matching Section 12.3: max-width 720px. Sync Status card (4 metric boxes + push/pull buttons), Provider Configuration card (4 provider selectors as clickable cards + provider-specific credential fields + test connection button), Sync Settings card (auto-sync toggle, interval dropdown, conflict resolution dropdown, encrypt toggle), Devices card, Sync History card (collapsible log with colored dots).
2. Build `ProfilesView`: header with Import + Save current buttons, description text, profile cards with name + stats + description + hover actions (Apply primary, Export, Delete). Empty state. Wire to profile Tauri commands.
3. Build `SettingsView`: max-width 640px. General group (auto-sync, auto-update, telemetry toggles), Registry group (URL input), Cloud sync group (status card linking to Cloud Sync), About group (version, license, GitHub link).
4. Create zustand stores: `cloudSyncStore` (provider config, connection status, sync history, devices), `profileStore` (profiles list, save/export/import/apply/delete). Wire to Tauri commands for cloud provider operations and profile management.

**Acceptance Criteria:**
- Cloud Sync view renders all 5 cards with correct layout
- Provider selector switches between S3/WebDAV/REST/Gist with correct fields
- Test connection button calls backend and shows result
- Profiles can be saved, exported, imported, applied, deleted
- Settings toggles persist via backend

**Reviewer Checklist:**
- Provider cards: active = primary bg, inactive = surface-2
- Sync history dots: push=primary, pull=green, conflict=orange
- Cloud Sync max-width 720px, Settings max-width 640px
- Credential fields for secret values use `type="password"`
- "This device" badge on current device in devices list
- No billing/tier/upgrade elements anywhere

**Integration Checks:**
- `npm run build`
- `cargo tauri dev` (visual verification)

---

## Phase 8: Frontend — Command Palette + Toast System + Polish

**Owner:** `gemini`

**Goal:** Implement Command Palette (Ctrl+K), global toast system, and final UI polish pass.

**Files:**
- Create: `src/components/command-palette/CommandPalette.tsx`
- Modify: `src/components/ui/Toast.tsx` (if needed)
- Modify: `src/App.tsx` (keyboard shortcut registration, final wiring)
- Modify: `src/stores/*.ts` (any missing connections)

**Tasks:**
1. Build `CommandPalette` matching Section 12.4: 520px centered with -80px top offset, search input with Lucide search icon + ESC badge, grouped results (Navigation + Servers), keyboard navigation (Arrow Up/Down + Enter), selected item highlight (surface-2 bg). Register Ctrl+K global shortcut.
2. Wire global toast system: toast container fixed bottom-right (20px offset), success/info/error variants with correct colors and icons, auto-dismiss 3.5s, toastIn animation. Ensure all actions (install, uninstall, toggle, sync, profile ops) trigger appropriate toasts.
3. Final polish: verify all hover states, transitions (0.12s for most, 0.15s for toggles), disabled states (opacity 0.4), focus states. Ensure scrollbar styling (5px width, surface-3 thumb). Verify responsive card grids at various window sizes. Test all modal ESC dismiss.
4. End-to-end flow test: launch app → detect clients → browse marketplace → install server to 3 clients → verify in Installed view → sync to another client → export profile → verify cloud sync UI.

**Acceptance Criteria:**
- Ctrl+K opens command palette, ESC closes
- Arrow keys + Enter navigate and execute commands
- All user actions show appropriate toasts
- No visual regressions across all 6 views
- Complete install → manage → sync → export flow works

**Reviewer Checklist:**
- Command palette groups Navigation and Servers sections
- Toast colors: success=#27a644, info=#828fff, error=#eb5757
- All transitions use correct durations from Section 12.6
- Scrollbar matches 5px width spec
- No console errors or React warnings
- Zero monetization/tier/billing references in any UI text

**Integration Checks:**
- `npm run build`
- `cargo tauri dev` (full E2E walkthrough)
- `cargo tauri build` (produces installable Windows binary)

---

## Phase 9: Rust Core — Cloud Sync Providers

**Owner:** `codex`

**Goal:** Implement all 4 cloud sync providers (S3, WebDAV, REST API, GitHub Gist) with test-connection and push/pull operations.

**Files:**
- Create: `src-tauri/src/cloud/mod.rs`
- Create: `src-tauri/src/cloud/traits.rs`
- Create: `src-tauri/src/cloud/s3.rs`
- Create: `src-tauri/src/cloud/webdav.rs`
- Create: `src-tauri/src/cloud/rest_api.rs`
- Create: `src-tauri/src/cloud/github_gist.rs`
- Modify: `src-tauri/src/commands/cloud.rs`

**Tasks:**
1. Define `SyncProvider` trait: `name()`, `configure()`, `test_connection()`, `push(profile)`, `pull()`, `list_remote_profiles()`. Provider credentials stored in vault (encrypted via DPAPI).
2. Implement S3 provider using `rust-s3` crate: connect to any S3-compatible endpoint (AWS, MinIO, Backblaze), PUT/GET profile JSON as object. Implement WebDAV provider using `reqwest`: PROPFIND/PUT/GET to WebDAV server.
3. Implement REST API provider: POST profile to user's endpoint, GET to retrieve. Bearer token auth. Implement GitHub Gist provider: create/update gist via GitHub API, GET gist content. PAT with `gist` scope.
4. Wire all providers to Tauri commands: `cloud_test_connection`, `cloud_push`, `cloud_pull`, `cloud_configure_provider`, `cloud_list_providers`. Credentials encrypted in vault before storage.

**Acceptance Criteria:**
- S3 provider pushes/pulls profiles to S3-compatible storage
- WebDAV provider pushes/pulls profiles to WebDAV server
- REST API provider POSTs/GETs profiles to custom endpoint
- GitHub Gist provider creates/updates gist with profile JSON
- Test connection validates credentials for each provider
- All provider credentials stored encrypted (never plaintext on disk)

**Reviewer Checklist:**
- HTTP timeouts on all provider requests (10s connect, 30s transfer)
- Secrets never logged or included in error messages
- Push always sends placeholders for env vars, never actual secrets
- S3 endpoint supports custom URLs for MinIO/Backblaze
- GitHub Gist uses correct API endpoints (api.github.com/gists)
- Provider config survives app restart (stored in sync_providers table + vault)

**Integration Checks:**
- `cd src-tauri && cargo test`
- `cd src-tauri && cargo check`

---

## Phase 10: Testing + Build + Final Integration

**Owner:** `codex`

**Goal:** Unit tests for all Rust modules, integration tests for adapter round-trips, production build configuration.

**Files:**
- Create: `src-tauri/tests/adapter_tests.rs`
- Create: `src-tauri/tests/vault_tests.rs`
- Create: `src-tauri/tests/registry_tests.rs`
- Create: `src-tauri/tests/profile_tests.rs`
- Modify: `src-tauri/tauri.conf.json` (production build settings)
- Modify: `package.json` (build scripts)

**Tasks:**
1. Write unit tests for all 11 client adapters: parse sample config JSON/TOML → canonical model → serialize back → verify round-trip. Test each adapter's quirks: Codex CLI TOML format, VS Code `servers` key, Claude Code `cmd /c` wrapper, MCPHub dual-key support.
2. Write vault tests: encrypt → decrypt round-trip, test with various string lengths, verify encrypted data differs from plaintext. Write registry tests: mock HTTP responses for Smithery/npm/PyPI, verify parsing.
3. Write profile tests: export → import round-trip, verify secrets become placeholders on export, verify client assignments preserved. Write sync tests: read from one adapter format → write to different format → verify correct translation.
4. Configure production build: app icon, Windows code signing placeholder in `tauri.conf.json`, MSI/NSIS installer config, version string, update URL placeholder. Add `npm run tauri:build` script.

**Acceptance Criteria:**
- All Rust tests pass (`cargo test`)
- Adapter round-trip tests cover all 11 clients
- Production build produces working Windows installer
- App launches from installed binary and detects real clients

**Reviewer Checklist:**
- Tests don't require real API keys or external services (mocked)
- Adapter tests use real-world sample configs (not synthetic)
- Vault tests verify encryption actually transforms data
- No `#[ignore]` on tests that should run in CI
- Build produces both `.msi` and `.exe` installer

**Integration Checks:**
- `cd src-tauri && cargo test`
- `npm run build`
- `cargo tauri build`

---

## Dependency Graph

```
Phase 1 (scaffold)
  ├── Phase 2 (UI shell + design system)     [gemini]
  └── Phase 3 (Rust core + adapters)         [codex]
        └── Phase 4 (Tauri commands + vault)  [codex]
              ├── Phase 5 (Marketplace UI)    [gemini]
              ├── Phase 6 (Installed/Clients) [gemini]
              ├── Phase 7 (Cloud/Profiles UI) [gemini]
              └── Phase 9 (Cloud providers)   [codex]
                    └── Phase 8 (Polish)      [gemini]
                          └── Phase 10 (Test) [codex]
```

Phases 2 and 3 can run in parallel after Phase 1.
Phases 5, 6, 7, and 9 can run in parallel after Phase 4.
Phase 8 depends on all UI phases (5-7) completing.
Phase 10 is the final gate.

## Summary

| Phase | Owner | Scope | Est. Files |
|-------|-------|-------|-----------|
| 1 | codex | Project scaffold | ~10 |
| 2 | gemini | Design system + layout + sidebar | ~14 |
| 3 | codex | Rust models + DB + 11 adapters | ~17 |
| 4 | codex | Tauri commands + vault + registry | ~15 |
| 5 | gemini | Marketplace + Detail panel | ~12 |
| 6 | gemini | Installed + Clients + modals | ~9 |
| 7 | gemini | Cloud Sync + Profiles + Settings | ~12 |
| 8 | gemini | Command palette + polish | ~4 |
| 9 | codex | Cloud sync providers | ~7 |
| 10 | codex | Tests + build | ~5 |
| **Total** | | | **~105 files** |
