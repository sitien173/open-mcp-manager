# Open MCP Manager — Design Document

**Date:** 2026-05-16
**Status:** Confirmed
**App Name:** Open MCP Manager
**Platform:** Windows 10/11 only (v1)
**Stack:** Tauri v2 (Rust backend) + React/TypeScript frontend

---

## 1. Architecture Overview

Three-layer architecture:

### Frontend (React/TypeScript)
- UI shell rendered in Tauri WebView
- Communicates with backend via Tauri `invoke` commands
- UI designs from Claude Design handoff (see Section 12: UI Specification)

### Core Engine (Rust)
- **Registry Manager** — pluggable registry sources (mcp.so API, GitHub JSON index, npm/PyPI search). Each source implements `RegistrySource` trait
- **Client Manager** — auto-detects installed AI clients via known config paths. Each client has adapter implementing `ClientAdapter` trait
- **Config Engine** — canonical `McpServerConfig` model. Adapters translate to/from each client's native format
- **Vault** — encrypted env var storage using Windows DPAPI. Secrets stored in SQLite with encrypted blob column
- **Sync Engine** — manual push/pull of server configs between local clients + cloud sync via pluggable providers
- **DXT Handler** — parses `.dxt` manifest.json, extracts server config, installs into Claude Desktop
- **Profile Manager** — export/import full config snapshots as JSON files

### Storage (SQLite via rusqlite)
- Single `open-mcp-manager.db` in `%APPDATA%/open-mcp-manager/`
- Tables: servers, clients, installs, vault_entries, profiles, registry_cache, sync_providers

### Design Principle
No monetization concepts anywhere. No tier checks, upgrade prompts, billing, subscription checks, server count limits, or paid plan checks. All features available to all users always.

---

## 2. Data Model

### Canonical McpServerConfig

```rust
struct McpServerConfig {
    id: Uuid,
    name: String,
    description: Option<String>,
    transport: Transport,          // Stdio | Sse | StreamableHttp
    command: Option<String>,       // for stdio: "npx", "uvx", "node", "cmd"
    args: Vec<String>,
    url: Option<String>,           // for sse/http transports
    env: HashMap<String, EnvValue>, // PlainText | VaultRef
    enabled: bool,
    tags: Vec<String>,
    source: ServerSource,          // Registry | Manual | DXT | Import
    version: Option<String>,
    installed_at: DateTime<Utc>,
}
```

### Verified Client Config Paths (Windows)

