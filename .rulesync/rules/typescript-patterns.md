---
root: false
targets: ["*"]
description: "TypeScript Best Practices and Type Safety Patterns"
globs: ["src/**/*.ts", "src/**/*.tsx", "*.config.ts", "tsconfig*.json"]
---

# TypeScript Best Practices for Figma Plugin Development

## Mandatory Type Annotations

### Function Signatures
```typescript
// ✅ REQUIRED - Explicit parameter and return types
function processNode(node: SceneNode): NodeData {
  return { id: node.id, name: node.name, type: node.type };
}

// ✅ REQUIRED - Async functions with Promise types
async function fetchAndTransform(input: string, options: TransformOptions): Promise<Result<OutputData>> {
  const parsed = InputSchema.parse(input);
  const transformed = applyTransform(parsed, options);
  return { success: true, data: transformed };
}

// ❌ FORBIDDEN - Implicit types
function processNode(node) { // Missing parameter type
  return { id: node.id }; // Missing return type
}
```

### Interface Definitions
```typescript
// ✅ REQUIRED - Comprehensive interface definitions
interface NodeData {
  readonly id: string;
  readonly name: string;
  readonly type: NodeType;
  readonly visible: boolean;
}

interface PluginMessage {
  readonly type: MessageType;
  readonly id?: string;
  readonly data?: Record<string, unknown>;
}

interface UIState {
  readonly isConnected: boolean;
  readonly selection: NodeData[];
  readonly rectangleCount: number;
}
```

## Error Handling Patterns

### Result Type Pattern
```typescript
// ✅ REQUIRED - Result pattern for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function safeNodeOperation(nodeId: string): Promise<Result<NodeData>> {
  try {
    const node = figma.getNodeById(nodeId);
    if (!node) {
      return { 
        success: false, 
        error: new Error(`Node with ID ${nodeId} not found`) 
      };
    }
    
    const nodeData: NodeData = {
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible
    };
    
    return { success: true, data: nodeData };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
```

### Usage of Result Pattern
```typescript
// ✅ REQUIRED - Proper Result pattern usage
async function handleNodeOperation(nodeId: string): Promise<void> {
  const result = await safeNodeOperation(nodeId);
  
  if (!result.success) {
    figma.notify(`Error: ${result.error.message}`, { error: true });
    return;
  }
  
  // Safe to use result.data here
  console.log(`Node: ${result.data.name}`);
}
```

## Zod Schema Validation

### Runtime Validation for External Data
```typescript
import { z } from 'zod';

// ✅ REQUIRED - Zod schemas for message validation
const UIMessageSchema = z.object({
  type: z.enum(['create-rectangle', 'get-selection', 'close-plugin']),
  id: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  color: z.object({
    r: z.number().min(0).max(1),
    g: z.number().min(0).max(1),
    b: z.number().min(0).max(1)
  }).optional()
});

type UIMessage = z.infer<typeof UIMessageSchema>;

// ✅ REQUIRED - Validate external data
function validateMessage(data: unknown): UIMessage {
  try {
    return UIMessageSchema.parse(data);
  } catch (error) {
    throw new Error(`Invalid message format: ${error}`);
  }
}
```

## Type Guards and Narrowing

### Node Type Guards
```typescript
// ✅ REQUIRED - Type guards for safe node operations
function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

function isFrameNode(node: SceneNode): node is FrameNode {
  return node.type === 'FRAME';
}

function isRectangleNode(node: SceneNode): node is RectangleNode {
  return node.type === 'RECTANGLE';
}

// ✅ Usage with type guards
function processSelectedNodes(): void {
  const selection = figma.currentPage.selection;
  
  selection.forEach(node => {
    if (isTextNode(node)) {
      // TypeScript knows this is a TextNode
      console.log(`Text content: ${node.characters}`);
    } else if (isRectangleNode(node)) {
      // TypeScript knows this is a RectangleNode
      console.log(`Rectangle size: ${node.width}x${node.height}`);
    }
  });
}
```

