# Create Command Documentation

## NPM Create Command for Figma Plugin by Vibe Coding

This package provides an `npm create` command for quickly generating new Figma plugin projects with AI-assisted development support.

## Usage

### Basic Usage
```bash
# Create a new plugin project
npm create figma-plugin-by-vibe-coding my-awesome-plugin
```

### With AI Target Specification
```bash
# Create with specific AI tool
npm create figma-plugin-by-vibe-coding my-plugin --ai=cursor
npm create figma-plugin-by-vibe-coding my-plugin --ai=claudecode
npm create figma-plugin-by-vibe-coding my-plugin --ai=copilot
```

### Supported AI Targets

- `cursor` (default) - Cursor AI
- `claudecode` - Claude Code
- `copilot` - GitHub Copilot
- `cline` - Cline
- `amazonq` - Amazon Q
- `qwen` - Qwen Code  
- `gemini` - Gemini CLI
- `windsurf` - Windsurf
- `warp` - Warp

## What Gets Created

The command creates a complete plugin project with:

### 📁 Project Structure
```
my-awesome-plugin/
├── src/
│   ├── plugin/           # Plugin thread (Figma API)
│   ├── ui/              # UI thread (React)
│   └── common/          # Shared types & contracts
├── .rulesync/           # AI development rules
├── scripts/             # Build & development scripts
└── config files...      # Vite, TypeScript, Tailwind, etc.
```

### 🤖 AI Development Setup
- **Rules generated** for your chosen AI tool
- **Type-safe communication** between plugin and UI
- **Best practices** from comprehensive rule files
- **Error handling patterns** and safety guidelines

### 🛠️ Technology Stack
- **React 18** + TypeScript 5.6+
- **shadcn/ui** components + Tailwind CSS
- **Vite** dual-process build system
- **Biome** for linting & formatting

### 📋 Ready-to-Use Features
- Random shape generator demo
- Selection management
- Figma theme integration
- Type-safe plugin communication
- Comprehensive error handling

## Post-Creation Steps

After project creation:

```bash
# Navigate to project
cd my-awesome-plugin

# Start development
npm run dev

# Open Figma Desktop and load the plugin from dist/
```

## Configuration

The created project includes a user-configurable `.vibe-coding.config.json`:

```json
{
  "$schema": "./vibe-coding.schema.json",
  "ai": {
    "target": "cursor"
  },
  "preferences": {
    "strictErrorHandling": true
  }
}
```

**User-configurable options:**
- `ai.target` - Your preferred AI development tool
- `preferences.strictErrorHandling` - Error handling behavior

**System-managed (not user-configurable):**
- Available AI targets list
- Technical framework settings
- Build system configuration

## AI Rules Integration

The create command automatically:

1. **Generates AI rules** for your specified target
2. **Creates comprehensive guidelines** in `.rulesync/rules/`
3. **Sets up tool-specific configuration** (`.cursor/`, `.claude/`, etc.)
4. **Provides LLM instructions** for effective development

## Development Workflow

### Available Commands
```bash
npm run dev              # Start development mode
npm run build           # Production build
npm run rules:generate  # Regenerate AI rules
npm run lint:fix        # Fix code issues
npm run typecheck       # Type checking
```

### AI-Assisted Development
1. Open project in your AI tool (Cursor, VS Code, etc.)
2. AI tool automatically loads generated rules
3. Start coding with intelligent assistance
4. LLM understands Figma plugin architecture

## Publishing Your Plugin

1. **Build for production**: `npm run build`
2. **Test in Figma**: Load `dist/manifest.json`
3. **Publish to Figma Community** via Figma Desktop

## Support & Resources

- **User Guide**: `README.md` (Japanese)
- **LLM Guide**: `README-LLM.md` (for AI tools)
- **Rule Files**: `.rulesync/rules/*.md` (comprehensive patterns)
- **Examples**: Pre-built demo components

The create command sets up everything you need for professional Figma plugin development with AI assistance!
