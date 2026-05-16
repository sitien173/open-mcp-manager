# Phase 8: Command Palette + Toast Wiring + Polish

## Task
Create `src/components/command-palette/CommandPalette.tsx` and modify `src/App.tsx` to wire it up with Ctrl+K shortcut and connect the existing toast store.

## File 1: src/components/command-palette/CommandPalette.tsx

### Design Spec
- 520px centered, top offset -80px (above center)
- Dark backdrop overlay (rgba(0,0,0,0.5)), zIndex 2000
- Search input at top: Lucide `Search` icon (14px) + text input + ESC badge (11px text, surface-3 bg, rounded-sm, padding 2px 6px)
- Grouped results: "Navigation" group (6 items mapping to views) + "Servers" group (from registry entries)
- Navigation items: Marketplace (Package icon), Installed (CheckCircle2), Clients (Monitor), Cloud Sync (Cloud), Profiles (Layers), Settings (Settings)
- Server items: show server name with Plug icon
- Each result item: 7px border radius, padding 8px 12px, flex row with icon (14px) + label (13px)
- Selected item: surface-2 background
- Keyboard: Arrow Up/Down moves selection, Enter executes, ESC closes
- Click on item also executes
- Clicking backdrop closes
- Navigation items call onNavigate(viewId)
- Server items call onSelectServer(server)
- Filter: typing in search filters both groups by label match (case-insensitive)
- Animation: modalIn (translateY(8px) scale(0.98) opacity(0) → 0 1 1, 0.18s ease)

### Props
```typescript
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  servers: Array<{ id: string; name: string }>;
  onSelectServer: (id: string) => void;
}
```

### Important
- Import icons from lucide-react as named imports: `import { Search, Package, CheckCircle2, Monitor, Cloud, Layers, Settings, Plug } from 'lucide-react'`
- Use CSS custom properties from tokens.css (--color-surface-1, --color-surface-2, --color-hairline, --color-ink, --color-ink-subtle, --color-ink-tertiary)
- Use inline styles (CSS-in-JS) matching the existing codebase pattern
- Auto-focus search input when opened
- Reset search and selection index when opened

## File 2: src/App.tsx modifications

### Current state
- Already imports ToastContainer and manages toasts via local state (addToast/removeToast)
- A global `useToastStore` already exists at `src/stores/toastStore.ts` with `toasts`, `addToast`, `removeToast`
- Need to: replace local toast state with toastStore, add CommandPalette with Ctrl+K shortcut

### Changes needed
1. Add import for CommandPalette: `import { CommandPalette } from './components/command-palette/CommandPalette'`
2. Add import for toastStore: `import { useToastStore } from './stores/toastStore'`
3. Replace local toasts state + addToast + removeToast with `useToastStore()` destructuring
4. Add `const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)`
5. Add useEffect for Ctrl+K: `if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setCmdPaletteOpen(prev => !prev); }`
6. Render CommandPalette before ToastContainer:
```tsx
<CommandPalette
  open={cmdPaletteOpen}
  onClose={() => setCmdPaletteOpen(false)}
  onNavigate={(v) => { setActiveView(v as ViewID); setCmdPaletteOpen(false); }}
  servers={registryStore.entries.map(e => ({ id: e.id, name: e.name }))}
  onSelectServer={(id) => {
    const s = registryStore.entries.find(e => e.id === id);
    if (s) { registryStore.setSelectedServer(s); setCmdPaletteOpen(false); }
  }}
/>
```
7. Keep ToastContainer but wire to toastStore: `<ToastContainer toasts={toasts} onDismiss={removeToast} />`

### Current App.tsx imports for reference
```typescript
import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ViewID } from './components/layout/Sidebar';
import { ToastContainer, ToastItem } from './components/ui/Toast';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { DetailPanel } from './components/detail/DetailPanel';
import { useRegistryStore } from './stores/registryStore';
import { useClientStore } from './stores/clientStore';
import { useInstalledStore } from './stores/installedStore';
import { InstalledView } from './components/installed/InstalledView';
import { ClientsView } from './components/clients/ClientsView';
import { CloudSyncView } from './components/cloud-sync/CloudSyncView';
import { ProfilesView } from './components/profiles/ProfilesView';
import { SettingsView } from './components/settings/SettingsView';
```

## Style Tokens Reference
- --color-canvas: #010102
- --color-surface-1: #16181d
- --color-surface-2: #1e2028
- --color-surface-3: #26282f
- --color-hairline: #23252a
- --color-ink: #f7f8f8
- --color-ink-subtle: #8a8f98
- --color-ink-tertiary: #62666d
- --color-primary: #5e6ad2
- --font-display: Inter, system-ui
- --font-text: Inter, system-ui

## Existing patterns
- All components use inline styles with `as React.CSSProperties` casts
- Icons imported as named imports from lucide-react
- Zustand stores via `create<State>((set) => ({...}))`
