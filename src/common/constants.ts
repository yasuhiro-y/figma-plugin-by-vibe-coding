/**
 * Essential constants for plugin configuration
 * Keep this minimal - use defaults where possible
 */

import type { PluginSettings } from './types.js';

// ============================================================================
// UI DIMENSIONS
// ============================================================================

/**
 * Standard UI dimensions for the plugin window
 */
export const UI_DIMENSIONS = {
  DEFAULT_WIDTH: 320,
  DEFAULT_HEIGHT: 480,
} as const;

// ============================================================================
// PLUGIN CONFIGURATION
// ============================================================================

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: PluginSettings = {
  theme: 'auto',
  showNotifications: true,
  autoSave: false,
  debugMode: false,
} as const;

/**
 * Storage keys for persistent data
 */
export const STORAGE_KEYS = {
  SETTINGS: 'plugin-settings',
} as const;
