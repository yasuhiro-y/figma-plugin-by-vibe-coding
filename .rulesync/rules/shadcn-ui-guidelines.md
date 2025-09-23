---
root: false
targets: ["*"]
description: "shadcn/ui Integration and UI Component Guidelines"
globs: ["src/ui/**/*", "tailwind.config.ts", "components.json"]
---

# shadcn/ui Integration Guidelines for Figma Plugins

## Complete shadcn/ui Philosophy

This project follows **shadcn/ui "ずっぷり"** (complete immersion) - we use ONLY shadcn/ui components and patterns. However, for notifications and alerts, we follow the priority system: **Browser Standard → Figma Native → shadcn/ui**.

## Notification & Alert Priority System

### Priority Order (CRITICAL)
1. **Browser Standard**: `window.confirm()`, `window.alert()`
2. **Figma Native**: `figma.notify()` with rich options
3. **shadcn/ui**: Dialog, AlertDialog (only for complex interactions)

```typescript
// ✅ EXCELLENT - Priority system in practice
function handleUserConfirmation(): void {
  // 1. Browser standard first (simple yes/no)
  if (window.confirm('Are you sure you want to delete all rectangles?')) {
    deleteAllRectangles();
  }
}

function showSimpleNotification(message: string, isError = false): void {
  // 2. Figma native for notifications (handled in plugin thread)
  // figma.notify() calls are made in the plugin thread, not UI thread
  console.log('Notify plugin:', message, isError);
}

function handleComplexModal(): void {
  // 3. shadcn/ui only for complex multi-step interactions
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complex Configuration</DialogTitle>
        </DialogHeader>
        {/* Complex form with multiple steps */}
      </DialogContent>
    </Dialog>
  );
}
```

### NO Custom Toast Components
```typescript
// ❌ FORBIDDEN - Custom toast/notification components
// import { NotificationToast } from './NotificationToast';

// ✅ CORRECT - Use figma.notify() through plugin communication
const { createRectangle } = useFigmaPlugin();

function handleAction(): void {
  try {
    createRectangle({ width: 100, height: 100 });
    // figma.notify() is called automatically in plugin thread
  } catch (error) {
    console.error('Action failed:', error);
  }
}
```

## Component Usage Patterns

### Always Use shadcn/ui Components
```typescript
// ✅ CORRECT - Use shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Title</CardTitle>
        <CardDescription>Clear description of functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="default">Status</Badge>
        <Separator />
        <Button variant="outline">Action</Button>
      </CardContent>
    </Card>
  );
}
```

### Component Hierarchy Standards
```typescript
// ✅ REQUIRED - Consistent component structure
// Smart Components (business logic)
export function FeatureName(): JSX.Element {
  // Business logic, state management, API calls
  return <FeatureNameUi {...props} />;
}

// UI Components (pure presentation)
interface FeatureNameUiProps {
  readonly title: string;
  readonly onAction: () => void;
}

export function FeatureNameUi({ title, onAction }: FeatureNameUiProps): JSX.Element {
  // Pure presentation using shadcn/ui components only
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Execute</Button>
      </CardContent>
    </Card>
  );
}
```

## Required Component Additions

When implementing new features, always add the necessary shadcn/ui components first:

```bash
# ✅ Add components before implementing
npx shadcn@latest add card badge separator
npx shadcn@latest add dialog alert-dialog
npx shadcn@latest add input textarea select
```

## Styling Guidelines

### Figma-Optimized Theme
```typescript
// ✅ Use Figma-appropriate sizing
// Font size: 14px base (Figma's standard)
// Colors: Use CSS custom properties
// Spacing: 8px grid system
```

### CSS Custom Properties Usage
```css
/* ✅ Use shadcn/ui variables exclusively */
background-color: hsl(var(--background));
color: hsl(var(--foreground));
border-color: hsl(var(--border));

/* ❌ AVOID custom colors */
/* background-color: #1a1a1a; */
```

## Simple Demo Best Practices

