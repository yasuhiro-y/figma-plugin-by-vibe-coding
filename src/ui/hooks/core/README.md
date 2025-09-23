# Core Hooks Directory

⚠️ **DO NOT MODIFY FILES IN THIS DIRECTORY** ⚠️

This directory contains **boilerplate-level hooks** that provide essential functionality for Figma plugin development.

## 🔒 What's Here

### `useFigmaPlugin.ts`
The main hook for Figma plugin communication and basic operations:
- Plugin ↔ UI thread communication
- Selection management  
- Basic node operations (create rectangles, etc.)
- Connection status tracking

### Future Core Hooks
These may be added to the boilerplate over time:
- `usePluginStorage.ts` - Local storage management
- `usePluginTheme.ts` - Theme and appearance management  
- `usePluginWindowSize.ts` - Plugin window sizing utilities

## 🎯 Usage

```typescript
import { useFigmaPlugin } from '@/hooks';
// or
import { useFigmaPlugin } from '@/hooks/core';

function MyComponent() {
  const { selection, isConnected, createRectangle } = useFigmaPlugin();
  
  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Selected: {selection.length} objects</p>
      <button onClick={() => createRectangle({ width: 100, height: 100 })}>
        Create Rectangle
      </button>
    </div>
  );
}
```

## 🛠️ For Boilerplate Maintainers Only

If you're maintaining this boilerplate:

1. **Breaking Changes**: Increment major version when changing core hook interfaces
2. **New Features**: Add new core hooks that benefit ALL plugin types  
3. **Documentation**: Update this README when adding new core hooks
4. **Testing**: Ensure all core hooks work across different plugin scenarios

## 🚫 For Plugin Developers

**Do NOT**:
- Modify these core hooks for your specific plugin
- Add plugin-specific logic to these files
- Copy these files to customize them

**Instead**:
- Create your custom hooks in `../features/`  
- Use composition to extend core functionality
- Report issues/requests for core hook improvements

---

**These hooks are the foundation that all plugins build upon. Keep them stable and reliable!**
