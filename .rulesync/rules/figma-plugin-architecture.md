---
root: false
targets: ["*"]
description: "Figma Plugin Architecture and Development Guidelines"
globs: ["src/plugin/**/*", "src/common/**/*", "*.manifest.ts", "vite.config.plugin.ts"]
---

# Figma Plugin Architecture & Communication Guidelines

## CRITICAL: Dual-Process Sandboxed Architecture

Figma plugins execute in **TWO completely isolated JavaScript contexts** that can ONLY communicate via `postMessage`. This is the most important concept for plugin development.

### Plugin Thread (`src/plugin/`) - Sandboxed Environment

**Access**: Full Figma API, NO browser APIs

```typescript
// ✅ AVAILABLE in plugin thread
figma.createRectangle();
figma.currentPage.selection;
figma.loadFontAsync();
figma.notify('Success!');
figma.ui.postMessage();

// ❌ NOT AVAILABLE in plugin thread  
window.fetch();          // ReferenceError
document.getElementById(); // ReferenceError
localStorage.setItem();   // ReferenceError
alert('message');        // ReferenceError (use figma.notify)
```

### UI Thread (`src/ui/`) - Standard Browser iframe

**Access**: Full browser APIs, NO Figma API

```typescript
// ✅ AVAILABLE in UI thread
fetch('https://api.example.com');
document.getElementById('root');
window.localStorage;
React.useState();
parent.postMessage();

// ❌ NOT AVAILABLE in UI thread
figma.createRectangle(); // ReferenceError
figma.notify();          // ReferenceError  
figma.currentPage;       // ReferenceError
```

**LLM INSTRUCTION**: Never attempt to call `figma.*` from UI thread or browser APIs from plugin thread. This causes runtime errors.

## Inter-Thread Communication Protocol

### Message Syntax (CRITICAL DIFFERENCE)

**UI → Plugin** (requires `pluginMessage` wrapper):
```typescript
// ✅ CORRECT - Must wrap in pluginMessage
parent.postMessage({ 
  pluginMessage: { type: 'create-rectangle', width: 100 } 
}, '*');

// ❌ WRONG - Direct message won't be received
parent.postMessage({ type: 'create-rectangle' }, '*');
```

**Plugin → UI** (direct message):
```typescript
// ✅ CORRECT - Direct message object
figma.ui.postMessage({ 
  type: 'notification', 
  message: 'Rectangle created!' 
});
```

### Receiving Messages

**Plugin thread** (`src/plugin/main.ts`):
```typescript
figma.ui.onmessage = async (msg: UIMessage) => {
  // msg is automatically extracted from pluginMessage wrapper
  console.log(msg.type); // 'create-rectangle'
  
  try {
    switch (msg.type) {
      case 'create-rectangle':
        const rect = figma.createRectangle();
        rect.resize(msg.width || 100, msg.height || 100);
        figma.currentPage.appendChild(rect);
        
        // Send success notification
        figma.notify('Rectangle created successfully!');
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
      case 'notification':
        // Handle plugin notifications (if needed in UI)
        break;
      default:
        console.warn('Unknown plugin message:', msg);
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

## Plugin Lifecycle Management

### MANDATORY: Plugin Termination

**CRITICAL**: Always call `figma.closePlugin()` when done, or plugin stays active consuming memory.

```typescript
// ✅ REQUIRED - Proper plugin termination
figma.ui.onmessage = async (msg: UIMessage) => {
  switch (msg.type) {
    case 'close-plugin':
      figma.closePlugin('Plugin closed by user');
      break;
    case 'create-rectangle':
      // Process creation but DON'T close automatically
      // Let user decide when to close
      break;
  }
};

// ❌ WRONG - Never ending plugin
// Forgetting to call figma.closePlugin() leaves plugin running
```

### UI Display Management

**CRITICAL**: `figma.showUI()` can only be called ONCE per plugin execution.

```typescript
// ✅ CORRECT - Called once at startup
figma.showUI(__html__, {
  width: UI_DIMENSIONS.width,
  height: UI_DIMENSIONS.height,
  themeColors: true,  // Enable Figma theme integration
  title: 'Plugin Name'
});

// ❌ WRONG - Cannot call showUI multiple times
if (someCondition) {
  figma.showUI(); // ERROR: UI already shown
}
```

### UI State Management

```typescript
// Hide UI (plugin keeps running, can communicate)
figma.ui.hide(); 
// UI iframe still exists, postMessage still works

// Show hidden UI
figma.ui.show();

