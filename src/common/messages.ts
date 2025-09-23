/**
 * Message Types for Plugin ↔ UI Communication
 *
 * This file defines the contract between the plugin thread and UI thread.
 * All communication between threads must go through postMessage and be type-safe.
 */

import type { Result } from './types.js';

// Messages sent FROM UI TO Plugin Thread

/**
 * ❌❌❌ DEMO CODE - DELETE THIS INTERFACE WHEN IMPLEMENTING REAL FEATURES ❌❌❌
 * 
 * 🚨 WARNING: This is SAMPLE MESSAGE TYPE for demonstration purposes only!
 * When you start building your actual plugin features, DELETE this interface entirely.
 * It will interfere with your real message handling and create confusion.
 * 
 * ✅ TO DELETE: Remove this interface and its usage in UIMessage union type below
 */
export interface CreateRectangleMessage {
  type: 'create-rectangle';
  width?: number;
  height?: number;
  color?: { r: number; g: number; b: number };
}

export interface GetSelectionMessage {
  type: 'get-selection';
  id: string; // For request correlation
}

export interface ClosePluginMessage {
  type: 'close-plugin';
}

/**
 * ❌❌❌ DEMO CODE - DELETE THIS INTERFACE WHEN IMPLEMENTING REAL FEATURES ❌❌❌
 * 
 * 🚨 WARNING: This is SAMPLE MESSAGE TYPE for demonstration purposes only!
 * When you start building your actual plugin features, DELETE this interface entirely.
 * It will interfere with your real message handling and create confusion.
 * 
 * ✅ TO DELETE: Remove this interface and its usage in UIMessage union type below
 */
export interface CreateRandomShapeMessage {
  type: 'create-random-shape';
}

/**
 * ❌ DEMO CODE WARNING: CreateRectangleMessage and CreateRandomShapeMessage are demo types
 * 🗑️ DELETE these demo message types when implementing your real features:
 * - CreateRectangleMessage
 * - CreateRandomShapeMessage
 * ✅ Keep GetSelectionMessage and ClosePluginMessage - these are useful utilities
 */
export type UIMessage =
  | CreateRectangleMessage  // ❌ DELETE THIS DEMO TYPE
  | CreateRandomShapeMessage  // ❌ DELETE THIS DEMO TYPE
  | GetSelectionMessage     // ✅ Keep this utility
  | ClosePluginMessage;     // ✅ Keep this utility

// Messages sent FROM Plugin TO UI Thread
export interface NotificationMessage {
  type: 'notification';
  message: string;
  error?: boolean;
}

export interface SelectionChangedMessage {
  type: 'selection-changed';
  selection: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export interface OperationResultMessage {
  type: 'operation-result';
  id: string; // Correlates with request
  result: Result<unknown>;
}

export type PluginMessage = NotificationMessage | SelectionChangedMessage | OperationResultMessage;

// Legacy type for backwards compatibility
export type UiMessage = UIMessage;
