import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Keep root at project level for proper path resolution
  root: __dirname,

  build: {
    // Output directory relative to project root
    outDir: path.resolve(__dirname, 'dist'),

    // Don't clean output directory to preserve UI build artifacts
    emptyOutDir: false,

    // Generate source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development',

    // Optimize for production
    minify: process.env.NODE_ENV !== 'development',

    // Configure library mode for plugin code
    lib: {
      // Entry point for plugin code
      entry: path.resolve(__dirname, 'src/plugin/main.ts'),

      // Output as ES modules for modern Figma plugin runtime
      formats: ['es'],

      // Fixed output filename required by Figma
      fileName: () => 'code.js',
    },

    // Configure Rollup options
    rollupOptions: {
      // External dependencies (none for Figma plugins - everything must be bundled)
      external: [],

      output: {
        // Ensure globals are defined for any externalized dependencies
        globals: {},

        // Preserve module structure where possible
        preserveModules: false,

        // Use consistent exports format
        exports: 'auto',
      },
    },

    // Target environment for plugin code (Figma runtime supports ES2017)
    target: 'es2017',
  },

  // Environment variables configuration
  envDir: path.resolve(__dirname),
  envPrefix: 'VITE_',

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    // Figma plugin environment doesn't have window or global
    global: 'globalThis',
  },

  // Optimize dependencies for plugin environment
  optimizeDeps: {
    include: ['zod'],
    exclude: [
      'react',
      'react-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
  },

  // Esbuild configuration for TypeScript transformation
  esbuild: {
    // Target ES2017 for Figma plugin runtime compatibility
    target: 'es2017',

    // Enable tree shaking
    treeShaking: true,

    // Preserve names for better debugging
    keepNames: process.env.NODE_ENV === 'development',

    // Drop console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