// Close plugin (terminates everything)
figma.closePlugin('Reason for closing'); 
// UI iframe destroyed, plugin stops completely
```

## Event Handling & Advanced Features

### Selection Change Monitoring

```typescript
// Monitor selection changes automatically
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  const selectionData = selection.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    locked: node.locked,
    visible: node.visible
  }));
  
  figma.ui.postMessage({
    type: 'selection-changed',
    selection: selectionData
  });
});
```

### Parameter-Based Plugin Execution

```typescript
// Handle plugin execution with parameters (e.g., Relaunch buttons)
figma.on('run', ({ parameters }) => {
  if (parameters) {
    const action = parameters.action;
    if (action === 'regenerate') {
      // Handle specific relaunch action
      regenerateElements();
    }
  }
});

// Set relaunch data on nodes for future execution
function setRelaunchCapability(node: SceneNode): void {
  node.setRelaunchData({
    regenerate: 'Regenerate with new settings'
  });
}
```

### Event Listener Management (IMPORTANT)

**CRITICAL**: Prevent duplicate event listeners:

```typescript
// ❌ WRONG - Creates multiple listeners on re-execution
figma.on('selectionchange', handleSelectionChange);

// ✅ CORRECT - Remove existing listeners first
figma.off('selectionchange', previousHandler);
figma.on('selectionchange', newHandler);

// ✅ BETTER - Use flags to prevent duplicates
let selectionListenerAttached = false;

if (!selectionListenerAttached) {
  figma.on('selectionchange', handleSelectionChange);
  selectionListenerAttached = true;
}
```

## Font Handling (CRITICAL for Text Operations)

### ALWAYS Load Fonts First

**CRITICAL**: Font loading is REQUIRED before ANY text property modification:

```typescript
// ✅ REQUIRED - Font loading before text manipulation
if (node.type === 'TEXT') {
  const fontName = node.fontName as FontName;
  
  try {
    await figma.loadFontAsync(fontName);
    // NOW safe to modify ANY text properties
    node.characters = 'New text content';
    node.fontSize = 16;
    node.textDecoration = 'UNDERLINE';
  } catch (error) {
    console.error(`Font loading failed: ${fontName.family}-${fontName.style}`);
    figma.notify(`Font "${fontName.family}" not available`, { error: true });
    return; // Skip this node
  }
}
```

### Mixed Font Handling

```typescript
// Handle mixed fonts in text nodes
if (node.type === 'TEXT') {
  if (node.fontName === figma.mixed) {
    // Text has multiple fonts - handle each range separately
    const textLength = node.characters.length;
    for (let i = 0; i < textLength; i++) {
      const fontName = node.getRangeFontName(i, i + 1) as FontName;
      await figma.loadFontAsync(fontName);
    }
  } else {
    // Single font for entire text
    await figma.loadFontAsync(node.fontName as FontName);
  }
  
  // Now safe to modify text
  node.characters = 'Updated text';
}
```

### Missing Font Detection

```typescript
// Check for missing fonts
if (node.type === 'TEXT' && node.hasMissingFont) {
  figma.notify('Text contains missing fonts - skipping modification', { error: true });
  return;
}
```

## Node Manipulation Best Practices

### Type Guards for Safe Operations

```typescript
// ✅ REQUIRED - Type guards for node operations
function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

function isFrameNode(node: SceneNode): node is FrameNode {
  return node.type === 'FRAME';
}

function hasChildren(node: SceneNode): node is SceneNode & ChildrenMixin {
  return 'children' in node;
}
```

### Selection State Handling

```typescript
// ✅ CORRECT - Handle all selection states
function processSelection(): void {
  const selection = figma.currentPage.selection;
  
  // Handle empty selection
  if (selection.length === 0) {
    figma.notify('Please select at least one object');
    return;
  }
  
  // Handle single selection
  if (selection.length === 1) {
    const node = selection[0];
    processNode(node);
    return;
  }
  
  // Handle multiple selection
  selection.forEach(processNode);
  
  // Focus on processed nodes
  figma.viewport.scrollAndZoomIntoView(selection);
}
```

### Readonly Properties (MAJOR PITFALL)

```typescript
// ❌ WRONG - Cannot modify readonly properties directly
// node.fills[0].opacity = 0.5; // Error!

// ✅ CORRECT - Clone, modify, reassign
const fills = JSON.parse(JSON.stringify(node.fills)) as Paint[];
if (fills[0] && fills[0].type === 'SOLID') {
  fills[0].opacity = 0.5;
}
node.fills = fills;

// ✅ ALTERNATIVE - Using spread with proper typing
const newFills = [...node.fills];
if (newFills[0] && newFills[0].type === 'SOLID') {
  newFills[0] = { ...newFills[0], opacity: 0.5 };
}
node.fills = newFills;
```

## Communication Contract & Type Safety

### Message Structure Definition

```typescript
// src/common/messages.ts - COMPREHENSIVE message contracts
export interface CreateRectangleMessage {
  type: 'create-rectangle';
  width?: number;
  height?: number;
  color?: { r: number; g: number; b: number };
}

export interface GetSelectionMessage {
  type: 'get-selection';
  id: string; // For request/response correlation
}