## Communication Type Safety

### Message Type Definitions
```typescript
// ✅ REQUIRED - Complete message type system
export interface PluginAPI {
  createRectangle(width: number, height: number): Promise<string>;
  getSelectedNodes(): Promise<NodeData[]>;
  deleteNodes(nodeIds: string[]): Promise<boolean>;
}

export interface UIMessages {
  'create-rectangle': {
    width: number;
    height: number;
    color?: RGB;
  };
  'get-selection': Record<string, never>;
  'close-plugin': Record<string, never>;
}

export interface PluginMessages {
  'selection-changed': {
    selection: NodeData[];
  };
  'operation-result': {
    id: string;
    result: unknown;
  };
  'notification': {
    message: string;
    error?: boolean;
  };
}

// ✅ Type-safe message handling
type MessageHandler<T extends keyof UIMessages> = (
  data: UIMessages[T]
) => Promise<void> | void;

const messageHandlers: {
  [K in keyof UIMessages]: MessageHandler<K>;
} = {
  'create-rectangle': async ({ width, height, color }) => {
    // Fully typed parameters
    const rect = figma.createRectangle();
    rect.resize(width, height);
    if (color) {
      rect.fills = [{ type: 'SOLID', color }];
    }
    figma.currentPage.appendChild(rect);
  },
  'get-selection': async () => {
    const selection = figma.currentPage.selection;
    // Handle selection...
  },
  'close-plugin': () => {
    figma.closePlugin();
  }
};
```

## React Component Type Patterns

### Component Props Types
```typescript
// ✅ REQUIRED - Explicit component prop types
interface SelectionPanelProps {
  readonly selection: NodeData[];
  readonly onRefreshSelection: () => void;
  readonly className?: string;
}

// ✅ Component with explicit return type
export function SelectionPanel({ 
  selection, 
  onRefreshSelection,
  className = '' 
}: SelectionPanelProps): JSX.Element {
  return (
    <Card className={className}>
      {/* Component implementation */}
    </Card>
  );
}
```

### Custom Hook Types
```typescript
// ✅ REQUIRED - Custom hook return types
interface FigmaPluginHookReturn {
  readonly selection: NodeData[];
  readonly isConnected: boolean;
  readonly createRectangle: (options: CreateRectangleOptions) => void;
  readonly getSelection: () => void;
  readonly closePlugin: () => void;
}

function useFigmaPlugin(options: FigmaPluginOptions = {}): FigmaPluginHookReturn {
  // Hook implementation with full type safety
  return {
    selection,
    isConnected,
    createRectangle,
    getSelection,
    closePlugin
  };
}
```

## Constants and Enums

### Type-Safe Constants
```typescript
// ✅ REQUIRED - Type-safe constants
export const NODE_TYPE_ICONS = {
  RECTANGLE: '▢',
  ELLIPSE: '○',
  TEXT: 'T',
  FRAME: '▦'
} as const;

export type NodeTypeIcon = typeof NODE_TYPE_ICONS[keyof typeof NODE_TYPE_ICONS];

export const FIGMA_COLORS = {
  BLUE: { r: 0.2, g: 0.8, b: 1 },
  PURPLE: { r: 0.8, g: 0.2, b: 0.8 },
  ORANGE: { r: 1, g: 0.6, b: 0.2 }
} as const;

export type FigmaColor = typeof FIGMA_COLORS[keyof typeof FIGMA_COLORS];
```

## Configuration and Build Types

### Strict TypeScript Configuration
```json
// tsconfig.json - REQUIRED settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Advanced TypeScript Patterns for Figma Plugins

### Figma-Specific Type Patterns

> **Note**: Refer to plugin-api.d.ts for available node types and mixins.

```typescript
// ✅ FIGMA API TYPE GUARDS - Essential for safe node operations
function hasChildren(node: SceneNode): node is SceneNode & ChildrenMixin {
  return 'children' in node && Array.isArray((node as any).children);
}

