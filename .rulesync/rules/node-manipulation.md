# Node Manipulation Best Practices

## CRITICAL: Readonly Property Limitations

**MAJOR PITFALL**: Figma node properties like `fills`, `strokes`, and nested objects are **READONLY**. Direct modification causes runtime errors.

### The Readonly Problem

```typescript
// ❌ FATAL ERROR - Cannot modify readonly properties
node.fills[0].opacity = 0.5;           // TypeError!
node.fills[0].color.r = 1;             // TypeError!
node.strokes[0].color = { r: 1, g: 0, b: 0 }; // TypeError!
```

### Solution: Clone, Modify, Reassign

```typescript
// ✅ CORRECT - Deep clone method
const newFills = JSON.parse(JSON.stringify(node.fills)) as Paint[];
if (newFills[0] && newFills[0].type === 'SOLID') {
  newFills[0].opacity = 0.5;
  newFills[0].color = { r: 1, g: 0.5, b: 0.2 };
}
node.fills = newFills;

// ✅ ALTERNATIVE - Spread operator with proper typing
const fills = [...node.fills] as Paint[];
if (fills[0] && fills[0].type === 'SOLID') {
  fills[0] = { 
    ...fills[0], 
    opacity: 0.5,
    color: { r: 1, g: 0.5, b: 0.2 }
  };
}
node.fills = fills;
```

### Complex Paint Manipulation

```typescript
// ✅ ROBUST PAINT HANDLING
function updateNodeFill(node: SceneNode, color: RGB, opacity = 1): void {
  if (!('fills' in node)) return;
  
  const currentFills = node.fills as Paint[];
  
  // Create new fill array
  const newFills: Paint[] = [{
    type: 'SOLID',
    color: color,
    opacity: opacity,
    blendMode: 'NORMAL',
    visible: true
  }];
  
  node.fills = newFills;
}

// ✅ PRESERVE EXISTING PAINT PROPERTIES
function modifyExistingFill(node: SceneNode, updates: Partial<SolidPaint>): void {
  if (!('fills' in node) || !node.fills || node.fills.length === 0) return;
  
  const fills = [...node.fills] as Paint[];
  
  if (fills[0] && fills[0].type === 'SOLID') {
    fills[0] = {
      ...fills[0],
      ...updates  // Merge updates preserving existing properties
    };
  }
  
  node.fills = fills;
}
```

## Node Type Safety & Guards

### Essential Type Guards

```typescript
// ✅ COMPREHENSIVE TYPE GUARDS
function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

function isFrameNode(node: SceneNode): node is FrameNode {
  return node.type === 'FRAME';
}

function isInstanceNode(node: SceneNode): node is InstanceNode {
  return node.type === 'INSTANCE';
}

function hasChildren(node: SceneNode): node is SceneNode & ChildrenMixin {
  return 'children' in node && Array.isArray(node.children);
}

function hasGeometry(node: SceneNode): node is SceneNode & GeometryMixin {
  return 'fills' in node;
}

function canResize(node: SceneNode): node is SceneNode & LayoutMixin {
  return 'resize' in node;
}
```

### Safe Node Access Patterns

```typescript
// ✅ DEFENSIVE NODE OPERATIONS
function safelyModifyNode(node: SceneNode): void {
  // Check if node still exists
  if (node.removed) {
    console.warn('Node was removed, skipping');
    return;
  }
  
  // Check if node is accessible
  if (node.locked) {
    figma.notify('Node is locked, cannot modify');
    return;
  }
  
  if (!node.visible) {
    console.warn('Node is hidden, modifications may not be visible');
  }
  
  // Type-safe operations
  if (isTextNode(node)) {
    modifyTextNode(node);
  } else if (hasGeometry(node)) {
    modifyGeometryNode(node);
  }
}
```

## Coordinate Systems & Positioning

### Understanding Coordinate Systems

```typescript
// ✅ COORDINATE SYSTEM GUIDE
interface CoordinateSystems {
  // Relative to parent
  localPosition: { x: number; y: number };
  
  // Absolute position on canvas
  absoluteTransform: Transform;
  
  // Visual bounding box (includes effects, rotation)
  absoluteRenderBounds: Rect | null;
  
  // Basic bounding box (excludes effects)
  absoluteBoundingBox: Rect | null;
}

function analyzeNodePosition(node: SceneNode): CoordinateSystems {
  return {
    localPosition: { x: node.x, y: node.y },
    absoluteTransform: node.absoluteTransform,
    absoluteRenderBounds: node.absoluteRenderBounds,
    absoluteBoundingBox: node.absoluteBoundingBox
  };
}
```

