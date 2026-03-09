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
// PAINT TYPES (Figma API v1.110+ Features)
// ============================================================================

export interface PatternPaint {
  readonly type: 'PATTERN';
  readonly scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE';
  readonly scalingFactor?: number;
  readonly rotation?: number;
  readonly imageHash?: string;
  readonly opacity?: number;
  readonly visible?: boolean;
}

// ============================================================================
// EFFECT TYPES (New in v1.110+)
// ============================================================================

export interface ProgressiveBlurEffect {
  readonly type: 'PROGRESSIVE_BLUR';
  readonly radius: number;
  readonly center: Point;
  readonly falloff: number;
  readonly visible: boolean;
}

export interface TextureEffect {
  readonly type: 'TEXTURE';
  readonly intensity: number;
  readonly textureType: 'PAPER' | 'CANVAS' | 'NOISE' | 'GRAIN';
  readonly visible: boolean;
}

export interface NoiseEffect {
  readonly type: 'NOISE';
  readonly intensity: number;
  readonly size: number;
  readonly seed: number;
  readonly visible: boolean;
}

export type AdvancedEffect = ProgressiveBlurEffect | TextureEffect | NoiseEffect;

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

// New node types from Figma API Version 1, Update 110+
export interface TextPathNodeData extends BaseNodeData {
  readonly type: 'TEXT_PATH';
  readonly characters: string;
  readonly fontSize?: number;
  readonly fontName?: FontName;
  readonly pathData?: string; // SVG path data
}

export interface TransformGroupNodeData extends BaseNodeData {
  readonly type: 'TRANSFORM_GROUP';
  readonly children?: readonly BaseNodeData[];
  readonly transform?: readonly number[][]; // 3x3 transformation matrix
}

export type NodeData =
  | BaseNodeData
  | TextNodeData
  | RectangleNodeData
  | GroupNodeData
  | TextPathNodeData
  | TransformGroupNodeData;

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

// ============================================================================
// STORAGE API TYPES (Enhanced for 5MB limit)
// ============================================================================

export interface StorageQuota {
  readonly used: number;
  readonly available: number;
  readonly limit: number; // 5MB = 5 * 1024 * 1024 bytes
  readonly entryLimit: number; // 100KB per entry
}

export interface StorageEntry<T = unknown> {
  readonly key: string;
  readonly value: T;
  readonly size: number;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly version: number;
}

export interface VersionedData<T> {
  readonly version: number;
  readonly data: T;
  readonly metadata: {
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly dataType: string;
  };
}

// ============================================================================
// DYNAMIC PAGE LOADING TYPES
// ============================================================================

export interface PageData {
  readonly id: string;
  readonly name: string;
  readonly type: 'PAGE';
  readonly nodeCount?: number;
  readonly isLoaded: boolean;
}

export interface DocumentData {
  readonly id: string;
  readonly name: string;
  readonly currentPageId: string;
  readonly pages: readonly PageData[];
}

export interface PageLoadResult {
  readonly pageId: string;
  readonly success: boolean;
  readonly loadTime?: number;
  readonly nodeCount?: number;
  readonly error?: string;
}

// ============================================================================
// ENHANCED API TYPES
// ============================================================================

export interface BrushProfile {
  readonly name: string;
  readonly width: number;
  readonly pressure?: number;
  readonly tilt?: number;
  readonly rotation?: number;
}

export interface VariableStrokeData {
  readonly profiles: readonly BrushProfile[];
  readonly smoothing: number;
  readonly streamline: number;
}

export interface CreateAdvancedNodeOptions extends CreateNodeOptions {
  readonly effects?: readonly AdvancedEffect[];
  readonly patterns?: readonly PatternPaint[];
  readonly strokeData?: VariableStrokeData;
}