function hasGeometry(node: SceneNode): node is SceneNode & GeometryMixin {
  return 'fills' in node && 'strokes' in node;
}

function canResize(node: SceneNode): node is SceneNode & LayoutMixin {
  return 'resize' in node && typeof (node as any).resize === 'function';
}

function hasText(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

// ✅ Usage with comprehensive type safety
function processNode(node: SceneNode): ProcessResult {
  if (!node || node.removed) {
    return { success: false, error: 'Node is invalid or removed' };
  }

  if (hasText(node)) {
    return processTextNode(node); // TypeScript knows this is TextNode
  } else if (hasGeometry(node)) {
    return processGeometryNode(node); // TypeScript knows this has fills/strokes
  } else if (hasChildren(node)) {
    return processContainerNode(node); // TypeScript knows this has children
  }

  return { success: false, error: 'Unsupported node type' };
}
```

### Plugin Communication Type Safety

```typescript
// ✅ COMPREHENSIVE MESSAGE TYPE SYSTEM
interface MessageBase {
  readonly id?: string;
  readonly timestamp?: number;
}

// UI → Plugin Messages
interface CreateNodeMessage extends MessageBase {
  readonly type: 'create-node';
  readonly nodeType: 'RECTANGLE' | 'ELLIPSE' | 'TEXT';
  readonly properties: CreateNodeProperties;
}

interface CreateNodeProperties {
  readonly width?: number;
  readonly height?: number;
  readonly x?: number;
  readonly y?: number;
  readonly fills?: ReadonlyArray<Paint>;
  readonly name?: string;
}

interface SelectionMessage extends MessageBase {
  readonly type: 'get-selection' | 'update-selection';
  readonly nodeIds?: readonly string[];
}

export type UIMessage = CreateNodeMessage | SelectionMessage | ClosePluginMessage;

// Plugin → UI Messages
interface NodeDataMessage extends MessageBase {
  readonly type: 'node-data';
  readonly nodes: readonly NodeData[];
}

interface ErrorMessage extends MessageBase {
  readonly type: 'error';
  readonly error: {
    readonly message: string;
    readonly code?: string;
    readonly context?: Record<string, unknown>;
  };
}

export type PluginMessage = NodeDataMessage | ErrorMessage | ProgressMessage;

// ✅ TYPE-SAFE MESSAGE HANDLERS
type MessageHandler<T extends UIMessage> = (message: T) => Promise<void> | void;

const messageHandlers: {
  readonly [K in UIMessage['type']]: MessageHandler<Extract<UIMessage, { type: K }>>;
} = {
  'create-node': async (msg) => {
    // TypeScript automatically narrows the type
    const { nodeType, properties } = msg;
    await createNodeSafely(nodeType, properties);
  },
  
  'get-selection': async (msg) => {
    const selection = await getSelectionData();
    figma.ui.postMessage({
      type: 'node-data',
      id: msg.id,
      nodes: selection
    });
  }
};
```

### Advanced Error Handling Types

```typescript
// ✅ COMPREHENSIVE ERROR TYPE SYSTEM
interface BaseError {
  readonly message: string;
  readonly code: string;
  readonly timestamp: number;
}

interface FigmaAPIError extends BaseError {
  readonly type: 'FIGMA_API_ERROR';
  readonly nodeId?: string;
  readonly operation?: string;
}

interface FontError extends BaseError {
  readonly type: 'FONT_ERROR';
  readonly fontFamily: string;
  readonly fontStyle: string;
}

interface ValidationError extends BaseError {
  readonly type: 'VALIDATION_ERROR';
  readonly field: string;
  readonly value: unknown;
  readonly constraint: string;
}

interface NetworkError extends BaseError {
  readonly type: 'NETWORK_ERROR';
  readonly url: string;
  readonly status?: number;
}

export type PluginError = FigmaAPIError | FontError | ValidationError | NetworkError;

// ✅ ERROR FACTORY FUNCTIONS WITH PROPER TYPING
class ErrorFactory {
  static fontError(fontName: FontName, operation: string): FontError {
    return {
      type: 'FONT_ERROR',
      message: `Font operation failed: ${operation}`,
      code: 'FONT_LOAD_FAILED',
      timestamp: Date.now(),
      fontFamily: fontName.family,
      fontStyle: fontName.style
    };
  }

  static validationError(field: string, value: unknown, constraint: string): ValidationError {
    return {
      type: 'VALIDATION_ERROR',
      message: `Validation failed for ${field}: ${constraint}`,
      code: 'VALIDATION_FAILED',
      timestamp: Date.now(),
      field,
      value,
      constraint
    };
  }

  static figmaAPIError(operation: string, nodeId?: string): FigmaAPIError {
    return {
      type: 'FIGMA_API_ERROR',
      message: `Figma API operation failed: ${operation}`,
      code: 'API_OPERATION_FAILED',
      timestamp: Date.now(),
      nodeId,
      operation
    };
  }
}

// ✅ RESULT TYPE WITH SPECIFIC ERROR TYPES
type Result<T, E extends PluginError = PluginError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

// Usage example
async function loadFont(fontName: FontName): Promise<Result<void, FontError>> {
  try {
    await figma.loadFontAsync(fontName);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: ErrorFactory.fontError(fontName, 'loadFontAsync')
    };
  }
}
```

### Performance-Optimized Type Patterns

```typescript
// ✅ EFFICIENT TYPE DEFINITIONS FOR LARGE DATASETS
interface NodeCache {
  readonly [nodeId: string]: {
    readonly data: NodeData;
    readonly lastAccessed: number;
    readonly version: number;
  };
}

