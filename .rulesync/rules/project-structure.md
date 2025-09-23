# Project Structure Guidelines for AI Development

## Complete Project Architecture

This boilerplate follows a **feature-based organization** with strict **dual-process architecture** boundaries for Figma plugin development. 

### Overall Directory Structure

```
figma-plugin-vibe-coding-boilerplate/
├── src/
│   ├── plugin/               # PLUGIN THREAD - Figma API only
│   │   └── main.ts           # Entry point, NO React/DOM
│   ├── ui/                   # UI THREAD - React + Browser APIs
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks (core vs features)
│   │   ├── styles/           # Global CSS + Tailwind
│   │   ├── lib/              # UI utilities
│   │   └── main.tsx          # UI entry point
│   └── common/               # SHARED - Types, constants, contracts
│       ├── messages.ts       # Communication protocol
│       ├── types.ts          # Data structures
│       └── constants.ts      # Shared constants
├── dist/                     # BUILD OUTPUT
│   ├── code.js              # Plugin thread bundle
│   ├── index.html           # UI thread bundle + HTML
│   └── manifest.json        # Generated manifest
├── .rulesync/               # AI DEVELOPMENT RULES
│   └── rules/               # Comprehensive guidelines
└── build configs...         # Vite, TypeScript, Tailwind
```

**LLM INSTRUCTION**: NEVER mix plugin thread code (`figma.*`) with UI thread code (React, DOM). Shared code goes in `common/` only.

## Hook Organization Philosophy

This boilerplate follows a clear separation between **core boilerplate functionality** and **user-specific features**.

### Core Hooks (`src/ui/hooks/core/`)

These hooks are **part of the boilerplate** and should NOT be modified when creating custom plugins:

```typescript
// ✅ CORE - Always available, don't modify
src/ui/hooks/core/
├── useFigmaPlugin.ts     # Figma communication & selection management
├── usePluginStorage.ts   # Local storage for plugin data (future)
├── usePluginTheme.ts     # Theme management (future)
└── index.ts              # Core hook exports
```

**When to use core hooks:**
- Basic Figma API communication
- Plugin lifecycle management
- Standard UI interactions (selection, notifications)
- Storage and settings management

### Feature Hooks (`src/ui/hooks/features/`)

These hooks contain **plugin-specific business logic** and should be created by users:

```typescript
// ✅ FEATURES - Plugin-specific, create your own
src/ui/hooks/features/
├── useColorPalette.ts       # For color palette plugins
├── useImageOptimization.ts  # For image processing plugins
├── useDesignTokens.ts       # For design system plugins
├── useDataVisualization.ts  # For chart/data plugins
└── index.ts                 # Feature hook exports
```

**When to create feature hooks:**
- Complex business logic for specific plugin functionality
- API integrations for external services
- Custom data processing and transformations
- Plugin-specific UI state management

## Hook Development Patterns

### Core Hook Example (Boilerplate - Don't Modify)
```typescript
// src/ui/hooks/core/useFigmaPlugin.ts
export function useFigmaPlugin(options: UseFigmaPluginOptions = {}): UseFigmaPluginReturn {
  // Standard Figma communication logic that ALL plugins need
  const [selection, setSelection] = useState<NodeData[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  // Standard plugin operations
  const createRectangle = useCallback((options) => { /* ... */ }, []);
  const getSelection = useCallback(() => { /* ... */ }, []);
  
  return { selection, isConnected, createRectangle, getSelection };
}
```

### Feature Hook Example (User Creates)
```typescript
// src/ui/hooks/features/useRandomShapeGenerator.ts
export function useRandomShapeGenerator() {
  const { createRandomShape } = useFigmaPlugin(); // Use core functionality
  const [generatedCount, setGeneratedCount] = useState(0);
  
  // Plugin-specific business logic
  const generateShape = useCallback(async () => {
    await createRandomShape();
    setGeneratedCount(prev => prev + 1);
  }, [createRandomShape]);
  
  const resetCounter = useCallback(() => {
    setGeneratedCount(0);
  }, []);
  
  return { generatedCount, generateShape, resetCounter };
}
```