### Viewport-Aware Positioning

```typescript
// ✅ SMART POSITIONING - Use viewport context
function positionNodeInViewport(node: SceneNode, offset = { x: 0, y: 0 }): void {
  const viewport = figma.viewport.bounds;
  const centerX = viewport.x + viewport.width / 2;
  const centerY = viewport.y + viewport.height / 2;
  
  // Convert screen coordinates to canvas coordinates
  const canvasCenter = figma.viewport.screenToCanvas(centerX, centerY);
  
  // Position node with offset
  node.x = canvasCenter.x + offset.x;
  node.y = canvasCenter.y + offset.y;
}

// ✅ HANDLE ROTATED/TRANSFORMED NODES
function getVisualBounds(node: SceneNode): Rect | null {
  // Use render bounds for rotated/scaled nodes
  const bounds = node.absoluteRenderBounds;
  if (!bounds) return null;
  
  return {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height
  };
}
```

## Text Node Manipulation

### Comprehensive Text Handling

```typescript
// ✅ COMPLETE TEXT NODE PROCESSING
async function processTextNode(node: TextNode): Promise<void> {
  try {
    // Check for missing fonts
    if (node.hasMissingFont) {
      figma.notify('Text contains missing fonts - skipping', { error: true });
      return;
    }
    
    // Handle mixed fonts
    if (node.fontName === figma.mixed) {
      await handleMixedFontText(node);
    } else {
      // Single font
      const fontName = node.fontName as FontName;
      await figma.loadFontAsync(fontName);
      
      // Now safe to modify text properties
      node.characters = `Processed: ${node.characters}`;
      
      // Handle fontSize safely
      if (node.fontSize !== figma.mixed && typeof node.fontSize === 'number') {
        node.fontSize = Math.max(8, node.fontSize * 1.1); // Ensure minimum size
      }
    }
  } catch (error) {
    console.error('Text processing failed:', error);
    figma.notify(`Text processing failed: ${error.message}`, { error: true });
  }
}

// ✅ MIXED FONT HANDLING
async function handleMixedFontText(node: TextNode): Promise<void> {
  const textLength = node.characters.length;
  const uniqueFonts = new Set<string>();
  
  // Collect all unique fonts
  for (let i = 0; i < textLength; i++) {
    const fontName = node.getRangeFontName(i, i + 1) as FontName;
    const fontKey = `${fontName.family}-${fontName.style}`;
    uniqueFonts.add(fontKey);
  }
  
  // Load all fonts
  for (let i = 0; i < textLength; i++) {
    const fontName = node.getRangeFontName(i, i + 1) as FontName;
    await figma.loadFontAsync(fontName);
  }
  
  // Now safe to modify text
  node.characters = `[${uniqueFonts.size} fonts] ${node.characters}`;
}
```

### Text Range Operations

```typescript
// ✅ SAFE TEXT RANGE MANIPULATION
function modifyTextRange(node: TextNode, start: number, end: number, newText: string): void {
  const textLength = node.characters.length;
  
  // Validate range bounds
  const safeStart = Math.max(0, Math.min(start, textLength));
  const safeEnd = Math.max(safeStart, Math.min(end, textLength));
  
  try {
    // Load font for the range
    const fontName = node.getRangeFontName(safeStart, safeEnd) as FontName;
    figma.loadFontAsync(fontName).then(() => {
      // Replace text in range
      const before = node.characters.slice(0, safeStart);
      const after = node.characters.slice(safeEnd);
      node.characters = before + newText + after;
    });
  } catch (error) {
    console.error('Text range modification failed:', error);
  }
}
```

## Selection Management

### Robust Selection Handling

