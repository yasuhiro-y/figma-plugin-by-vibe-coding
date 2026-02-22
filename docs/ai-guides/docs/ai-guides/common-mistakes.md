# Common Figma Plugin Development Mistakes and Solutions

## Overview

This guide covers the most frequent mistakes beginners make when developing Figma plugins, with specific error messages, explanations, and fixes. Each mistake includes prevention strategies and LLM prompts to get help.

## Mistake Category 1: Font Loading Issues

### Mistake 1.1: Modifying Text Without Loading Fonts

**What You'll See:**
```
Error: "Cannot set property 'characters' of undefined"
Error: "Font 'Inter-Regular' could not be loaded"
```

**Why It Happens:**
Figma requires explicit font loading before any text modifications. This is for performance and availability reasons.

**❌ Wrong Code:**
```typescript
const textNode = figma.createText();
textNode.characters = "Hello World"; // ❌ Will fail!
```

**✅ Correct Code:**
```typescript
const textNode = figma.createText();

// MUST load font first
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

// Now safe to modify text
textNode.characters = "Hello World"; // ✅ Works!
```

**Prevention Strategy:**
- Always load fonts before ANY text property modification
- Use try-catch blocks for font loading
- Have fallback fonts ready

**AI Prompt for Help:**
```
I'm getting font loading errors when working with text in my Figma plugin. Can you show me the complete pattern for safe text creation with proper font loading and fallback handling?
```

### Mistake 1.2: Not Handling Missing Fonts

**What You'll See:**
```
Error: Font loading failed
Plugin stops working when font is unavailable
```

**Why It Happens:**
Not all users have the same fonts installed. Your plugin should gracefully handle missing fonts.

**❌ Wrong Code:**
```typescript
await figma.loadFontAsync({ family: 'MyCustomFont', style: 'Bold' }); // ❌ Might not exist
```

**✅ Correct Code:**
```typescript
try {
  await figma.loadFontAsync({ family: 'MyCustomFont', style: 'Bold' });
} catch (error) {
  // Fallback to safe system font
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  figma.notify('Using fallback font - custom font not available');
}
```

**AI Prompt for Help:**
```
My plugin breaks when users don't have specific fonts installed. Can you show me how to implement a robust font fallback system with user-friendly error messages?
```

## Mistake Category 2: Selection Handling Errors

### Mistake 2.1: Not Checking if Selection Exists

**What You'll See:**
```
Error: "Cannot read property 'length' of undefined"
Plugin acts on wrong objects or throws errors
```

**Why It Happens:**
You assume users have selected something, but they might have nothing selected.

**❌ Wrong Code:**
```typescript
const selection = figma.currentPage.selection;
selection.forEach(node => {
  // ❌ What if selection is empty?
  node.name = "Updated";
});
```

**✅ Correct Code:**
```typescript
const selection = figma.currentPage.selection;

if (selection.length === 0) {
  figma.notify('Please select at least one object');
  return;
}

selection.forEach(node => {
  node.name = "Updated";
});
```

**AI Prompt for Help:**
```
My plugin assumes users have objects selected but sometimes they don't. Can you show me the proper pattern for validating selections and providing helpful user feedback?
```

### Mistake 2.2: Not Validating Node Types

**What You'll See:**
```
Error: "Property 'cornerRadius' does not exist on type 'TextNode'"
Plugin tries to set properties that don't exist on certain node types
```

**Why It Happens:**
Different Figma objects have different properties. You can't set `cornerRadius` on text nodes.

**❌ Wrong Code:**
```typescript
selection.forEach(node => {
  node.cornerRadius = 10; // ❌ What if it's a text node?
});
```

