# Advanced Features & Complex API Usage

## Vector Network Manipulation

### Understanding VectorNetwork Structure

**COMPLEXITY WARNING**: VectorNetwork is Figma's proprietary format, different from SVG paths.

```typescript
// ✅ SAFE VECTOR ANALYSIS - Read-only operations first
function analyzeVectorNetwork(vectorNode: VectorNode): VectorAnalysis {
  const network = vectorNode.vectorNetwork;
  
  return {
    vertexCount: network.vertices.length,
    segmentCount: network.segments.length,
    regionCount: network.regions?.length || 0,
    isClosed: network.regions && network.regions.length > 0,
    hasHoles: network.regions ? network.regions.some(r => r.windingRule === 'EVENODD') : false,
    bounds: vectorNode.absoluteBoundingBox
  };
}

interface VectorAnalysis {
  vertexCount: number;
  segmentCount: number;
  regionCount: number;
  isClosed: boolean;
  hasHoles: boolean;
  bounds: Rect | null;
}

// ✅ BASIC VECTOR MODIFICATIONS - Simple operations only
function simplifyVectorPath(vectorNode: VectorNode): boolean {
  try {
    const network = vectorNode.vectorNetwork;
    
    if (network.vertices.length < 3) {
      figma.notify('Vector must have at least 3 points', { error: true });
      return false;
    }
    
    // Only modify simple properties
    // DO NOT attempt complex path modifications
    if (hasGeometry(vectorNode)) {
      // Update styling instead of geometry
      updateNodeFill(vectorNode, { r: 0.5, g: 0.5, b: 1.0 });
      vectorNode.strokeWeight = 2;
    }
    
    return true;
  } catch (error) {
    console.error('Vector modification failed:', error);
    figma.notify('Vector modification not supported for this shape', { error: true });
    return false;
  }
}
```

### SVG Import Limitations & Workarounds

```typescript
// ✅ ROBUST SVG IMPORT - Handle failures gracefully
async function importSVGSafely(
  svgString: string, 
  fallbackOptions?: FallbackOptions
): Promise<SceneNode | null> {
  try {
    // Validate SVG string first
    if (!svgString.includes('<svg')) {
      throw new Error('Invalid SVG format');
    }
    
    // Attempt import
    const node = figma.createNodeFromSvg(svgString);
    
    if (!node) {
      throw new Error('SVG import returned null');
    }
    
    // Verify import success
    const bounds = node.absoluteBoundingBox;
    if (!bounds || bounds.width === 0 || bounds.height === 0) {
      throw new Error('SVG imported with zero dimensions');
    }
    
    figma.currentPage.appendChild(node);
    positionNodeInViewport(node);
    
    figma.notify('SVG imported successfully');
    return node;
    
  } catch (error) {
    console.error('SVG import failed:', error);
    
    // Attempt fallback strategies
    if (fallbackOptions?.createPlaceholder) {
      const placeholder = createSVGPlaceholder(fallbackOptions.width, fallbackOptions.height);
      figma.notify('SVG import failed - created placeholder instead', { 
        timeout: 5000,
        button: { text: 'Try Again', action: () => console.log('User wants to retry') }
      });
      return placeholder;
    }
    
    // Specific error messages for common issues
    const errorMessage = getSVGErrorMessage(error.message);
    figma.notify(errorMessage, { error: true, timeout: 8000 });
    
    return null;
  }
}

interface FallbackOptions {
  createPlaceholder?: boolean;
  width?: number;
  height?: number;
}

function getSVGErrorMessage(errorMsg: string): string {
  if (errorMsg.includes('filter')) {
    return 'SVG contains unsupported filters. Try simplifying the SVG.';
  }
  if (errorMsg.includes('mask')) {
    return 'SVG contains complex masking. Export as image instead.';
  }
  if (errorMsg.includes('text')) {
    return 'SVG text may not import correctly. Convert to paths first.';
  }
  return 'SVG format not fully supported. Try exporting from a different tool.';
}

function createSVGPlaceholder(width = 100, height = 100): RectangleNode {
  const rect = figma.createRectangle();
  rect.resize(width, height);
  rect.fills = [{
    type: 'SOLID',
    color: { r: 0.9, g: 0.9, b: 0.9 }
  }];
  rect.strokes = [{
    type: 'SOLID',
    color: { r: 0.5, g: 0.5, b: 0.5 }
  }];
  rect.strokeWeight = 1;
  rect.strokeAlign = 'INSIDE';
  rect.name = 'SVG Import Failed - Placeholder';
  
  figma.currentPage.appendChild(rect);
  return rect;
}
```