| # | Client | Config Path | Root Key | Format | Notes |
|---|--------|------------|----------|--------|-------|
| 1 | Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` | `mcpServers` | JSON | MSIX virtualization caveat |
| 2 | Claude Code | `~/.claude/settings.json` (user) / `.mcp.json` (project) | `mcpServers` | JSON | `cmd /c` wrapper needed on Windows for npx |
| 3 | Cursor | `%USERPROFILE%\.cursor\mcp.json` (global) / `<project>\.cursor\mcp.json` | `mcpServers` | JSON | Restart required after changes |
| 4 | Windsurf | `%USERPROFILE%\.codeium\windsurf\mcp_config.json` | `mcpServers` | JSON | |
| 5 | Cline | `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` | `mcpServers` | JSON | VS Code extension storage |
| 6 | Roo Code | `%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json` | `mcpServers` | JSON | Same format as Cline |
| 7 | VS Code / GitHub Copilot | `%APPDATA%\Code\User\mcp.json` (user) / `.vscode\mcp.json` (project) | `servers` | JSON | Key is `servers` NOT `mcpServers` |
| 8 | GitHub Copilot CLI | `~/.copilot/mcp-config.json` | `mcpServers` | JSON | Also supports bare format |
| 9 | Codex CLI | `~/.codex/config.toml` (global) / `.codex/config.toml` (project) | `[mcp_servers.<name>]` | TOML | Only non-JSON client |
| 10 | MCPHub | `~/.config/mcphub/servers.json` | `mcpServers` | JSON | Also reads `.vscode/mcp.json`, `.cursor/mcp.json` |
| 11 | Custom | user-defined path | user-defined | JSON/TOML | User specifies adapter |

### ClientAdapter Trait

```rust
trait ClientAdapter: Send + Sync {
    fn client_name(&self) -> &str;
    fn detect(&self) -> Option<ClientInfo>;
    fn config_paths(&self) -> Vec<ConfigScope>;  // global + project-level paths
    fn read_servers(&self, path: &Path) -> Result<Vec<McpServerConfig>>;
    fn write_servers(&self, path: &Path, servers: &[McpServerConfig]) -> Result<()>;
    fn config_format(&self) -> ConfigFormat;  // Json | Toml
    fn root_key(&self) -> &str;               // "mcpServers" | "servers" | "mcp_servers"
    fn needs_cmd_wrapper(&self) -> bool;      // Windows cmd /c wrapping
}
```

### Key Adapter Quirks
- **Codex CLI**: TOML format, `[mcp_servers.<name>]` tables, supports `supports_parallel_tool_calls`, custom timeout fields
- **VS Code/Copilot**: Uses `servers` key not `mcpServers`
- **Claude Code on Windows**: Needs `cmd /c` wrapper for stdio commands
- **Claude Desktop**: MSIX virtualization can cause config file path confusion
- **MCPHub**: Supports both `mcpServers` and `servers` keys, JSON5 with comments

---

## 3. Registry Sources & Discovery

### RegistrySource Trait

```rust
trait RegistrySource: Send + Sync {
    fn name(&self) -> &str;
    fn fetch_catalog(&self, query: Option<&str>) -> Result<Vec<RegistryEntry>>;
    fn fetch_details(&self, server_id: &str) -> Result<ServerDetails>;
    fn install_instructions(&self, server_id: &str) -> Result<InstallManifest>;
}
```

### Built-in Sources

| Source | How it works | Data provided |
|--------|-------------|---------------|
| mcp.so / Smithery | REST API calls to smithery.ai public API | Name, description, install command, categories, author, stars, transport type |
| GitHub JSON Index | Maintained `open-mcp-registry` GitHub repo with `index.json`. Community PRs. | Curated list with verified install commands, env var requirements, client compatibility |
| npm search | Query npm registry API for packages tagged `mcp-server` or `@modelcontextprotocol/*` | Package name, version, description, weekly downloads |
| PyPI search | Query PyPI JSON API for packages with `mcp` classifier/keyword | Package name, version, description |

### RegistryEntry Model

```rust
struct RegistryEntry {
    source: String,
    source_id: String,
    name: String,
    description: String,
    author: Option<String>,
    transport: Transport,
    install: InstallManifest,
    categories: Vec<String>,
    homepage: Option<String>,
    repo_url: Option<String>,
}
```

### InstallManifest

```rust
struct InstallManifest {
    command: String,
    args: Vec<String>,
    required_env: Vec<EnvRequirement>,
    optional_env: Vec<EnvRequirement>,
    prerequisites: Vec<String>,  // "node >= 18", "python >= 3.10", "docker"
}
```

### Discovery Flow
1. App startup -> fetch catalogs from all enabled sources (cached locally, refresh on demand)
2. User searches -> filter across all sources, deduplicate by name/command
3. User picks server -> show details, env requirements, compatible clients
4. "Install" -> user picks target clients -> app writes config via adapters

### Caching
Registry data cached in SQLite with TTL (default 24h). Manual refresh button. Offline-capable from cache.

---

## 4. Sync Engine

### Local Push/Pull (v1)

Manual one-click sync between local clients:

1. User opens Sync view -> sees all detected clients + their installed servers
2. Picks source client (e.g., "Claude Code - 5 servers")
3. Picks target client(s) (e.g., Cursor + Windsurf)
4. Selects which servers to sync (checkboxes, default all)
5. Preview diff - shows what will be added/updated/skipped per target
6. Confirm -> app reads from source via adapter, translates to target format, writes via target adapter
7. Shows result summary with warnings

**Conflict handling:** If target already has server with same name, show side-by-side comparison. User chooses: overwrite, skip, or rename.

**Windows cmd wrapper:** When syncing TO Claude Code on Windows, adapter auto-wraps stdio commands with `cmd /c` if not already wrapped.

### Cloud Sync (Pluggable Providers)

```rust
trait SyncProvider: Send + Sync {
    fn name(&self) -> &str;
    fn configure(&mut self, config: ProviderConfig) -> Result<()>;
    fn test_connection(&self) -> Result<ConnectionStatus>;
    fn push(&self, profile: &ProfileExport) -> Result<SyncResult>;
    fn pull(&self) -> Result<ProfileExport>;
    fn list_remote_profiles(&self) -> Result<Vec<ProfileMeta>>;
}
```

### Built-in Providers

| Provider | Credentials | Storage |
|----------|-------------|---------|
| GitHub Gist | GitHub PAT (gist scope) | Profile JSON as gist file |
| S3 / S3-compatible | Access key, secret key, bucket, region, optional endpoint (MinIO/Backblaze) | Profile JSON as object |
| WebDAV | URL, username, password | Profile JSON file on WebDAV server |
| REST API | Base URL, optional auth header/bearer token | POST/GET profile JSON to user's endpoint |

### Provider Configuration Flow
1. Settings -> Cloud Sync -> Add Provider
2. Pick provider type (dropdown)
3. Fill credential fields specific to provider
4. "Test Connection" button -> validates credentials, checks read/write access
5. Save -> credentials stored in encrypted vault (DPAPI-backed)

### Sync Behavior
- Manual push/pull (button click), no auto-sync in v1
- Push = upload current profile to remote
- Pull = download remote profile, show diff, user confirms import
- Conflict: show remote vs local side-by-side, user picks
- Secrets exported as placeholders in remote profiles (never send actual API keys)
- Multiple providers supported simultaneously; user selects active provider per sync action

---

## 5. Profile Export/Import

### Export Format

```json
{
  "version": "1.0",
  "exported_at": "2026-05-16T10:30:00Z",
  "app_version": "0.1.0",
  "servers": [
    {
      "name": "github-mcp",
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": { "type": "placeholder", "description": "GitHub PAT" }
      },
      "enabled": true,
      "tags": ["dev-tools"],
      "client_assignments": ["claude-desktop", "cursor", "claude-code"]
    }
  ],
  "metadata": {
    "client_states": {
      "claude-desktop": { "detected": true, "path": "..." },
      "cursor": { "detected": true, "path": "..." }
    }
  }
}
```

### Design Decisions
- Secrets exported as **placeholders** (type + description), never as values
- Client assignments stored so import knows where to install
- Metadata records source machine state (informational, not required for import)
- Human-readable, git-friendly, shareable

### Import Flow
1. Load JSON profile
2. Show server list with client assignments
3. User picks which servers to import + which clients to target
4. Prompt for required env vars (fill from vault if available)
5. Write to selected clients via adapters

---

## 6. DXT Support

**Scope:** Read + install DXT manifests into Claude Desktop.

DXT (Desktop Extension) = zip package containing `manifest.json` + optional bundled server code.

### App Handles
1. Parse `manifest.json` from `.dxt` package -> extract server name, command, args, env requirements
2. Convert to canonical `McpServerConfig`
3. Install into Claude Desktop via adapter (write to `claude_desktop_config.json`)
4. Display DXT metadata (author, version, description) in UI

### Not in Scope (v1)
Building/packaging DXT files, signing, updating installed DXT extensions.

---

## 7. Encrypted Vault

- Env vars stored in SQLite with encrypted blob column
- Encryption via Windows DPAPI (Data Protection API)
- Per-user encryption tied to Windows account
- Vault entries keyed by server ID + env var name
- On config write: resolve VaultRef -> plaintext value -> write to client config
- On profile export: VaultRef -> placeholder (never export actual secrets)
- On cloud sync: same as export — placeholders only

---

## 8. Project Structure

```
open-mcp-manager/
├── src-tauri/                    # Rust backend (Tauri)
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/            # Tauri invoke command handlers
│   │   │   ├── mod.rs
│   │   │   ├── registry.rs
│   │   │   ├── clients.rs
│   │   │   ├── servers.rs
│   │   │   ├── sync.rs
│   │   │   ├── profiles.rs
│   │   │   ├── vault.rs
│   │   │   ├── cloud.rs
│   │   │   └── dxt.rs
│   │   ├── adapters/            # Per-client config adapters
│   │   │   ├── mod.rs
│   │   │   ├── claude_desktop.rs
│   │   │   ├── claude_code.rs
│   │   │   ├── cursor.rs
│   │   │   ├── windsurf.rs
│   │   │   ├── cline.rs
│   │   │   ├── roo_code.rs
│   │   │   ├── vscode_copilot.rs
│   │   │   ├── copilot_cli.rs
│   │   │   ├── codex_cli.rs     # TOML adapter
│   │   │   ├── mcphub.rs
│   │   │   └── custom.rs
│   │   ├── registry/            # Registry source implementations
│   │   │   ├── mod.rs
│   │   │   ├── smithery.rs
│   │   │   ├── github_index.rs
│   │   │   ├── npm.rs
│   │   │   └── pypi.rs
│   │   ├── cloud/               # Cloud sync providers
│   │   │   ├── mod.rs
│   │   │   ├── github_gist.rs
│   │   │   ├── s3.rs
│   │   │   ├── webdav.rs
│   │   │   └── rest_api.rs
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   ├── schema.rs
│   │   │   └── migrations/
│   │   ├── vault.rs
│   │   └── models.rs
│   └── tauri.conf.json
├── src/                         # React/TypeScript frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/              # UI (designs from Claude Design)
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   └── lib/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 9. Key Dependencies

### Rust
| Crate | Purpose |
|-------|---------|
| `tauri` v2 | Desktop framework |
| `rusqlite` | SQLite storage |
| `serde` / `serde_json` | JSON serialization |
| `toml` | Codex CLI config read/write |
| `reqwest` | HTTP client for registry APIs + cloud sync |
| `uuid` | Server IDs |
| `chrono` | Timestamps |
| `windows` crate | DPAPI access for vault encryption |
| `zip` | DXT package extraction |
| `rust-s3` | S3 sync provider |

### Frontend
| Package | Purpose |
|---------|---------|
| `@tauri-apps/api` | Invoke Rust commands |
| `react` + `react-dom` | UI framework |
| `zustand` | Lightweight state management |
| `lucide-react` | Icon library (Lucide icons used throughout design) |
| Custom CSS tokens | Linear-inspired design system (see Section 12) |

## 10. Success Criteria

1. Auto-detect 10+ AI clients on Windows
2. Browse MCP servers from multiple registries
3. One-click install server into any combination of clients
4. Enable/disable servers per client
5. Push/pull servers between clients
6. Export/import profiles as JSON
7. Encrypted vault for secrets (DPAPI)
8. DXT manifest install into Claude Desktop
9. Cloud sync via GitHub Gist / S3 / WebDAV / REST API with test connection
10. Zero monetization UI — no tiers, limits, billing, upgrades anywhere

## 11. Research Sources

- [Claude Desktop MCP config](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop)
- [Claude Code MCP docs](https://code.claude.com/docs/en/mcp)
- [Cursor MCP docs](https://cursor.com/docs/context/mcp)
- [Windsurf MCP integration](https://docs.windsurf.com/windsurf/cascade/mcp)
- [VS Code MCP servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
- [GitHub Copilot CLI MCP](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers)
- [Codex CLI config reference](https://developers.openai.com/codex/config-reference)
- [Codex CLI MCP docs](https://developers.openai.com/codex/mcp)
- [MCPHub config](https://ravitemer.github.io/mcphub.nvim/mcp/servers_json.html)

---

## 12. UI Specification (from Claude Design Handoff)

Source: `Open MCP Manager-handoff.zip` — prototype in HTML/CSS/JSX. Production implementation must pixel-match the visual output in React/TypeScript.

### 12.1 Design System — Linear-Inspired Dark Theme

**Fonts:**
- Display/Headings: SF Pro Display (self-hosted woff2, weights: 400/500/600/700)
- Body text: SF Pro Text (self-hosted woff2, weights: 400/600)
- Monospace: JetBrains Mono (Google Fonts, weights: 400/500)

**Color Tokens:**
```css
/* Brand & Accent */
--color-primary:          #5e6ad2;   /* Default accent — configurable */
--color-primary-hover:    #828fff;
--color-on-primary:       #ffffff;

