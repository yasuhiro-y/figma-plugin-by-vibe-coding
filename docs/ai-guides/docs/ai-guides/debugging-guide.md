# Figma Plugin Debugging and Troubleshooting Guide

## Overview

This guide helps you debug common issues in Figma plugin development. Each section includes diagnostic steps, AI prompts for getting help, and systematic approaches to solving problems.

## Getting Started: Essential Debugging Tools

### Browser Developer Tools
**How to Access**:
1. Right-click in your plugin UI
2. Select "Inspect Element" or "Inspect"
3. Go to the "Console" tab

**What to Look For**:
- Red error messages (JavaScript errors)
- Warning messages (yellow icons)
- Network requests (if your plugin makes external calls)
- React component errors (if using React DevTools)

### Figma Plugin Console
**How to Access**:
1. In Figma, go to Help → Troubleshooting → Show/Hide Console
2. Look for messages from your plugin thread

**What You'll See**:
- `console.log()` outputs from your plugin thread
- Figma API error messages
- Font loading issues
- Performance warnings

## Debugging Workflow: The Systematic Approach

### Step 1: Identify the Problem Category
Ask yourself:
- **When does it happen?** (Plugin load, button click, specific operation)
- **What's the error message?** (Exact text)
- **What were you trying to do?** (User action)
- **Does it happen consistently?** (Always, sometimes, once)

### Step 2: Collect Evidence
**Information to Gather**:
- Exact error messages from browser console
- Steps to reproduce the issue
- What you expected to happen
- Current state of your code
- Recent changes you made

### Step 3: Use AI for Systematic Diagnosis
**Universal Debugging Prompt**:
```
I'm debugging a Figma plugin issue. Here's the systematic information:

PROBLEM:
- What happens: [EXACT DESCRIPTION]
- Error message: [COPY/PASTE EXACT MESSAGE]
- When it occurs: [TRIGGER ACTION]
- Consistency: [ALWAYS/SOMETIMES/ONCE]

CONTEXT:
- What I was trying to do: [YOUR GOAL]
- Recent changes: [WHAT YOU CHANGED RECENTLY]
- Expected behavior: [WHAT SHOULD HAPPEN]

CODE:
[PASTE RELEVANT CODE SECTION]

EVIDENCE:
- Browser console shows: [ANY ERROR MESSAGES]
- Figma console shows: [ANY PLUGIN ERRORS]
- Network tab shows: [ANY NETWORK ACTIVITY]

Can you help me:
1. Understand what this error means
2. Identify the root cause
3. Provide a step-by-step fix
4. Prevent this error in the future
5. Add better debugging information for next time
```

## Common Issue Categories and Solutions

## Category 1: Plugin Won't Load or Show UI

### Issue 1.1: Plugin Loads But No UI Appears

**Symptoms**:
- Plugin appears in Figma plugins menu
- Clicking it does nothing or shows blank window
- No error messages visible

**Debugging Steps**:
1. Check browser console for errors
2. Check if `figma.showUI()` is called
3. Verify HTML file exists and is referenced correctly

**AI Prompt**:
```
My Figma plugin loads but doesn't show any UI. I can see it in the plugins menu, but clicking it shows nothing or a blank window.

Current code in src/plugin/main.ts:
[PASTE YOUR INITIALIZATION CODE]

figma.manifest.ts configuration:
[PASTE MANIFEST CONFIG]

Browser console shows: [ANY ERRORS]

What should I check and how do I fix this?
```

**Common Fixes**:
- Ensure `figma.showUI(__html__)` is called
- Check that `ui: 'index.html'` is in manifest
- Verify the HTML file builds correctly
- Check for JavaScript errors preventing UI initialization

### Issue 1.2: Plugin Fails to Load Entirely

**Symptoms**:
- Plugin doesn't appear in Figma plugins menu
- Import from manifest fails
- Error during plugin registration

