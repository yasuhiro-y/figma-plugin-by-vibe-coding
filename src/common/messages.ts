/**
 * Message Types for Plugin ↔ UI Communication
 *
 * This file defines the contract between the plugin thread and UI thread.
 * All communication between threads must go through postMessage and be type-safe.
 */

import type {
  AdvancedEffect,
  CreateAdvancedNodeOptions,
  DocumentData,
  PageData,
  PageLoadResult,
  Result,
  StorageQuota,
} from './types.js';

// Messages sent FROM UI TO Plugin Thread

/**
 * 📚 REFERENCE CODE - Example implementation for learning purposes
 *
 * This is a SAMPLE MESSAGE TYPE that demonstrates how to structure
 * plugin messages with proper TypeScript typing. Use this as a reference
 * when implementing your own plugin features.
 *
 * 💡 TIP: Keep this as reference or replace with your actual message types
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

// ============================================================================
// NEW MESSAGE TYPES (Figma API v1.110+)
// ============================================================================

export interface LoadPageMessage {
  type: 'load-page';
  pageId: string;
  id: string; // For request correlation
}

export interface GetDocumentInfoMessage {
  type: 'get-document-info';
  id: string; // For request correlation
}

export interface CreateAdvancedNodeMessage {
  type: 'create-advanced-node';
  nodeType: 'TEXT_PATH' | 'TRANSFORM_GROUP' | 'RECTANGLE' | 'TEXT';
  options: CreateAdvancedNodeOptions;
  id: string; // For request correlation
}

export interface GetStorageQuotaMessage {
  type: 'get-storage-quota';
  id: string; // For request correlation
}

export interface LoadBrushesMessage {
  type: 'load-brushes';
  brushNames?: readonly string[];
  id: string; // For request correlation
}

/**
 * 📚 REFERENCE CODE - Example random shape generation
 *
 * This demonstrates how to create messages for more complex operations
 * that don't require parameters. Use as reference for implementing
 * your own parameterless operations.
 *
 * 💡 TIP: Keep this as reference or replace with your actual message types
 */
export interface CreateRandomShapeMessage {
  type: 'create-random-shape';
}

/**
 * UI → Plugin Message Types
 *
 * 📚 REFERENCE: CreateRectangleMessage and CreateRandomShapeMessage are example implementations
 * 💡 TIP: Use these as reference when implementing your actual plugin features:
 * - CreateRectangleMessage (parameterized operations)
 * - CreateRandomShapeMessage (simple operations)
 * ✅ UTILITY: GetSelectionMessage and ClosePluginMessage are generally useful
 */
export type UIMessage =
  | CreateRectangleMessage // 📚 Reference implementation
  | CreateRandomShapeMessage // 📚 Reference implementation
  | GetSelectionMessage // ✅ Utility for selection management
  | ClosePluginMessage // ✅ Utility for plugin lifecycle
  | LoadPageMessage // ✅ Dynamic page loading (new)
  | GetDocumentInfoMessage // ✅ Document information (new)
  | CreateAdvancedNodeMessage // ✅ Advanced node creation (new)
  | GetStorageQuotaMessage // ✅ Storage management (new)
  | LoadBrushesMessage; // ✅ Brush loading (new)

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

// ============================================================================
// NEW PLUGIN → UI MESSAGES (Figma API v1.110+)
// ============================================================================

export interface PageLoadedMessage {
  type: 'page-loaded';
  result: PageLoadResult;
}

export interface DocumentInfoMessage {
  type: 'document-info';
  id: string; // Correlates with request
  documentData: DocumentData;
}

export interface StorageQuotaMessage {
  type: 'storage-quota';
  id: string; // Correlates with request
  quota: StorageQuota;
}

export interface BrushesLoadedMessage {
  type: 'brushes-loaded';
  id: string; // Correlates with request
  success: boolean;
  loadedBrushes?: readonly string[];
  error?: string;
}

export interface AdvancedNodeCreatedMessage {
  type: 'advanced-node-created';
  id: string; // Correlates with request
  nodeId: string;
  nodeType: string;
  success: boolean;
  error?: string;
}

export type PluginMessage =
  | NotificationMessage
  | SelectionChangedMessage
  | OperationResultMessage
  | PageLoadedMessage
  | DocumentInfoMessage
  | StorageQuotaMessage
  | BrushesLoadedMessage
  | AdvancedNodeCreatedMessage;

// Legacy type for backwards compatibility
export type UiMessage = UIMessage;
