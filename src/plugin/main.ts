/**
 * Figma Plugin Main Thread
 *
 * This file runs in Figma's sandboxed plugin environment where you have access
 * to the Figma API but NO access to browser APIs like DOM, fetch, localStorage, etc.
 *
 * This is a robust example plugin that demonstrates:
 * - Creating rectangles with proper error handling
 * - Type-safe message passing between UI and plugin threads
 * - Using @figma/plugin-typings for full type safety
 * - Best practices for Figma plugin development
 *
 * @see https://figma.com/plugin-docs/plugin-api/
 */

/// <reference types="@figma/plugin-typings" />

import { UI_DIMENSIONS } from '../common/constants.js';
import type {
  CreateAdvancedNodeMessage,
  CreateRandomShapeMessage,
  CreateRectangleMessage,
  GetDocumentInfoMessage,
  GetStorageQuotaMessage,
  LoadBrushesMessage,
  LoadPageMessage,
  PluginMessage,
  UIMessage,
} from '../common/messages.js';
import type {
  CreateAdvancedNodeOptions,
  CreateNodeOptions,
  DocumentData,
  PageData,
  PageLoadResult,
  RGB,
  Result,
  StorageQuota,
} from '../common/types.js';

// ============================================================================
// PLUGIN INITIALIZATION
// ============================================================================

/**
 * Show the plugin UI
 */
figma.showUI(__html__, {
  width: UI_DIMENSIONS.DEFAULT_WIDTH,
  height: UI_DIMENSIONS.DEFAULT_HEIGHT,
  themeColors: true, // Use Figma's theme colors
});

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Handle messages from the UI with proper type safety and error handling
 */