/* Surface Ladder (dark) */
--color-canvas:           #010102;   /* App background */
--color-surface-1:        #16181d;   /* Cards, panels */
--color-surface-2:        #1e2028;   /* Hover states, elevated cards */
--color-surface-3:        #26282f;   /* Toggles off-state, icon bg */
--color-surface-4:        #2e3038;   /* Scrollbar hover */

/* Borders */
--color-hairline:         #23252a;   /* Default borders */
--color-hairline-strong:  #35373e;   /* Hover borders */

/* Text / Ink */
--color-ink:              #f7f8f8;   /* Primary text */
--color-ink-muted:        #d0d6e0;   /* Body text */
--color-ink-subtle:       #8a8f98;   /* Secondary text */
--color-ink-tertiary:     #62666d;   /* Disabled/placeholder */

/* Semantic */
--color-semantic-success: #27a644;   /* Green indicators */
--color-label-red:        #eb5757;   /* Danger/delete */
```

**Spacing:** 4/8/12/16/24/32/48/96px scale
**Border Radius:** 4/6/8/12/16/24/9999px scale

### 12.2 Layout — Sidebar + Content

Full-height flex layout. No title bar overlap (Tauri WebView).

```
┌──────────────┬────────────────────────────────────┐
│              │  Header (title + search + actions)  │
│   Sidebar    ├────────────────────────────────────┤
│   220px      │                                    │
│   #0a0b0f bg │  Content area (scrollable)         │
│              │                                    │
│   Brand      │                                    │
│   ─────      │                                    │
│   Discover   │                                    │
│     Market   │                                    │
│   ─────      │                                    │
│   Manage     │                                    │
│     Install  │                                    │
│     Clients  │                                    │
│   ─────      │                                    │
│   Configure  │                                    │
│     Cloud    │                                    │
│     Profiles │                                    │
│     Settings │                                    │
│   ─────      │                                    │
│   Footer     │                                    │
│   (status)   │                                    │
└──────────────┴────────────────────────────────────┘
```

**Sidebar (220px, `#0a0b0f`):**
- Brand: 28px icon (primary color bg) + "Open MCP Manager" title + "v0.1.0-beta" mono subtitle
- Sections with uppercase 10.5px labels: Discover, Manage, Configure
- Nav items: 15px Lucide icon + 13px label + optional count (mono) or badge
- Active state: `surface-2` bg + `ink` color
- Footer: green status dot + "All systems operational" + version mono