```typescript
// ✅ COMPREHENSIVE SELECTION PROCESSING
function processCurrentSelection(): SelectionResult {
  const selection = figma.currentPage.selection;
  
  // Handle empty selection
  if (selection.length === 0) {
    return { 
      success: false, 
      message: 'Please select at least one object',
      count: 0 
    };
  }
  
  // Analyze selection
  const analysis = analyzeSelection(selection);
  
  if (!analysis.canProcess) {
    return {
      success: false,
      message: `Cannot process selection: ${analysis.issues.join(', ')}`,
      count: selection.length
    };
  }
  
  // Process valid nodes
  const results = selection.map(processNode).filter(Boolean);
  
  return {
    success: true,
    message: `Processed ${results.length} of ${selection.length} nodes`,
    count: results.length,
    processed: results
  };
}

interface SelectionAnalysis {
  canProcess: boolean;
  issues: string[];
  types: string[];
  hasLocked: boolean;
  hasHidden: boolean;
}

function analyzeSelection(selection: readonly SceneNode[]): SelectionAnalysis {
  const issues: string[] = [];
  const types = [...new Set(selection.map(node => node.type))];
  
  const hasLocked = selection.some(node => node.locked);
  const hasHidden = selection.some(node => !node.visible);
  const hasRemoved = selection.some(node => node.removed);
  
  if (hasLocked) issues.push('some nodes are locked');
  if (hasHidden) issues.push('some nodes are hidden');
  if (hasRemoved) issues.push('some nodes were deleted');
  
  return {
    canProcess: issues.length === 0,
    issues,
    types,
    hasLocked,
    hasHidden
  };
}
```

## Instance & Component Handling

### Safe Instance Manipulation

```typescript
// ✅ COMPONENT INSTANCE BEST PRACTICES
function processInstance(instance: InstanceNode): void {
  // Check if main component is accessible
  const mainComponent = instance.mainComponent;
  
  if (!mainComponent) {
    figma.notify('Instance has no main component');
    return;
  }
  
  // Check if it's a remote library component
  if (mainComponent.remote) {
    figma.notify('Cannot modify library components directly');
    
    // Can still modify instance properties
    instance.name = `Modified ${instance.name}`;
    return;
  }
  
  // Local component - can modify both instance and main
  instance.name = `Instance of ${mainComponent.name}`;
  
  // Modify instance overrides
  modifyInstanceOverrides(instance);
}

function modifyInstanceOverrides(instance: InstanceNode): void {
  // Find overridable properties
  const textOverrides = instance.findAll(node => 
    node.type === 'TEXT' && 'characters' in node
  ) as TextNode[];
  
  for (const textNode of textOverrides) {
    if (!textNode.locked) {
      // Safely modify text with font loading
      processTextNode(textNode);
    }
  }
}
```

## Vector & Path Manipulation

### Safe Vector Operations

```typescript
// ✅ VECTOR NETWORK HANDLING
function processVectorNode(node: VectorNode): void {
  try {
    const vectorNetwork = node.vectorNetwork;
    
    if (!vectorNetwork.vertices.length) {
      figma.notify('Vector has no vertices');
      return;
    }
    
    // Basic vector info
    console.log({
      vertices: vectorNetwork.vertices.length,
      segments: vectorNetwork.segments.length,
      regions: vectorNetwork.regions?.length || 0
    });
    
    // Only modify simple properties safely
    if (hasGeometry(node)) {
      updateNodeFill(node, { r: 0.5, g: 0.5, b: 1 });
    }
    
  } catch (error) {
    console.error('Vector processing failed:', error);
  }
}

// ✅ SVG IMPORT HANDLING
async function createFromSVG(svgString: string): Promise<SceneNode | null> {
  try {
    const node = figma.createNodeFromSvg(svgString);
    
    // SVG import may fail or produce unexpected results
    if (!node) {
      throw new Error('SVG import failed');
    }
    
    // Position and add to page
    figma.currentPage.appendChild(node);
    positionNodeInViewport(node);
    
    return node;
  } catch (error) {
    console.error('SVG import failed:', error);
    figma.notify('SVG contains unsupported features', { error: true });
    return null;
  }
}
```

## Performance Optimization

### Efficient Bulk Operations

