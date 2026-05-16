# Phase 7: Cloud Sync + Profiles + Settings

Build 9 React/TypeScript components + 2 zustand stores. Modify App.tsx. Use inline styles matching design tokens. Use lucide-react named imports. Use existing UI: `Toggle`, `Btn`, `ModalShell`, `EmptyState`, `Badge`.

## Design References
- `docs/design/app-cloud-sync.jsx` — full CloudSyncView prototype with styles, provider fields, devices, sync history
- `docs/design/app-secondary.jsx` — ProfilesView, ProfileCard, SettingsView prototypes with styles

Read these files for exact layout, spacing, colors, and component structure. Convert `<i data-lucide="...">` to lucide-react named imports.

## Files to Create

### 1. `src/stores/cloudSyncStore.ts`
Zustand store with:
- `providers: CloudProviderView[]` (fetched from `cloud_list_providers` command)
- `activeProviderId: string | null`
- `connected: boolean`
- `syncing: 'push' | 'pull' | false`
- `lastSync: string | null`
- `testing: boolean`
- `autoSync: boolean`, `syncInterval: string`, `conflictStrategy: string`, `encryptData: boolean`
- Actions: `fetchProviders()`, `configureProvider(input)`, `testConnection(providerId)`, `push(providerId, profile)`, `pull(providerId)`, `setAutoSync`, `setSyncInterval`, `setConflictStrategy`, `setEncryptData`
- Tauri commands: `cloud_list_providers` (no args), `cloud_configure_provider` (input: {id?, providerType, config, secrets}), `cloud_test_connection` (input: {providerId}), `cloud_push` (input: {providerId, profile}), `cloud_pull` (input: {providerId})
- Type: `CloudProviderView = { id: string; providerType: string; config: Record<string, any> }`

### 2. `src/stores/profileStore.ts`
Zustand store with:
- `profiles: ProfileInfo[]` — array of {id, name, serverCount, clientCount, createdAt, description}
- `loading: boolean`
- Actions: `fetchProfiles()`, `saveCurrentProfile(name)`, `exportProfile(id)`, `importProfile(json)`, `deleteProfile(id)`
- Tauri commands: `list_profiles`, `save_current_profile` (name: string), `export_profile` (name: string), `import_profile` (json: string), `delete_profile` (id: string)
- Note: backend profile commands are stubs returning empty data. UI should still wire correctly.

### 3. `src/components/cloud-sync/CloudSyncView.tsx`
Main container, max-width 720px. Header: "Cloud Sync" title + connection status dot + Disconnect ghost button.
Content: scrollable column with 5 card components:
- SyncStatusCard
- ProviderSelector (provider config card)
- SyncSettingsCard
- DevicesCard
- SyncHistoryCard
Wire to cloudSyncStore.

### 4. `src/components/cloud-sync/SyncStatusCard.tsx`
Card with "Sync status" title (Activity icon). 4 metric boxes in a row (surface-2 bg, borderRadius 8): Status (green/gray), Last sync, Provider name, Devices count. Below: Push to cloud (primary) + Pull from cloud (secondary) buttons. Loading states with Loader icon + spin animation.

### 5. `src/components/cloud-sync/ProviderSelector.tsx`
Card with "Provider configuration" title (CloudCog icon). 4 provider cards in a row (flex, clickable): S3-Compatible (HardDrive), WebDAV (Server), REST API (Globe), GitHub Gist (GitBranch). Active = primary bg + white text/icon, inactive = surface-2 bg.

Below providers: provider-specific credential fields based on selection:
- S3: endpoint, bucket, accessKey, secretKey (type=password)
- WebDAV: endpoint (WebDAV URL), username, password (type=password)
- REST: endpoint (API Endpoint), apiKey (type=password)
- Gist: token (type=password, hint "Requires `gist` scope"), gistId (optional)

Field style: 12px label ink-subtle, input with canvas bg, hairline border, borderRadius 6, padding 7px 10px, mono font 12px.

Bottom: Test connection (secondary) + Docs (ghost) buttons.

Wire "Save" to `cloud_configure_provider` with config (non-secret fields) and secrets (secret fields) separated. Wire "Test connection" to `cloud_test_connection`.

