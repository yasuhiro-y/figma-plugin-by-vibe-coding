/**
 * Build script to generate manifest.json from TypeScript manifest
 * Includes validation to prevent "unexpected extra property" errors
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import manifest from '../figma.manifest.js';

const manifestPath = resolve(process.cwd(), 'dist/manifest.json');

// Official Figma-supported manifest properties
const SUPPORTED_PROPERTIES = new Set([
  'name', 'id', 'api', 'main', 'ui', 'capabilities', 
  'enableProposedApi', 'editorType', 'networkAccess',
  'parameters', 'menu', 'relaunchButtons'
]);

// Properties that cause "unexpected extra property" errors
const FORBIDDEN_PROPERTIES = new Set([
  'description', 'author', 'version', 'keywords', 'homepage',
  'repository', 'license', 'bugs'
]);

/**
 * Validate manifest properties against Figma's official specification
 */
function validateManifest(manifest: Record<string, unknown>): void {
  const manifestKeys = Object.keys(manifest);
  const issues: string[] = [];
  
  // Check for forbidden properties
  for (const key of manifestKeys) {
    if (FORBIDDEN_PROPERTIES.has(key)) {
      issues.push(`❌ Property "${key}" is not supported by Figma and will cause errors`);
    } else if (!SUPPORTED_PROPERTIES.has(key)) {
      issues.push(`⚠️  Property "${key}" may not be supported by Figma`);
    }
  }
  
  // Check required properties
  const REQUIRED_PROPERTIES = ['name', 'id', 'api', 'main'];
  for (const required of REQUIRED_PROPERTIES) {
    if (!manifestKeys.includes(required)) {
      issues.push(`❌ Required property "${required}" is missing`);
    }
  }
  
  // Check plugin ID format
  if (manifest.id === '0000000000000000000') {
    issues.push('⚠️  Plugin ID is still default value - replace with actual Figma plugin ID');
  }
  
  if (issues.length > 0) {
    console.log('\n📋 Manifest Validation:');
    issues.forEach(issue => console.log(`  ${issue}`));
    
    const hasErrors = issues.some(issue => issue.startsWith('❌'));
    if (hasErrors) {
      console.error('\n❌ Manifest validation failed');
      process.exit(1);
    }
    console.log(''); // Add spacing
  }
}

try {
  // Validate before generating
  validateManifest(manifest);
  
  // Generate manifest.json
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Generated manifest.json successfully');
} catch (error) {
  console.error('❌ Failed to generate manifest.json:', error);
  process.exit(1);
}
