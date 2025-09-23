#!/usr/bin/env node
/**
 * Release Script for create-figma-plugin-by-vibe-coding
 * 
 * Interactive release management with version bumping and npm publishing
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

interface ReleaseOptions {
  type: 'patch' | 'minor' | 'major';
  skipTests: boolean;
  dryRun: boolean;
}

function getCurrentVersion(): string {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  return packageJson.version;
}

function runCommand(command: string, options: { dryRun?: boolean } = {}): void {
  console.log(`🔧 ${options.dryRun ? '[DRY RUN] ' : ''}Running: ${command}`);
  
  if (!options.dryRun) {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`❌ Command failed: ${command}`);
      process.exit(1);
    }
  }
}

function promptUser(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function selectReleaseType(): Promise<ReleaseOptions['type']> {
  console.log('\n📋 Select release type:');
  console.log('1. patch (1.0.0 → 1.0.1) - Bug fixes');
  console.log('2. minor (1.0.0 → 1.1.0) - New features (RECOMMENDED)');
  console.log('3. major (1.0.0 → 2.0.0) - Breaking changes');
  
  const answer = await promptUser('\nEnter choice (1-3): ');
  
  switch (answer) {
    case '1': return 'patch';
    case '2': return 'minor';
    case '3': return 'major';
    default:
      console.log('Invalid choice, defaulting to minor');
      return 'minor';
  }
}

async function confirmRelease(currentVersion: string, releaseType: string): Promise<boolean> {
  const answer = await promptUser(`\n❓ Release ${releaseType} version from ${currentVersion}? (y/N): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

async function main(): Promise<void> {
  console.log('🚀 Figma Plugin by Vibe Coding - Release Manager\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipTests = args.includes('--skip-tests');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  const currentVersion = getCurrentVersion();
  console.log(`📦 Current version: ${currentVersion}`);
  
  // Check git status
  try {
    execSync('git diff-index --quiet HEAD --');
  } catch {
    console.error('❌ Working directory is not clean. Please commit or stash changes first.');
    process.exit(1);
  }
  
  // Select release type
  const releaseType = await selectReleaseType();
  
  // Confirm release
  const confirmed = await confirmRelease(currentVersion, releaseType);
  if (!confirmed) {
    console.log('❌ Release cancelled');
    process.exit(0);
  }
  
  console.log(`\n🔄 Starting ${releaseType} release...\n`);
  
  // Run quality checks
  if (!skipTests) {
    console.log('🧪 Running quality checks...');
    runCommand('pnpm run check-all', { dryRun });
  }
  
  // Build create command
  console.log('🏗️ Building create command...');
  runCommand('pnpm run build:create', { dryRun });
  
  // Version bump and publish
  console.log('📈 Bumping version and publishing...');
  runCommand(`npm version ${releaseType}`, { dryRun });
  runCommand('npm publish', { dryRun });
  
  // Push git tags
  console.log('📤 Pushing git tags...');
  runCommand('git push --follow-tags', { dryRun });
  
  if (!dryRun) {
    const newVersion = getCurrentVersion();
    console.log(`\n🎉 Successfully released version ${newVersion}!`);
    console.log(`📦 Package available at: https://www.npmjs.com/package/create-figma-plugin-by-vibe-coding`);
    console.log(`🚀 Users can now run: npm create figma-plugin-by-vibe-coding my-plugin`);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('❌ Release failed:', error);
  process.exit(1);
});