## Plugin Data Management

### Understanding Data Storage Types

```typescript
// ✅ PLUGIN DATA PATTERNS - Understand the differences
namespace PluginDataManager {
  
  // PRIVATE DATA - Only accessible by this plugin
  export function setPrivateData(node: SceneNode, key: string, value: any): void {
    try {
      const data = JSON.stringify(value);
      node.setPluginData(key, data);
    } catch (error) {
      console.error('Failed to set private plugin data:', error);
    }
  }
  
  export function getPrivateData<T>(node: SceneNode, key: string, defaultValue: T): T {
    try {
      const data = node.getPluginData(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Failed to get private plugin data:', error);
      return defaultValue;
    }
  }
  
  // SHARED DATA - Accessible by all team members
  export function setSharedData(node: SceneNode, namespace: string, key: string, value: any): void {
    try {
      const data = JSON.stringify(value);
      node.setSharedPluginData(namespace, key, data);
    } catch (error) {
      console.error('Failed to set shared plugin data:', error);
    }
  }
  
  export function getSharedData<T>(node: SceneNode, namespace: string, key: string, defaultValue: T): T {
    try {
      const data = node.getSharedPluginData(namespace, key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Failed to get shared plugin data:', error);
      return defaultValue;
    }
  }
  
  // BULK OPERATIONS - More efficient for multiple nodes
  export function bulkSetPrivateData(nodes: SceneNode[], key: string, value: any): void {
    const data = JSON.stringify(value);
    nodes.forEach(node => {
      try {
        node.setPluginData(key, data);
      } catch (error) {
        console.error(`Failed to set data on node ${node.id}:`, error);
      }
    });
  }
}

// ✅ NAMESPACE COLLISION PREVENTION
const PLUGIN_NAMESPACE = 'com.company.plugin-name'; // Use reverse domain notation

function setTeamSharedData(node: SceneNode, key: string, value: any): void {
  PluginDataManager.setSharedData(node, PLUGIN_NAMESPACE, key, value);
}

function getTeamSharedData<T>(node: SceneNode, key: string, defaultValue: T): T {
  return PluginDataManager.getSharedData(node, PLUGIN_NAMESPACE, key, defaultValue);
}
```

### Advanced Data Patterns

```typescript
// ✅ VERSIONED DATA STORAGE - Handle schema changes
interface VersionedData<T> {
  version: number;
  data: T;
  createdAt: number;
  updatedAt: number;
}

class VersionedStorage<T> {
  constructor(
    private namespace: string,
    private currentVersion: number,
    private migrations: Map<number, (oldData: any) => T>
  ) {}
  
  setData(node: SceneNode, key: string, data: T): void {
    const versionedData: VersionedData<T> = {
      version: this.currentVersion,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    PluginDataManager.setSharedData(node, this.namespace, key, versionedData);
  }
  
  getData(node: SceneNode, key: string, defaultValue: T): T {
    const versionedData = PluginDataManager.getSharedData<VersionedData<T> | null>(
      node, this.namespace, key, null
    );
    
    if (!versionedData) return defaultValue;
    
    // Handle version migration
    if (versionedData.version < this.currentVersion) {
      const migrated = this.migrateData(versionedData);
      this.setData(node, key, migrated); // Update to new version
      return migrated;
    }
    
    return versionedData.data;
  }
  
  private migrateData(oldVersionedData: VersionedData<any>): T {
    let data = oldVersionedData.data;
    
    // Apply migrations sequentially
    for (let version = oldVersionedData.version + 1; version <= this.currentVersion; version++) {
      const migration = this.migrations.get(version);
      if (migration) {
        data = migration(data);
      }
    }
    
    return data;
  }
}

// Usage example
const userSettingsStorage = new VersionedStorage<UserSettings>(
  'user-settings',
  2, // Current version
  new Map([
    [2, (oldData: any) => ({
      ...oldData,
      newFeature: true // Added in version 2
    })]
  ])
);
```