export interface ClosePluginMessage {
  type: 'close-plugin';
}

// Union type for all UI → Plugin messages
export type UIMessage = 
  | CreateRectangleMessage 
  | GetSelectionMessage 
  | ClosePluginMessage;

// Plugin → UI messages
export interface SelectionChangedMessage {
  type: 'selection-changed';
  selection: Array<{
    id: string;
    name: string;
    type: string;
    locked: boolean;
    visible: boolean;
  }>;
}

export interface OperationResultMessage {
  type: 'operation-result';
  id: string; // Correlate with request
  result: Result<unknown>;
}

export type PluginMessage = 
  | SelectionChangedMessage 
  | OperationResultMessage;
```

### Error Handling Pattern

```typescript
// ✅ REQUIRED - Result pattern for ALL operations
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Plugin thread - Comprehensive error handling
async function handleCreateRectangle(msg: CreateRectangleMessage): Promise<Result<string>> {
  try {
    const rect = figma.createRectangle();
    rect.resize(msg.width || 100, msg.height || 100);
    
    if (msg.color) {
      rect.fills = [{
        type: 'SOLID',
        color: msg.color
      }];
    }
    
    figma.currentPage.appendChild(rect);
    
    return { success: true, data: rect.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}
```

## Advanced Communication Patterns

### Request/Response with Timeout

```typescript
// UI thread - Promise-based request with timeout
function sendRequestWithResponse<T>(message: UIMessage & { id: string }): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(message.id);
      reject(new Error('Request timeout'));
    }, 10000);
    
    pendingRequests.set(message.id, (result) => {
      clearTimeout(timeoutId);
      resolve(result as T);
    });
    
    parent.postMessage({ pluginMessage: message }, '*');
  });
}
```

### Batch Operations

```typescript
// Plugin thread - Process multiple operations efficiently
async function processBatch(operations: Array<{ type: string; data: any }>): Promise<void> {
  const results = await Promise.all(
    operations.map(async (op) => {
      try {
        return await processOperation(op);
      } catch (error) {
        console.error(`Batch operation failed:`, error);
        return { success: false, error };
      }
    })
  );
  
  figma.ui.postMessage({
    type: 'batch-complete',
    results
  });
}
```

## iframe Security & Limitations

### Origin Handling

```typescript
// UI starts with null origin
console.log(window.location.origin); // "null"

// External navigation changes origin and may break communication
window.location.href = "https://external-site.com"; // Dangerous!
```

### Alert/Confirm Limitations

```typescript
// ❌ NOT AVAILABLE in VS Code extension environment
// window.alert('message');    // May not work
// window.confirm('question'); // May not work

// ✅ USE INSTEAD - Custom UI components
import { AlertDialog } from '@/components/ui/alert-dialog';

// Or send message to plugin for figma.notify
parent.postMessage({ 
  pluginMessage: { type: 'show-notification', message: 'Important message' } 
}, '*');
```

## API Limitations & Graceful Degradation

### Operations NOT Possible

- ❌ File system access (reading/writing local files)
- ❌ Network requests to arbitrary external APIs (without networkAccess)
- ❌ OS-level operations (font installation, app launching)
- ❌ Figma UI modification (menus, panels, interface)
- ❌ Version history or comment system access
- ❌ Direct clipboard access

### Graceful Error Handling

```typescript
function handleUnsupportedOperation(): void {
  figma.notify(
    'This operation requires manual export. Use File > Export menu.', 
    { 
      error: false,
      timeout: 4000,
      button: { 
        text: 'Got it', 
        action: () => console.log('User acknowledged') 
      }
    }
  );
}
```

## Performance & Memory Management

### Efficient Node Processing

```typescript
// ✅ CORRECT - Batch read operations, then batch write operations
function optimizeNodeProcessing(nodes: SceneNode[]): void {
  // Batch reads first
  const nodeData = nodes.map(node => ({
    node,
    width: node.width,
    height: node.height,
    x: node.x,
    y: node.y
  }));
  
  // Then batch writes
  nodeData.forEach(({ node, width, height }) => {
    node.resize(width * 1.1, height * 1.1);
  });
  
  // Single viewport update
  figma.viewport.scrollAndZoomIntoView(nodes);
}
```

### Memory Leak Prevention

```typescript
// UI thread - Clean up on unmount
useEffect(() => {
  const handleMessage = (event: MessageEvent) => { /* ... */ };
  
  window.addEventListener('message', handleMessage);
  
  // CRITICAL: Cleanup on unmount
  return () => {
    window.removeEventListener('message', handleMessage);
    // Clear any timers, intervals, etc.
  };
}, []);
```

**LLM INSTRUCTION**: This dual-process architecture is fundamental to Figma plugins. ALL functionality must respect these boundaries and communication patterns.