#!/usr/bin/env node
/**
 * Create Figma Plugin by Vibe Coding
 * 
 * NPM create command for generating new plugin projects
 * Usage: npm create figma-plugin-by-vibe-coding <project-name> [--ai=cursor]
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface CreateOptions {
  projectName: string;
  aiTarget: string;
  targetDir: string;
}

const SUPPORTED_AI_TARGETS = [
  'cursor', 'claudecode', 'copilot', 'cline', 
  'amazonq', 'qwen', 'gemini', 'windsurf', 'warp'
];

function parseArgs(): CreateOptions {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Project name is required');
    console.log('Usage: npm create figma-plugin-by-vibe-coding <project-name> [--ai=cursor]');
    process.exit(1);
  }
  
  const projectName = args[0];
  const aiFlag = args.find(arg => arg.startsWith('--ai='));
  const aiTarget = aiFlag ? aiFlag.split('=')[1] : 'cursor';
  
  if (!SUPPORTED_AI_TARGETS.includes(aiTarget)) {
    console.error(`❌ Unsupported AI target: ${aiTarget}`);
    console.log(`Supported targets: ${SUPPORTED_AI_TARGETS.join(', ')}`);
    process.exit(1);
  }
  
  return {
    projectName,
    aiTarget,
    targetDir: path.resolve(projectName)
  };
}

function validateProjectName(name: string): void {
  if (!/^[a-z0-9-]+$/.test(name)) {
    console.error('❌ Project name must contain only lowercase letters, numbers, and hyphens');
    process.exit(1);
  }
  
  if (existsSync(name)) {
    console.error(`❌ Directory '${name}' already exists`);
    process.exit(1);
  }
}

function getTemplatePath(): string {
  // When published as npm package, template will be in package root
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const packageRoot = path.resolve(currentDir, '..');
  
  // Check if we're in development or published package
  if (existsSync(path.join(packageRoot, 'package.json'))) {
    return packageRoot;
  }
  
  throw new Error('Template not found');
}

function copyTemplate(templatePath: string, targetDir: string, projectName: string): void {
  console.log('📁 Creating project directory...');
  mkdirSync(targetDir, { recursive: true });
  
  console.log('📋 Copying template files...');
  cpSync(templatePath, targetDir, { 
    recursive: true,
    filter: (src) => {
      // Skip certain directories and files
      const relativePath = path.relative(templatePath, src);
      const skipPatterns = [
        'node_modules', '.git', 'dist', '.cursor', '.claude',
        'CLAUDE.md', 'AGENTS.md', 'scripts/create-plugin.ts'
      ];
      
      return !skipPatterns.some(pattern => 
        relativePath.includes(pattern) || relativePath === pattern
      );
    }
  });
}

function updateProjectFiles(targetDir: string, options: CreateOptions): void {
  console.log('🔧 Updating project files...');
  
  // Update package.json
  const packagePath = path.join(targetDir, 'package.json');
  if (existsSync(packagePath)) {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    packageJson.name = options.projectName;
    packageJson.description = `${options.projectName} - Figma Plugin by Vibe Coding`;
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }
  
  // Update manifest
  const manifestPath = path.join(targetDir, 'figma.manifest.ts');
  if (existsSync(manifestPath)) {
    let manifest = readFileSync(manifestPath, 'utf-8');
    manifest = manifest.replace(
      "name: 'Figma Plugin by Vibe Coding'",
      `name: '${options.projectName}'`
    );
    writeFileSync(manifestPath, manifest);
  }
  
  // Update rulesync.jsonc target
  const rulesyncPath = path.join(targetDir, 'rulesync.jsonc');
  if (existsSync(rulesyncPath)) {
    let content = readFileSync(rulesyncPath, 'utf-8');
    content = content.replace(
      /"targets":\s*\[[^\]]*\]/,
      `"targets": ["${options.aiTarget}"]`
    );
    writeFileSync(rulesyncPath, content);
    console.log(`✅ Set AI target to: ${options.aiTarget}`);
  }
}

function installDependencies(targetDir: string): void {
  console.log('📦 Installing dependencies...');
  
  try {
    execSync('npm install', { 
      cwd: targetDir, 
      stdio: 'inherit' 
    });
  } catch (error) {
    console.warn('⚠️  Failed to install dependencies automatically');
    console.log('Please run: cd', path.basename(targetDir), '&& npm install');
  }
}

function generateAIRules(targetDir: string): void {
  console.log('🤖 Generating AI development rules...');
  
  try {
    execSync('npm run rules:generate', { 
      cwd: targetDir, 
      stdio: 'inherit' 
    });
  } catch (error) {
    console.warn('⚠️  Failed to generate AI rules automatically');
    console.log('Please run: cd', path.basename(targetDir), '&& npm run rules:generate');
  }
}

function printSuccess(options: CreateOptions): void {
  console.log('\n🎉 Project created successfully!');
  console.log('\nNext steps:');
  console.log(`  cd ${options.projectName}`);
  console.log('  npm run dev');
  console.log('\n📖 Documentation:');
  console.log('  README.md - User guide (Japanese)');
  console.log('  README-LLM.md - AI development guide');
  console.log(`\n🤖 AI Target: ${options.aiTarget}`);
  console.log('  Your AI development rules have been generated!');
}

function main(): void {
  console.log('🚀 Creating Figma Plugin by Vibe Coding...\n');
  
  const options = parseArgs();
  validateProjectName(options.projectName);
  
  try {
    const templatePath = getTemplatePath();
    
    copyTemplate(templatePath, options.targetDir, options.projectName);
    updateProjectFiles(options.targetDir, options);
    installDependencies(options.targetDir);
    generateAIRules(options.targetDir);
    
    printSuccess(options);
    
  } catch (error: any) {
    console.error('❌ Failed to create project:', error.message);
    process.exit(1);
  }
}

main();
