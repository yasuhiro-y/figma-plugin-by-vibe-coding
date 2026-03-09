---
root: false
targets: ["*"]
description: "Figma Plugin Architecture and Development Guidelines"
globs: ["src/plugin/**/*", "src/common/**/*", "*.manifest.ts", "vite.config.plugin.ts"]
---

# Figma Plugin Architecture & Communication Guidelines

> For specific API method signatures and type definitions, refer to `plugin-api.d.ts`.

## CRITICAL: Dual-Process Sandboxed Architecture

Figma plugins execute in **TWO completely isolated JavaScript contexts** that can ONLY communicate via `postMessage`. This is the most important concept for plugin development.

### Plugin Thread (`src/plugin/`) - Sandboxed Environment

**Access**: Full Figma API, NO browser APIs

Available:
- All `figma.*` methods (node creation, page access, font loading, notifications, UI messaging)
- Plugin data storage (`figma.clientStorage`)

Not available:
- `window`, `document`, `fetch`, `localStorage`, `alert` — any browser/DOM API

### UI Thread (`src/ui/`) - Standard Browser iframe

**Access**: Full browser APIs, NO Figma API

Available:
- `fetch`, `document`, `localStorage`, `window` — standard Web APIs
- React, framework code, `parent.postMessage()`

Not available:
- Any `figma.*` call — these are ReferenceErrors in the UI thread

Never attempt to call `figma.*` from the UI thread or browser APIs from the plugin thread. This causes runtime errors with no fallback.

## Inter-Thread Communication Protocol

### Message Syntax (CRITICAL DIFFERENCE)

**UI to Plugin** (requires `pluginMessage` wrapper):
```typescript
// CORRECT - Must wrap in pluginMessage
parent.postMessage({
  pluginMessage: { type: 'my-action', data: payload }
}, '*');

// WRONG - Direct message won't be received by the plugin thread
parent.postMessage({ type: 'my-action' }, '*');
```

**Plugin to UI** (direct message):
```typescript
figma.ui.postMessage({ type: 'response', data: payload });
```

### Receiving Messages

**Plugin thread** (`src/plugin/main.ts`):
```typescript
figma.ui.onmessage = async (msg: UIMessage) => {
  // msg is automatically extracted from the pluginMessage wrapper
  try {
    switch (msg.type) {
      case 'some-action':
        // Call Figma API here — see plugin-api.d.ts for available methods
        break;
      case 'close-plugin':
        figma.closePlugin('Plugin closed by user');
        break;
      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    figma.notify(`Error: ${error.message}`, { error: true });
  }
};
```

