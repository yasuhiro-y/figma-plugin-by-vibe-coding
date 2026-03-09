# Performance Optimization & Memory Management

> **Note**: For specific Figma API method signatures, see plugin-api.d.ts.

## CRITICAL: Infinite Loop Prevention

**FATAL RISK**: Infinite loops in plugins can freeze Figma entirely, requiring force quit.

### Loop Safety Patterns

```typescript
// ❌ DANGEROUS - Potential infinite loop
function findParentFrame(node: SceneNode): FrameNode | null {
  let current = node.parent;
  while (current) {
    if (current.type === 'FRAME') {
      return current as FrameNode;
    }
    current = current.parent; // Could loop forever if tree is corrupted
  }
  return null;
}

// ✅ SAFE - With maximum depth protection
function findParentFrame(node: SceneNode, maxDepth = 100): FrameNode | null {
  let current = node.parent;
  let depth = 0;
  
  while (current && depth < maxDepth) {
    if (current.type === 'FRAME') {
      return current as FrameNode;
    }
    current = current.parent;
    depth++;
  }
  
  if (depth >= maxDepth) {
    console.warn('Maximum depth reached while searching for parent frame');
  }
  
  return null;
}

// ✅ ROBUST - With circular reference detection
function findParentFrameSafe(node: SceneNode): FrameNode | null {
  const visited = new Set<string>();
  let current = node.parent;
  
  while (current) {
    if (visited.has(current.id)) {
      console.error('Circular reference detected in node tree');
      break;
    }
    visited.add(current.id);
    
    if (current.type === 'FRAME') {
      return current as FrameNode;
    }
    current = current.parent;
  }
  
  return null;
}
```

## Heavy Processing Management

### Chunked Processing for Large Operations

```typescript
// ✅ CHUNKED PROCESSING - Prevents UI freeze
async function processLargeDataset(
  items: SceneNode[], 
  processor: (item: SceneNode) => void,
  chunkSize = 50
): Promise<void> {
  const totalChunks = Math.ceil(items.length / chunkSize);
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkNumber = Math.floor(i / chunkSize) + 1;
    
    // Process chunk synchronously
    chunk.forEach(processor);
    
    // Update progress
    const progress = chunkNumber / totalChunks;
    figma.ui.postMessage({
      type: 'progress-update',
      progress,
      message: `Processing ${chunkNumber}/${totalChunks} chunks...`
    });
    
    // Yield control back to Figma UI
    if (i + chunkSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}

// ✅ INTERRUPTIBLE PROCESSING - Allow cancellation
class InterruptibleProcessor {
  private cancelled = false;
  private progress = 0;
  
  cancel(): void {
    this.cancelled = true;
  }
  
  async processWithCancellation(
    items: SceneNode[],
    processor: (item: SceneNode) => Promise<void>
  ): Promise<boolean> {
    for (let i = 0; i < items.length; i++) {
      if (this.cancelled) {
        figma.notify('Processing cancelled by user');
        return false;
      }
      
      await processor(items[i]);
      
      this.progress = (i + 1) / items.length;
      
      // Update UI periodically
      if (i % 10 === 0) {
        figma.ui.postMessage({
          type: 'progress-update',
          progress: this.progress
        });
        
        // Yield for cancellation check
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return true; // Completed successfully
  }
}
```

### Batch API Operations

```typescript
// ❌ SLOW - Sequential API calls
async function loadFontsSequentially(textNodes: TextNode[]): Promise<void> {
  for (const node of textNodes) {
    if (node.fontName !== figma.mixed) {
      const fontName = node.fontName as FontName;
      await figma.loadFontAsync(fontName); // Each font loads individually
    }
  }
}

// ✅ FAST - Parallel batch loading
async function loadFontsBatch(textNodes: TextNode[]): Promise<void> {
  // Collect unique fonts first
  const uniqueFonts = new Map<string, FontName>();
  
  textNodes.forEach(node => {
    if (node.fontName !== figma.mixed) {
      const fontName = node.fontName as FontName;
      const key = `${fontName.family}-${fontName.style}`;
      uniqueFonts.set(key, fontName);
    }
  });
  
  // Load all fonts in parallel
  const fontPromises = Array.from(uniqueFonts.values()).map(fontName =>
    figma.loadFontAsync(fontName).catch(error => {
      console.error(`Font loading failed: ${fontName.family}-${fontName.style}`, error);
      return null; // Continue with other fonts
    })
  );
  
  await Promise.all(fontPromises);
  figma.notify(`Loaded ${uniqueFonts.size} fonts successfully`);
}
```

## Node Property Access Optimization

### Efficient Property Reading