interface BatchOperation<T> {
  readonly items: readonly T[];
  readonly batchSize: number;
  readonly onProgress?: (completed: number, total: number) => void;
  readonly onBatchComplete?: (batchIndex: number, results: readonly Result<unknown>[]) => void;
}

// ✅ MEMORY-EFFICIENT PROCESSING WITH GENERATORS
type NodeProcessor<T> = (node: SceneNode) => Promise<T>;

async function* processBatchedNodes<T>(
  nodes: readonly SceneNode[],
  processor: NodeProcessor<T>,
  batchSize = 50
): AsyncGenerator<readonly T[], void, unknown> {
  for (let i = 0; i < nodes.length; i += batchSize) {
    const batch = nodes.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(processor));
    yield results;
  }
}

// Usage with type safety
async function processAllTextNodes(): Promise<void> {
  const textNodes = figma.currentPage.findAll(node => node.type === 'TEXT') as TextNode[];
  
  for await (const batch of processBatchedNodes(textNodes, processTextNode, 25)) {
    console.log(`Processed batch of ${batch.length} text nodes`);
    
    // Allow UI to remain responsive
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
```

### Plugin Data & Storage Types

```typescript
// ✅ VERSIONED DATA STORAGE WITH MIGRATIONS
interface VersionedData<T> {
  readonly version: number;
  readonly data: T;
  readonly createdAt: number;
  readonly updatedAt: number;
}

interface UserSettings {
  readonly theme: 'light' | 'dark' | 'system';
  readonly defaultColors: readonly RGB[];
  readonly shortcuts: Record<string, string>;
  readonly recentActions: readonly string[];
}

interface PluginMetadata {
  readonly version: string;
  readonly lastUsed: number;
  readonly usage: {
    readonly totalOperations: number;
    readonly favoriteFeatures: readonly string[];
  };
}

// ✅ TYPE-SAFE STORAGE MANAGER
class TypedStorage {
  static async setUserSettings(settings: UserSettings): Promise<Result<void>> {
    const versionedData: VersionedData<UserSettings> = {
      version: 1,
      data: settings,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await figma.clientStorage.setAsync('user-settings', JSON.stringify(versionedData));
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: ErrorFactory.figmaAPIError('setAsync', 'user-settings')
      };
    }
  }

  static async getUserSettings(): Promise<Result<UserSettings | null>> {
    try {
      const stored = await figma.clientStorage.getAsync('user-settings');
      if (!stored) {
        return { success: true, data: null };
      }

      const versionedData = JSON.parse(stored) as VersionedData<UserSettings>;
      
      // Handle version migrations if needed
      if (versionedData.version < 1) {
        // Migration logic here
      }

      return { success: true, data: versionedData.data };
    } catch (error) {
      return {
        success: false,
        error: ErrorFactory.figmaAPIError('getAsync', 'user-settings')
      };
    }
  }
}
```

### React Component Type Integration

```typescript
// ✅ COMPREHENSIVE COMPONENT TYPE PATTERNS
interface BaseComponentProps {
  readonly className?: string;
  readonly 'data-testid'?: string;
}

interface ConnectedComponentProps extends BaseComponentProps {
  readonly isConnected: boolean;
  readonly onConnectionLost?: () => void;
}

interface PluginFeatureProps<T = unknown> extends ConnectedComponentProps {
  readonly featureData: T;
  readonly isLoading: boolean;
  readonly error?: PluginError;
  readonly onRetry?: () => void;
}

// ✅ GENERIC FEATURE COMPONENT PATTERN
interface FeatureComponentProps<TData, TActions> extends BaseComponentProps {
  readonly data: TData;
  readonly actions: TActions;
  readonly state: {
    readonly isLoading: boolean;
    readonly error?: PluginError;
  };
}

// Example usage
interface ColorPaletteData {
  readonly colors: readonly RGB[];
  readonly selectedIndex: number;
}

interface ColorPaletteActions {
  readonly onColorSelect: (index: number) => void;
  readonly onAddColor: (color: RGB) => void;
  readonly onRemoveColor: (index: number) => void;
}

function ColorPalette(props: FeatureComponentProps<ColorPaletteData, ColorPaletteActions>): JSX.Element {
  // Fully typed component implementation
  const { data, actions, state } = props;
  
  if (state.error) {
    return <ErrorDisplay error={state.error} onRetry={actions.onRetry} />;
  }
  
  return (
    <Card>
      {data.colors.map((color, index) => (
        <ColorSwatch
          key={index}
          color={color}
          isSelected={index === data.selectedIndex}
          onClick={() => actions.onColorSelect(index)}
        />
      ))}
    </Card>
  );
}
```

### Build-Time Type Generation

```typescript
// ✅ GENERATE TYPES FROM RUNTIME DATA
// This can be used with tools like ts-to-zod for runtime validation

export const PLUGIN_ACTIONS = {
  'create-rectangle': z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    color: z.object({
      r: z.number().min(0).max(1),
      g: z.number().min(0).max(1),
      b: z.number().min(0).max(1),
    }).optional(),
  }),
  'create-text': z.object({
    content: z.string().min(1),
    fontSize: z.number().positive().max(1000),
    fontName: z.object({
      family: z.string(),
      style: z.string(),
    }),
  }),
} as const;

// Generate TypeScript types from Zod schemas
export type PluginActions = {
  readonly [K in keyof typeof PLUGIN_ACTIONS]: z.infer<typeof PLUGIN_ACTIONS[K]>;
};

// Type-safe action handler
function handlePluginAction<K extends keyof PluginActions>(
  action: K,
  data: PluginActions[K]
): Promise<Result<unknown>> {
  // Implementation with full type safety
  return Promise.resolve({ success: true, data: null });
}
```

This comprehensive TypeScript approach ensures complete type safety, better developer experience, fewer runtime errors in production, and seamless integration with Figma's complex API surface area.