**Debugging Steps**:
1. Check manifest.json syntax
2. Verify all required files exist in dist/
3. Check for build errors

**AI Prompt**:
```
My Figma plugin won't load at all. When I try to import from manifest, I get [ERROR MESSAGE].

My manifest.json contains:
[PASTE MANIFEST.JSON CONTENT]

Build output shows:
[PASTE BUILD ERRORS/WARNINGS]

Files in dist/ directory:
[LIST FILES]

What's wrong with my plugin setup?
```

## Category 2: Communication Issues (UI ↔ Plugin)

### Issue 2.1: UI Messages Not Reaching Plugin

**Symptoms**:
- Clicking buttons does nothing
- No response from plugin thread
- No errors in console

**Debugging Steps**:
1. Add `console.log` in UI click handlers
2. Add `console.log` in plugin message receiver
3. Check pluginMessage wrapper format

**Diagnostic Code to Add**:
```typescript
// In UI component
const handleClick = () => {
  console.log('UI: Sending message'); // Add this
  parent.postMessage({ 
    pluginMessage: { type: 'test-message' }
  }, '*');
};

// In plugin main.ts
figma.ui.onmessage = (msg) => {
  console.log('Plugin: Received message', msg); // Add this
  // ... rest of handler
};
```

**AI Prompt**:
```
My UI sends messages but the plugin thread never receives them. I've added logging and here's what I see:

UI console logs:
[PASTE UI CONSOLE OUTPUT]

Plugin console logs (Figma console):
[PASTE PLUGIN CONSOLE OUTPUT]

My message sending code:
[PASTE UI MESSAGE CODE]

My message receiving code:
[PASTE PLUGIN MESSAGE HANDLER]

What's wrong with my message communication?
```

### Issue 2.2: Plugin Messages Not Reaching UI

**Symptoms**:
- Plugin operations complete but UI doesn't update
- No response messages received in UI
- Plugin console shows messages being sent

**Debugging Steps**:
1. Check UI message event listener setup
2. Verify event listener is attached correctly
3. Check message structure from plugin

**Diagnostic Code to Add**:
```typescript
// In UI component
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    console.log('UI: Received message', event.data); // Add this
    // ... message handling
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

**AI Prompt**:
```
My plugin sends messages but the UI never receives them. Here's what I see:

Plugin sending code:
[PASTE PLUGIN MESSAGE SENDING CODE]

Plugin console shows:
[PASTE PLUGIN CONSOLE OUTPUT]

UI receiving code:
[PASTE UI MESSAGE HANDLER CODE]

UI console shows:
[PASTE UI CONSOLE OUTPUT]

Why isn't my UI receiving plugin messages?
```

## Category 3: Figma API Errors

### Issue 3.1: Font Loading Errors

**Symptoms**:
- "Font could not be loaded" errors
- Text operations fail
- Plugin works sometimes, fails other times

**Debugging Steps**:
1. Check exact font family and style names
2. Test with common system fonts first
3. Add proper error handling for font loading

**AI Prompt**:
```
I'm getting font loading errors in my Figma plugin:

Error message: [EXACT FONT ERROR]
Font I'm trying to load: [FONT FAMILY AND STYLE]
When it happens: [WHAT OPERATION TRIGGERS IT]

My font loading code:
[PASTE FONT LOADING CODE]

Can you help me:
1. Fix the immediate font loading issue
2. Add proper error handling for missing fonts
3. Implement a fallback font system
4. Explain why font loading is required
```

### Issue 3.2: Node Property Errors

**Symptoms**:
- "Property 'X' does not exist on type 'Y'" errors
- Runtime errors when accessing node properties
- Operations work on some objects but not others

**Debugging Steps**:
1. Check selected node types
2. Add type guards before property access
3. Log node properties to understand structure

**Diagnostic Code to Add**:
```typescript
// Debug selected nodes
const selection = figma.currentPage.selection;
console.log('Selection info:', selection.map(node => ({
  id: node.id,
  name: node.name,
  type: node.type,
  properties: Object.keys(node) // See available properties
})));
```

**AI Prompt**:
```
I'm getting property errors when working with Figma nodes:

