# Figma API Fundamentals & Async Operations

## CRITICAL: Async Function Usage

**MANDATORY**: ALL functions with `Async` suffix MUST use `await`. Forgetting `await` causes race conditions and data corruption.

```typescript
// ✅ CORRECT - Always await async functions
await figma.loadFontAsync(fontName);
await page.loadAsync();
await figma.loadAllPagesAsync();
const bytes = await node.exportAsync({ format: 'PNG' });

// ❌ WRONG - Missing await causes undefined behavior
figma.loadFontAsync(fontName); // Promise not awaited!
page.loadAsync(); // Data not loaded when accessed!
```

## Page Loading & Data Access

### Current Page vs Other Pages

**CRITICAL**: Figma only loads the current page automatically. Accessing other pages requires explicit loading.

```typescript
// ✅ CURRENT PAGE - Always available
const currentSelection = figma.currentPage.selection;
const currentChildren = figma.currentPage.children;

// ❌ OTHER PAGES - NOT automatically loaded
const otherPage = figma.root.children[1]; // Page exists
// otherPage.children // EMPTY ARRAY - not loaded!

// ✅ CORRECT - Load page data first
const otherPage = figma.root.children[1] as PageNode;
await otherPage.loadAsync();
const children = otherPage.children; // Now populated
```

### Document-Wide Operations

**CRITICAL**: Searching across entire document requires loading all pages first.

```typescript
// ❌ WRONG - Only searches current page
const allTextNodes = figma.root.findAll(node => node.type === 'TEXT');

// ✅ CORRECT - Load all pages first
await figma.loadAllPagesAsync();
const allTextNodes = figma.root.findAll(node => node.type === 'TEXT');

// ⚠️  WARNING - Very expensive operation, use sparingly
```

### Efficient Page Traversal

```typescript
// ✅ OPTIMIZED - Process pages individually
for (const page of figma.root.children) {
  if (page.type === 'PAGE') {
    await page.loadAsync();
    
    // Process page content
    const textNodes = page.findAll(node => node.type === 'TEXT');
    processTextNodes(textNodes);
    
    // Optional: Unload page to save memory (if supported)
    // page.remove(); // Only if no longer needed
  }
}
```

## Node Access & Reference Management

### Node ID vs Node Reference

```typescript
// ✅ SAFE - Access by ID (async)
const nodeId = 'some-node-id';
const node = await figma.getNodeByIdAsync(nodeId);
if (!node) {
  figma.notify('Node not found or deleted', { error: true });
  return;
}

// ✅ SAFE - Check if node still exists
function isNodeValid(node: SceneNode): boolean {
  return !node.removed && node.parent !== null;
}

// ❌ DANGEROUS - Stored references can become invalid
let storedNode = figma.currentPage.selection[0];
// ... later in code ...
storedNode.name = 'New name'; // May error if node was deleted
```

### Library Component Access

```typescript
// ❌ WRONG - Cannot modify remote library components
if (node.type === 'INSTANCE' && node.mainComponent?.remote) {
  // node.mainComponent.name = 'New name'; // ERROR!
  figma.notify('Cannot modify library components', { error: true });
  return;
}

// ✅ CORRECT - Check before modification
function canModifyComponent(instance: InstanceNode): boolean {
  return instance.mainComponent?.remote !== true;
}
```

## Async Operations & Performance

### Parallel vs Sequential Processing

```typescript
// ❌ SLOW - Sequential font loading
async function loadFontsSequentially(textNodes: TextNode[]): Promise<void> {
  for (const node of textNodes) {
    const fontName = node.fontName as FontName;
    await figma.loadFontAsync(fontName); // Waits for each font
  }
}

// ✅ FAST - Parallel font loading
async function loadFontsParallel(textNodes: TextNode[]): Promise<void> {
  const fontPromises = textNodes.map(node => {
    const fontName = node.fontName as FontName;
    return figma.loadFontAsync(fontName).catch(error => {
      console.error(`Failed to load font ${fontName.family}:`, error);
    });
  });
  
  await Promise.all(fontPromises);
}
```

### Batch Operations Pattern

