# Development Environment & Build System Guidelines

## CRITICAL: Figma Desktop App Requirement

**LLM INSTRUCTION**: Always inform users that the Figma desktop app is MANDATORY for plugin development. Browser version cannot run local plugins.

```typescript
// ❌ IMPOSSIBLE - Browser Figma cannot load local plugins
// ✅ REQUIRED - Figma Desktop App only
```

## Build System Architecture (Vite Dual-Process)

### Build Configuration Understanding

This boilerplate uses **TWO separate Vite configs**:

1. `vite.config.plugin.ts` - Builds plugin thread (`src/plugin/main.ts` → `dist/code.js`)
2. `vite.config.ui.ts` - Builds UI thread (`src/ui/main.tsx` → `dist/index.html`)

**LLM INSTRUCTION**: Never attempt to merge these configs. The dual-process nature requires separate compilation.

### Build Process Rules

```bash
# ✅ CORRECT - Development with auto-rebuild
pnpm run dev  # Watches both plugin and UI

# ✅ CORRECT - Production build
pnpm run build  # Builds both + manifest

# ❌ WRONG - Don't build individually unless debugging
pnpm run build:plugin  # Plugin only (breaks workflow)
```

### TypeScript Compilation & Watch Mode

**CRITICAL**: TypeScript files MUST be compiled to JavaScript before Figma can load them.

```json
// vite.config.plugin.ts - ES2017 for Figma compatibility
esbuild: {
  target: 'es2017', // NOT es2020+ (Figma limitation)
  format: 'cjs',
}
```

**LLM INSTRUCTION**: When users report "code changes not reflected," check if dev mode is running.

## Manifest & Path Configuration

### manifest.json Generation

```typescript
// figma.manifest.ts - Type-safe manifest
export default {
  name: "Plugin Name",
  main: 'code.js',        // MUST match plugin build output
  ui: 'index.html',       // MUST match UI build output
  editorType: ["figma"],  // ALWAYS specify supported editors
} satisfies Manifest;
```

**Common Mistakes**:
- ❌ Wrong file paths in manifest
- ❌ Missing `editorType` specification
- ❌ Hardcoded values instead of dynamic generation

### NetworkAccess Configuration

```typescript
// Only add if external API access is needed
networkAccess: {
  allowedDomains: [
    "https://api.specific-service.com",  // ✅ Specific domains
    // "https://*"  // ❌ Avoid wildcards (review rejection)
  ]
}
```

## Debugging Setup & Console Management

### Dual Console System

**CRITICAL**: Figma plugins have TWO separate consoles:

1. **Plugin Thread Console**: Figma → Plugins → Development → Open Console
2. **UI Thread Console**: Right-click UI → Inspect → Console tab

```typescript
// Plugin thread (src/plugin/main.ts)
console.log('This appears in Figma console');

// UI thread (src/ui/)
console.log('This appears in browser DevTools');
```

**LLM INSTRUCTION**: When debugging, always specify which console to check.

### Source Maps Configuration

```typescript
// vite.config.plugin.ts
export default defineConfig({
  build: {
    sourcemap: 'inline',  // ✅ Essential for debugging
    // sourcemap: false   // ❌ Makes debugging impossible
  }
});
```

## Dependency Management & Bundle Optimization

### Bundle Size Optimization

```bash
# Check bundle size
pnpm run build
ls -la dist/  # code.js should be < 1MB ideally
```

**Performance Rules**:
- Use `devDependencies` for build-only packages
- Enable tree-shaking in Vite config
- Avoid heavy libraries in plugin thread

### Type Definition Management

```json
// tsconfig.plugin.json - Plugin thread types
{
  "compilerOptions": {
    "types": ["@figma/plugin-typings"],  // ✅ Figma API types
    "lib": ["ES2017"],                   // ✅ Match esbuild target
    // "dom" // ❌ NOT available in plugin thread
  }
}

// tsconfig.ui.json - UI thread types  
{
  "compilerOptions": {
    "types": ["node"],
    "lib": ["ES2022", "DOM"],  // ✅ Browser APIs available
    // "@figma/plugin-typings"  // ❌ NOT available in UI thread
  }
}
```

## Environment-Specific Development

### Development vs Production

```typescript
// Use environment detection for dev features
if (process.env.NODE_ENV === 'development') {
  // Debug helpers, mock data, performance monitoring
  window.__PLUGIN_DEBUG__ = {
    selection: () => figma.currentPage.selection,
    createTestData: () => { /* ... */ }
  };
}
```

### Hot Module Replacement (HMR)

```typescript
// src/ui/main.tsx - HMR for UI development
// @ts-ignore
if (import.meta?.hot) {
  // @ts-ignore
  import.meta.hot.accept('./components/App', () => {
    root.render(<React.StrictMode><App /></React.StrictMode>);
  });
}
```

## Error Detection & Prevention

### Common Build Failures

**Plugin build fails** (`code.js` not generated):
- ✅ Check `src/plugin/main.ts` syntax errors
- ✅ Verify `vite.config.plugin.ts` paths
- ✅ Ensure `figma` types are available

**UI build fails** (`index.html` not generated):
- ✅ Check React component errors
- ✅ Verify shadcn/ui imports
- ✅ Check Tailwind CSS processing

**Figma can't load plugin**:
- ✅ Verify `dist/manifest.json` paths
- ✅ Check file permissions
- ✅ Ensure Figma Desktop App (not browser)

### Automated Quality Checks

```json
// package.json - Pre-build validation
"scripts": {
  "build": "pnpm run clean && pnpm run lint:check && pnpm run typecheck && pnpm run build:plugin && pnpm run build:ui && pnpm run build:manifest",
}
```

**LLM INSTRUCTION**: Always run quality checks before build to catch issues early.

## VS Code Integration

### Essential Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "biomejs.biome",           // Linting & formatting
    "bradlc.vscode-tailwindcss", // Tailwind support
    "ms-vscode.vscode-typescript-next" // TypeScript
  ]
}
```

### Settings for Plugin Development

```json
// .vscode/settings.json
{
  "biome.enabled": true,
  "biome.lspBin": "./node_modules/@biomejs/biome/bin/biome",
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "css.validate": false,  // Let Tailwind handle CSS
}
```

## Development Workflow Best Practices

### Efficient Development Loop

1. **Setup**: `pnpm install` + `pnpm run rules:generate`
2. **Development**: `pnpm run dev` (auto-rebuild)
3. **Testing**: Load plugin in Figma Desktop
4. **Quality**: `pnpm run auto-lint` before commit
5. **Build**: `pnpm run build` for production

### Node.js Compatibility

```typescript
// Use node: protocol for Node.js imports
import { execSync } from 'node:child_process';
import path from 'node:path';

// ❌ Avoid legacy imports
// import path from 'path';
```

**LLM INSTRUCTION**: This development environment ensures reliable, type-safe plugin development with optimal DX for AI-assisted coding.