```typescript
// ❌ INEFFICIENT - Multiple property reads trigger recalculation
function inefficientNodeProcessing(nodes: SceneNode[]): void {
  nodes.forEach(node => {
    // Each property access may trigger internal calculations
    const width = node.width;
    const height = node.height;
    const x = node.x;
    const y = node.y;
    
    // Modifying properties triggers recalculation
    node.x = x + 10;
    node.y = y + 10;
    
    // More property reads after modifications
    const newWidth = node.width; // Recalculates layout
    const newHeight = node.height;
  });
}

// ✅ OPTIMIZED - Batch reads, then batch writes
function optimizedNodeProcessing(nodes: SceneNode[]): void {
  // Phase 1: Batch read all properties
  const nodeData = nodes.map(node => ({
    node,
    originalBounds: {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    }
  }));
  
  // Phase 2: Calculate transformations
  const transformations = nodeData.map(({ originalBounds }) => ({
    x: originalBounds.x + 10,
    y: originalBounds.y + 10,
    scaleX: 1.1,
    scaleY: 1.1
  }));
  
  // Phase 3: Batch write all modifications
  nodeData.forEach(({ node }, index) => {
    const transform = transformations[index];
    
    // Group modifications to minimize recalculation
    node.x = transform.x;
    node.y = transform.y;
    
    if ('resize' in node) {
      node.resize(
        node.width * transform.scaleX,
        node.height * transform.scaleY
      );
    }
  });
}
```

### Viewport Update Optimization

```typescript
// ❌ INEFFICIENT - Multiple viewport updates
function inefficientViewportUpdates(nodes: SceneNode[]): void {
  nodes.forEach(node => {
    node.x += 50;
    figma.viewport.scrollAndZoomIntoView([node]); // Expensive operation per node
  });
}

// ✅ OPTIMIZED - Single viewport update
function optimizedViewportUpdate(nodes: SceneNode[]): void {
  // Modify all nodes first
  nodes.forEach(node => {
    node.x += 50;
  });
  
  // Single viewport update for all modified nodes
  if (nodes.length > 0) {
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
}
```

## Memory Management & Leak Prevention

### Plugin Thread Memory Management

```typescript
// ✅ MEMORY-EFFICIENT NODE PROCESSING
class MemoryEfficientProcessor {
  private processedCount = 0;
  private readonly batchSize = 100;
  
  async processLargeNodeSet(nodes: SceneNode[]): Promise<void> {
    // Process in batches to prevent memory buildup
    for (let i = 0; i < nodes.length; i += this.batchSize) {
      const batch = nodes.slice(i, i + this.batchSize);
      
      // Process batch
      await this.processBatch(batch);
      
      // Force garbage collection hint (if available)
      if (typeof global !== 'undefined' && global.gc) {
        global.gc();
      }
      
      // Yield to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  private async processBatch(nodes: SceneNode[]): Promise<void> {
    const results = await Promise.all(
      nodes.map(node => this.processNode(node))
    );
    
    this.processedCount += results.filter(Boolean).length;
    
    // Clear batch references
    results.length = 0;
  }
  
  private async processNode(node: SceneNode): Promise<boolean> {
    try {
      // Process node logic here
      return true;
    } catch (error) {
      console.error('Node processing failed:', error);
      return false;
    }
  }
}
```

### UI Thread Memory Management

```typescript
// ✅ REACT MEMORY LEAK PREVENTION
function useMemoryEfficientPlugin() {
  const [data, setData] = useState<PluginData[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const requestsRef = useRef<Map<string, AbortController>>(new Map());
  
  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.length = 0;
    
    // Abort pending requests
    requestsRef.current.forEach(controller => controller.abort());
    requestsRef.current.clear();
    
    // Clear large data
    setData([]);
  }, []);
  
  // Auto-cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  // Timeout with cleanup tracking
  const createTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      callback();
      // Remove from tracking
      const index = timeoutsRef.current.indexOf(timeoutId);
      if (index > -1) {
        timeoutsRef.current.splice(index, 1);
      }
    }, delay);
    
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);
  
  return { data, setData, createTimeout, cleanup };
}

// ✅ EFFICIENT LIST RENDERING
const MemoizedListItem = memo(({ item, onClick }: ListItemProps) => {
  return (
    <div onClick={() => onClick(item.id)} className="p-2 border-b">
      {item.name}
    </div>
  );
});

function EfficientList({ items }: { items: ListItem[] }) {
  // Virtual scrolling for large lists
  const [visibleStart, setVisibleStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const ITEM_HEIGHT = 40;
  const CONTAINER_HEIGHT = 300;
  const VISIBLE_COUNT = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT) + 2; // Buffer
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleStart, visibleStart + VISIBLE_COUNT);
  }, [items, visibleStart, VISIBLE_COUNT]);
  
  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: CONTAINER_HEIGHT }}
      onScroll={(e) => {
        const scrollTop = e.currentTarget.scrollTop;
        const newStart = Math.floor(scrollTop / ITEM_HEIGHT);
        setVisibleStart(newStart);
      }}
    >
      <div style={{ height: items.length * ITEM_HEIGHT, position: 'relative' }}>
        <div 
          style={{ 
            position: 'absolute',
            top: visibleStart * ITEM_HEIGHT,
            width: '100%'
          }}
        >
          {visibleItems.map(item => (
            <MemoizedListItem key={item.id} item={item} onClick={handleItemClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

## API Usage Optimization

### Smart API Call Patterns

```typescript
// ✅ DEBOUNCED API CALLS - Prevent excessive requests
function useDebouncePlugin<T>(value: T, delay: number, callback: (value: T) => void) {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );
  
  useEffect(() => {
    debouncedCallback(value);
  }, [value, debouncedCallback]);
  
  useEffect(() => {
    return () => debouncedCallback.cancel();
  }, [debouncedCallback]);
}

