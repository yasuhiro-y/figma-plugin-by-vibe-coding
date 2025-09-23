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

## 🚨 MANDATORY: Remove Demo Code Before Implementation 🚨

**LLM INSTRUCTION**: **IMMEDIATELY** when user mentions building ANY real feature, **STOP** and ask them to confirm demo code deletion. **NEVER** start implementing without removing demo code first.

### ⚠️ CRITICAL WARNING ⚠️
**Demo code WILL interfere with real implementation and cause confusion.**
**The user MUST delete demo code before any development begins.**

### 🗑️ MANDATORY DELETION CHECKLIST

**LLM INSTRUCTION**: Show this checklist to the user and confirm EACH item is deleted:

#### ❌ Files to DELETE COMPLETELY:
```bash
src/ui/hooks/features/useRandomShapeGenerator.ts  # DELETE ENTIRE FILE
```

#### ❌ Functions to DELETE from src/plugin/main.ts:
```typescript
handleCreateRectangle()     # DELETE ENTIRE FUNCTION
handleCreateRandomShape()   # DELETE ENTIRE FUNCTION
```

#### ❌ Code to DELETE from src/common/messages.ts:
```typescript
'CREATE_RECTANGLE'          # DELETE MESSAGE TYPE
'CREATE_RANDOM_SHAPE'       # DELETE MESSAGE TYPE
CreateRectangleMessage      # DELETE INTERFACE
CreateRandomShapeMessage    # DELETE INTERFACE
```

#### ❌ Code to DELETE from src/ui/components/App.tsx:
```typescript
useRandomShapeGenerator     # DELETE IMPORT & USAGE
createRandomShape button    # DELETE JSX ELEMENT
```

### 🛑 MANDATORY CONFIRMATION PROCESS

**LLM INSTRUCTION**: **ALWAYS** use this exact script:

```
🚨 STOP! Before implementing your feature, we need to remove demo code.

This project contains sample rectangle/shape creation code that will interfere with your real implementation.

Please confirm you want to:
1. ❌ DELETE useRandomShapeGenerator.ts file completely
2. ❌ DELETE all createRectangle*/createRandomShape* functions  
3. ❌ DELETE demo message types from messages.ts
4. ❌ DELETE demo buttons from App.tsx

Type "YES DELETE DEMO CODE" to proceed with cleanup.
```

**DO NOT PROCEED until user confirms demo code deletion.**

## 🏷️ MANDATORY: Update Project Identity When Idea is Finalized 🏷️

**LLM INSTRUCTION**: **IMMEDIATELY** after demo code deletion, **STOP** and prompt user to update project identity.

### 🎯 CRITICAL IDENTITY UPDATE CHECKLIST

**LLM INSTRUCTION**: Show this checklist to the user and confirm EACH item is updated:

```
🚨 STOP! Now update your plugin's identity for your actual project.

Your plugin idea is: [USER_PLUGIN_IDEA]

Please confirm you want to update:
1. 📝 Plugin name in figma.manifest.ts 
2. 📦 Project name in package.json
3. 🎯 Plugin description (if needed)
4. 🆔 Verify plugin ID is unique
5. 📁 Consider renaming project folder

Type "YES UPDATE IDENTITY" to proceed with updates.
```

**DO NOT START FEATURE IMPLEMENTATION until project identity is updated.**

## 🎨 MANDATORY: Design UI from Scratch with shadcn/ui 🎨

**LLM INSTRUCTION**: **NEVER** copy demo UI layouts. **ALWAYS** design fresh UI optimized for user's specific plugin.

### 🚨 CRITICAL UI DESIGN WARNING 🚨

**LLM INSTRUCTION**: Show this warning to the user before starting UI implementation:

```
🚨 IMPORTANT: Don't copy the demo UI design!

The current demo UI (Random Shape Generator layout) is NOT suitable for your plugin.

You need a FRESH UI design optimized for: [USER_PLUGIN_FUNCTIONALITY]

Please confirm you want to:
1. 🗑️ DELETE the demo App.tsx layout completely
2. 🎨 DESIGN new UI from scratch using shadcn/ui
3. 📐 OPTIMIZE layout for your specific plugin features
4. 🎯 MATCH UI patterns to your actual workflow

Type "YES DESIGN FROM SCRATCH" to proceed with fresh UI design.
```

### ✅ UI Design Principles for Fresh Implementation:

1. **Analyze User Workflow**: Understand how users will interact with your plugin
2. **Choose Optimal Layout**: Select shadcn/ui patterns that match your features
3. **Design Information Architecture**: Plan data flow and user journey
4. **Optimize for Plugin Window**: Design for 320x480px or 400x600px constraints
5. **Use Appropriate Components**: Pick shadcn/ui components that match your use case