## Text Range Manipulation

### Safe Text Operations

```typescript
// ✅ COMPREHENSIVE TEXT RANGE HANDLING
interface TextRange {
  start: number;
  end: number;
  content: string;
}

class SafeTextEditor {
  async modifyTextRange(
    textNode: TextNode,
    range: TextRange,
    newContent: string
  ): Promise<boolean> {
    try {
      // Validate node
      if (textNode.removed || textNode.type !== 'TEXT') {
        throw new Error('Invalid text node');
      }
      
      // Handle missing fonts
      if (textNode.hasMissingFont) {
        figma.notify('Cannot edit text with missing fonts', { error: true });
        return false;
      }
      
      // Validate range bounds
      const textLength = textNode.characters.length;
      const safeStart = Math.max(0, Math.min(range.start, textLength));
      const safeEnd = Math.max(safeStart, Math.min(range.end, textLength));
      
      // Handle mixed fonts in range
      await this.loadRangeFonts(textNode, safeStart, safeEnd);
      
      // Perform text replacement
      const before = textNode.characters.slice(0, safeStart);
      const after = textNode.characters.slice(safeEnd);
      textNode.characters = before + newContent + after;
      
      return true;
      
    } catch (error) {
      console.error('Text range modification failed:', error);
      figma.notify(`Text editing failed: ${error.message}`, { error: true });
      return false;
    }
  }
  
  private async loadRangeFonts(textNode: TextNode, start: number, end: number): Promise<void> {
    const uniqueFonts = new Set<string>();
    
    // Collect fonts in range
    for (let i = start; i < end; i++) {
      const fontName = textNode.getRangeFontName(i, i + 1) as FontName;
      const fontKey = `${fontName.family}-${fontName.style}`;
      uniqueFonts.add(fontKey);
    }
    
    // Load all unique fonts
    const fontPromises = Array.from(uniqueFonts).map(fontKey => {
      const [family, style] = fontKey.split('-');
      return figma.loadFontAsync({ family, style } as FontName).catch(error => {
        console.error(`Font loading failed: ${fontKey}`, error);
      });
    });
    
    await Promise.all(fontPromises);
  }
  
  // ✅ EMOJI AND UNICODE HANDLING
  insertEmoji(textNode: TextNode, position: number, emoji: string): boolean {
    try {
      // Validate position for surrogate pairs
      const chars = Array.from(textNode.characters); // Properly handles Unicode
      const safePosition = Math.max(0, Math.min(position, chars.length));
      
      const before = chars.slice(0, safePosition).join('');
      const after = chars.slice(safePosition).join('');
      
      textNode.characters = before + emoji + after;
      return true;
      
    } catch (error) {
      console.error('Emoji insertion failed:', error);
      return false;
    }
  }
  
  // ✅ FIND AND REPLACE WITH REGEX
  async findAndReplace(
    textNode: TextNode,
    pattern: string | RegExp,
    replacement: string,
    isRegex = false
  ): Promise<number> {
    try {
      await this.loadAllNodeFonts(textNode);
      
      const originalText = textNode.characters;
      let newText: string;
      let matchCount = 0;
      
      if (isRegex && pattern instanceof RegExp) {
        newText = originalText.replace(pattern, (match) => {
          matchCount++;
          return replacement;
        });
      } else {
        const searchStr = typeof pattern === 'string' ? pattern : pattern.toString();
        const parts = originalText.split(searchStr);
        matchCount = parts.length - 1;
        newText = parts.join(replacement);
      }
      
      if (matchCount > 0) {
        textNode.characters = newText;
        figma.notify(`Replaced ${matchCount} occurrence(s)`);
      }
      
      return matchCount;
      
    } catch (error) {
      console.error('Find and replace failed:', error);
      return 0;
    }
  }
  
  private async loadAllNodeFonts(textNode: TextNode): Promise<void> {
    if (textNode.fontName === figma.mixed) {
      // Handle mixed fonts
      const textLength = textNode.characters.length;
      const uniqueFonts = new Set<string>();
      
      for (let i = 0; i < textLength; i++) {
        const fontName = textNode.getRangeFontName(i, i + 1) as FontName;
        uniqueFonts.add(`${fontName.family}-${fontName.style}`);
      }
      
      await Promise.all(Array.from(uniqueFonts).map(fontKey => {
        const [family, style] = fontKey.split('-');
        return figma.loadFontAsync({ family, style } as FontName);
      }));
    } else {
      // Single font
      await figma.loadFontAsync(textNode.fontName as FontName);
    }
  }
}

const textEditor = new SafeTextEditor();
```