// ✅ REQUEST DEDUPLICATION
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();
  
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Return existing request if pending
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }
    
    // Create new request
    const request = requestFn().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, request);
    return request;
  }
}

const requestDedup = new RequestDeduplicator();

// Usage
async function getNodeData(nodeId: string): Promise<NodeData> {
  return requestDedup.deduplicate(`node-${nodeId}`, async () => {
    const node = await figma.getNodeByIdAsync(nodeId);
    return node ? { id: node.id, name: node.name, type: node.type } : null;
  });
}
```

### Efficient Selection Processing

```typescript
// ✅ SMART SELECTION HANDLING
class SelectionProcessor {
  private lastProcessedSelection: string[] = [];
  
  processSelection(): void {
    const currentSelection = figma.currentPage.selection.map(n => n.id);
    
    // Skip if selection hasn't changed
    if (this.arraysEqual(currentSelection, this.lastProcessedSelection)) {
      return;
    }
    
    this.lastProcessedSelection = [...currentSelection];
    
    // Group nodes by type for efficient processing
    const nodesByType = this.groupSelectionByType(figma.currentPage.selection);
    
    // Process each type optimally
    this.processTextNodes(nodesByType.TEXT || []);
    this.processShapeNodes([
      ...(nodesByType.RECTANGLE || []),
      ...(nodesByType.ELLIPSE || [])
    ]);
  }
  
  private groupSelectionByType(selection: readonly SceneNode[]): Record<string, SceneNode[]> {
    return selection.reduce((groups, node) => {
      const type = node.type;
      (groups[type] = groups[type] || []).push(node);
      return groups;
    }, {} as Record<string, SceneNode[]>);
  }
  
  private arraysEqual(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }
  
  private async processTextNodes(textNodes: SceneNode[]): Promise<void> {
    if (textNodes.length === 0) return;
    
    // Batch font loading
    await loadFontsBatch(textNodes as TextNode[]);
    
    // Process all text nodes
    textNodes.forEach(node => {
      if (node.type === 'TEXT') {
        // Text processing logic
      }
    });
  }
  
  private processShapeNodes(shapeNodes: SceneNode[]): void {
    if (shapeNodes.length === 0) return;
    
    // Batch shape processing (no async needed)
    shapeNodes.forEach(node => {
      // Shape processing logic
    });
  }
}
```

## Performance Monitoring

### Performance Profiling

```typescript
// ✅ PERFORMANCE MONITORING
class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  time<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    
    try {
      const result = fn();
      return result;
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      
      if (duration > 100) {
        console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
      }
    }
  }
  
  async timeAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      return result;
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      
      if (duration > 500) {
        console.warn(`Slow async operation: ${operation} took ${duration.toFixed(2)}ms`);
      }
    }
  }
  
  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const times = this.metrics.get(operation)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }
  
  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  reportMetrics(): void {
    console.group('Performance Metrics');
    this.metrics.forEach((times, operation) => {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const max = Math.max(...times);
      console.log(`${operation}: avg ${avg.toFixed(2)}ms, max ${max.toFixed(2)}ms, samples ${times.length}`);
    });
    console.groupEnd();
  }
}

const perf = new PerformanceMonitor();

// Usage
const result = perf.time('node-processing', () => {
  return processComplexNodes(nodes);
});
```

**LLM INSTRUCTION**: These performance optimization patterns are critical for creating responsive, reliable plugins that don't freeze Figma or consume excessive memory.
