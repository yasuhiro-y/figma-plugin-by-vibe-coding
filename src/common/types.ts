/**
 * Common type definitions shared between plugin and UI threads
 *
 * We use Figma's official types from @figma/plugin-typings where possible
 * and only define custom types for plugin-specific functionality.
 */

import { z } from 'zod';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

// ============================================================================
// BASIC TYPES
// ============================================================================

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Rectangle extends Point, Size {}

// ============================================================================
// COLOR TYPES
// ============================================================================

export interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface RGBA extends RGB {
  readonly a: number;
}

export interface FontName {
  readonly family: string;
  readonly style: string;
}

// ============================================================================
// NODE TYPES (Safe for both threads)
// ============================================================================

export interface BaseNodeData {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
}

export interface TextNodeData extends BaseNodeData {
  readonly type: 'TEXT';
  readonly characters: string;
  readonly fontSize?: number;
  readonly fontName?: FontName;
}

export interface RectangleNodeData extends BaseNodeData {
  readonly type: 'RECTANGLE';
  readonly width: number;
  readonly height: number;
  readonly cornerRadius?: number;
  readonly fills?: readonly RGBA[];
}

export interface GroupNodeData extends BaseNodeData {
  readonly type: 'GROUP';
  readonly children?: readonly BaseNodeData[];
}

export type NodeData = BaseNodeData | TextNodeData | RectangleNodeData | GroupNodeData;

// ============================================================================
// PLUGIN API TYPES
// ============================================================================

export interface CreateNodeOptions {
  readonly width?: number;
  readonly height?: number;
  readonly x?: number;
  readonly y?: number;
  readonly color?: RGB;
  readonly name?: string;
}

export interface PluginConfig {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
}

// ============================================================================
// PLUGIN CONFIGURATION
// ============================================================================

/**
 * Plugin settings that can be persisted
 */
export const PluginSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  showNotifications: z.boolean().default(true),
  autoSave: z.boolean().default(false),
  debugMode: z.boolean().default(false),
});

export type PluginSettings = z.infer<typeof PluginSettingsSchema>;