**Navigation Views:**
- Marketplace (view: `marketplace`)
- Installed (view: `installed`)
- Clients (view: `clients`)
- Cloud Sync (view: `cloud-sync`)
- Profiles (view: `profiles`)
- Settings (view: `settings`)

### 12.3 Views

#### Marketplace View
- Header: "Marketplace" title (15px 600) + SearchInput (surface-1 bg, hairline border, 8px radius)
- Category pills row: `All | Developer Tools | Data & Analytics | Communication | Cloud & Infra | AI & ML`
- Active pill: primary bg, white text. Inactive: surface-1 bg.
- **Card grid** (default): `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`, 12px gap
- **Compact list** (alt mode): single column, 4px gap
- **Server Card (default):** 12px radius, surface-1 bg, hairline border. Top: 34px icon square (surface-3, 9px radius) + name (14px 500 display font) + author/version mono. DXT badge if applicable. 2-line description (13px, line-clamp 2). Footer: category badge + download count with arrow-down icon.
- **Server Card (compact):** 10px radius, single row: 28px icon + name/desc + download count + installed badge.
- Installed servers show green "Installed" badge.

#### Installed Servers View
- Header: "Installed servers" + "N enabled · M total" (mono)
- List rows: Toggle (sm) + 32px icon + name (13px 500) + version/transport (mono) + client avatars (22px squares with initials) + hover actions (settings + trash icons)
- Empty state: package icon + "No servers installed" message