## Import Patterns

### Recommended Import Style
```typescript
// ✅ BEST - Import from main hooks index
import { useFigmaPlugin, useMyFeature } from '@/hooks';

// ✅ GOOD - Import from specific categories  
import { useFigmaPlugin } from '@/hooks/core';
import { useMyFeature } from '@/hooks/features';
```

### Path Alias Configuration
Ensure your `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "paths": {
      "@/hooks": ["./src/ui/hooks"],
      "@/hooks/*": ["./src/ui/hooks/*"],
      "@/components": ["./src/ui/components"],
      "@/components/*": ["./src/ui/components/*"]
    }
  }
}
```

## Component Integration

### Smart vs UI Component Pattern
```typescript
// ✅ Smart Component - Uses hooks for business logic
export function RandomShapeGenerator(): JSX.Element {
  // Core boilerplate functionality
  const { isConnected } = useFigmaPlugin();
  
  // Plugin-specific feature logic
  const { generatedCount, generateShape, resetCounter } = useRandomShapeGenerator();
  
  return (
    <RandomShapeGeneratorUi
      isConnected={isConnected}
      generatedCount={generatedCount}
      onGenerate={generateShape}
      onReset={resetCounter}
    />
  );
}

// ✅ UI Component - Pure presentation
interface RandomShapeGeneratorUiProps {
  readonly isConnected: boolean;
  readonly generatedCount: number;
  readonly onGenerate: () => void;
  readonly onReset: () => void;
}

export function RandomShapeGeneratorUi(props: RandomShapeGeneratorUiProps): JSX.Element {
  // Only shadcn/ui components and presentation logic
  return (
    <Card>
      <CardHeader>
        <CardTitle>Random Shape Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={props.onGenerate} disabled={!props.isConnected}>
          Generate Shape
        </Button>
        <div>Generated: {props.generatedCount}</div>
      </CardContent>
    </Card>
  );
}
```

## Benefits of This Structure

### For Boilerplate Maintainers
- Core functionality can be updated independently
- Breaking changes are isolated to core hooks
- Feature hooks remain stable across boilerplate updates

### For Plugin Developers  
- Clear separation of concerns
- Easy to understand what's boilerplate vs custom code
- Can focus on plugin-specific logic without worrying about breaking base functionality
- Easy to share feature hooks between projects

### For LLM Code Generation
- Clear instructions on where to place different types of hooks
- Prevents accidental modification of core boilerplate code
- Makes it easier to generate appropriate feature hooks

## Migration Guide

When updating from older versions:
1. Move plugin-specific hooks to `src/ui/hooks/features/`
2. Keep using core hooks from `src/ui/hooks/core/`
3. Update imports to use the new structure
4. Export custom hooks from `src/ui/hooks/features/index.ts`

## AI Development Rules Integration

### Rule File Structure

The `.rulesync/rules/` directory contains comprehensive guidelines for AI-assisted development:

```
.rulesync/rules/
├── overview.md                    # High-level project overview
├── development-environment.md     # Build, debug, tooling
├── figma-plugin-architecture.md   # Dual-process model, communication
├── figma-api-fundamentals.md      # API usage, async patterns
├── node-manipulation.md           # Safe node operations  
├── ui-development.md              # React, iframe, theming
├── performance-optimization.md    # Memory, speed, efficiency
├── user-experience.md             # UX patterns, feedback
├── advanced-features.md           # Complex APIs, integrations
├── ecosystem-integration.md       # Security, publishing
├── typescript-patterns.md         # Type safety, patterns
├── shadcn-ui-guidelines.md        # UI components, styling
└── project-structure.md           # This file
```

**LLM INSTRUCTION**: Always reference these rule files when generating code. They contain detailed patterns, best practices, and common pitfalls to avoid.

### Code Generation Guidelines

When generating code, follow this decision tree:

1. **Determine Thread**: Plugin thread (`figma.*`) or UI thread (React)?
2. **Check Hook Type**: Core functionality or plugin-specific feature?  
3. **Reference Rules**: Which rule files apply to this code?
4. **Apply Patterns**: Use established patterns from relevant rules
5. **Validate Safety**: Check against anti-patterns and limitations