## Variables API & Design Tokens

### Variable Management

```typescript
// ✅ VARIABLES API - Handle collections and modes
interface VariableReference {
  collection: string;
  mode: string;
  variable: string;
}

class DesignTokenManager {
  async getVariableCollections(): Promise<VariableCollection[]> {
    try {
      return await figma.variables.getLocalVariableCollectionsAsync();
    } catch (error) {
      console.error('Failed to load variable collections:', error);
      return [];
    }
  }
  
  async createColorVariable(
    collectionId: string,
    name: string,
    values: Record<string, RGB>
  ): Promise<Variable | null> {
    try {
      const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
      if (!collection) {
        throw new Error('Collection not found');
      }
      
      const variable = figma.variables.createVariable(name, collection, 'COLOR');
      
      // Set values for each mode
      for (const [modeId, color] of Object.entries(values)) {
        variable.setValueForMode(modeId, color);
      }
      
      return variable;
    } catch (error) {
      console.error('Failed to create color variable:', error);
      figma.notify(`Failed to create variable: ${error.message}`, { error: true });
      return null;
    }
  }
  
  async bindVariableToNode(
    node: SceneNode,
    property: 'fills' | 'strokes',
    variable: Variable
  ): Promise<boolean> {
    try {
      if (property === 'fills' && 'fills' in node) {
        // Bind variable to fill
        const boundVariable = figma.variables.setBoundVariableForPaint(
          node.fills[0] as SolidPaint,
          variable
        );
        
        if (boundVariable) {
          node.fills = [boundVariable];
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Variable binding failed:', error);
      return false;
    }
  }
  
  // ✅ VARIABLE VALUE RESOLUTION
  async resolveVariableValue(variable: Variable, modeId: string): Promise<any> {
    try {
      const value = variable.valuesByMode[modeId];
      
      // Handle variable aliases
      if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
        const referencedVariable = await figma.variables.getVariableByIdAsync(value.id);
        if (referencedVariable) {
          return this.resolveVariableValue(referencedVariable, modeId);
        }
      }
      
      return value;
    } catch (error) {
      console.error('Variable resolution failed:', error);
      return null;
    }
  }
}
```

## Image Processing & Canvas Operations

### Advanced Image Handling

```typescript
// ✅ COMPLETE IMAGE PROCESSING PIPELINE
class AdvancedImageProcessor {
  async processNodeImage(node: SceneNode): Promise<ProcessedImage | null> {
    try {
      // Step 1: Export from Figma
      const imageBytes = await this.exportNodeImage(node);
      if (!imageBytes) return null;
      
      // Step 2: Send to UI for processing
      const processedBytes = await this.processInUI(imageBytes);
      if (!processedBytes) return null;
      
      // Step 3: Create new node with processed image
      const newNode = await this.createImageNode(processedBytes, `Processed ${node.name}`);
      
      return {
        originalNode: node,
        processedNode: newNode,
        processingTime: Date.now()
      };
      
    } catch (error) {
      console.error('Image processing failed:', error);
      figma.notify('Image processing failed', { error: true });
      return null;
    }
  }
  
  private async exportNodeImage(node: SceneNode): Promise<Uint8Array | null> {
    try {
      const bounds = node.absoluteRenderBounds;
      if (!bounds || bounds.width === 0 || bounds.height === 0) {
        throw new Error('Node has no visible bounds');
      }
      
      return await node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 2 }
      });
    } catch (error) {
      console.error('Node export failed:', error);
      return null;
    }
  }
  
  private async processInUI(imageBytes: Uint8Array): Promise<Uint8Array | null> {
    return new Promise((resolve) => {
      const requestId = `img-${Date.now()}`;
      
      // Setup response handler
      const handleMessage = (event: MessageEvent) => {
        const msg = event.data.pluginMessage;
        if (msg?.type === 'image-processed' && msg.id === requestId) {
          window.removeEventListener('message', handleMessage);
          resolve(msg.success ? new Uint8Array(msg.imageBytes) : null);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Send to UI for processing
      figma.ui.postMessage({
        type: 'process-image',
        id: requestId,
        imageBytes: Array.from(imageBytes)
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        resolve(null);
      }, 30000);
    });
  }
  
  private async createImageNode(imageBytes: Uint8Array, name: string): Promise<RectangleNode> {
    // Create rectangle to hold image
    const rect = figma.createRectangle();
    rect.name = name;
    
    // Create image paint
    const image = figma.createImage(imageBytes);
    const imagePaint: ImagePaint = {
      type: 'IMAGE',
      scaleMode: 'FILL',
      imageRef: image,
      scalingFactor: 0.5,
      rotation: 0,
      filters: {
        exposure: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0
      }
    };
    
    rect.fills = [imagePaint];
    figma.currentPage.appendChild(rect);
    
    return rect;
  }
}

interface ProcessedImage {
  originalNode: SceneNode;
  processedNode: SceneNode;
  processingTime: number;
}
```

