---
root: true
targets: ["*"]
description: "Figma Plugin API Reference - Always use plugin-api.d.ts as authoritative source"
globs: ["src/plugin/**/*", "src/common/**/*"]
---

# Figma Plugin API Reference

## CRITICAL: Authoritative API Source

**The single source of truth for Figma Plugin API is:**

```
node_modules/@figma/plugin-typings/plugin-api.d.ts
```

This file contains the complete, up-to-date type definitions for all Figma Plugin APIs including:
- All `figma.*` methods and properties
- All node types (SceneNode, TextNode, FrameNode, etc.)
- All mixins (GeometryMixin, LayoutMixin, ChildrenMixin, etc.)
- All enums and constants
- All event types and handlers

## LLM INSTRUCTION: How to Use

1. **When you need to know what methods/properties exist**: Search or read `plugin-api.d.ts` directly
2. **When you are unsure about a method signature**: Look it up in `plugin-api.d.ts`
3. **When the user asks about a new or unfamiliar API**: Check `plugin-api.d.ts` first — it always reflects the installed version
4. **Do NOT rely on memorized API knowledge** — the `.d.ts` file is always more current

### Quick Reference Patterns

```bash
# Find all methods on the figma global object
grep "interface PluginAPI" plugin-api.d.ts

# Find a specific node type
grep "interface TextNode" plugin-api.d.ts

# Find available create methods
grep "create.*(" plugin-api.d.ts

# Find all event types
grep "on(" plugin-api.d.ts
```

## Version Enforcement

This project enforces the latest `@figma/plugin-typings` via:
- `postinstall` script automatically updates to latest
- `dev` and `build` commands verify latest version before running
- The `.d.ts` file is always synchronized with the latest Figma Plugin API

## What This Rule Replaces

Previously, API method documentation was hand-written in rule files. That approach became stale as Figma released new APIs. Now:
- **API methods, signatures, types** → Read from `plugin-api.d.ts`
- **Architectural patterns, pitfalls, best practices** → Documented in other rule files (these don't change with API updates)
