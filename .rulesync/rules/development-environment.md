# Development Environment & Build System Guidelines

## CRITICAL: Production Code Over Configuration Changes

**LLM INSTRUCTION**: When encountering compatibility issues (ES2020+, TypeScript errors), PRIORITIZE fixing the actual production code instead of changing build configurations. Configuration changes often hide underlying code quality issues.

```typescript
// ❌ WRONG APPROACH - Changing target to avoid fixing code
// esbuild: { target: 'es2022' }  // Avoiding fixing spread operator

// ✅ CORRECT APPROACH - Fix the actual code
// Instead of: const obj = { ...baseObj, ...updates };
const obj = Object.assign({}, baseObj, updates);  // ES2017 compatible
```

**Configuration changes should be LAST resort, not first response.**

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

## CRITICAL: Pre-Coding Manifest Verification

**LLM INSTRUCTION**: ALWAYS verify the manifest configuration before starting any coding session. Read `figma.manifest.ts` to understand:

1. **Plugin Identity**: Check name, id, version
2. **Capabilities**: Verify enabled features match requirements
3. **Network Access**: Confirm allowed domains for API calls
4. **Editor Support**: Ensure figma/figjam compatibility as needed

```typescript
// ✅ ALWAYS check manifest first
// 1. Read figma.manifest.ts
// 2. Verify plugin ID is not '0000000000000000000'
// 3. Confirm capabilities match feature requirements
// 4. Check networkAccess for external API needs

// Example manifest verification:
if (manifest.id === '0000000000000000000') {
  // Generate unique plugin ID for development
}

if (requiresNetworkAccess && manifest.networkAccess?.allowedDomains[0] === 'none') {
  // Add required domains to networkAccess
}
```

## CRITICAL: Avoid Manifest Property Errors

**LLM INSTRUCTION**: Only use officially supported manifest properties to prevent "unexpected extra property" errors:

### ✅ Officially Supported Properties
```typescript
interface PluginManifest {
  name: string;              // Required
  id: string;               // Required
  api: string;              // Required ('1.0.0')
  main: string;             // Required ('code.js')
  ui?: string;              // Optional ('index.html')
  capabilities?: string[];   // ['inspect', 'export', 'codegen', 'textreview']
  enableProposedApi?: boolean;
  editorType?: Array<'figma' | 'figjam'>;
  networkAccess?: { allowedDomains: string[] };
  parameters?: Array<{ name: string; key: string; description?: string }>;
  menu?: Array<{ name: string; command: string; parameters?: Record<string, string> }>;
  relaunchButtons?: Array<{ command: string; name: string }>;
}
```

### ❌ NEVER Use These Properties
```typescript
// These cause "unexpected extra property" errors:
// description: string     // Not supported
// author: string         // Not supported  
// version: string        // Not supported
// keywords: string[]     // Not supported
// homepage: string       // Not supported
```

**NEVER start coding without understanding the current manifest configuration.**

## CRITICAL: Remove Demo Code When Building Real Features

**LLM INSTRUCTION**: When user requests to build their actual plugin features, ALWAYS remove/replace the demo boilerplate code first.

### Demo Code to Remove

```typescript
// ❌ DELETE these demo functions when starting real development:
- createRectangleNode() functions
- createRandomShape() functionality  
- useRandomShapeGenerator hook
- Demo message handlers in plugin/main.ts
- Sample UI components showing rectangles/shapes

// ✅ REPLACE with user's actual requirements:
- User-specific API functions
- Real business logic hooks
- Actual UI components for the feature
- Proper message handlers for real functionality
```

### Cleanup Process

1. **Ask User**: "What specific functionality do you want to implement?"
2. **Remove Demo Code**: Delete all `createRectangle*` and `createRandomShape*` related code
3. **Clean Messages**: Remove demo message types from `src/common/messages.ts`
4. **Update UI**: Replace demo buttons/panels with actual feature UI
5. **Implement Real Logic**: Build user's requested functionality

```typescript
// ✅ EXAMPLE: Clean removal and replacement
// Before: Demo rectangle creation
function handleCreateRectangle(msg: CreateRectangleMessage): void { ... }

// After: User's actual feature
function handleUserFeature(msg: UserFeatureMessage): void { 
  // Real implementation based on user requirements
}
```

**Remember**: Demo code is ONLY for showing plugin structure - always replace with real features.**

## CRITICAL: Code Compatibility Over Configuration

**LLM INSTRUCTION**: When encountering ES2020+ compatibility errors, fix the production code rather than changing build targets. Figma's plugin environment has specific JavaScript compatibility requirements.

```typescript
// ❌ WRONG APPROACH - Changing build target to avoid code fixes
// esbuild: { target: 'es2022' }

// ✅ CORRECT APPROACH - Fix the actual code for ES2017 compatibility

// 1. Optional Catch Binding (ES2019) → ES2017
// ❌ ES2019: catch { }
try {
  riskyOperation();
} catch {  // ERROR in Figma!
  handleError();
}

// ✅ ES2017: catch (error)
try {
  riskyOperation();
} catch (error) {  // Compatible with Figma
  handleError();
}

// 2. Spread Operators in Objects
// ❌ ES2018: { ...obj, prop: value }
const newObj = { ...baseObj, updatedProp: newValue };

// ✅ ES2017: Object.assign()
const newObj = Object.assign({}, baseObj, { updatedProp: newValue });

// 3. Optional Chaining (ES2020)
// ❌ ES2020: obj?.prop?.method?.()
const result = obj?.prop?.method?.();

// ✅ ES2017: Explicit null checks
const result = obj && obj.prop && obj.prop.method ? obj.prop.method() : undefined;

// 4. Nullish Coalescing (ES2020)
// ❌ ES2020: value ?? defaultValue
const finalValue = inputValue ?? defaultValue;

// ✅ ES2017: Explicit undefined/null checks
const finalValue = (typeof inputValue !== 'undefined' && inputValue !== null) 
  ? inputValue 
  : defaultValue;

// 5. Array.flat() (ES2019)
// ❌ ES2019: array.flat()
const flattened = nestedArray.flat();

// ✅ ES2017: Manual flattening
const flattened = nestedArray.reduce((acc, val) => acc.concat(val), []);
```

**LLM INSTRUCTION**: This development environment ensures reliable, type-safe plugin development with optimal DX for AI-assisted coding.
