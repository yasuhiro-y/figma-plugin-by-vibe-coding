/**
 * Build script to generate manifest.json from TypeScript manifest
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import manifest from '../figma.manifest.js';

const manifestPath = resolve(process.cwd(), 'dist/manifest.json');

try {
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Generated manifest.json successfully');
} catch (error) {
  console.error('❌ Failed to generate manifest.json:', error);
  process.exit(1);
}