```typescript
// ✅ OPTIMIZED - Batch processing with progress feedback
async function processManyNodes(nodes: SceneNode[]): Promise<void> {
  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(nodes.length / BATCH_SIZE);
  
  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    const batch = nodes.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    
    // Process batch
    await Promise.all(batch.map(processNode));
    
    // Update progress
    figma.ui.postMessage({
      type: 'progress-update',
      progress: batchNumber / totalBatches,
      message: `Processing batch ${batchNumber}/${totalBatches}`
    });
    
    // Yield to UI thread
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

## Selection & Viewport Management

### Safe Selection Access

```typescript
// ✅ COMPREHENSIVE - Handle all selection states
function analyzeSelection(): {
  count: number;
  types: string[];
  canProcess: boolean;
} {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    return { count: 0, types: [], canProcess: false };
  }
  
  const types = [...new Set(selection.map(node => node.type))];
  const canProcess = selection.every(node => 
    !node.locked && node.visible && !node.removed
  );
  
  return { count: selection.length, types, canProcess };
}
```

### Viewport Operations

```typescript
// ✅ SMART VIEWPORT - Position nodes intelligently
function positionNodesInViewport(nodes: SceneNode[]): void {
  if (nodes.length === 0) return;
  
  // Get current viewport
  const viewport = figma.viewport.bounds;
  const centerX = viewport.x + viewport.width / 2;
  const centerY = viewport.y + viewport.height / 2;
  
  // Convert to canvas coordinates
  const canvasCenter = figma.viewport.screenToCanvas(centerX, centerY);
  
  // Position nodes with slight offset to avoid perfect overlap
  nodes.forEach((node, index) => {
    const offset = index * 10; // 10px offset per node
    node.x = canvasCenter.x + offset;
    node.y = canvasCenter.y + offset;
  });
  
  // Focus on created nodes
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}
```

## Color & Paint Management

### Color Space Handling

```typescript
// ✅ CORRECT - Figma uses 0.0-1.0 range, not 0-255
function createColorPaint(r: number, g: number, b: number): SolidPaint {
  return {
    type: 'SOLID',
    color: {
      r: r / 255, // Convert from 0-255 to 0.0-1.0
      g: g / 255,
      b: b / 255
    },
    opacity: 1.0
  };
}

// ✅ SAFE COLOR MANIPULATION - Handle mixed values
function updateNodeColor(node: SceneNode, color: RGB): void {
  if ('fills' in node && node.fills && node.fills.length > 0) {
    const fills = [...node.fills] as Paint[];
    
    if (fills[0] && fills[0].type === 'SOLID') {
      fills[0] = {
        ...fills[0],
        color: color
      };
      node.fills = fills;
    }
  }
}
```

### figma.mixed Handling

```typescript
// ✅ CRITICAL - Always check for figma.mixed
function getNodeFontSize(node: TextNode): number | typeof figma.mixed {
  const fontSize = node.fontSize;
  
  if (fontSize === figma.mixed) {
    // Text has multiple font sizes
    console.log('Text has mixed font sizes');
    return figma.mixed;
  }
  
  return fontSize as number;
}

