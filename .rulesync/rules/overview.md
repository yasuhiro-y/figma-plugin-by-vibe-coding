---
root: true
targets: ["*"]
description: "Figma Plugin Vibe Coding Boilerplate - Professional TypeScript plugin development with shadcn/ui"
globs: ["**/*"]
---

# Figma Plugin Technical Architecture

## Core Technology Stack

- **TypeScript 5.6+**: Strict typing with explicit annotations across all layers
- **React 18**: Modern functional components with hooks and strict mode
- **shadcn/ui**: Complete component system with Tailwind CSS
- **Vite**: Dual-process build configuration (plugin + UI)
- **Zod**: Runtime schema validation for message contracts
- **Figma Plugin Typings**: Always kept at latest version (auto-enforced). See plugin-api.d.ts for complete API reference.

## Dual-Process Architecture (CRITICAL)

Figma plugins execute in TWO completely isolated JavaScript contexts:

1. **Plugin Thread** (`src/plugin/`)
   - Sandboxed environment with Figma API access only
   - NO browser APIs (DOM, fetch, localStorage, window)
   - Communication: `figma.ui.postMessage()` → UI

2. **UI Thread** (`src/ui/`)
   - Standard browser iframe with full Web APIs
   - NO Figma API access (cannot use `figma` namespace)
   - Communication: `parent.postMessage()` → Plugin

**Rule**: Treat as separate applications - ALL communication must use postMessage.

## Code Generation Standards

### Mandatory TypeScript Patterns

```typescript
// ✅ REQUIRED - Explicit function signatures
function createNode(width: number, height: number): Promise<string>

// ✅ REQUIRED - Result pattern for error handling  
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// ✅ REQUIRED - Zod validation for external data
const MessageSchema = z.object({
  type: z.enum(['create', 'update', 'delete']),
  payload: z.unknown()
});
```

### UI Component Standards

```typescript
// ✅ CORRECT - shadcn/ui only
import { Card, CardContent } from '@/components/ui/card';

// ❌ FORBIDDEN - Custom CSS/styling
// className="custom-style" style={{ color: 'red' }}
```

## Development Guidelines

1. **Type Safety**: All parameters and returns must have explicit types
2. **shadcn/ui Exclusive**: No custom CSS - use component library only
3. **Error Boundaries**: Handle all failures with Result pattern
4. **Message Contracts**: Type-safe communication via `src/common/messages.ts`
5. **Font Loading**: Always load fonts before text operations (see plugin-api.d.ts for methods)