### Common Code Locations

```typescript
// ✅ PLUGIN THREAD - Figma API operations
// Location: src/plugin/main.ts
figma.ui.onmessage = async (msg: UIMessage) => {
  switch (msg.type) {
    case 'create-rectangle':
      // Handle Figma API operations
      break;
  }
};

// ✅ UI THREAD - React components  
// Location: src/ui/components/FeatureName.tsx
export function FeatureName(): JSX.Element {
  const { isConnected } = useFigmaPlugin();
  const { featureState } = useFeatureHook();
  return <FeatureNameUi {...props} />;
}

// ✅ SHARED - Communication contracts
// Location: src/common/messages.ts
export interface CreateRectangleMessage {
  type: 'create-rectangle';
  width: number;
  height: number;
}

// ✅ FEATURE HOOK - Plugin-specific logic
// Location: src/ui/hooks/features/useFeatureName.ts  
export function useFeatureName() {
  const { sendMessage } = useFigmaPlugin();
  // Feature-specific business logic
}
```

## File Naming Conventions

### Component Files
- **Smart Components**: `ComponentName.tsx` (business logic)
- **UI Components**: `ComponentNameUi.tsx` (presentation only)
- **Component Types**: `ComponentName.types.ts` (if complex)

### Hook Files  
- **Core Hooks**: `useCoreFunction.ts` (boilerplate functionality)
- **Feature Hooks**: `useFeatureName.ts` (plugin-specific logic)
- **Hook Types**: `useHookName.types.ts` (if complex)

### Utility Files
- **Plugin Utils**: `src/plugin/utils/utilName.ts`
- **UI Utils**: `src/ui/lib/utilName.ts`
- **Shared Utils**: `src/common/utilName.ts`

## Import Order & Organization

```typescript
// ✅ RECOMMENDED IMPORT ORDER
// 1. Node.js / External libraries
import { z } from 'zod';
import React, { useState, useCallback } from 'react';

// 2. Internal shared types/constants  
import type { UIMessage, PluginMessage } from '../common/messages';
import { UI_DIMENSIONS } from '../common/constants';

// 3. Core hooks (boilerplate)
import { useFigmaPlugin } from './hooks/core';

// 4. Feature hooks (plugin-specific)
import { useRandomShapeGenerator } from './hooks/features';

// 5. UI Components
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
```

## Error Handling Architecture

### Centralized Error Management
```typescript
// src/common/error-handling.ts
export interface ErrorContext {
  component?: string;
  action?: string;
  userInput?: any;
}

export class PluginErrorHandler {
  static handle(error: Error, context: ErrorContext): void {
    // Log structured error
    console.error('Plugin Error:', { error: error.message, context });
    
    // User feedback in plugin thread
    if (typeof figma !== 'undefined') {
      figma.notify(`Error: ${error.message}`, { error: true });
    }
    
    // UI feedback if available
    if (context.component) {
      // Handle UI-specific error display
    }
  }
}
```

## Performance Considerations

### Bundle Organization
- **Plugin Bundle** (`code.js`): Keep minimal, only Figma API code
- **UI Bundle** (`index.html`): React app, can be larger but optimize
- **Shared Code**: Minimize to reduce both bundle sizes

### Development vs Production
```typescript
// Use environment-specific code
if (process.env.NODE_ENV === 'development') {
  // Debug helpers, mock data, verbose logging
} else {
  // Optimized production code
}
```

## Testing Strategy

### Test File Locations
```
src/
├── plugin/
│   ├── main.ts
│   └── __tests__/
│       └── main.test.ts
├── ui/
│   ├── components/
│   │   ├── Component.tsx
│   │   └── __tests__/
│   │       └── Component.test.tsx
│   └── hooks/
│       └── __tests__/
└── common/
    └── __tests__/
```

### Test Categories
- **Unit Tests**: Individual functions, components
- **Integration Tests**: Hook interactions, component integration
- **E2E Tests**: Full plugin workflow simulation

This structure ensures maintainable, scalable plugin development with comprehensive AI development support and clear boundaries between boilerplate and custom functionality.