### 6. `src/components/cloud-sync/SyncSettingsCard.tsx`
Card with "Sync settings" title (Settings icon). Rows:
- Auto-sync toggle + description "Automatically push changes when config is modified"
- Sync interval dropdown (only when autoSync=true): 1/5/15/30/60 min options. Select style: canvas bg, hairline border, borderRadius 6, mono font
- Conflict resolution dropdown: Local wins / Remote wins / Newest wins / Ask each time
- Encrypt sync data toggle + description "AES-256-GCM encryption before upload (recommended)"

### 7. `src/components/cloud-sync/DevicesCard.tsx`
Card with "Synced devices" title (MonitorSmartphone icon) + device count badge. Mock data for now (no backend). Device rows: 32px icon (Monitor/Laptop/Server based on OS), name + "This device" Badge for current, OS + server/client counts in mono, last seen with status dot.

### 8. `src/components/cloud-sync/SyncHistoryCard.tsx`
Card with "Sync history" title (History icon) + Collapse/Expand ghost button. Collapsible log. Each entry: colored dot (push=primary, pull=green, conflict=#f2994a) + message + device name + details + time (mono). Mock data for now.

### 9. `src/components/profiles/ProfilesView.tsx`
Header: "Profiles" title + Import (secondary, Upload icon) + Save current (primary, Plus icon) buttons.
Description text below header.
ProfileCard list or EmptyState (Layers icon).
ProfileCard: surface-1 card, borderRadius 12. 36px icon (Layers), name (14px, font-display), stats line (mono 11px: "N servers · N clients · date"). Description text. On hover: Apply (primary), Export (secondary, Download), Delete (ghost, Trash2) buttons appear.
Wire to profileStore.

### 10. `src/components/settings/SettingsView.tsx`
Max-width 640px. Header: "Settings" title.
Groups with title (13px, weight 600, font-display) + rows:
- **General**: Auto-sync toggle, Auto-update toggle, Telemetry toggle (each with label + description)
- **Registry**: Registry URL input (mono, 260px width)
- **Cloud sync**: Status card (surface-1 bg, borderRadius 10) with Cloud icon + "BYO Cloud Sync" + Connected badge + description + "Open Cloud Sync settings" secondary button (navigates to cloud-sync view)
- **About**: Version (0.1.0-beta), License (MIT), GitHub link (primary color)

For "Open Cloud Sync settings" button, accept an `onNavigate` prop callback.

## Modify: `src/App.tsx`
Replace placeholder CloudSyncView, ProfilesView, SettingsView with real imports:
```
import { CloudSyncView } from './components/cloud-sync/CloudSyncView';
import { ProfilesView } from './components/profiles/ProfilesView';
import { SettingsView } from './components/settings/SettingsView';
```
Pass `onNavigate={setActiveView}` to SettingsView so it can navigate to cloud-sync.

## Existing UI Components
- `Toggle` from `../ui/Toggle` — checked, onChange, size, disabled
- `Btn` from `../ui/Btn` — variant, size, disabled, onClick, children
- `Badge` from `../ui/Badge` — check its props (children, color?, bg?)
- `EmptyState` from `../ui/EmptyState` — icon (string key like "Layers"), title, subtitle

## Type Definitions (add to src/types/index.ts if needed)
```typescript
interface CloudProviderView {
  id: string;
  providerType: string;
  config: Record<string, any>;
}

interface ProfileInfo {
  id: string;
  name: string;
  serverCount: number;
  clientCount: number;
  createdAt: string;
  description: string;
}
```

## Design Token Reference
Same as Phase 6. Key values:
- `--color-canvas`: #010102, `--color-surface-1`: #111214, `--color-surface-2`: #1a1b1f, `--color-surface-3`: #222328
- `--color-ink`: #e8e8ed, `--color-ink-muted`: #a1a1aa, `--color-ink-subtle`: #72727e, `--color-ink-tertiary`: #4b4b57
- `--color-hairline`: #1e1f24, `--color-hairline-strong`: #2c2d35
- `--color-primary`: #5e6ad2, `--color-semantic-success`: #27ae60
- Font families: `--font-display`, `--font-mono`, `--font-text`

## Important
- All icons: lucide-react named imports, NOT `<i data-lucide="...">`
- Inline styles only
- TypeScript strict
- `invoke` from `@tauri-apps/api/core`
- Cloud sync card styles: borderRadius 12, padding 18px 20px, gap 14, surface-1 bg, hairline border
- Secret fields MUST use `type="password"`
