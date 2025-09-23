/**
 * Hooks Index - Central Export Point
 *
 * This file provides a convenient way to import hooks from anywhere in the UI.
 * It separates core boilerplate hooks from user-specific feature hooks.
 */

// Core hooks (part of boilerplate - don't modify)
export * from './core';

// Feature hooks (add your custom hooks here)
export * from './features';

/**
 * Import examples:
 *
 * // Import core boilerplate hook
 * import { useFigmaPlugin } from '@/hooks';
 *
 * // Import your custom feature hook
 * import { useMyFeature } from '@/hooks';
 *
 * // Import specific hooks directly
 * import { useFigmaPlugin } from '@/hooks/core';
 * import { useMyFeature } from '@/hooks/features';
 */
