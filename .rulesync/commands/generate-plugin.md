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