```typescript
// ✅ OPTIMIZED BULK NODE PROCESSING
async function processManyNodes(nodes: SceneNode[]): Promise<void> {
  // Group nodes by type for efficient processing
  const nodesByType = groupBy(nodes, node => node.type);
  
  // Process text nodes (require font loading)
  if (nodesByType.TEXT) {
    await processTextNodesBulk(nodesByType.TEXT as TextNode[]);
  }
  
  // Process geometry nodes (no async needed)
  if (nodesByType.RECTANGLE || nodesByType.ELLIPSE) {
    const geometryNodes = [
      ...(nodesByType.RECTANGLE || []),
      ...(nodesByType.ELLIPSE || [])
    ];
    processGeometryNodesBulk(geometryNodes);
  }
  
  // Single viewport update for all processed nodes
  const processedNodes = nodes.filter(node => !node.removed);
  if (processedNodes.length > 0) {
    figma.viewport.scrollAndZoomIntoView(processedNodes);
  }
}

// ✅ BATCH FONT LOADING
async function processTextNodesBulk(textNodes: TextNode[]): Promise<void> {
  // Collect unique fonts
  const uniqueFonts = new Map<string, FontName>();
  
  for (const node of textNodes) {
    if (node.fontName !== figma.mixed) {
      const fontName = node.fontName as FontName;
      const key = `${fontName.family}-${fontName.style}`;
      uniqueFonts.set(key, fontName);
    }
  }
  
  // Load all fonts in parallel
  const fontPromises = Array.from(uniqueFonts.values()).map(fontName =>
    figma.loadFontAsync(fontName).catch(error => {
      console.error(`Font loading failed: ${fontName.family}-${fontName.style}`, error);
    })
  );
  
  await Promise.all(fontPromises);
  
  // Now process all text nodes
  textNodes.forEach(node => {
    if (!node.removed && !node.locked) {
      node.characters = `Bulk processed: ${node.characters}`;
    }
  });
}

function groupBy<T, K extends string | number | symbol>(
  array: T[], 
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    (groups[key] = groups[key] || []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}
```

## Error Prevention & Recovery

### Node State Validation

```typescript
// ✅ COMPREHENSIVE NODE VALIDATION
function validateNodeForOperation(node: SceneNode, operation: string): ValidationResult {
  const issues: string[] = [];
  
  // Basic existence checks
  if (node.removed) {
    return { valid: false, reason: 'Node was deleted' };
  }
  
  if (node.locked) {
    issues.push('node is locked');
  }
  
  if (!node.visible && operation !== 'show') {
    issues.push('node is hidden');
  }
  
  // Operation-specific checks
  if (operation === 'resize' && !canResize(node)) {
    issues.push('node cannot be resized');
  }
  
  if (operation === 'text-edit' && !isTextNode(node)) {
    issues.push('node is not text');
  }
  
  return {
    valid: issues.length === 0,
    reason: issues.join(', '),
    warnings: issues
  };
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
  warnings?: string[];
}
```

## CRITICAL: Font Loading for Text Operations

**MANDATORY**: Font loading MUST happen BEFORE creating or manipulating ANY text nodes. Creating a text node without pre-loading fonts causes immediate errors.

```typescript
// ❌ WRONG - Creates text node then tries to load font (ERROR!)
const textNode = figma.createText();  // ERROR: No font loaded
textNode.characters = 'Hello World';

// ❌ WRONG - Load font after creating text node (ERROR!)
const textNode = figma.createText();  // ERROR: No font loaded
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
textNode.characters = 'Hello World';

// ✅ CORRECT - Load font BEFORE creating text node
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const textNode = figma.createText();
textNode.characters = 'Hello World';
```

**LLM INSTRUCTION**: Text node creation requires a loaded font. Always load the font first, never create the text node and then attempt to load fonts.

### Font Loading Error Handling

```typescript
async function createTextWithFont(text: string, fontName: FontName): Promise<TextNode | null> {
  try {
    // CRITICAL: Load font BEFORE creating text node
    await figma.loadFontAsync(fontName);
    
    // Now safe to create and modify text
    const textNode = figma.createText();
    textNode.fontName = fontName;
    textNode.characters = text;
    
    return textNode;
  } catch (error) {
    console.error(`Failed to load font ${fontName.family}-${fontName.style}:`, error);
    figma.notify(`Font "${fontName.family}" not available`, { error: true });
    return null;
  }
}

// ✅ BATCH FONT LOADING - For multiple text nodes
async function loadRequiredFonts(fontNames: FontName[]): Promise<FontName[]> {
  const loadedFonts: FontName[] = [];
  
  await Promise.all(fontNames.map(async (fontName) => {
    try {
      await figma.loadFontAsync(fontName);
      loadedFonts.push(fontName);
    } catch (error) {
      console.warn(`Font ${fontName.family}-${fontName.style} not available`);
    }
  }));
  
  return loadedFonts;
}
```

**LLM INSTRUCTION**: These node manipulation patterns are essential for reliable plugin development. Always validate node state, handle readonly properties correctly, use proper type guards, and NEVER create text nodes without loading fonts first.
