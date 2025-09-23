# Feature Hooks Directory

This directory is for **your custom plugin-specific hooks**. 

## 🎯 What Goes Here

Create hooks here for business logic that's specific to your plugin's functionality:

- **Data processing hooks**: `useImageOptimizer`, `useColorExtractor`
- **API integration hooks**: `useExternalAPI`, `useDataFetcher`  
- **Complex UI state hooks**: `useMultiStepWizard`, `useFormValidation`
- **Plugin feature hooks**: `useDesignTokens`, `useComponentLibrary`

## 📁 Example Structure

```
src/ui/hooks/features/
├── useColorPalette.ts       # Color manipulation logic
├── useImageProcessor.ts     # Image processing business logic
├── useDesignSystem.ts       # Design system integration
├── useDataVisualization.ts  # Chart/graph generation
├── usePluginSettings.ts     # Plugin-specific settings
└── index.ts                 # Export all your hooks
```

## ✅ Hook Creation Example

```typescript
// useColorPalette.ts
import { useState, useCallback } from 'react';
import { useFigmaPlugin } from '../core';

export function useColorPalette() {
  const { selection } = useFigmaPlugin();
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  
  const extractColors = useCallback(() => {
    // Your color extraction logic here
    const colors = selection.map(/* extract colors from nodes */);
    setExtractedColors(colors);
  }, [selection]);
  
  return {
    extractedColors,
    extractColors,
  };
}
```

## 📤 Don't Forget to Export

Add your hooks to `index.ts`:

```typescript
// index.ts
export { useColorPalette } from './useColorPalette';
export { useImageProcessor } from './useImageProcessor';
// ... add more as you create them
```

## 🚫 What NOT to Put Here

- Core Figma communication logic (that's in `core/`)
- Generic utility functions (use `src/ui/utils/`)
- Component-specific state (keep in components)
- Simple useState calls (use directly in components)

---

**Remember**: These hooks should contain reusable business logic specific to your plugin's features!