**✅ Correct Code:**
```typescript
selection.forEach(node => {
  if (node.type === 'RECTANGLE') {
    node.cornerRadius = 10; // ✅ Safe!
  } else {
    console.log(`Skipping ${node.type} - doesn't support corner radius`);
  }
});
```

**AI Prompt for Help:**
```
I'm getting property errors when trying to modify selected objects. Can you show me how to use type guards to safely check node types before accessing their properties?
```

## Mistake Category 3: Communication Errors

### Mistake 3.1: Forgetting the pluginMessage Wrapper

**What You'll See:**
```
Message sent from UI but plugin doesn't receive it
No error messages, but nothing happens
```

**Why It Happens:**
UI → Plugin messages must be wrapped in a `pluginMessage` object, but Plugin → UI messages don't need this.

**❌ Wrong Code (UI side):**
```typescript
// From UI thread
parent.postMessage({ 
  type: 'create-rectangle' 
}, '*'); // ❌ Missing pluginMessage wrapper
```

**✅ Correct Code (UI side):**
```typescript
// From UI thread  
parent.postMessage({ 
  pluginMessage: { type: 'create-rectangle' }
}, '*'); // ✅ Properly wrapped
```

**Note:** Plugin → UI messages are sent directly:
```typescript
// From plugin thread (correct as-is)
figma.ui.postMessage({ 
  type: 'notification',
  message: 'Success!'
}); // ✅ No wrapper needed
```

**AI Prompt for Help:**
```
My UI sends messages but the plugin thread never receives them. Can you explain the pluginMessage wrapper pattern and show me the correct way to send messages in both directions?
```

### Mistake 3.2: Not Handling Async Operations in Messages

**What You'll See:**
```
Error: "Cannot read property of undefined" in async operations
Race conditions where UI updates before plugin operations complete
```

**Why It Happens:**
Plugin operations are often async, but message handling isn't waiting for them.

**❌ Wrong Code:**
```typescript
figma.ui.onmessage = (msg) => {
  switch (msg.type) {
    case 'create-text':
      // ❌ Not awaiting async operations
      handleCreateText(msg.content);
      figma.ui.postMessage({ type: 'success' }); // Too early!
      break;
  }
};
```

**✅ Correct Code:**
```typescript
figma.ui.onmessage = async (msg) => { // ✅ async handler
  switch (msg.type) {
    case 'create-text':
      try {
        await handleCreateText(msg.content); // ✅ Wait for completion
        figma.ui.postMessage({ type: 'success' });
      } catch (error) {
        figma.ui.postMessage({ type: 'error', error: error.message });
      }
      break;
  }
};
```

**AI Prompt for Help:**
```
My plugin has timing issues where the UI updates before plugin operations finish. Can you show me how to properly handle async operations in message handlers with proper error handling?
```

## Mistake Category 4: TypeScript and Type Safety

### Mistake 4.1: Using 'any' Type Instead of Proper Types

**What You'll See:**
```
Runtime errors that TypeScript should have caught
"Cannot read property" errors in production
```

**Why It Happens:**
Using `any` disables TypeScript's safety checks, allowing bugs to slip through.

**❌ Wrong Code:**
```typescript
function processNode(node: any) { // ❌ 'any' type
  node.fills = [{ type: 'SOLID', color: node.color }]; // Might not exist
}
```

**✅ Correct Code:**
```typescript
function processNode(node: SceneNode) { // ✅ Proper type
  // Type guard for safety
  if ('fills' in node && node.type !== 'GROUP') {
    node.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }];
  }
}
```

**AI Prompt for Help:**
```
I keep using 'any' types in my plugin code and getting runtime errors. Can you help me understand proper TypeScript typing for Figma plugin development and show me how to avoid 'any' types?
```

### Mistake 4.2: Missing Return Type Annotations

**What You'll See:**
```
Functions returning unexpected types
Difficult debugging when functions don't return what you expect
```

**Why It Happens:**
Without explicit return types, TypeScript infers types that might not match your intentions.

**❌ Wrong Code:**
```typescript
function createRectangle(width, height) { // ❌ No parameter or return types
  const rect = figma.createRectangle();
  rect.resize(width, height);
  figma.currentPage.appendChild(rect);
  // Unclear what this returns
}
```

**✅ Correct Code:**
```typescript
function createRectangle(width: number, height: number): string { // ✅ Clear types
  const rect = figma.createRectangle();
  rect.resize(width, height);
  figma.currentPage.appendChild(rect);
  return rect.id; // Clear return value
}
```

**AI Prompt for Help:**
```
My TypeScript functions lack proper type annotations and I'm getting confused about what they return. Can you help me add proper parameter and return type annotations to my Figma plugin functions?
```

## Mistake Category 5: UI Component Issues

### Mistake 5.1: Not Following shadcn/ui Patterns

**What You'll See:**
```
UI components that look inconsistent
Styling conflicts with existing components
```

**Why It Happens:**
This project uses shadcn/ui exclusively. Custom CSS or other component libraries clash with the design system.

**❌ Wrong Code:**
```tsx
// ❌ Custom CSS styling
<div style={{ backgroundColor: 'blue', padding: '10px' }}>
  <button onClick={handleClick}>Click me</button>
</div>
```

**✅ Correct Code:**
```tsx
// ✅ Using shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

<Card>
  <CardContent>
    <Button onClick={handleClick}>Click me</Button>
  </CardContent>
</Card>
```

**AI Prompt for Help:**
```
I want to add new UI elements to my plugin but they look inconsistent with the existing design. Can you show me how to use shadcn/ui components properly and avoid custom CSS?
```

### Mistake 5.2: Not Handling Loading States

**What You'll See:**
```
UI becomes unresponsive during plugin operations
Users don't know if something is working
```

**Why It Happens:**
Plugin operations can take time, but UI doesn't show progress or loading states.

**❌ Wrong Code:**
```tsx
const handleClick = () => {
  // ❌ No loading state
  parent.postMessage({ 
    pluginMessage: { type: 'slow-operation' } 
  }, '*');
};

