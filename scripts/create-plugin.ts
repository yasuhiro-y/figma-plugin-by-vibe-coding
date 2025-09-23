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
        'node_modules', '.git', 'dist', 'bin', '.cursor', '.claude', '.github/workflows',
        'CLAUDE.md', 'AGENTS.md', 'scripts/create-plugin.ts', 'scripts/release.ts'
      ];
      
      return !skipPatterns.some(pattern => 
        relativePath.includes(pattern) || relativePath === pattern
      );
    }
  });
}

function generateRandomPluginId(): string {
  // Generate a 19-digit random number (typical Figma plugin ID format)
  const timestamp = Date.now().toString(); // 13 digits
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // 6 digits
  return timestamp + random; // Total 19 digits
}

function updateProjectFiles(targetDir: string, options: CreateOptions): void {
  console.log('🔧 Updating project files...');
  
  // Generate unique plugin ID for this project
  const pluginId = generateRandomPluginId();
  console.log(`🆔 Generated plugin ID: ${pluginId}`);
  
  // Update package.json
  const packagePath = path.join(targetDir, 'package.json');
  if (existsSync(packagePath)) {
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    packageJson.name = options.projectName;
    packageJson.description = `${options.projectName} - Figma Plugin by Vibe Coding`;
    
    // Remove npm create command related fields
    delete packageJson.bin;
    delete packageJson.publishConfig;
    if (packageJson.files) {
      // Remove 'bin/' from files array
      packageJson.files = packageJson.files.filter((file: string) => file !== 'bin/');
    }
    if (packageJson.scripts) {
      // Remove npm publishing and release related scripts
      delete packageJson.scripts['build:create'];
      delete packageJson.scripts['prepublishOnly'];
      delete packageJson.scripts['release'];
      delete packageJson.scripts['release:minor'];
      delete packageJson.scripts['release:patch'];
      delete packageJson.scripts['release:major'];
      delete packageJson.scripts['prepare-publish'];
    }
    
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }
  
  // Update manifest with name and unique plugin ID
  const manifestPath = path.join(targetDir, 'figma.manifest.ts');
  if (existsSync(manifestPath)) {
    let manifest = readFileSync(manifestPath, 'utf-8');
    manifest = manifest.replace(
      "name: 'Figma Plugin by Vibe Coding'",
      `name: '${options.projectName}'`
    );
    manifest = manifest.replace(
      "id: '0000000000000000000'",
      `id: '${pluginId}'`
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

function runInitialBuild(targetDir: string): void {
  console.log('🔨 Running initial build...');
  
  try {
    execSync('npm run build', { 
      cwd: targetDir, 
      stdio: 'inherit' 
    });
    console.log('✅ Initial build completed successfully');
  } catch (error) {
    console.warn('⚠️  Initial build failed');
    console.log('Please run: cd', path.basename(targetDir), '&& npm run build');
  }
}

function initializeGitRepository(targetDir: string): void {
  console.log('🔧 Initializing Git repository...');
  
  try {
    // Initialize git repository
    execSync('git init', { 
      cwd: targetDir, 
      stdio: 'pipe' // Suppress git init output
    });
    
    // Create .gitignore
    const gitignoreContent = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.cache/

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/settings.json
.vscode/launch.json
.idea/
*.swp
*.swo

# OS files  
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# AI tool generated files (optional - remove if you want to commit them)
.cursor/
.claude/
.agents/
.amazonq/
.augment/
.clinerules/
.codex/
.gemini/
.junie/
.kiro/
.opencode/
.qwen/  
.roo/
.windsurf/
.warp/
.github/instructions/
.github/copilot-instructions.md
.augment-guidelines
CLAUDE.md
AGENTS.md
QWEN.md
GEMINI.md
WARP.md

# Plugin development
figma-plugin.zip
`;
    
    writeFileSync(path.join(targetDir, '.gitignore'), gitignoreContent);
    
    // Add all files
    execSync('git add .', { 
      cwd: targetDir, 
      stdio: 'pipe' 
    });
    
    // Create initial commit
    execSync('git commit -m "feat: initial Figma plugin project setup\\n\\nGenerated with figma-plugin-by-vibe-coding"', { 
      cwd: targetDir, 
      stdio: 'pipe' 
    });
    
    console.log('✅ Git repository initialized with initial commit');
  } catch (error) {
    console.warn('⚠️  Git initialization failed');
    console.log('You can manually run: cd', path.basename(targetDir), '&& git init');
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
  console.log('\n📦 Git Repository:');
  console.log('  ✅ Initialized with initial commit');
  console.log('  ✅ .gitignore configured for Figma plugin development');
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
    runInitialBuild(options.targetDir);
    initializeGitRepository(options.targetDir);
    
    printSuccess(options);
    
  } catch (error: any) {
    console.error('❌ Failed to create project:', error.message);
    process.exit(1);
  }
}

main();
