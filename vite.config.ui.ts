import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // UI code root directory
  root: path.resolve(__dirname, 'src/ui'),

  plugins: [
    react({
      // Enable fast refresh for better development experience
      fastRefresh: true,
      // Enable automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
    // Inline all assets into single HTML file for Figma plugin requirement
    viteSingleFile({
      removeViteModuleLoader: true,
      useRecommendedBuildConfig: true,
    }),
  ],

  build: {
    // Output directory relative to project root
    outDir: path.resolve(__dirname, 'dist'),

    // Don't clean output directory to preserve plugin artifacts
    emptyOutDir: false,

    // Generate source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development',

    // Optimize bundle for production
    minify: process.env.NODE_ENV !== 'development',

    // Configure Rollup options
    rollupOptions: {
      input: {
        ui: path.resolve(__dirname, 'src/ui/index.html'),
      },
      output: {
        // Ensure consistent file naming
        entryFileNames: 'assets/ui-[hash].js',
        chunkFileNames: 'assets/ui-chunk-[hash].js',
        assetFileNames: 'assets/ui-[name]-[hash].[ext]',
      },
    },
  },

  // Path resolution for imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/common': path.resolve(__dirname, 'src/common'),
      '@/components': path.resolve(__dirname, 'src/ui/components'),
      '@/hooks': path.resolve(__dirname, 'src/ui/hooks'),
      '@/lib': path.resolve(__dirname, 'src/ui/lib'),
      '@/utils': path.resolve(__dirname, 'src/ui/utils'),
    },
  },

  // Development server configuration - Enhanced for CSS stability
  server: {
    port: 3000,
    host: 'localhost',
    strictPort: true,
    open: false,
    cors: true,
    // Enhanced HMR for CSS stability
    hmr: {
      port: 3001,
      // Force CSS updates during HMR
      overlay: true,
      // Improve CSS hot reload reliability
      clientPort: 3001,
    },
    // Force reload on CSS changes to prevent style loss
    watch: {
      usePolling: false,
      interval: 100,
    },
  },

  // Preview server configuration
  preview: {
    port: 3002,
    host: 'localhost',
    strictPort: true,
    open: false,
  },

  // Environment variables configuration
  envDir: path.resolve(__dirname),
  envPrefix: 'VITE_',

  // CSS configuration - Maximum HMR stability
  css: {
    devSourcemap: true,
    // Always use PostCSS for consistent processing
    postcss: './postcss.config.cjs',
    // NEVER extract CSS in development - force inline
    extract: false,
    // Enable CSS injection
    modules: false,
    // Aggressive CSS processing
    preprocessorOptions: {
      css: {
        charset: false,
      }
    },
    // Force CSS reloading
    transformer: 'postcss',
  },

  // Define global constants
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },

  // Optimize dependencies - UI thread only (no figma-await-ipc)
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-slot',
    ],
    exclude: [
      '@figma/plugin-typings',
      'figma-await-ipc', // Plugin thread only, not UI
    ],
  },
});
