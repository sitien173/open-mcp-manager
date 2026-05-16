# Phase 6: Installed + Clients + Sync Dialog

Build 7 React/TypeScript components for Open MCP Manager. Use inline styles matching the design system (CSS custom properties from tokens.css). Use lucide-react for icons (named imports like `Settings`, `Trash2`, `Plus`, `RefreshCw`, `FileText`, `Check`, `Copy`, `Loader`, `Search`). Use existing UI components from `src/components/ui/`: `Toggle`, `Btn`, `ModalShell`, `EmptyState`.

## Files to Create

### 1. `src/components/installed/InstalledView.tsx`
- Header: "Installed servers" title (15px, weight 600, font-display) + "{enabled} enabled · {total} total" count (12px, mono, ink-tertiary)
- List of InstalledRow components, scrollable
- Empty state with package icon when no servers
- Wire to `useInstalledStore` for data and actions

### 2. `src/components/installed/InstalledRow.tsx`
Props: server (McpServerConfig), clients (ClientInfo[]), onToggle, onSelect, onRemove
- Row: flex, alignItems center, gap 12, padding 10px 24px, bottom hairline border
- Left: sm Toggle for enabled state
- 32px icon square (surface-2 bg, borderRadius 8) with server icon
- Name (13px, weight 500, font-display) + meta line "v{version} · {transport}" (11px, mono, ink-tertiary)
- Client avatar squares: 22px, borderRadius 6, surface-3 bg, 9px weight-600 text showing 2-letter initials. Show max 4, then "+N" overflow
- On hover: show settings (Settings icon) + trash (Trash2 icon, #eb5757) ghost buttons. Stop propagation on action clicks
- Row click -> onSelect. Disabled appearance (opacity 0.5) when not enabled

### 3. `src/components/clients/ClientsView.tsx`
- Header: "AI Clients" title (flex 1) + "{detected} detected · {total} configured" count + "Add client" secondary button with Plus icon
- Grid: `repeat(auto-fill, minmax(340px, 1fr))`, gap 12, padding 24
- ClientCard components
- State management for modals: addClientOpen, syncSource (ClientInfo|null), configViewClient (ClientInfo|null)
- Render AddClientModal, SyncDialog, ConfigViewerModal conditionally

### 4. `src/components/clients/ClientCard.tsx`
Props: client (ClientInfo), onToggleServer, onSyncFrom, onViewConfig
- Card: surface-1 bg, hairline border, borderRadius 12, padding 16px 18px, flex-column gap 12
- Hover: surface-2 bg, hairline-strong border
- Top row: 36px icon (surface-3 bg, borderRadius 9) + name (14px, weight 500, font-display) + config path (11px, mono, ink-tertiary, text-overflow ellipsis) + detected status (7px dot + "Detected"/"Not found" text, green/gray)
- Server list: each row has icon (13px) + name (flex 1, ink-muted) + sm Toggle. Rows separated by hairline top border. Empty state: "No servers configured" italic centered
- Bottom actions: Sync ghost button (RefreshCw icon) + View config ghost button (FileText icon)
- For server list: use `client.servers` array (server IDs) and look up from installed store

### 5. `src/components/modals/AddClientModal.tsx`
- Uses ModalShell, width 440
- Title: "Add custom client"
- Fields: Client name input (text, placeholder "My Custom Client", autoFocus), Config file path input (mono font, placeholder path), Icon picker (6 options: terminal, code, message-square, monitor, sparkles, square-terminal as 36px squares, selected = primary bg + white icon, unselected = surface-2 bg + ink-subtle icon)
- Footer: Cancel secondary + Add client primary (Plus icon), disabled when name or path empty
- On submit: call clientStore.addClient(name, path, icon), close modal
- Field style: label 12px weight 500 ink-subtle, input has canvas bg, hairline border, borderRadius 7, padding 8px 11px

### 6. `src/components/modals/ConfigViewerModal.tsx`
Props: client (ClientInfo), onClose
- Uses ModalShell, width 560
- Title: "{client.name} — config"
- Shows config path with FileText icon (11px mono ink-tertiary)
- JSON syntax highlighting in pre block: canvas bg, hairline border, borderRadius 8, padding 14px 16px, mono 12px, lineHeight 1.65. Colors: keys=#828fff, string values=#27ae60, numbers=#f2c94c
- Copy button (ghost, Check icon when copied) + Close secondary button in footer
- Build config JSON by invoking `get_client_servers` command for actual data. If no servers, show italic "No servers configured" message
- Use `dangerouslySetInnerHTML` for syntax-highlighted pre block

### 7. `src/components/modals/SyncDialog.tsx`
Props: sourceClient (ClientInfo), clients (ClientInfo[]), onClose
- Uses ModalShell, width 440
- Title: "Sync configuration"
- Description text: "Copy the MCP server configuration from **{source}** to the selected target clients."
- "Target clients" label + Select all/Deselect all ghost button
- Checkbox list: 16px checkbox (borderRadius 4, primary when checked with Check icon, hairline-strong border when unchecked) + client icon (14px) + name (flex 1, ink-muted) + "Ready"/"N/A" status (11px mono, green/gray)
- Footer: Cancel secondary + "Sync to {N} clients" primary (RefreshCw icon), disabled when 0 selected or syncing
- Syncing state: show Loader icon with spin animation + "Syncing..." text
- Wire to `sync_servers_between_clients` Tauri command

## Files to Modify

### `src/App.tsx`
- Replace placeholder InstalledView and ClientsView with imports from new component files
- Import InstalledView from `./components/installed/InstalledView`
- Import ClientsView from `./components/clients/ClientsView`
- Keep other placeholder views (CloudSyncView, ProfilesView, SettingsView) unchanged

### `src/stores/clientStore.ts`
- The addClient method currently has a commented-out invoke. Since there's no backend command for custom clients yet, keep it as-is (detect_clients refresh). The UI can call this and it will refresh the client list.

## Type References (from src/types/index.ts)
```typescript
interface McpServerConfig {
  id: string; name: string; description: string | null;
  transport: Transport; command: string | null; args: string[];
  url: string | null; env: Record<string, EnvValue>;
  enabled: boolean; tags: string[]; source: ServerSource;
  version: string | null; installedAt: string;
}

interface ClientInfo {
  id: string; name: string; icon: string; detected: boolean;
  configPaths: ConfigScope[]; activePath: string | null; servers: string[];
}
```

## Existing Components to Use
- `Toggle` from `../ui/Toggle` — props: checked, onChange, size ('sm'|'md'), disabled
- `Btn` from `../ui/Btn` — props: variant ('primary'|'secondary'|'ghost'|'danger'|'outline'), size ('sm'|'md'), disabled, onClick, children
- `ModalShell` from `../ui/ModalShell` — props: title, width, onClose, footer, children
- `EmptyState` from `../ui/EmptyState` — props: icon, title, subtitle

## Design Token Reference
- `--color-canvas`: #010102 (deepest bg)
- `--color-surface-1`: #111214 (card bg)
- `--color-surface-2`: #1a1b1f (hover/secondary bg)
- `--color-surface-3`: #222328 (tertiary)
- `--color-ink`: #e8e8ed (primary text)
- `--color-ink-muted`: #a1a1aa
- `--color-ink-subtle`: #72727e
- `--color-ink-tertiary`: #4b4b57
- `--color-hairline`: #1e1f24
- `--color-hairline-strong`: #2c2d35
- `--color-primary`: #5e6ad2
- `--color-primary-hover`: #6e7ae0
- `--color-semantic-success`: #27ae60
- `--font-display`: Inter var, system-ui
- `--font-mono`: JetBrains Mono, monospace
- `--font-text`: Inter var, system-ui

## Stores to Import
- `useInstalledStore` from `../../stores/installedStore` — has: servers, toggleServer, uninstallServer
- `useClientStore` from `../../stores/clientStore` — has: clients, fetchClients, addClient

## Important
- All icons use lucide-react named imports (e.g., `import { Settings, Trash2 } from 'lucide-react'`), NOT `<i data-lucide="...">` 
- Use inline styles only (no CSS modules)
- TypeScript strict — type all props with interfaces
- `invoke` from `@tauri-apps/api/core` for Tauri commands
