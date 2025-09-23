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
  name: 'Figma Plugin by Vibe Coding',
  id: '0000000000000000000', // ⚠️  Replace with your plugin ID from Figma
  api: '1.0.0',
  main: 'code.js',
  ui: 'index.html',

  // Plugin capabilities - uncomment and add as needed:
  capabilities: [
    // 'inspect',     // Read properties from selected objects
    // 'export',      // Export images/assets
    // 'codegen',     // Generate code snippets
    // 'textreview'   // Text content review
  ],

  // Enable experimental APIs (use with caution)
  enableProposedApi: false,

  // Supported Figma editor types
  editorType: ['figma', 'figjam'],

  // Network access configuration
  networkAccess: {
    allowedDomains: ['none'], // Add domains if your plugin needs external API access
    // Example: ['api.example.com', 'cdn.example.com']
  },

} satisfies PluginManifest;

// Official Figma Plugin Manifest Type Definition
// Only includes properties officially supported by Figma
interface PluginManifest {
  name: string;
  id: string;
  api: string;
  main: string;
  ui?: string;
  capabilities?: string[];
  enableProposedApi?: boolean;
  editorType?: Array<'figma' | 'figjam'>;
  networkAccess?: {
    allowedDomains: string[];
  };
  parameters?: Array<{
    name: string;
    key: string;
    description?: string;
  }>;
  menu?: Array<{
    name: string;
    command: string;
    parameters?: Record<string, string>;
  }>;
  relaunchButtons?: Array<{
    command: string;
    name: string;
  }>;
}
