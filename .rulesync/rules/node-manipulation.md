# Node Manipulation Best Practices

> For full API type definitions, see `plugin-api.d.ts` in the project root.

## CRITICAL: Readonly Property Limitations

**MAJOR PITFALL**: Figma node properties (`fills`, `strokes`, `effects`, and their nested objects) are **READONLY**. Direct mutation causes runtime errors.

```typescript
// WRONG — TypeError at runtime
node.fills[0].opacity = 0.5;
node.fills[0].color.r = 1;
```

### Pattern: Clone, Modify, Reassign

Always deep-clone the array, modify the clone, then reassign the entire property:

```typescript
// CORRECT
const fills = JSON.parse(JSON.stringify(node.fills)) as Paint[];
if (fills[0]?.type === 'SOLID') {
  fills[0].opacity = 0.5;
  fills[0].color = { r: 1, g: 0.5, b: 0.2 };
}
node.fills = fills;
```

This applies to **all** readonly array properties: `fills`, `strokes`, `effects`, `constraints`, `guides`, etc. The same clone-modify-reassign pattern works for all of them.

---

## Node Type Safety & Guards

`SceneNode` is a union type. You must narrow it before accessing type-specific properties.

### Use `node.type` checks or custom type guards:

```typescript
function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

function hasChildren(node: SceneNode): node is SceneNode & ChildrenMixin {
  return 'children' in node;
}
```

### Defensive checks before operations:

- `node.removed` — node may have been deleted since you obtained the reference
- `node.locked` — locked nodes cannot be modified
- `'fills' in node` — not all node types have geometry properties

---

## Coordinate Systems

Figma has multiple coordinate systems. Using the wrong one is a common source of positioning bugs.

| Property | Meaning | Use When |
|---|---|---|
| `node.x`, `node.y` | Position relative to **parent** | Moving a node within its parent frame |
| `node.absoluteTransform` | Absolute canvas position (2D matrix) | Calculating global positions across nesting |
| `node.absoluteBoundingBox` | Axis-aligned bounding box on canvas | Getting width/height in canvas space |
| `node.absoluteRenderBounds` | Visual bounds including effects, rotation | Checking what the user actually sees (may be `null`) |

Key insight: `x`/`y` are **local** to the parent. A node at `(0, 0)` inside a frame at `(500, 500)` is actually at `(500, 500)` on the canvas. Use `absoluteTransform` or `absoluteBoundingBox` when you need canvas-level coordinates.

---

## CRITICAL: Font Loading for Text Operations

**MANDATORY**: Fonts must be loaded BEFORE creating or modifying text nodes. This is the #1 cause of plugin crashes involving text.

```typescript
// WRONG — errors immediately, font not loaded
const text = figma.createText();
text.characters = 'Hello';

// WRONG — font loaded too late, createText already failed
const text = figma.createText();
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
text.characters = 'Hello';

// CORRECT — load font FIRST
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const text = figma.createText();
text.characters = 'Hello';
```

Always wrap font loading in try/catch — the font may not be available on the user's system.

---

## Text Node Mixed Font Handling

When a text node uses multiple fonts, properties like `fontName` and `fontSize` return `figma.mixed` instead of a single value.

**You must check for `figma.mixed` before using text properties:**

```typescript
if (node.fontName === figma.mixed) {
  // Multiple fonts — use getRangeFontName(start, end) to inspect per-character
  // Must load ALL fonts in the node before modifying characters
  for (let i = 0; i < node.characters.length; i++) {
    const font = node.getRangeFontName(i, i + 1) as FontName;
    await figma.loadFontAsync(font);
  }
} else {
  // Single font — straightforward
  await figma.loadFontAsync(node.fontName as FontName);
}
```

This `figma.mixed` pattern applies to `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight`, `textDecoration`, and other text range properties. Always check before assuming a single value.