## OAuth & External Service Integration

### Secure Authentication Flow

```typescript
// ✅ OAUTH IMPLEMENTATION - Secure token management
class OAuthManager {
  private readonly CLIENT_ID = 'your-client-id';
  private readonly REDIRECT_URI = 'https://your-domain.com/oauth/callback';
  private readonly AUTH_URL = 'https://api.service.com/oauth/authorize';
  
  async authenticateUser(): Promise<AuthResult | null> {
    try {
      // Step 1: Generate secure state parameter
      const state = this.generateSecureState();
      
      // Step 2: Build authorization URL
      const authUrl = this.buildAuthURL(state);
      
      // Step 3: Open authentication in new window
      figma.ui.postMessage({
        type: 'open-auth-window',
        url: authUrl,
        state
      });
      
      // Step 4: Wait for callback
      return await this.waitForCallback(state);
      
    } catch (error) {
      console.error('OAuth authentication failed:', error);
      figma.notify('Authentication failed', { error: true });
      return null;
    }
  }
  
  private generateSecureState(): string {
    // Generate cryptographically secure random state
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16)).join('');
  }
  
  private buildAuthURL(state: string): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      state: state,
      scope: 'read write'
    });
    
    return `${this.AUTH_URL}?${params}`;
  }
  
  private async waitForCallback(expectedState: string): Promise<AuthResult | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        cleanup();
        resolve(null);
      }, 300000); // 5 minute timeout
      
      const handleMessage = (event: MessageEvent) => {
        const msg = event.data.pluginMessage;
        
        if (msg?.type === 'oauth-callback') {
          if (msg.state !== expectedState) {
            console.error('OAuth state mismatch');
            cleanup();
            resolve(null);
            return;
          }
          
          if (msg.error) {
            console.error('OAuth error:', msg.error);
            cleanup();
            resolve(null);
            return;
          }
          
          // Exchange code for token (would need server endpoint)
          this.exchangeCodeForToken(msg.code).then(token => {
            cleanup();
            resolve(token);
          }).catch(() => {
            cleanup();
            resolve(null);
          });
        }
      };
      
      const cleanup = () => {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
      };
      
      window.addEventListener('message', handleMessage);
    });
  }
  
  private async exchangeCodeForToken(code: string): Promise<AuthResult> {
    // This would typically involve a server-side endpoint
    // to securely exchange the authorization code for an access token
    
    const response = await fetch('/api/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: this.CLIENT_ID,
        redirect_uri: this.REDIRECT_URI
      })
    });
    
    if (!response.ok) {
      throw new Error('Token exchange failed');
    }
    
    const tokenData = await response.json();
    
    // Store token securely
    await figma.clientStorage.setAsync('auth_token', JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }));
    
    return tokenData;
  }
}

interface AuthResult {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}
```

**LLM INSTRUCTION**: These advanced features require deep understanding of Figma's APIs and careful error handling. Use these patterns for complex plugins that need sophisticated functionality.
