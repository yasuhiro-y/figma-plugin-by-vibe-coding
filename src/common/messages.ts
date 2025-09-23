/**
 * Message Types for Plugin ↔ UI Communication
 *
 * This file defines the contract between the plugin thread and UI thread.
 * All communication between threads must go through postMessage and be type-safe.
 */

import type { Result } from './types.js';

// Messages sent FROM UI TO Plugin Thread
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

export interface CreateRandomShapeMessage {
  type: 'create-random-shape';
}

export type UIMessage =
  | CreateRectangleMessage
  | CreateRandomShapeMessage
  | GetSelectionMessage
  | ClosePluginMessage;

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
