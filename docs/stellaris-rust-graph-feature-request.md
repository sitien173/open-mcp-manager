# Feature Request: Rust Dependency Graph Support in Stellaris

**Repository:** https://github.com/GDM-Pixel/stellaris-code-search
**Date:** 2026-05-16
**Author:** sitienbmt@gmail.com

## Summary

Stellaris already indexes Rust files for semantic search (via tree-sitter-rust) and AST symbol extraction (`get_file_outline`, `get_symbol`). However, the dependency graph (`graph.db`) only resolves JS/TS imports. Rust `mod`, `use`, `pub use`, and `extern crate` statements are not parsed, causing all `.rs` files to appear as orphan nodes in graph analysis.

## Current Behavior

- `search_code` with `.rs` files: **works** (vector + FTS search)
- `get_file_outline` for `.rs` files: **works** (tree-sitter AST — functions, structs, impls, traits, types)
- `get_symbol` for `.rs` files: **works**
- `get_dependencies` / `get_dependents` for `.rs` files: **returns empty** (no graph edges)
- `get_blast_radius` for `.rs` files: **returns empty**
- `get_dead_code`: **false positives** — all `.rs` files flagged as dead (in-degree = 0, out-degree = 0)
- `get_boundary_violations`: **no coverage** for Rust module boundaries
- `project_health` dead code % inflated by orphan `.rs` files

## Root Cause

`src/graph/resolver.ts` only handles JS/TS import resolution:
- `RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']`
- `isResolvableImport()` checks for `.` prefix (relative), `@/`, `~/` — JS/TS patterns
- No awareness of Rust's `mod`, `use`, `pub use`, or `extern crate` syntax
- No resolution of `mod.rs` / `lib.rs` barrel patterns

## Proposed Solution

### Option A: Rust Import Resolver (recommended)

Add a Rust-specific resolver alongside the existing JS/TS one. Rust module resolution rules:

1. **`mod foo;`** in `src/lib.rs` or `src/main.rs` resolves to `src/foo.rs` or `src/foo/mod.rs`
2. **`mod foo;`** in `src/bar.rs` resolves to `src/bar/foo.rs` or `src/bar/foo/mod.rs`
3. **`use crate::foo::bar;`** resolves to the file containing module `foo`, submodule `bar`
4. **`use super::sibling;`** resolves relative to parent module
5. **`pub use` (re-exports)** should create graph edges like JS re-exports
6. **`extern crate`** can be ignored (external dependencies, like npm packages)

### Implementation sketch

```typescript
// src/graph/rust-resolver.ts

const RUST_EXTENSIONS = ['.rs'];

export function resolveRustImports(
  sourceContent: string,
  sourceFilePath: string,  // e.g., "src-tauri/src/commands/mod.rs"
  projectRoot: string,
): ResolvedImport[] {
  const imports: ResolvedImport[] = [];
  
  // 1. Parse `mod foo;` declarations (not `mod foo { ... }` inline)
  const modDecls = sourceContent.matchAll(/^\s*(?:pub\s+)?mod\s+(\w+)\s*;/gm);
  for (const match of modDecls) {
    const modName = match[1];
    const resolved = resolveRustMod(modName, sourceFilePath, projectRoot);
    imports.push({ raw: `mod ${modName}`, resolved });
  }
  
  // 2. Parse `use crate::path::to::module;` 
  const useDecls = sourceContent.matchAll(/^\s*(?:pub\s+)?use\s+crate::(\S+?)\s*[;{]/gm);
  for (const match of useDecls) {
    const usePath = match[1].replace(/::/g, '/').replace(/\{.*/, '');
    const resolved = resolveRustUsePath(usePath, sourceFilePath, projectRoot);
    imports.push({ raw: `use crate::${match[1]}`, resolved });
  }
  
  // 3. Parse `use super::` relative imports
  const superDecls = sourceContent.matchAll(/^\s*(?:pub\s+)?use\s+super::(\S+?)\s*[;{]/gm);
  for (const match of superDecls) {
    const resolved = resolveRustSuperPath(match[1], sourceFilePath, projectRoot);
    imports.push({ raw: `use super::${match[1]}`, resolved });
  }
  
  return imports;
}

function resolveRustMod(
  modName: string, 
  sourceFilePath: string, 
  projectRoot: string
): string | null {
  const sourceDir = dirname(join(projectRoot, sourceFilePath));
  const baseName = basename(sourceFilePath, '.rs');
  
  // If source is mod.rs or lib.rs or main.rs, look in same directory
  // Otherwise look in subdirectory named after the source file
  const lookupDir = ['mod', 'lib', 'main'].includes(baseName) 
    ? sourceDir 
    : join(sourceDir, baseName);
  
  // Try: dir/modName.rs
  const asFile = join(lookupDir, `${modName}.rs`);
  if (existsSync(asFile)) return relative(projectRoot, asFile).replace(/\\/g, '/');
  
  // Try: dir/modName/mod.rs
  const asDir = join(lookupDir, modName, 'mod.rs');
  if (existsSync(asDir)) return relative(projectRoot, asDir).replace(/\\/g, '/');
  
  return null;
}
```

### Changes required

| File | Change |
|------|--------|
| `src/graph/resolver.ts` | Add language dispatch: if `.rs` file, call Rust resolver |
| `src/graph/rust-resolver.ts` | New file: Rust `mod`/`use` parsing + resolution |
| `src/indexer/chunker.ts` | Possibly extract raw import strings from Rust AST (tree-sitter-rust already available) |

### Option B: Exclude Rust from graph (minimal)

If full Rust graph support is too complex, filter `.rs` files from graph-dependent tools:
- `get_dead_code`: skip `.rs` files
- `project_health`: exclude `.rs` from dead code calculation
- `get_boundary_violations`: skip rules where from/to match `.rs` paths

This is less useful but prevents false positives.

## Impact

Projects mixing JS/TS frontend with Rust backend (Tauri, wasm-bindgen, Neon, etc.) are increasingly common. Without Rust graph support:
- `project_health` scores are artificially low (our project: B instead of A due to 50 "dead" `.rs` files)
- `get_dead_code` is noisy — 30+ false positives from Rust modules
- `get_blast_radius` misses Rust-side impact when changing shared types
- `stellaris.boundaries.json` can't enforce Rust module architecture rules

## Test Case

Our project (Open MCP Manager): Tauri v2 app with 42 `.rs` files and 61 `.ts/.tsx` files. After reindex:
- 103 files indexed, 448 chunks
- Graph shows 97 edges (all JS/TS)
- 50 files flagged dead — 30+ are Rust false positives
- Health score penalized 25 points for "54.9% dead code"

With Rust graph support, Rust files would contribute ~40+ additional edges from `mod` declarations and `use` statements, dead code would drop to ~10 files (actual unused), and health score would improve to A.
