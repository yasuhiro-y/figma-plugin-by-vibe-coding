# 🚀 Figma Plugin by Vibe Coding

**TypeScript Figma plugin boilerplate with AI development tools integration**

[![npm version](https://badge.fury.io/js/create-figma-plugin-by-vibe-coding.svg)](https://www.npmjs.com/package/create-figma-plugin-by-vibe-coding)
[![npm downloads](https://img.shields.io/npm/dm/create-figma-plugin-by-vibe-coding.svg)](https://www.npmjs.com/package/create-figma-plugin-by-vibe-coding)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern Figma plugin development setup with TypeScript, React, and AI development tools support.

## ✨ Features

### 🏗️ **Tech Stack**
- **TypeScript 5.6+** - Type safety with explicit annotations
- **React 18** - Functional components with hooks
- **Vite** - Fast build system with HMR
- **shadcn/ui** - Accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Biome** - Linting and formatting

### 🤖 **AI Development Integration**
- **15+ AI Tools Supported** - Cursor, Claude, Copilot, Cline, and more
- **rulesync** - AI development rules generation
- **Type-Safe Code Generation** - Structured codebase for AI tools
- **AI Collaboration** - Pre-configured patterns for AI assistance

### 🛡️ **Development Features**
- **HMR Stability** - Solved CSS issues during hot reload
- **Error Handling** - Result pattern implementation
- **Quality Tools** - Automated lint + format + typecheck
- **Dual Process Architecture** - Figma Plugin API compliance


## 🚀 Quick Start

### 1. Create New Plugin Project

**⚠️ Important: Don't clone this repository directly!** Use the create command instead:

```bash
# Create a new plugin using npm create command
npm create figma-plugin-by-vibe-coding my-awesome-plugin

# Or with yarn/pnpm
yarn create figma-plugin-by-vibe-coding my-awesome-plugin
pnpm create figma-plugin-by-vibe-coding my-awesome-plugin

# Navigate to your project
cd my-awesome-plugin
```

### 2. Generate AI Development Rules 🤖

If you're using AI-assisted development, generate the rule files for your preferred AI tool.

#### Configure AI Tool
Edit `rulesync.jsonc` to select your AI tool:
```jsonc
{
  // ✏️ Specify your preferred AI tool
  "targets": ["cursor"],  // or ["claudecode"], ["copilot"], etc.
}
```

#### Generate Rules
```bash
# Generate rules for configured AI tools
npm run rules:generate
```

> **⚠️ Note**: You might see Node.js compatibility errors from rulesync, but files are generated successfully. Check for `.cursor/`, `CLAUDE.md` etc. to confirm success.

This generates files for your selected AI tool:
- **Cursor**: `.cursor/rules/` + custom commands
- **Claude Code**: `.claude/memories/` + specialized agents  
- **GitHub Copilot**: `.github/instructions/` integration
- **Cline**: `.clinerules/` auto-generation
- **Others**: Amazon Q, Qwen, Gemini, etc.

### 3. Start Development

```bash
# Start development server
npm run dev

# Or develop UI only in browser
npm run dev:ui-only  # http://localhost:3000
```

### 4. Load Plugin in Figma

1. Open **Figma Desktop**
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select `dist/manifest.json`
4. Your plugin is now loaded with demo random shape generation

## 📋 Development Commands

### 🔧 **Basic Commands**
```bash
npm run dev              # Start development server
npm run build            # Production build (hot reload safe)
npm run build:clean      # Clean build (for releases)
npm run dev:ui-only      # UI-only development in browser
```

### 🧹 **Code Quality**
```bash
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code
npm run typecheck        # TypeScript type checking
```

### 🤖 **AI Development Tools**
```bash
npm run rules:generate   # Generate AI tool rules
```

## 🏗️ Project Structure

```
src/
├── plugin/           # Plugin thread (Figma API)
│   └── main.ts       
├── ui/               # UI thread (React)
│   ├── components/   # UI components
│   ├── hooks/        
│   │   ├── core/     # Core functionality (communication, connection)
│   │   └── features/ # Feature-specific (custom logic)
│   └── styles/       # Global styles
├── common/           # Shared files
│   ├── messages.ts   # Communication contracts
│   ├── types.ts      # Type definitions
│   └── constants.ts  # Constants
└── .rulesync/        # AI development rules (auto-generated)
```

## 📚 AI Development Guides (New!)

**Perfect for coding beginners using AI assistance!**

We've created comprehensive guides for developing Figma plugins with AI tools like Claude, ChatGPT, or Cursor AI:

- **[📖 Complete Guide Collection](./docs/ai-guides/)** - Start here for the full overview
- **[🎯 Beginner Guide](./docs/ai-guides/beginner-guide.md)** - Perfect if you're new to coding
- **[🤖 AI Development Patterns](./docs/ai-guides/ai-development-patterns.md)** - Specific prompts and templates
- **[🔧 Common Mistakes & Solutions](./docs/ai-guides/common-mistakes.md)** - Troubleshooting guide
- **[📋 Step-by-Step Development](./docs/ai-guides/step-by-step-development.md)** - Complete workflow
- **[🐛 Debugging Guide](./docs/ai-guides/debugging-guide.md)** - When things go wrong

**New AI Collaboration Guides:**
- **[🤖 LLM Behavior Guidelines](./docs/ai-guides/llm-behavior-guidelines.md)** - How AI should help beginners
- **[🤝 AI Collaboration Best Practices](./docs/ai-guides/ai-collaboration-best-practices.md)** - Maximize AI effectiveness
- **[📈 Learning Progression Guide](./docs/ai-guides/learning-progression-guide.md)** - Structured skill development

These guides include specific AI prompts, exact error solutions, and step-by-step instructions designed for beginners who want to build professional Figma plugins using AI assistance.

## 🎯 Demo Features

### Random Shape Generation
- **Function**: Generates random shapes (rectangles, ellipses, polygons)
- **Features**: Random colors, sizes, and viewport positioning
- **Notifications**: Native notifications via `figma.notify()`
- **Type Safety**: TypeScript type checking

## 🤖 AI Development Tips

1. **AI Tool Setup**: Configure your preferred AI tool in `rulesync.jsonc`
2. **Rule Updates**: Run `npm run rules:generate` before implementing new features
3. **Expert Agents**: Use Claude's `figma-expert` agent for specialized help
4. **Keep It Simple**: Use rulesync's standard features as-is

## 💡 Troubleshooting

### **Build Errors During Hot Reload**
```bash
# ❌ Issue: npm run build crashes the plugin
# ✅ Solution: Use hot reload safe build
npm run build        # Safe build (recommended)
npm run build:clean  # Full clean build (for releases only)
```

### **CSS Application Issues**
- CSS disappearing during HMR has been resolved
- Protection mechanisms for stable style application
- `forceCSSSafety()` for automatic recovery

### **rulesync Errors**
```bash
# Node.js compatibility errors are expected but work correctly
ls .cursor CLAUDE.md  # Verify file generation
```

## 📦 Package Usage

```bash
# Basic usage
npx figma-plugin-by-vibe-coding my-plugin

# With AI tool selection
npx figma-plugin-by-vibe-coding my-plugin cursor
npx figma-plugin-by-vibe-coding my-plugin claudecode
```

> **Note**: Use `npx` instead of `npm create` for this package. The `npm create` command looks for packages with `create-` prefix, but our package uses the standard binary approach.

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙋‍♂️ Support

- **Issues**: [GitHub Issues](https://github.com/yasuhiro-y/figma-plugin-by-vibe-coding/issues)
- **Discussions**: Project Discussions
- **Documentation**: `README-LLM.md` (Detailed guide for LLM)

## 🌟 Contributing

Pull requests are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

**Made with ❤️ for AI-assisted Figma plugin development**