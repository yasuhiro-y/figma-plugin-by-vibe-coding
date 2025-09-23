---
root: false
targets: ["*"]
description: "Scripter Plugin Best Practices adapted for Professional Plugin Development"
globs: ["src/plugin/**/*", "src/common/**/*"]
---

# Scripter Best Practices for Professional Plugin Development

## Error Handling and User Feedback

### User-Friendly Notifications
```typescript
// ✅ EXCELLENT - Rich notification patterns
function showNotification(message: string, options?: NotificationOptions): void {
  figma.notify(message, {
    timeout: 4000,
    ...options
  });
}

// ✅ Success notifications
function showSuccess(message: string): void {
  figma.notify(`✅ ${message}`, { 
    timeout: 3000
  });
}

// ✅ Error notifications with helpful context
function showError(error: string, context?: string): void {
  const message = context ? `${context}: ${error}` : error;
  figma.notify(`❌ ${message}`, { 
    error: true, 
    timeout: 6000,
    button: {
      text: 'Help',
      action: () => {
        console.log('Error details:', { error, context });
        figma.notify('Check the console for detailed error information');
      }
    }
  });
}

// ✅ Warning notifications
function showWarning(message: string): void {
  figma.notify(`⚠️ ${message}`, { 
    timeout: 4000 
  });
}
```

### Console-Based Debugging
```typescript
// ✅ REQUIRED - Structured console logging for debugging
interface LogContext {
  operation: string;
  nodeId?: string;
  nodeType?: NodeType;
  timestamp: number;
}

function logOperation(context: LogContext, message: string): void {
  const timestamp = new Date().toISOString();
  console.group(`[${context.operation}] ${timestamp}`);
  console.log('Message:', message);
  if (context.nodeId) console.log('Node ID:', context.nodeId);
  if (context.nodeType) console.log('Node Type:', context.nodeType);
  console.groupEnd();
}

// ✅ Usage example
async function processNode(node: SceneNode): Promise<void> {
  const context: LogContext = {
    operation: 'processNode',
    nodeId: node.id,
    nodeType: node.type,
    timestamp: Date.now()
  };
  
  try {
    logOperation(context, 'Starting node processing');
    // Processing logic...
    logOperation(context, 'Node processing completed');
    showSuccess(`Processed ${node.name}`);
  } catch (error) {
    logOperation(context, `Error: ${error.message}`);
    showError('Failed to process node', `Check console for details`);
  }
}
```

## Font Handling Excellence

### Comprehensive Font Management
```typescript
// ✅ EXCELLENT - Robust font handling system
interface FontLoadResult {
  success: boolean;
  fontName: FontName;
  error?: string;
}

async function loadFontSafely(fontName: FontName): Promise<FontLoadResult> {
  try {
    await figma.loadFontAsync(fontName);
    return { success: true, fontName };
  } catch (error) {
    const errorMessage = `Failed to load font: ${fontName.family}-${fontName.style}`;
    console.error(errorMessage, error);
    return { 
      success: false, 
      fontName, 
      error: errorMessage 
    };
  }
}

// ✅ Text operations with proper font handling
async function updateTextNode(node: TextNode, newText: string): Promise<void> {
  if (node.type !== 'TEXT') {
    showError('Invalid node type for text operation');
    return;
  }

  const fontName = node.fontName as FontName;
  const fontResult = await loadFontSafely(fontName);
  
  if (!fontResult.success) {
    showError(`Cannot update text: ${fontResult.error}`);
    showWarning('Consider using a system font like Inter-Regular');
    return;
  }

  try {
    node.characters = newText;
    showSuccess(`Updated text: "${newText.substring(0, 30)}..."`);
  } catch (error) {
    showError('Failed to update text content', `Check node permissions`);
    console.error('Text update error:', error);
  }
}
```

## Batch Processing Excellence

### Efficient Node Processing
```typescript
// ✅ EXCELLENT - Batch processing with progress feedback
async function processNodesInBatches(nodes: SceneNode[], batchSize = 10): Promise<void> {
  if (nodes.length === 0) {
    showWarning('No nodes to process');
    return;
  }

  showNotification(`Processing ${nodes.length} nodes...`);
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    
    // Process batch
    for (const node of batch) {
      try {
        await processNode(node);
        processed++;
      } catch (error) {
        errors++;
        console.error(`Failed to process node ${node.id}:`, error);
      }
    }

    // Progress feedback
    const progress = Math.round(((i + batch.length) / nodes.length) * 100);
    console.log(`Progress: ${progress}% (${processed + errors}/${nodes.length})`);
    
    // Allow UI to stay responsive
    if (i + batchSize < nodes.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Final summary
  const successRate = Math.round((processed / nodes.length) * 100);
  if (errors > 0) {
    showWarning(`Completed with ${errors} errors. Success rate: ${successRate}%`);
  } else {
    showSuccess(`All ${processed} nodes processed successfully!`);
  }
}
```