Error: [EXACT PROPERTY ERROR]
What I'm trying to do: [OPERATION DESCRIPTION]
Node types I'm working with: [SELECTED NODE TYPES]

My code:
[PASTE NODE MANIPULATION CODE]

Debug output showing node structure:
[PASTE DEBUG CONSOLE OUTPUT]

Can you help me add proper type checking and fix the property access?
```

## Category 4: TypeScript and Build Issues

### Issue 4.1: TypeScript Compilation Errors

**Symptoms**:
- Red squiggly lines in IDE
- Build fails with type errors
- "Type 'X' is not assignable to type 'Y'" messages

**Debugging Steps**:
1. Read the error message carefully
2. Check import statements
3. Verify type definitions match usage

**AI Prompt**:
```
I'm getting TypeScript errors that prevent my plugin from building:

Error messages:
[PASTE EXACT TYPESCRIPT ERRORS]

Code causing the error:
[PASTE PROBLEMATIC CODE]

What I'm trying to do:
[DESCRIBE INTENTION]

Can you help me:
1. Understand what these TypeScript errors mean
2. Fix the type issues
3. Add proper type annotations
4. Explain the correct types to use
```

### Issue 4.2: Build or Import Errors

**Symptoms**:
- Build process fails
- Missing dependencies
- Import statements fail

**AI Prompt**:
```
My plugin build is failing with these errors:

Build command: [COMMAND YOU RAN]
Error output:
[PASTE FULL ERROR OUTPUT]

Package.json dependencies:
[PASTE RELEVANT DEPENDENCIES]

Recent changes:
[WHAT YOU CHANGED]

Can you help me fix the build issues and get my plugin working again?
```

## Category 5: Performance and Behavior Issues

### Issue 5.1: Plugin Feels Slow or Unresponsive

**Symptoms**:
- Long delays during operations
- UI freezes during processing
- Figma becomes unresponsive

**Debugging Steps**:
1. Check if you're processing many objects at once
2. Add timing logs to identify bottlenecks
3. Verify async/await usage

**Performance Diagnostic Code**:
```typescript
// Add timing to operations
const startTime = performance.now();

// Your operation here

const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

**AI Prompt**:
```
My Figma plugin feels slow and unresponsive:

Operation that's slow: [DESCRIBE OPERATION]
Number of objects processed: [QUANTITY]
Time it takes: [DURATION]

Current implementation:
[PASTE SLOW CODE]

Performance logs:
[PASTE TIMING OUTPUT]

Can you help me:
1. Identify performance bottlenecks
2. Optimize the slow operations
3. Add progress feedback for users
4. Prevent UI freezing during long operations
```

### Issue 5.2: Memory or State Issues

**Symptoms**:
- Plugin behavior changes over time
- Inconsistent results
- Memory usage grows continuously

**AI Prompt**:
```
My plugin has memory or state issues:

Symptoms: [DESCRIBE STRANGE BEHAVIOR]
When it happens: [TIMING/FREQUENCY]
Consistency: [DOES IT GET WORSE OVER TIME]

Code that might be causing issues:
[PASTE SUSPECTED CODE]

Can you help me identify and fix memory leaks or state management problems?
```

## Advanced Debugging Techniques

### Debugging Complex Message Flows

**Add Message Tracing**:
```typescript
// Create a message tracer
const MessageTracer = {
  sent: [] as any[],
  received: [] as any[],
  
  logSent(message: any) {
    this.sent.push({ timestamp: Date.now(), message });
    console.log('📤 SENT:', message);
  },
  
  logReceived(message: any) {
    this.received.push({ timestamp: Date.now(), message });
    console.log('📥 RECEIVED:', message);
  },
  
  printHistory() {
    console.log('Message History:', { sent: this.sent, received: this.received });
  }
};

// Use in UI
parent.postMessage({ pluginMessage: msg }, '*');
MessageTracer.logSent(msg);

// Use in Plugin
figma.ui.onmessage = (msg) => {
  MessageTracer.logReceived(msg);
  // ... handle message
};
```