**UI thread** (`src/ui/hooks/core/useFigmaPlugin.ts`):
```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // CRITICAL: Extract from pluginMessage wrapper
    const msg = event.data.pluginMessage as PluginMessage | undefined;
    if (!msg) return;

    switch (msg.type) {
      case 'selection-changed':
        setSelection(msg.selection);
        break;
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

## Plugin Lifecycle Management

### MANDATORY: Plugin Termination

Always call `figma.closePlugin()` when done, or the plugin stays active consuming memory. Forgetting this is a common and serious mistake.

### UI Display Management

`figma.showUI()` can only be called **ONCE** per plugin execution. To toggle visibility after that, use `figma.ui.hide()` and `figma.ui.show()`. The UI iframe persists (and `postMessage` still works) even when hidden.

Calling `figma.closePlugin()` destroys the iframe and terminates the plugin completely.

## Event Handling

### Selection Change Monitoring

Use `figma.on('selectionchange', handler)` to react when the user selects different nodes. Forward serialized selection data to the UI via `figma.ui.postMessage`.

### Parameter-Based Execution

Use `figma.on('run', ({ parameters }) => { ... })` to handle relaunch buttons and parameterized plugin invocations. Set relaunch data on nodes with `node.setRelaunchData()`.

### Event Listener Management (IMPORTANT)

Prevent duplicate event listeners on re-execution:
- Remove previous listeners with `figma.off()` before attaching new ones, OR
- Use a guard flag to ensure a listener is only attached once

## Font Handling (CRITICAL for Text Operations)

**Font loading is REQUIRED before ANY text property modification.** Modifying `characters`, `fontSize`, `textDecoration`, or any text property without first calling `await figma.loadFontAsync(fontName)` will throw an error.

Key rules:
- Always load the font with `figma.loadFontAsync()` before modifying text properties
- Handle `figma.mixed` — text nodes can have multiple fonts across character ranges; each must be loaded individually via `getRangeFontName()`
- Check `node.hasMissingFont` before attempting modifications; skip nodes with missing fonts
- Wrap font loading in try/catch — the font may not be available

See `plugin-api.d.ts` for `FontName`, `TextNode`, and related type definitions.

## Node Manipulation Best Practices

### Type Guards

Use `node.type` checks (e.g., `node.type === 'TEXT'`) or custom type guard functions before accessing type-specific properties. See `plugin-api.d.ts` for the full node type hierarchy.

### Selection State Handling

Always handle all selection states: empty selection, single node, and multiple nodes. Use `figma.currentPage.selection` and provide user feedback via `figma.notify()` when selection is invalid.

### Readonly Properties (MAJOR PITFALL)

Node properties like `fills`, `strokes`, and `effects` are **readonly arrays**. You cannot mutate them in place. Instead: clone the array, modify the clone, then reassign the entire property. This pattern is detailed in `node-manipulation.md`.

## Communication Contract & Type Safety

### Message Structure Definition

Define all messages as typed interfaces in `src/common/messages.ts`:

```typescript
// UI -> Plugin messages
export interface SomeActionMessage {
  type: 'some-action';
  payload: SomePayload;
}

export interface ClosePluginMessage {
  type: 'close-plugin';
}

export type UIMessage =
  | SomeActionMessage
  | ClosePluginMessage;

// Plugin -> UI messages
export interface SelectionChangedMessage {
  type: 'selection-changed';
  selection: Array<{ id: string; name: string; type: string }>;
}

export interface OperationResultMessage {
  type: 'operation-result';
  id: string;
  result: Result<unknown>;
}

export type PluginMessage =
  | SelectionChangedMessage
  | OperationResultMessage;
```

### Error Handling Pattern

Use a Result type for all operations crossing the thread boundary:

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

Wrap all Figma API calls in try/catch within the plugin thread and return structured results to the UI.

## Advanced Communication Patterns

### Request/Response with Timeout

For operations where the UI needs a response, use a correlation ID in the message, store a pending promise in a Map, and set a timeout. The plugin thread sends back a result message with the same ID. This avoids fire-and-forget patterns where the UI never learns about failures.

### Batch Operations

Process multiple operations with `Promise.all`, collecting results and sending a single `batch-complete` message back to the UI. Catch errors per-operation so one failure does not abort the batch.

## iframe Security & Limitations

- The UI iframe starts with a `null` origin. External navigation changes the origin and may break `postMessage` communication.
- `window.alert()` and `window.confirm()` may not work (especially in VS Code extension environments). Use custom UI components or send a message to the plugin thread to call `figma.notify()`.

## API Limitations

Operations NOT possible in Figma plugins:
- File system access (reading/writing local files)
- Network requests without `networkAccess` manifest permission
- OS-level operations (font installation, app launching)
- Figma UI modification (menus, panels, native interface)
- Version history or comment system access
- Direct clipboard access

Handle unsupported operations gracefully with `figma.notify()` and guide the user to manual alternatives.

## Performance & Memory Management

### Efficient Node Processing

Batch reads before writes. Read all needed properties from nodes first, then perform all mutations. This minimizes layout recalculations. Finish with a single `figma.viewport.scrollAndZoomIntoView()` call if viewport adjustment is needed.

### Memory Leak Prevention

In the UI thread, always clean up event listeners, timers, and intervals on component unmount (return a cleanup function from `useEffect`). In the plugin thread, avoid holding references to large node trees longer than necessary.