## API Limitation Handling

### Graceful Degradation Patterns
```typescript
// ✅ EXCELLENT - Handle API limitations gracefully
function handleUnsupportedOperation(operation: string): void {
  const limitations = {
    'file-export': 'Use Figma\'s Export menu to save files',
    'external-api': 'Plugin cannot access external APIs directly',
    'file-system': 'Cannot read/write local files - use clipboard instead',
    'font-install': 'Use system fonts or install fonts in Figma',
    'version-history': 'Use Figma\'s version history feature',
    'comments': 'Use Figma\'s comment system directly'
  };

  const suggestion = limitations[operation as keyof typeof limitations] || 
    'This operation is not supported by the Figma Plugin API';

  showError(`Unsupported Operation: ${operation}`, suggestion);
  console.group('API Limitation Details');
  console.log('Operation:', operation);
  console.log('Alternative:', suggestion);
  console.log('Learn more: https://figma.com/plugin-docs/api/api-reference');
  console.groupEnd();
}

// ✅ Usage example
function attemptFileExport(): void {
  try {
    // This would fail
    handleUnsupportedOperation('file-export');
    
    // Provide alternative
    showNotification('💡 Tip: Select your frames and use Cmd+Shift+E to export');
  } catch (error) {
    showError('Export operation failed');
  }
}
```

## Development and Debugging Patterns

### Console-First Debugging Strategy
```typescript
// ✅ EXCELLENT - Guide users to console for debugging
function enableDebugMode(): void {
  if (process.env.NODE_ENV === 'development') {
    showNotification('🔧 Debug mode enabled - Check browser console for detailed logs');
    console.log('%c🚀 Figma Plugin Debug Mode', 'color: #0066cc; font-size: 16px; font-weight: bold');
    console.log('Available debugging commands:');
    console.log('- figma.currentPage.selection: Current selection');
    console.log('- figma.currentPage.findAll(): Find nodes');
    console.log('- figma.notify("message"): Test notifications');
    
    // Make debugging utilities available in console
    (window as any).__figmaDebug = {
      selection: () => figma.currentPage.selection,
      notify: (msg: string) => figma.notify(msg),
      logNodeTree: () => console.log('Node tree:', figma.currentPage.children)
    };
  }
}
```

### Performance Monitoring
```typescript
// ✅ Performance tracking for optimization
function trackPerformance<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  
  return fn().finally(() => {
    const duration = performance.now() - start;
    console.log(`⏱️ ${operation} took ${duration.toFixed(2)}ms`);
    
    if (duration > 1000) {
      showWarning(`${operation} took longer than expected (${duration.toFixed(0)}ms)`);
    }
  });
}
```

## User Experience Guidelines

### Proactive User Guidance
```typescript
// ✅ EXCELLENT - Guide users through complex operations
function guideUserOperation(operation: string): void {
  const guides = {
    'text-operations': 'Select text objects first, then run the operation',
    'batch-processing': 'Select multiple objects for batch operations',
    'font-issues': 'Install missing fonts or switch to system fonts',
    'performance': 'For large selections, consider processing in smaller batches'
  };

  const guide = guides[operation as keyof typeof guides];
  if (guide) {
    showNotification(`💡 ${guide}`);
  }
}

// ✅ Interactive help system
function showInteractiveHelp(): void {
  figma.notify('Need help? Check the browser console for debugging tools', {
    button: {
      text: 'Open Console',
      action: () => {
        console.log('%c🔍 How to open browser console:', 'color: #ff6600; font-size: 14px; font-weight: bold');
        console.log('1. Right-click anywhere in the plugin');
        console.log('2. Select "Inspect Element"');
        console.log('3. Go to the "Console" tab');
        console.log('4. Look for plugin messages and errors');
        enableDebugMode();
      }
    },
    timeout: 8000
  });
}
```

These patterns ensure robust error handling, excellent user experience, and maintainable code that follows Scripter's proven practices while avoiding UI pollution with result text.