return <Button onClick={handleClick}>Do Something</Button>;
```

**✅ Correct Code:**
```tsx
const [isLoading, setIsLoading] = useState(false);

const handleClick = () => {
  setIsLoading(true); // ✅ Show loading state
  parent.postMessage({ 
    pluginMessage: { type: 'slow-operation' } 
  }, '*');
};

// Listen for completion
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data.pluginMessage?.type === 'operation-complete') {
      setIsLoading(false); // ✅ Hide loading state
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

return (
  <Button onClick={handleClick} disabled={isLoading}>
    {isLoading ? 'Processing...' : 'Do Something'}
  </Button>
);
```

**AI Prompt for Help:**
```
My plugin UI doesn't show loading states during operations and users don't know when something is processing. Can you help me implement proper loading states and user feedback patterns?
```

## Mistake Category 6: Error Handling and User Feedback

### Mistake 6.1: Silent Failures

**What You'll See:**
```
Plugin appears to do nothing when errors occur
Users have no idea what went wrong
```

**Why It Happens:**
Errors are caught but not communicated to users.

**❌ Wrong Code:**
```typescript
try {
  const rect = figma.createRectangle();
  // ... some operation
} catch (error) {
  console.log(error); // ❌ Users don't see console
}
```

**✅ Correct Code:**
```typescript
try {
  const rect = figma.createRectangle();
  // ... some operation
  figma.notify('Rectangle created successfully!');
} catch (error) {
  // ✅ Tell the user what happened
  figma.notify(`Failed to create rectangle: ${error.message}`, { error: true });
  console.error('Detailed error for debugging:', error);
}
```

**AI Prompt for Help:**
```
My plugin fails silently and users don't know what went wrong. Can you show me how to implement proper error handling with user-friendly notifications and helpful error messages?
```

### Mistake 6.2: Overwhelming Users with Technical Errors

**What You'll See:**
```
Error messages like "TypeError: Cannot read property 'x' of undefined"
Users get confused by technical language
```

**Why It Happens:**
Showing raw error messages instead of user-friendly explanations.

**❌ Wrong Code:**
```typescript
catch (error) {
  figma.notify(error.message); // ❌ Technical error message
}
```

**✅ Correct Code:**
```typescript
catch (error) {
  // ✅ User-friendly message with helpful context
  if (error.message.includes('font')) {
    figma.notify('Could not apply text formatting. Please install the required font.');
  } else if (error.message.includes('selection')) {
    figma.notify('Please select at least one object to modify.');
  } else {
    figma.notify('Something went wrong. Check the browser console for details.');
  }
  
  // Still log detailed error for developers
  console.error('Detailed error:', error);
}
```

**AI Prompt for Help:**
```
My error messages are too technical for users to understand. Can you help me create user-friendly error messages that provide helpful guidance instead of confusing technical details?
```

## Debugging Strategies for Each Mistake Type

### For Font Issues:
1. **Check browser console** for font loading errors
2. **Test with common fonts** (Inter, Roboto) first
3. **Add font fallbacks** for production

### For Selection Issues:
1. **Use console.log** to check selection content
2. **Test with different object types** selected
3. **Handle empty selections gracefully**

### For Communication Issues:
1. **Add console.log** in both UI and Plugin message handlers
2. **Verify pluginMessage wrapper** in UI messages
3. **Test with simple messages** first

### For TypeScript Issues:
1. **Enable strict mode** in tsconfig.json
2. **Fix type errors** before testing
3. **Use the IDE's error highlighting**

### For UI Issues:
1. **Check component imports** from correct paths
2. **Test loading states** manually
3. **Verify event handlers** are properly attached

## Prevention: Best Practices Checklist

Before writing any new feature:

- [ ] **Plan the message flow** (UI ↔ Plugin communication)
- [ ] **Identify node types** you'll work with  
- [ ] **Consider font requirements** for text operations
- [ ] **Plan error handling** for each step
- [ ] **Design loading states** for async operations
- [ ] **Use TypeScript types** throughout
- [ ] **Test with edge cases** (empty selections, etc.)

## Getting Help from AI for These Mistakes

### Universal Problem-Solving Prompt:
```
I'm getting this error in my Figma plugin:

Error: [EXACT ERROR MESSAGE]
What I was trying to do: [DESCRIBE GOAL]
When it happens: [TRIGGER ACTION]
My code: [PASTE RELEVANT CODE]

Can you:
1. Explain what this error means in simple terms
2. Show me the corrected code
3. Explain why the fix works
4. Help me prevent this error in the future
5. Add better error handling to make it more user-friendly

Please include TypeScript types and user notifications.
```

Remember: Every error is a learning opportunity. These mistakes are normal parts of the learning process!