# 🤖 Figma Plugin Vibe Coding Boilerplate - AI Development Guide

**Setup and Usage Guide for AI Development Tools (LLMs, Cursor, Claude, Copilot, etc.)**

This document explains how to use this boilerplate with AI development tools. For detailed technical specifications, refer to the generated rule files in `.rulesync/rules/`.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![rulesync](https://img.shields.io/badge/rulesync-FF6B35?style=for-the-badge)](https://github.com/dyoshikawa/rulesync)

## 🎯 What This Is

A **production-ready Figma plugin boilerplate** specifically designed for **Vibe Coding** (AI-assisted development). This project demonstrates:

- Modern TypeScript patterns with complete type safety
- shadcn/ui integration for professional UI development
- Figma's dual-process plugin architecture
- Comprehensive error handling and user experience patterns

## 🚀 Quick Setup for AI Development

### 1. Initial Setup

```bash
git clone [your-repository]
cd figma-plugin-vibe-coding-boilerplate
pnpm install
```

### 2. Generate AI Development Rules

**IMPORTANT**: Before using with AI tools, generate the rule files:

```bash
# Generate rules for ALL AI development tools (recommended)
pnpm run rules:generate

# Development mode (faster, fewer tools)  
pnpm run rules:dev
```

This creates **~90 files** for comprehensive AI tool support:
- `.cursor/rules/` - Cursor AI rules
- `.claude/memories/` - Claude Code memories + agents
- `.github/instructions/` - GitHub Copilot integration
- `.clinerules/`, `.amazonq/`, `.qwen/`, `.gemini/` - Specialized tool support
- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `WARP.md` - Main configuration files
- Support for 15+ AI development tools

### 3. Start Development

```bash
pnpm dev    # Start development server
pnpm build  # Production build
```

## 📚 Generated Rule Files

After running `pnpm run rules:generate`, you'll have AI-specific documentation:

### 📁 Core Rules (`.rulesync/rules/`)
- `overview.md` - Project overview and philosophy
- `figma-plugin-architecture.md` - Dual-process architecture details
- `typescript-patterns.md` - Type safety patterns and standards  
- `shadcn-ui-guidelines.md` - UI component usage rules
- `scripter-best-practices.md` - Error handling and UX patterns

### 🤖 AI Tool Integration
- **Cursor**: Uses `.cursor/rules/` for contextual assistance
- **Claude Code**: Uses `.claude/memories/` + specialized agents
- **GitHub Copilot**: Uses generated markdown rules
- **Other AI Tools**: Automatically supported via rulesync

### 🔧 Custom Commands & Agents
- `generate-plugin` command - Generates new features with best practices
- `figma-expert` agent - Specialized Figma Plugin API knowledge

## 🏗️ Key Concepts for AI Development

### Figma Plugin Architecture (CRITICAL)
Figma plugins run in **TWO isolated processes**:
1. **Plugin Thread** (`src/plugin/`) - Figma API access, no browser APIs
2. **UI Thread** (`src/ui/`) - React/browser APIs, no Figma API access

**Communication**: Only via `postMessage` - treat as separate applications.

### Development Philosophy
1. **Complete Type Safety** - All functions must have explicit types
2. **shadcn/ui Only** - No custom CSS, use component library exclusively  
3. **Error Boundaries** - All operations handle failures gracefully
4. **Production Ready** - Code must be deployment-ready

### Code Generation Standards
- Use TypeScript strict mode with explicit annotations
- Implement Result pattern for error handling
- Validate external data with Zod schemas
- Use shadcn/ui components exclusively for UI

## 💻 Development Commands

```bash
# AI Rules Management
pnpm run rules:generate    # Generate rules for all AI tools
pnpm run rules:dev        # Quick generation (Cursor + Claude only)

# Development  
pnpm dev                  # Start development server
pnpm build               # Production build
pnpm typecheck          # TypeScript validation
pnpm lint               # Code quality check
```

## 🎯 How to Use with Specific AI Tools

### Cursor AI
1. Rules automatically loaded from `.cursor/rules/`
2. Use the `generate-plugin` command for new features
3. Context includes all architectural patterns

### Claude Code
1. References `.claude/memories/` for detailed knowledge
2. Use `figma-expert` agent for specialized assistance
3. Main context available in `CLAUDE.md`

### GitHub Copilot
1. Rules embedded as comments in generated files
2. Follow established patterns in existing code
3. Use TypeScript types for context

### Other AI Tools
All major AI development tools supported via rulesync generation.

## 📝 Example Workflow

1. **Start New Feature**:
   ```bash
   pnpm run rules:generate  # Ensure AI rules are current
   ```

2. **Use AI Assistant**:
   - "Generate a new text manipulation feature following the established patterns"
   - AI will use the generated rules for type-safe, shadcn/ui code

3. **Build & Test**:
   ```bash
   pnpm build
   # Test in Figma
   ```

## 🔧 Customizing AI Rules

Edit files in `.rulesync/` to customize AI behavior:
- `.rulesync/rules/` - Core development rules
- `.rulesync/commands/` - Custom AI commands
- `.rulesync/subagents/` - Specialized AI agents

After editing, regenerate:
```bash
pnpm run rules:generate
```

## 📚 Additional Resources

- **Technical Details**: See generated rule files in `.rulesync/rules/`  
- **User Guide**: See `README.md` (Japanese)
- **Figma Plugin Docs**: https://figma.com/plugin-docs/
- **shadcn/ui**: https://ui.shadcn.com/

## 💡 Tips for AI-Assisted Development

1. **Always generate rules first** before starting development
2. **Use specific AI commands** like `generate-plugin` for consistent output
3. **Reference existing code patterns** - the boilerplate demonstrates best practices
4. **Test frequently** - use `pnpm dev` for hot reload during development

---

**Ready for Vibe Coding! 🚀** Use the generated rules and let AI assistants help you build professional Figma plugins.