figma.ui.onmessage = async (msg: UIMessage): Promise<void> => {
  try {
    switch (msg.type) {
      case 'create-rectangle': {
        const result = await handleCreateRectangle(msg);
        if (result.success) {
          figma.notify('Rectangle created successfully!');
        } else {
          figma.notify(`Failed to create rectangle: ${result.error.message}`, {
            error: true,
          });
        }
        break;
      }

      case 'create-random-shape': {
        const result = await handleCreateRandomShape(msg);
        if (result.success) {
          figma.notify(`✨ Random ${result.data.type} created with ${result.data.color}!`);
        } else {
          figma.notify(`Failed to create random shape: ${result.error.message}`, { error: true });
        }
        break;
      }

      case 'get-selection': {
        const result = getSelectionData();
        const response: PluginMessage = {
          type: 'operation-result',
          id: msg.id,
          result,
        };
        figma.ui.postMessage(response);
        break;
      }

      case 'load-page': {
        const result = await handleLoadPage(msg);
        const response: PluginMessage = {
          type: 'page-loaded',
          result,
        };
        figma.ui.postMessage(response);
        break;
      }

      case 'get-document-info': {
        const documentData = getDocumentInfo();
        const response: PluginMessage = {
          type: 'document-info',
          id: msg.id,
          documentData,
        };
        figma.ui.postMessage(response);
        break;
      }

      case 'create-advanced-node': {
        const result = await handleCreateAdvancedNode(msg);
        if (result.success) {
          const response: PluginMessage = {
            type: 'advanced-node-created',
            id: msg.id,
            nodeId: result.data.nodeId,
            nodeType: msg.nodeType,
            success: true,
          };
          figma.ui.postMessage(response);
        } else {
          const response: PluginMessage = {
            type: 'advanced-node-created',
            id: msg.id,
            nodeId: '',
            nodeType: msg.nodeType,
            success: false,
            error: result.error.message,
          };
          figma.ui.postMessage(response);
        }
        break;
      }

      case 'get-storage-quota': {
        const quota = await getStorageQuota();
        const response: PluginMessage = {
          type: 'storage-quota',
          id: msg.id,
          quota,
        };
        figma.ui.postMessage(response);
        break;
      }

      case 'load-brushes': {
        const result = await handleLoadBrushes(msg);
        if (result.success) {
          const response: PluginMessage = {
            type: 'brushes-loaded',
            id: msg.id,
            success: true,
            loadedBrushes: result.data,
          };
          figma.ui.postMessage(response);
        } else {
          const response: PluginMessage = {
            type: 'brushes-loaded',
            id: msg.id,
            success: false,
            error: result.error.message,
          };
          figma.ui.postMessage(response);
        }
        break;
      }

      case 'close-plugin':
        figma.closePlugin('Plugin closed by user');
        break;

      default: {
        // TypeScript ensures this never happens if all cases are handled
        const exhaustiveCheck: never = msg;
        console.warn('Unhandled message type:', exhaustiveCheck);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error handling message:', error);
    figma.notify(`Plugin error: ${errorMessage}`, { error: true });
  }
};

// ============================================================================
// PLUGIN OPERATIONS
// ============================================================================

// ============================================================================
// PLUGIN OPERATIONS WITH PROPER ERROR HANDLING
// ============================================================================

/**
 * 📚 REFERENCE CODE - Example rectangle creation implementation
 *
 * This demonstrates how to handle parameterized node creation with proper
 * error handling and type safety. Use as reference when implementing your
 * own node creation features.
 *
 * 💡 TIP: Keep as reference or replace with your actual implementation
 */
async function handleCreateRectangle(msg: CreateRectangleMessage): Promise<Result<string>> {
  try {
    const options: CreateNodeOptions = msg.color
      ? {
          width: msg.width || 100,
          height: msg.height || 100,
          color: msg.color,
        }
      : {
          width: msg.width || 100,
          height: msg.height || 100,
        };

    const nodeId = createRectangleNode(options);
    return { success: true, data: nodeId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to create rectangle'),
    };
  }
}

/**
 * 📚 REFERENCE CODE - Example random shape generation
 *
 * This demonstrates how to create complex shapes with randomization,
 * showing advanced Figma API usage patterns and node manipulation.
 * Use as reference for implementing generative features.
 *
 * 💡 TIP: Keep as reference or replace with your actual implementation
 */
async function handleCreateRandomShape(
  _msg: CreateRandomShapeMessage,
): Promise<Result<{ type: string; color: string; nodeId: string }>> {
  try {
    const result = createRandomShapeNode();
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to create random shape'),
    };
  }
}

/**
 * 📚 REFERENCE CODE - Basic node creation with options
 *
 * This shows the fundamental pattern for creating and configuring Figma nodes
 * with proper error handling, positioning, and viewport management.
 *
 * 💡 TIP: Use this pattern as foundation for your node creation logic
 */
function createRectangleNode(options: CreateNodeOptions): string {
  const rect = figma.createRectangle();

  // Set dimensions
  const width = Math.max(1, options.width || 100);
  const height = Math.max(1, options.height || 100);
  rect.resize(width, height);

  // Set color (either provided or random)
  if (options.color) {
    rect.fills = [
      {
        type: 'SOLID',
        color: options.color,
      },
    ];
  } else {
    const colors: RGB[] = [
      { r: 0.2, g: 0.8, b: 1 }, // Figma Blue
      { r: 0.8, g: 0.2, b: 0.8 }, // Figma Purple
      { r: 1, g: 0.6, b: 0.2 }, // Figma Orange
      { r: 0.2, g: 0.9, b: 0.4 }, // Figma Green
      { r: 1, g: 0.3, b: 0.3 }, // Figma Red
    ];

    const randomIndex = Math.floor(Math.random() * colors.length);
    const randomColor = colors[randomIndex]; // Safe because index is within bounds
    if (!randomColor) {
      throw new Error('Failed to select random color');
    }
    rect.fills = [
      {
        type: 'SOLID',
        color: randomColor,
      },
    ];
  }

  // Set name if provided
  if (options.name) {
    rect.name = options.name;
  } else {
    rect.name = `Rectangle ${width}×${height}`;
  }

  // Add to current page
  figma.currentPage.appendChild(rect);

  // Position in viewport with some randomness to avoid overlaps
  positionNodeInViewport(rect, { width, height });

  // Select and focus the created rectangle
  figma.currentPage.selection = [rect];
  figma.viewport.scrollAndZoomIntoView([rect]);

  return rect.id;
}

/**
 * 📚 REFERENCE CODE - Advanced shape generation with randomization
 *
 * This demonstrates creating different node types (rectangle, ellipse, polygon)
 * with random properties and comprehensive configuration. Shows advanced
 * Figma API usage patterns.
 *
 * 💡 TIP: Use this as reference for procedural generation features
 */
function createRandomShapeNode(): {
  type: string;
  color: string;
  nodeId: string;
} {
  const shapes = ['rectangle', 'ellipse', 'polygon'];
  const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

  // Random bright colors
  const colors = [
    { name: 'Bright Red', r: 1, g: 0.3, b: 0.3 },
    { name: 'Bright Blue', r: 0.3, g: 0.6, b: 1 },
    { name: 'Bright Green', r: 0.3, g: 0.9, b: 0.5 },
    { name: 'Bright Purple', r: 0.8, g: 0.4, b: 1 },
    { name: 'Bright Orange', r: 1, g: 0.6, b: 0.2 },
    { name: 'Bright Pink', r: 1, g: 0.4, b: 0.7 },
    { name: 'Bright Cyan', r: 0.2, g: 0.9, b: 0.9 },
    { name: 'Bright Yellow', r: 1, g: 0.9, b: 0.3 },
  ];
  const randomColorIndex = Math.floor(Math.random() * colors.length);
  const randomColor = colors[randomColorIndex];
  if (!randomColor) {
    throw new Error('Failed to select random color');
  }

  // Random size between 50-200px
  const size = Math.floor(Math.random() * 150) + 50;
  const width = shapeType === 'ellipse' ? size : Math.floor(Math.random() * 150) + 50;
  const height = shapeType === 'ellipse' ? size : Math.floor(Math.random() * 150) + 50;

  let node: SceneNode;

  switch (shapeType) {
    case 'rectangle': {
      const rect = figma.createRectangle();
      rect.resize(width, height);
      rect.cornerRadius = Math.floor(Math.random() * 20); // Random corner radius
      node = rect;
      break;
    }
    case 'ellipse': {
      const ellipse = figma.createEllipse();
      ellipse.resize(size, size);
      node = ellipse;
      break;
    }
    case 'polygon': {
      const polygon = figma.createPolygon();
      polygon.resize(size, size);
      polygon.pointCount = Math.floor(Math.random() * 5) + 3; // 3-7 points
      node = polygon;
      break;
    }
    default:
      throw new Error(`Unsupported shape type: ${shapeType}`);
  }

  // Set random color fill
  node.fills = [
    {
      type: 'SOLID',
      color: { r: randomColor.r, g: randomColor.g, b: randomColor.b },
    },
  ];

  // Add to current page
  figma.currentPage.appendChild(node);

  // Position and select node
  positionNodeInViewport(node, { width: node.width, height: node.height });

  return {
    type: shapeType,
    color: randomColor.name,
    nodeId: node.id,
  };
}

/**
 * Position a node in the center of the viewport with some randomness
 */
function positionNodeInViewport(node: SceneNode, size: { width: number; height: number }): void {
  const viewport = figma.viewport.bounds;
  const centerX = viewport.x + viewport.width / 2;
  const centerY = viewport.y + viewport.height / 2;

  // Add some randomness to avoid overlapping when creating multiple nodes
  const offsetX = (Math.random() - 0.5) * 200;
  const offsetY = (Math.random() - 0.5) * 200;

  node.x = centerX - size.width / 2 + offsetX;
  node.y = centerY - size.height / 2 + offsetY;
}

/**
 * Get current selection data in a format safe for the UI thread
 */
function getSelectionData(): Result<Array<{ id: string; name: string; type: string }>> {
  try {
    const selection = figma.currentPage.selection;
    const selectionData = selection.map((node: BaseNode) => ({
      id: node.id,
      name: node.name,
      type: node.type,
    }));

    return { success: true, data: selectionData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to get selection'),
    };
  }
}

// ============================================================================
// NEW FIGMA API v1.110+ HANDLERS
// ============================================================================

/**
 * Handle dynamic page loading (new in v1.110+)
 * Enables loading other pages without performance overhead
 */
async function handleLoadPage(msg: LoadPageMessage): Promise<PageLoadResult> {
  const startTime = Date.now();

  try {
    // Find the page to load
    const targetPage = figma.root.children.find((page) => page.id === msg.pageId);

    if (!targetPage || targetPage.type !== 'PAGE') {
      return {
        pageId: msg.pageId,
        success: false,
        error: `Page with ID ${msg.pageId} not found`,
      };
    }

    // Load the page data (call loadAsync on the page node)
    await (targetPage as PageNode).loadAsync();

    const loadTime = Date.now() - startTime;
    const nodeCount = targetPage.children.length;

    figma.notify(`Loaded page "${targetPage.name}" (${nodeCount} objects, ${loadTime}ms)`);

    return {
      pageId: msg.pageId,
      success: true,
      loadTime,
      nodeCount,
    };
  } catch (error) {
    return {
      pageId: msg.pageId,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load page',
    };
  }
}

/**
 * Get document information with all pages
 */
function getDocumentInfo(): DocumentData {
  const pages: PageData[] = figma.root.children.map((page) => ({
    id: page.id,
    name: page.name,
    type: 'PAGE' as const,
    nodeCount: page.children.length,
    isLoaded: page === figma.currentPage, // Only current page is guaranteed loaded
  }));

  return {
    id: figma.root.id,
    name: figma.root.name,
    currentPageId: figma.currentPage.id,
    pages,
  };
}

/**
 * Handle advanced node creation with new API features
 */
async function handleCreateAdvancedNode(
  msg: CreateAdvancedNodeMessage,
): Promise<Result<{ nodeId: string; nodeType: string }>> {
  try {
    let node: SceneNode;

    switch (msg.nodeType) {
      case 'TEXT_PATH': {
        // Create text on path - requires a VectorNode as base
        // figma.createTextPath(node: VectorNode, startSegment: number, startPosition: number)
        const vector = figma.createVector();
        // Create a simple circular path
        vector.vectorPaths = [
          {
            windingRule: 'NONZERO',
            data: 'M 0 100 C 0 44.77 44.77 0 100 0 C 155.23 0 200 44.77 200 100 C 200 155.23 155.23 200 100 200 C 44.77 200 0 155.23 0 100 Z',
          },
        ];
        figma.currentPage.appendChild(vector);

        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        const textPath = figma.createTextPath(vector, 0, 0);
        textPath.characters = 'Text on Path';

        node = textPath;
        break;
      }

      case 'TRANSFORM_GROUP': {
        // Transform group requires existing nodes and TransformModifier[]
        // figma.transformGroup(nodes, parent, index, modifiers)
        const rect = figma.createRectangle();
        rect.resize(100, 100);
        rect.name = msg.options.name || 'Transform Group Item';
        figma.currentPage.appendChild(rect);

        const modifier: LinearRepeatModifier = {
          type: 'REPEAT',
          repeatType: 'LINEAR',
          count: 3,
          unitType: 'PIXELS',
          offset: 120,
          axis: 'HORIZONTAL',
        };
        figma.transformGroup([rect], figma.currentPage, figma.currentPage.children.length - 1, [
          modifier,
        ]);

        node = rect;
        break;
      }

      case 'RECTANGLE': {
        const rect = figma.createRectangle();
        rect.resize(msg.options.width || 100, msg.options.height || 100);

        // Apply advanced effects if provided
        if (msg.options.effects) {
          // Note: Some effects may require enableProposedApi: true
          // Advanced effects would be applied here
        }

        node = rect;
        break;
      }

      case 'TEXT': {
        const textNode = figma.createText();

        // Load default font first
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        textNode.characters = 'Sample Text';
        textNode.fontSize =
          (msg.options as CreateAdvancedNodeOptions & { fontSize?: number }).fontSize || 16;

        node = textNode;
        break;
      }

      default:
        throw new Error(`Unsupported node type: ${msg.nodeType}`);
    }

    // Apply common properties
    if (msg.options.x !== undefined && msg.options.y !== undefined) {
      node.x = msg.options.x;
      node.y = msg.options.y;
    } else {
      // Position in viewport center
      positionNodeInViewport(node, {
        width: node.width || 100,
        height: node.height || 100,
      });
    }

    if (msg.options.name) {
      node.name = msg.options.name;
    }

    // Add to current page
    figma.currentPage.appendChild(node);

    // Select and focus
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);

    return {
      success: true,
      data: {
        nodeId: node.id,
        nodeType: msg.nodeType,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to create advanced node'),
    };
  }
}

/**
 * Get storage quota information (5MB limit since v1.109)
 */
async function getStorageQuota(): Promise<StorageQuota> {
  try {
    // Get current usage - this is an approximation since Figma doesn't provide direct API
    const keys = await figma.clientStorage.keysAsync();
    let totalUsed = 0;

    for (const key of keys) {
      try {
        const value = await figma.clientStorage.getAsync(key);
        if (value) {
          totalUsed += new Blob([value]).size;
        }
      } catch (_error) {
        console.warn(`Failed to measure size for key: ${key}`);
      }
    }

    const limit = 5 * 1024 * 1024; // 5MB
    const entryLimit = 100 * 1024; // 100KB per entry

    return {
      used: totalUsed,
      available: limit - totalUsed,
      limit,
      entryLimit,
    };
  } catch (_error) {
    // Fallback values if quota check fails
    return {
      used: 0,
      available: 5 * 1024 * 1024,
      limit: 5 * 1024 * 1024,
      entryLimit: 100 * 1024,
    };
  }
}

/**
 * Handle brush loading (new in v1.110+)
 */
async function handleLoadBrushes(msg: LoadBrushesMessage): Promise<Result<string[]>> {
  try {
    // Load brushes by type - loadBrushesAsync requires a brush type argument
    const brushType = (msg.brushNames?.[0] === 'SCATTER' ? 'SCATTER' : 'STRETCH') as
      | 'STRETCH'
      | 'SCATTER';
    await figma.loadBrushesAsync(brushType);
    return {
      success: true,
      data: [brushType],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Failed to load brushes'),
    };
  }
}

// ============================================================================
// SELECTION CHANGE LISTENER
// ============================================================================

/**
 * Notify UI when selection changes
 */
figma.on('selectionchange', () => {
  const selectionResult = getSelectionData();
  if (selectionResult.success) {
    const message: PluginMessage = {
      type: 'selection-changed',
      selection: selectionResult.data,
    };
    figma.ui.postMessage(message);
  }
});