#### Clients View
- Header: "AI Clients" + "N detected · M configured" (mono) + "Add client" button
- Card grid: `repeat(auto-fill, minmax(340px, 1fr))`, 12px gap
- **Client Card:** 12px radius. Top: 36px icon (surface-3) + client name (14px 500) + config path (mono 11px) + detected status (green dot "Detected" or gray "Not found"). Server list with per-server toggle. Actions: "Sync" + "View config" ghost buttons.

#### Cloud Sync View
- Max-width: 720px content column
- **Sync Status card:** 4 metric boxes (Status/Last sync/Provider/Devices) in flex row + Push/Pull buttons
- **Provider Configuration card:** 4 provider selectors (S3-Compatible, WebDAV, REST API, GitHub Gist) as clickable cards. Active: primary bg. Provider-specific credential fields below. "Test connection" button.
- **Sync Settings card:** Auto-sync toggle, sync interval dropdown (1/5/15/30/60 min), conflict resolution dropdown (local wins/remote wins/newest wins/ask), encrypt data toggle (AES-256-GCM)
- **Synced Devices card:** Device list (icon + name + OS + server/client counts + last seen)
- **Sync History card:** Collapsible log with colored dots (push=primary, pull=green, conflict=orange)

#### Profiles View
- Header: "Profiles" + "Import" secondary button + "Save current" primary button
- Description text block explaining profiles
- **Profile Card:** 12px radius. 36px layers icon + name (14px 500) + stats mono (servers · clients · date) + description. Hover: Apply (primary) + Export + Delete buttons.
- Empty state: "No profiles saved"