// ✅ PROPER MIXED VALUE HANDLING
function processTextFormatting(node: TextNode): void {
  // Check each property for mixed values
  const fontSize = node.fontSize;
  const fontName = node.fontName;
  
  if (fontSize !== figma.mixed && typeof fontSize === 'number') {
    // Safe to treat as number
    node.fontSize = fontSize * 1.2;
  }
  
  if (fontName !== figma.mixed) {
    // Single font - safe to load and modify
    const font = fontName as FontName;
    figma.loadFontAsync(font).then(() => {
      node.characters = `Formatted: ${node.characters}`;
    });
  } else {
    figma.notify('Text has mixed fonts - advanced formatting needed');
  }
}
```

## Export & Image Operations

### Safe Export Operations

```typescript
// ✅ ROBUST EXPORT - Handle all edge cases
async function exportNode(node: SceneNode, format: ExportSettingsImage['format']): Promise<Uint8Array | null> {
  try {
    // Check if node can be exported
    if (node.removed || !node.visible) {
      throw new Error('Node cannot be exported (removed or invisible)');
    }
    
    // Check if node has valid bounds
    const bounds = node.absoluteRenderBounds;
    if (!bounds || bounds.width === 0 || bounds.height === 0) {
      throw new Error('Node has no render bounds');
    }
    
    const bytes = await node.exportAsync({
      format,
      constraint: { type: 'SCALE', value: 2 } // 2x resolution
    });
    
    return bytes;
  } catch (error) {
    console.error('Export failed:', error);
    figma.notify(`Export failed: ${error.message}`, { error: true });
    return null;
  }
}
```

### Image Processing Pipeline

```typescript
// ✅ COMPLETE IMAGE WORKFLOW - Plugin → UI → Plugin
async function processNodeImage(node: SceneNode): Promise<void> {
  try {
    // 1. Export in plugin thread
    const imageBytes = await exportNode(node, 'PNG');
    if (!imageBytes) return;
    
    // 2. Send to UI for processing
    figma.ui.postMessage({
      type: 'process-image',
      imageBytes: Array.from(imageBytes), // Convert to transferable array
      nodeId: node.id
    });
    
    // 3. UI will process with canvas and send back
    // (Implementation continues in UI thread)
  } catch (error) {
    figma.notify(`Image processing failed: ${error.message}`, { error: true });
  }
}
```

## Error Handling & Debugging

### Comprehensive Error Catching

```typescript
// ✅ PRODUCTION-READY ERROR HANDLING
async function robustOperation(node: SceneNode): Promise<Result<string>> {
  try {
    // Validate node state
    if (node.removed) {
      return { success: false, error: new Error('Node was deleted') };
    }
    
    if (node.locked) {
      return { success: false, error: new Error('Node is locked') };
    }
    
    // Perform operation
    const result = await performComplexOperation(node);
    
    return { success: true, data: result };
    
  } catch (error) {
    // Structured error logging
    console.error('Operation failed:', {
      nodeId: node.id,
      nodeType: node.type,
      error: error.message,
      stack: error.stack
    });
    
    // User-friendly error message
    const userMessage = error.message.includes('font') 
      ? 'Font loading failed. Please check if fonts are available.'
      : 'Operation failed. Please try again.';
      
    return { 
      success: false, 
      error: new Error(userMessage)
    };
  }
}
```

### Development vs Production Logging

```typescript
// ✅ ENVIRONMENT-AWARE LOGGING
function debugLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Plugin Debug] ${message}`, data);
  }
}

function errorLog(message: string, error: Error, context?: any): void {
  console.error(`[Plugin Error] ${message}`, {
    error: error.message,
    stack: error.stack,
    context
  });
  
  // In development, also show in Figma UI
  if (process.env.NODE_ENV === 'development') {
    figma.notify(`Debug: ${message}`, { error: true });
  }
}
```

## Advanced API Patterns

### Plugin Data Management

```typescript
// ✅ SAFE PLUGIN DATA STORAGE
const PLUGIN_NAMESPACE = 'com.company.plugin-name';

function setPluginData(node: SceneNode, key: string, value: any): void {
  try {
    const data = JSON.stringify(value);
    node.setPluginData(key, data);
  } catch (error) {
    console.error('Failed to set plugin data:', error);
  }
}

function getPluginData<T>(node: SceneNode, key: string, defaultValue: T): T {
  try {
    const data = node.getPluginData(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Failed to get plugin data:', error);
    return defaultValue;
  }
}

// Shared data across plugin instances
function setSharedPluginData(key: string, value: any): void {
  try {
    const data = JSON.stringify(value);
    figma.root.setSharedPluginData(PLUGIN_NAMESPACE, key, data);
  } catch (error) {
    console.error('Failed to set shared plugin data:', error);
  }
}
```

### Client Storage for Persistent Settings

```typescript
// ✅ PERSISTENT USER SETTINGS
async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    const data = JSON.stringify(settings);
    await figma.clientStorage.setAsync('user-settings', data);
    figma.notify('Settings saved');
  } catch (error) {
    console.error('Failed to save settings:', error);
    figma.notify('Failed to save settings', { error: true });
  }
}

async function loadUserSettings(): Promise<UserSettings | null> {
  try {
    const data = await figma.clientStorage.getAsync('user-settings');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
}
```

**LLM INSTRUCTION**: These API fundamentals are essential for reliable plugin development. Always use async/await, handle errors gracefully, and respect Figma's data loading model.