### Debugging Asynchronous Operations

**Add Async Operation Tracking**:
```typescript
const AsyncTracker = {
  operations: new Map(),
  
  start(name: string) {
    const id = Math.random().toString(36);
    this.operations.set(id, { name, startTime: Date.now() });
    console.log(`🔄 ASYNC START: ${name} (${id})`);
    return id;
  },
  
  end(id: string, result?: any) {
    const op = this.operations.get(id);
    if (op) {
      const duration = Date.now() - op.startTime;
      console.log(`✅ ASYNC END: ${op.name} took ${duration}ms`, result);
      this.operations.delete(id);
    }
  },
  
  error(id: string, error: any) {
    const op = this.operations.get(id);
    if (op) {
      console.log(`❌ ASYNC ERROR: ${op.name}`, error);
      this.operations.delete(id);
    }
  }
};

// Usage
const opId = AsyncTracker.start('Font Loading');
try {
  await figma.loadFontAsync(fontName);
  AsyncTracker.end(opId, 'Font loaded successfully');
} catch (error) {
  AsyncTracker.error(opId, error);
}
```

## Emergency Debugging: When Everything Breaks

### The Nuclear Option: Start Fresh

If your plugin completely breaks and you can't figure out why:

1. **Create a minimal test case**:
```typescript
// Minimal working example
figma.ui.onmessage = (msg) => {
  console.log('Received:', msg);
  figma.notify(`Got message: ${msg.type}`);
};
```

2. **Test communication first**:
```typescript
// Minimal UI test
const testButton = () => {
  parent.postMessage({ 
    pluginMessage: { type: 'test' } 
  }, '*');
};
```

3. **Gradually add complexity back**

**AI Prompt for Nuclear Option**:
```
My Figma plugin is completely broken and I can't figure out why. Can you help me:

1. Create a minimal working example that just tests basic communication
2. Add my features back one at a time 
3. Identify which change broke everything
4. Fix the fundamental issue

What I think broke it:
[DESCRIBE RECENT CHANGES]

Last known working state:
[DESCRIBE WHAT WORKED BEFORE]
```

## Debugging Checklist: Before Asking for Help

Before reaching out for help, complete this checklist:

- [ ] **Exact Error Messages**: Copy the complete error text
- [ ] **Reproduction Steps**: Write down exactly how to trigger the issue
- [ ] **Code Context**: Identify which function/file has the problem
- [ ] **Console Output**: Check both browser and Figma console
- [ ] **Recent Changes**: Note what you changed recently
- [ ] **Expected vs Actual**: Be clear about what should happen vs what does happen
- [ ] **Minimal Example**: Can you reproduce with simpler code?

## Prevention: Avoiding Debugging Sessions

### Write Defensive Code
```typescript
// Always validate inputs
function processNode(node: SceneNode) {
  if (!node || node.removed) {
    console.warn('Invalid node provided');
    return;
  }
  
  // Type guard
  if (node.type !== 'RECTANGLE') {
    console.warn(`Expected rectangle, got ${node.type}`);
    return;
  }
  
  // Safe to proceed
}
```

### Add Comprehensive Logging
```typescript
// Log important state changes
function updateSelection() {
  const before = figma.currentPage.selection.length;
  // ... operation
  const after = figma.currentPage.selection.length;
  console.log(`Selection changed: ${before} → ${after} objects`);
}
```

### Use TypeScript Strictly
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true
  }
}
```

Remember: Every bug you fix makes you a better developer. Debugging is a skill that improves with practice!