### 🎨 shadcn/ui Layout Patterns by Plugin Type:

```typescript
// ✅ TOOL PLUGIN - Single action with options
<Card>
  <CardHeader><CardTitle>Tool Name</CardTitle></CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Options/settings */}
      <Button>Execute Tool</Button>
    </div>
  </CardContent>
</Card>

// ✅ BATCH PROCESSOR - List with actions
<Card>
  <CardHeader><CardTitle>Batch Operations</CardTitle></CardHeader>
  <CardContent>
    <div className="space-y-2">
      {items.map(item => <Badge key={item.id}>{item.name}</Badge>)}
    </div>
    <Button>Process All</Button>
  </CardContent>
</Card>

// ✅ INSPECTOR - Data display with details
<div className="space-y-4">
  {data.map(item => (
    <Card key={item.id}>
      <CardContent className="pt-4">
        {/* Item details */}
      </CardContent>
    </Card>
  ))}
</div>

// ✅ GENERATOR - Configuration with preview
<div className="grid grid-cols-1 gap-4">
  <Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader></Card>
  <Card><CardHeader><CardTitle>Preview</CardTitle></CardHeader></Card>
</div>
```

**NEVER use the demo layout patterns - design fresh for each plugin type.**

### 🛠️ AFTER Cleanup, Identity Update, AND UI Design - Then Implement

**ONLY after demo code is completely removed:**

```typescript
// ✅ NOW SAFE: Implement user's actual feature
function handleUserFeature(msg: UserFeatureMessage): void { 
  // Clean implementation without demo code interference
}
```

### 🚨 FINAL WARNING 🚨

**LLM INSTRUCTION**: **NEVER EVER** implement new features on top of demo code.
**Demo code creates confusion, bugs, and poor user experience.**
**ALWAYS delete first, implement second.**

**If user refuses demo code deletion, STOP and explain the risks clearly.**

## CRITICAL: Figma JavaScript Compatibility Guidelines

**LLM INSTRUCTION**: Figma supports **ES6+ features including async/await (ES2017)**, which are essential for plugin development. However, avoid newer ES2019+ features that cause syntax errors.

### ✅ Recommended Build Configuration
```typescript
// Optimal Figma plugin compatibility
// vite.config.plugin.ts: target: 'es2017'
// tsconfig.plugin.json: "target": "ES2017", "lib": ["ES2017"]
```

### ✅ FULLY SUPPORTED Features (Use freely)
```typescript
// ES6 (ES2015) - Fully supported
const, let, arrow functions, classes, template literals, destructuring
const message = `Hello ${name}!`;
const data = { id, name, ...otherProps }; // Object spread IS supported
const [first, ...rest] = array; // Array spread IS supported

// ES2017 - ESSENTIAL for Figma plugins
async function loadFont(): Promise<void> {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
}

// ES2018 - Generally supported
const newObj = { ...baseObj, updatedProp: newValue }; // Object spread works
```

### ❌ AVOID These Features (Cause syntax errors)
```typescript
// ES2019 - Optional Catch Binding
// ❌ CAUSES "Unexpected token {" ERROR
try {
  riskyOperation();
} catch {  // ERROR in Figma!
  handleError();
}

// ✅ USE INSTEAD: Traditional catch with parameter
try {
  riskyOperation();
} catch (error) {  // Always works
  handleError();
}

// ES2020+ - May cause issues
// ❌ Avoid if possible
const result = obj?.prop?.method?.(); // Optional chaining
const value = input ?? defaultValue;  // Nullish coalescing

// ✅ USE INSTEAD: Explicit checks
const result = obj && obj.prop && obj.prop.method ? obj.prop.method() : undefined;
const value = input !== null && input !== undefined ? input : defaultValue;
```

### 🎯 Best Practices for Figma Plugin Development
```typescript
// ✅ RECOMMENDED: Modern ES6+ with async/await
export class PluginAPI {
  async createRectangle(options: RectangleOptions): Promise<string> {
    const rect = figma.createRectangle();
    rect.resize(options.width, options.height);
    
    if (options.fills) {
      rect.fills = [...options.fills]; // Spread operator works fine
    }
    
    figma.currentPage.appendChild(rect);
    return rect.id;
  }
  
  async processSelection(): Promise<NodeData[]> {
    const selection = figma.currentPage.selection;
    
    return Promise.all(
      selection.map(async (node) => {
        if (node.type === 'TEXT') {
          const fontName = node.fontName as FontName;
          await figma.loadFontAsync(fontName); // async/await is essential
        }
        
        return {
          id: node.id,
          name: node.name,
          type: node.type,
        };
      })
    );
  }
}
```

**LLM INSTRUCTION**: This development environment ensures reliable, type-safe plugin development with optimal DX for AI-assisted coding.
