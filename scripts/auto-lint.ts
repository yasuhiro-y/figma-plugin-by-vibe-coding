#!/usr/bin/env tsx
/**
 * Auto Lint Script for LLM Code Generation
 *
 * This script automatically checks and fixes code quality issues:
 * - Runs biome lint and format
 * - Runs TypeScript type checking
 * - Provides structured feedback for LLM
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  success: boolean;
  message: string;
  details?: string;
}

const projectRoot = process.cwd();

function runCheck(name: string, command: string): CheckResult {
  try {
    console.log(`🔍 Running ${name}...`);
    const output = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    return {
      name,
      success: true,
      message: `✅ ${name} passed`,
      details: output.trim() || undefined,
    };
  } catch (error: any) {
    return {
      name,
      success: false,
      message: `❌ ${name} failed`,
      details: error.stdout || error.stderr || error.message,
    };
  }
}

function runFix(name: string, command: string): CheckResult {
  try {
    console.log(`🔧 Running ${name}...`);
    const output = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    return {
      name,
      success: true,
      message: `✅ ${name} completed`,
      details: output.trim() || undefined,
    };
  } catch (error: any) {
    return {
      name,
      success: false,
      message: `❌ ${name} failed`,
      details: error.stdout || error.stderr || error.message,
    };
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting Auto Lint & Check Process...\n');

  const results: CheckResult[] = [];

  // 1. Auto-fix formatting and linting (plugin files only)
  results.push(runFix('Biome Format', 'pnpm run format'));
  results.push(runFix('Biome Lint Fix', 'pnpm run lint:fix'));

  // 2. Run checks (plugin files only)
  results.push(runCheck('Biome Lint Check', 'pnpm run lint:check'));
  results.push(runCheck('TypeScript Check', 'pnpm run typecheck'));

  // 3. Summary
  console.log('\n📊 Results Summary:');
  console.log('='.repeat(50));

  let allPassed = true;
  for (const result of results) {
    console.log(result.message);
    if (result.details && !result.success) {
      console.log(`   ${result.details.split('\n')[0]}...`);
    }
    if (!result.success) allPassed = false;
  }

  console.log('='.repeat(50));

  if (allPassed) {
    console.log('🎉 All checks passed! Code is ready for commit.');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Please review the issues above.');

    // Provide LLM-friendly error summary
    console.log('\n🤖 LLM Error Summary:');
    const failedChecks = results.filter((r) => !r.success);
    for (const failed of failedChecks) {
      console.log(`- ${failed.name}: ${failed.details?.split('\n')[0] || 'Unknown error'}`);
    }

    process.exit(1);
  }
}

// Execute main function when script is run directly
main().catch((error) => {
  console.error('❌ Auto-lint script failed:', error);
  process.exit(1);
});
