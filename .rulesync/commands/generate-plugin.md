---
description: 'Generate a new Figma plugin feature with full type safety and shadcn/ui integration'
targets: ["*"]
---

Based on the user's request for a new plugin feature, generate a complete implementation that follows our established patterns:

## Analysis Phase
1. Understand the feature requirements
2. Identify required Figma API operations
3. Determine necessary shadcn/ui components
4. Plan error handling and user feedback

## CRITICAL: Demo Code Cleanup First

**MANDATORY**: Before implementing any new features, remove ALL demo/boilerplate code:

## CRITICAL: Update Project Identity After Cleanup

**MANDATORY**: After removing demo code, **STOP** and prompt the user to update their project identity:

```
🚨 STOP! Update your plugin's identity for your actual project.

Your plugin idea is: [USER_PLUGIN_IDEA_DESCRIPTION]

Please confirm you want to update:
1. 📝 Plugin name in figma.manifest.ts → Replace "Figma Plugin by Vibe Coding" 
2. 📦 Project name in package.json → Replace "figma-plugin-by-vibe-coding"
3. 🎯 Plugin description in package.json → Describe your actual functionality
4. 🆔 Verify plugin ID is unique (keep generated ID if using create command)
5. 📁 Consider renaming project folder to match your plugin

Type "YES UPDATE IDENTITY" to proceed with identity updates.
```

**DO NOT START FEATURE IMPLEMENTATION until project identity is updated.**

## CRITICAL: Design Fresh UI from Scratch

**MANDATORY**: **NEVER** copy demo UI layouts. Design completely fresh UI optimized for the user's specific plugin functionality.

### 🚨 UI Design Warning:
```
🚨 CRITICAL: The demo UI layout is NOT suitable for your plugin!

Current demo: Random Shape Generator layout (header, single card, centered button)
Your plugin: [SPECIFIC_PLUGIN_FUNCTIONALITY]

REQUIRED Actions:
1. 🗑️ DELETE entire demo App.tsx layout structure
2. 🎨 ANALYZE your plugin's workflow and user needs  
3. 📐 DESIGN optimal layout using appropriate shadcn/ui patterns
4. 🎯 OPTIMIZE for your specific feature requirements

DO NOT copy demo header, card structure, or button layouts!
```

### ✅ Fresh UI Design Process:

1. **Analyze Plugin Type**:
   - Tool Plugin → Single action with options
   - Batch Processor → List view with bulk actions
   - Inspector → Data display with details
   - Generator → Configuration + preview panels

2. **Choose Optimal shadcn/ui Patterns**:
   - Use components that match your data structure
   - Design information hierarchy for your workflow
   - Optimize layout for plugin window constraints

3. **Design Fresh Layout**:
   ```typescript
   // ✅ EXAMPLE: Design fresh layout for different plugin types
   
   // Color Palette Manager
   <div className="p-4 space-y-4">
     <div className="grid grid-cols-4 gap-2">
       {colors.map(color => <ColorSwatch key={color.id} />)}
     </div>
     <Button>Add Color</Button>
   </div>
   
   // Text Formatter
   <div className="p-4 space-y-4">
     <Textarea placeholder="Enter text to format" />
     <div className="flex gap-2">
       <Button variant="outline">Bold</Button>
       <Button variant="outline">Italic</Button>
     </div>
   </div>
   
   // Layer Manager
   <ScrollArea className="h-96">
     {layers.map(layer => (
       <Card key={layer.id} className="mb-2">
         <CardContent className="p-2 flex justify-between">
           <span>{layer.name}</span>
           <Button size="sm">Edit</Button>
         </CardContent>
       </Card>
     ))}
   </ScrollArea>
   ```

### 🗑️ Remove These Demo Files/Functions:
```typescript
// Delete demo functions:
- handleCreateRectangle() in src/plugin/main.ts
- handleCreateRandomShape() in src/plugin/main.ts
- useRandomShapeGenerator() hook in src/ui/hooks/features/
- Any createRectangle* related code

// Clean message types:
- 'CREATE_RECTANGLE' from src/common/messages.ts
- 'CREATE_RANDOM_SHAPE' from src/common/messages.ts
- Related CreateRectangleMessage, CreateRandomShapeMessage types

// Update UI components:
- Remove demo buttons from src/ui/components/App.tsx
- Remove demo-related imports and hooks
```

### ✅ After Cleanup:
- Clean `src/plugin/main.ts` with only essential message handlers
- Empty `src/ui/hooks/features/` directory for new feature hooks
- Clean `src/common/messages.ts` with only base types
- Simplified `src/ui/components/App.tsx` ready for new features

## Implementation Steps

### 1. Type Definitions (src/common/)
Create comprehensive TypeScript interfaces:
- Message types for plugin ↔ UI communication
- Data structures for the feature
- Zod schemas for runtime validation

### 2. Plugin Logic (src/plugin/)
Implement the main thread logic:
- Async functions with proper error handling
- Font loading for text operations (if needed)
- Batch processing for multiple nodes
- Result pattern for error management

### 3. UI Components (src/ui/)
Build with shadcn/ui components:
- Smart components for business logic
- UI components for pure presentation
- Custom hooks for state management
- Consistent Card/Button/Badge usage

### 4. Communication Layer
Ensure type-safe messaging:
- Message validation with Zod
- Request/response correlation
- Error propagation to UI

## Code Generation Standards

Always include:
- ✅ Complete TypeScript type annotations
- ✅ Comprehensive error handling
- ✅ shadcn/ui component integration
- ✅ User-friendly notifications
- ✅ Console logging for debugging
- ✅ Performance considerations
- ✅ Accessibility features

Never include:
- ❌ `any` types or implicit typing
- ❌ Custom CSS or inline styles
- ❌ Direct DOM manipulation
- ❌ Unhandled async operations
- ❌ Missing error boundaries

## Example Structure
```typescript
// 1. Types (src/common/types.ts)
interface FeatureData {
  readonly id: string;
  readonly name: string;
}

// 2. Plugin logic (src/plugin/feature.ts)
async function handleFeature(): Promise<Result<FeatureData[]>> {
  try {
    // Implementation with proper error handling
  } catch (error) {
    return { success: false, error };
  }
}

// 3. UI component (src/ui/components/FeaturePanel.tsx)
export function FeaturePanel(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Name</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Implementation */}
      </CardContent>
    </Card>
  );
}
```

Generate production-ready code that demonstrates professional Figma plugin development patterns.
