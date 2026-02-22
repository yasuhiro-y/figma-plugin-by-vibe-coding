/**
 * Figma Plugin Manifest
 *
 * This file defines the plugin configuration that Figma reads to understand
 * how to load and run your plugin. It's written in TypeScript for type safety
 * and compiled to JSON during the build process.
 *
 * @see https://figma.com/plugin-docs/manifest/
 */

export default {
  // ❌❌❌ UPDATE THIS NAME WHEN YOUR PLUGIN IDEA IS FINALIZED ❌❌❌
  // 🚨 WARNING: "Figma Plugin by Vibe Coding" is a PLACEHOLDER name!
  // ✅ REPLACE with your actual plugin name (e.g., "Color Palette Generator", "Design System Helper")
  name: 'Figma Plugin by Vibe Coding',
  
  id: '0000000000000000000', // ⚠️  Replace with your plugin ID from Figma (or keep generated ID from create command)
  api: '1.0.0',
  main: 'code.js',
  ui: 'index.html',

  // Dynamic page loading - enables access to other pages without preloading
  documentAccess: 'dynamic-page',

  // Plugin capabilities - uncomment and add as needed:
  capabilities: [
    // 'inspect',     // Read properties from selected objects
    // 'export',      // Export images/assets
    // 'codegen',     // Generate code snippets
    // 'textreview'   // Text content review
  ],

  // Enable experimental/proposed APIs (Version 1, Update 110+ features)
  enableProposedApi: true, // Required for latest node types and effects

  // Supported Figma editor types
  editorType: ['figma', 'figjam'],

  // Network access configuration
  networkAccess: {
    allowedDomains: ['none'], // Add domains if your plugin needs external API access
    // Example: ['api.example.com', 'cdn.example.com']
  },

} satisfies PluginManifest;

// Official Figma Plugin Manifest Type Definition
// Updated for Figma Plugin API Version 1, Update 110+ (2026)
interface PluginManifest {
  name: string;
  id: string;
  api: string;
  main: string;
  ui?: string;
  
  // Document access control for dynamic page loading
  documentAccess?: 'dynamic-page';
  
  capabilities?: string[];
  enableProposedApi?: boolean;
  editorType?: Array<'figma' | 'figjam'>;
  
  // Network access configuration
  networkAccess?: {
    allowedDomains: string[];
  };
  
  // Plugin parameters for relaunch and menu commands
  parameters?: Array<{
    name: string;
    key: string;
    description?: string;
  }>;
  
  // Plugin menu items
  menu?: Array<{
    name: string;
    command: string;
    parameters?: Record<string, string>;
  }>;
  
  // Relaunch button configuration
  relaunchButtons?: Array<{
    command: string;
    name: string;
  }>;
}