#### Settings View
- Max-width: 640px
- **General group:** Auto-sync toggle, auto-update toggle, telemetry toggle
- **Registry group:** Registry URL text input (mono)
- **Cloud sync group:** Status card with link to Cloud Sync panel
- **About group:** Version (mono), License (MIT), GitHub link

### 12.4 Overlays & Modals

#### Server Detail Panel (slide-in)
- 480px width, slides from right with 0.2s ease animation
- Dark backdrop (rgba 0,0,0,0.5)
- Header: close X + 44px icon + server name (17px 600) + DXT/Installed badges + author/version mono
- Body: description, details table (category, transport, downloads, version), config JSON block (syntax highlighted: keys in #828fff, strings in #27ae60, numbers in #f2c94c), client selection checkboxes (16px, primary bg when checked)
- Footer: Uninstall (danger) if installed + Cancel + Install/Update primary button

#### Add Client Modal
- 440px centered modal, 14px radius, modalIn animation (0.18s)
- Fields: Client name (text), Config file path (mono), Icon picker (6 Lucide icon options in 36px squares)
- Footer: Cancel + Add client (primary)

#### Config Viewer Modal
- 560px. Shows client config path, syntax-highlighted JSON preview, Copy button.

#### Sync Dialog Modal
- 440px. Source client name bolded. Target clients with checkboxes + detected status. Select all/deselect all. Sync button with count.

#### Command Palette (Ctrl+K)
- 520px centered, -80px top offset. Search input with Lucide search icon + ESC badge.
- Grouped results: Navigation (6 items) + Servers (all MCP servers). 7px radius items, selected = surface-2 bg. Arrow keys + Enter navigation.

### 12.5 Shared Components

| Component | Props | Behavior |
|-----------|-------|----------|
| `Toggle` | `checked, onChange, size(sm\|md)` | 36x20 (md) or 28x16 (sm). Primary bg when on, surface-3 when off. White dot. 0.15s transitions. |
| `Badge` | `children, color, bg` | 11px 500, pill radius, 2px 7px padding. Default: surface-2 bg, ink-subtle color. |
| `SearchInput` | `value, onChange, placeholder` | surface-1 bg, hairline border, 8px radius. Lucide search icon. X clear button. |
| `Btn` | `variant(primary\|secondary\|ghost\|danger), size(sm\|md), onClick, disabled` | 8px radius, 0.12s transitions. Primary: primary bg → hover brighter. Secondary: surface-2 → surface-3. Ghost: transparent → surface-2. Danger: red-tinted bg. SM: 12px 5px 10px. MD: 13px 7px 14px. |
| `EmptyState` | `icon, title, subtitle` | Centered column, 32px icon at 0.4 opacity, 15px 500 title, 13px subtitle max-width 320px. |
| `Toast` | `message, type(success\|info\|error), onDismiss` | Fixed bottom-right (20px offset). surface-2 bg, colored border. Icon: check-circle (green), info (blue), alert-circle (red). toastIn animation. Auto-dismiss 3.5s. |
| `ModalShell` | `title, width, onClose, footer, children` | Centered overlay. surface-1 bg, 14px radius, modalIn animation. ESC to close. |

### 12.6 Animations

| Name | CSS | Used by |
|------|-----|---------|
| `slideIn` | `translateX(100%) → 0` 0.2s ease | Detail panel |
| `toastIn` | `translateY(12px) opacity(0) → 0 1` 0.25s ease | Toast notifications |
| `spin` | `rotate(0 → 360)` 1s linear infinite | Loading spinners |
| `modalIn` | `translateY(8px) scale(0.98) opacity(0) → 0 1 1` 0.18s ease | All modals |

### 12.7 Icons (Lucide)

All icons use Lucide icon set. Key icons by context:
- Sidebar: package, check-circle-2, monitor, cloud, layers, settings
- Clients: message-square (Claude Desktop), terminal (Claude Code), mouse-pointer-2 (Cursor), wind (Windsurf), square-terminal (Cline), code (Roo Code), sparkles (Copilot), square-chevron-right (Codex CLI)
- Actions: plus, trash-2, refresh-cw, download, upload, copy, search, x, settings, file-text, plug
- Status: check-circle-2, alert-circle, info, loader

### 12.8 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Toggle command palette |
| `ESC` | Close any modal/overlay |
| `Arrow Up/Down` | Navigate command palette results |
| `Enter` | Execute selected command |

### 12.9 Data Model Additions from Handoff

The handoff reveals additional fields needed on RegistryEntry beyond what Section 3 defined:
- `icon: String` — Lucide icon name per server
- `downloads: u64` — download count for display
- `isDxt: bool` — whether server is a DXT extension
- `category: String` — category ID (not Vec), single primary category

Categories enum: `all | developer-tools | data-analytics | communication | cloud | ai-ml`

Client model additions:
- `icon: String` — Lucide icon name per client
- `detected: bool` — whether client was auto-detected on this machine
- `servers: Vec<String>` — list of installed server IDs for this client