### Minimal, Focused Functionality
```typescript
// ✅ EXCELLENT - Simple demo with clear purpose
export function App(): JSX.Element {
  const [rectangleCount, setRectangleCount] = useState<number>(0);
  const { selection, createRectangle, isConnected } = useFigmaPlugin();

  const handleCreateRectangle = (): void => {
    try {
      createRectangle({ width: 100, height: 100 });
      setRectangleCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create rectangle:', error);
    }
  };

  const handleConfirm = (): void => {
    // ✅ Browser standard first
    if (window.confirm('Reset count?')) {
      setRectangleCount(0);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Card>
        <CardHeader>
          <CardTitle>Simple Demo</CardTitle>
          <CardDescription>Clean shadcn/ui with Figma native notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateRectangle} disabled={!isConnected}>
            Create Rectangle
          </Button>
          <span>Created: {rectangleCount}</span>
          <Button variant="outline" onClick={handleConfirm}>
            Reset Count
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Status Indicators
```typescript
// ✅ Connection status with Badge
<Badge variant={isConnected ? 'default' : 'destructive'} className="gap-1">
  <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
  {isConnected ? 'Connected' : 'Disconnected'}
</Badge>
```

### Selection Panel
```typescript
// ✅ Selection information with Card
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-base">Current Selection</CardTitle>
    <Badge variant="secondary">{selection.length} selected</Badge>
  </CardHeader>
  <CardContent>
    {/* Selection details */}
  </CardContent>
</Card>
```

### Action Sections
```typescript
// ✅ Feature sections with consistent structure
<Card>
  <CardHeader>
    <CardTitle className="text-base">Feature Name</CardTitle>
    <CardDescription>
      Clear description of what this feature does
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Feature controls */}
    <Separator />
    <Button variant="outline" className="w-full">
      Close Plugin
    </Button>
  </CardContent>
</Card>
```

## Custom Hook Integration

### Combine shadcn/ui with React Hooks
```typescript
// ✅ shadcn/ui + custom hooks pattern
function useFeatureLogic() {
  const [data, setData] = useState<FeatureData[]>([]);
  // Business logic here
  return { data, actions };
}

function FeatureComponent(): JSX.Element {
  const { data, actions } = useFeatureLogic();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature</CardTitle>
      </CardHeader>
      <CardContent>
        {data.map(item => (
          <Badge key={item.id}>{item.name}</Badge>
        ))}
      </CardContent>
    </Card>
  );
}
```

## Figma Plugin UI Best Practices

### Size Constraints
- Plugin window: Typically 320x480px or 400x600px
- Use `overflow-hidden` on body to prevent scrollbars
- Components should be responsive within small constraints

### Performance
- Use `React.memo()` for expensive components
- Debounce user input operations
- Batch figma API calls when possible

### Accessibility
- shadcn/ui components come with accessibility built-in
- Always provide meaningful labels and descriptions
- Use proper heading hierarchy (CardTitle, CardDescription)

## Communication with Plugin Thread

### Figma Notify Integration
```typescript
// ✅ CORRECT - Plugin thread handles notifications
// src/plugin/main.ts
figma.ui.onmessage = async (msg: UIMessage): Promise<void> => {
  try {
    switch (msg.type) {
      case 'create-rectangle': {
        const result = await handleCreateRectangle(msg);
        if (result.success) {
          // ✅ Native Figma notification
          figma.notify('Rectangle created successfully!');
        } else {
          figma.notify(`Error: ${result.error.message}`, { error: true });
        }
        break;
      }
    }
  } catch (error) {
    figma.notify(`Plugin error: ${error.message}`, { error: true });
  }
};

// ✅ Rich notification options
figma.notify('Operation completed', {
  timeout: 4000,
  button: {
    text: 'View Details',
    action: () => console.log('Additional details...')
  }
});
```

## Anti-Patterns to Avoid

### ❌ NEVER Do These
```typescript
// ❌ Custom notification/toast components
import { NotificationToast } from './NotificationToast'; // FORBIDDEN

// ❌ Custom CSS classes
<div className="custom-blue-background">

// ❌ Inline styles
<div style={{ backgroundColor: '#1a1a1a' }}>

// ❌ Non-shadcn components
<div className="my-custom-card">

// ❌ Mixed component libraries
import { Button } from 'antd'; // Wrong!

// ❌ UI thread notifications (use figma.notify() instead)
const [notifications, setNotifications] = useState([]); // FORBIDDEN
```

### ✅ Always Do These
```typescript
// ✅ shadcn/ui components with variants
<Button variant="outline" size="sm">Action</Button>

// ✅ Proper Card structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ✅ Consistent spacing and layout
<div className="space-y-4">
  <div className="grid grid-cols-2 gap-2">
```

This "shadcn/ui complete" approach ensures consistent, professional UI design that integrates seamlessly with modern development workflows.
