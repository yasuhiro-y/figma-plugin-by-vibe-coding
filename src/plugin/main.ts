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
  CreateRandomShapeMessage,
  CreateRectangleMessage,
  PluginMessage,
  UIMessage,
} from '../common/messages.js';
import type { CreateNodeOptions, RGB, Result } from '../common/types.js';

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
 * Handle rectangle creation with comprehensive error handling
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
 * Handle random shape creation with comprehensive error handling
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
 * Creates a rectangle with specified options and returns its ID
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
 * Creates a random shape with random properties
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
