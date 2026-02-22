# Step-by-Step Figma Plugin Development Guide

## Overview

This guide walks you through developing a complete Figma plugin feature from start to finish. Follow these steps in order, using AI assistance at each stage. Each step includes specific AI prompts and validation checkpoints.

## Phase 1: Project Setup and Understanding (1-2 hours)

### Step 1.1: Explore the Project Structure
**Goal**: Understand what you're working with

**AI Prompt**:
```
I'm new to this Figma plugin project. Can you help me understand the file structure? 

Please explain what each main folder does:
- src/plugin/
- src/ui/  
- src/common/
- .cursor/rules/

And tell me which files I'll likely modify when adding new features.
```

**Validation Checklist**:
- [ ] You understand the dual-process architecture
- [ ] You can locate the main entry files
- [ ] You know where shared types are defined

### Step 1.2: Run the Demo Plugin
**Goal**: See the plugin working before making changes

**Commands to run**:
```bash
npm install          # Install dependencies
npm run dev         # Start development mode
```

**In Figma**:
1. Go to Plugins → Development → Import plugin from manifest...
2. Select the `manifest.json` file from your `dist/` folder
3. Test the demo features

**Validation Checklist**:
- [ ] Plugin loads in Figma without errors
- [ ] You can create demo rectangles
- [ ] You see the UI interface
- [ ] Console shows no major errors

### Step 1.3: Study the Reference Code
**Goal**: Learn from working examples

**AI Prompt**:
```
I want to understand the reference implementations in this project. Can you walk me through:

1. How the "Create Rectangle" feature works end-to-end
2. The message flow from UI button to plugin creation
3. How the error handling is implemented
4. The TypeScript types used

Please explain each step in beginner-friendly terms.
```

**Validation Checklist**:
- [ ] You understand how UI buttons trigger plugin actions
- [ ] You can follow the message flow in the code
- [ ] You understand the error handling pattern

## Phase 2: Plan Your First Feature (30 minutes)

### Step 2.1: Choose a Simple Feature
**Good beginner features**:
- Change color of selected rectangles
- Create text with user input
- Duplicate selected objects with offset
- Set specific dimensions on selected objects

**AI Prompt**:
```
I want to build my first custom Figma plugin feature. I'm thinking of [DESCRIBE YOUR IDEA].

Is this a good beginner feature? If not, can you suggest a simpler alternative?

Please break down the implementation into these categories:
1. UI components needed (buttons, inputs, etc.)
2. Plugin thread operations (what Figma API calls)
3. Message types for communication
4. Potential challenges or gotchas
5. Testing approach

Keep it simple - I'm just starting out.
```

### Step 2.2: Create Implementation Plan
**AI Prompt**:
```
I want to build [YOUR CHOSEN FEATURE]. Can you create a step-by-step implementation plan?

Please organize it like this:
1. UI changes (what to add to components)
2. Message contract (new message types)
3. Plugin logic (Figma API operations)
4. Error handling (what could go wrong)
5. Testing steps (how to verify it works)

For each step, tell me which files I'll need to modify.
```

**Validation Checklist**:
- [ ] You have a clear, written plan
- [ ] Each step specifies which files to modify
- [ ] You understand the potential challenges
- [ ] The scope feels manageable

## Phase 3: Implement UI Components (1-2 hours)

### Step 3.1: Add UI Elements
**Goal**: Create the user interface first (you can see results immediately)

**AI Prompt**:
```
I need to add [DESCRIBE UI ELEMENTS] to my plugin interface.

Current UI: [DESCRIBE WHAT YOU SEE NOW]
New elements needed: [BUTTONS/INPUTS/DISPLAYS]
User interaction flow: [HOW USERS WILL USE IT]

Please help me:
1. Modify src/ui/components/App.tsx to add these elements
2. Use only shadcn/ui components (Button, Card, Input, etc.)
3. Add proper TypeScript types for any new state
4. Include proper event handlers (onClick, onChange)
5. Add loading states for any async operations

Keep the styling consistent with existing components.
```

**Development Process**:
1. Make the changes AI suggests
2. Save the file  
3. Check your browser to see UI updates (should be automatic)
4. Test all interactive elements

**Validation Checklist**:
- [ ] New UI elements appear correctly
- [ ] Buttons are clickable (even if they don't work yet)
- [ ] Input fields accept user input
- [ ] No TypeScript errors in your IDE
- [ ] No console errors in browser

### Step 3.2: Add State Management
**Goal**: Handle user input and UI state changes

**AI Prompt**:
```
My UI elements are visible but I need to handle state properly. I need to:

- Track [LIST YOUR STATE VARIABLES] 
- Handle user input from [LIST INPUTS]
- Show loading states during operations
- Display results or error messages

Current component: [PASTE YOUR CURRENT App.tsx COMPONENT]

Can you help me add proper React state management with:
1. useState for all necessary state
2. Event handlers for user interactions  
3. Loading state management
4. Error state handling
5. TypeScript types for all state

Please explain what each state variable does.
```

**Validation Checklist**:
- [ ] User input updates state correctly
- [ ] You can see state changes in React DevTools (if available)
- [ ] Loading states show/hide properly
- [ ] No TypeScript errors

## Phase 4: Define Message Contracts (30 minutes)

### Step 4.1: Add New Message Types
**Goal**: Define how UI and Plugin will communicate

**AI Prompt**:
```
I need to add message types for my feature. Here's what needs to communicate:

From UI to Plugin:
- [DESCRIBE DATA GOING TO PLUGIN]
- [WHAT ACTION TO TRIGGER]

From Plugin to UI:  
- [DESCRIBE RESPONSE DATA]
- [SUCCESS/ERROR STATUS]

Current message file: [PASTE CURRENT src/common/messages.ts]

Can you help me:
1. Add new interfaces for these messages
2. Update the UIMessage and PluginMessage union types  
3. Include proper TypeScript types for all data
4. Add request/response correlation IDs if needed
5. Follow the existing naming conventions

Please explain each message type's purpose.
```

**Validation Checklist**:
- [ ] New message interfaces are added
- [ ] Union types are updated
- [ ] No TypeScript errors in messages.ts
- [ ] Message types match your UI needs

### Step 4.2: Implement Message Sending (UI Side)
**Goal**: Send messages from UI to Plugin

**AI Prompt**:
```
Now I need to send my new messages from the UI. I have these message types:
[LIST YOUR NEW MESSAGE TYPES]

Current UI component: [PASTE YOUR CURRENT COMPONENT WITH EVENT HANDLERS]

Can you help me:
1. Add message sending in my event handlers
2. Use the correct pluginMessage wrapper format
3. Include proper error handling for message sending
4. Add loading state management around message sending
5. Handle the response messages properly

Please explain the pluginMessage wrapper and why it's needed.
```

**Validation Checklist**:
- [ ] Messages are sent with proper format
- [ ] Loading states activate when sending
- [ ] No console errors when clicking buttons
- [ ] You can see messages in browser Network tab (if applicable)

## Phase 5: Implement Plugin Logic (1-2 hours)

### Step 5.1: Add Message Handling (Plugin Side)
**Goal**: Receive and route messages in the plugin thread

**AI Prompt**:
```
I need to add message handling for my new message types in the plugin thread.

New message types to handle:
- [LIST YOUR MESSAGE TYPES]

Current plugin message handler: [PASTE CURRENT figma.ui.onmessage FROM src/plugin/main.ts]

Can you help me:
1. Add new cases to the switch statement
2. Include proper async/await handling
3. Add comprehensive error handling with try-catch
4. Send appropriate response messages back to UI
5. Follow the existing patterns for consistency

Please explain each handler and what it should do.
```

**Validation Checklist**:
- [ ] New message cases are added
- [ ] No TypeScript errors in main.ts
- [ ] Message handling follows existing patterns

### Step 5.2: Implement Core Feature Logic
**Goal**: Write the actual Figma API operations

**AI Prompt**:
```
I need to implement the core logic for [YOUR FEATURE]. This involves:

Figma API operations needed:
- [LIST WHAT YOU NEED TO DO IN FIGMA]

User selection requirements:
- [WHAT OBJECTS USERS SHOULD SELECT]

Data from UI:
- [WHAT PARAMETERS THE UI SENDS]

Can you help me write a function that:
1. Safely handles the user's selection
2. Validates that selected objects are the right type
3. Performs the Figma API operations
4. Includes comprehensive error handling
5. Provides user feedback via figma.notify()
6. Returns proper success/error results

Please include TypeScript types and explain each step.
```

**Example Response Pattern**:
```typescript
async function handleYourFeature(msg: YourMessageType): Promise<Result<YourReturnType>> {
  try {
    // 1. Validate selection
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      return { success: false, error: new Error('Please select objects first') };
    }

    // 2. Filter for valid node types
    const validNodes = selection.filter(node => node.type === 'RECTANGLE');
    if (validNodes.length === 0) {
      return { success: false, error: new Error('Please select rectangles') };
    }

    // 3. Perform operations
    validNodes.forEach(node => {
      // Your feature logic here
    });

    // 4. Success feedback
    figma.notify(`Updated ${validNodes.length} object(s)`);
    return { success: true, data: { processedCount: validNodes.length } };

  } catch (error) {
    // 5. Error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    figma.notify(`Error: ${errorMessage}`, { error: true });
    return { success: false, error: new Error(errorMessage) };
  }
}
```

**Validation Checklist**:
- [ ] Function compiles without TypeScript errors
- [ ] Error handling covers edge cases
- [ ] User feedback is provided for success/failure

## Phase 6: Integration and Testing (1 hour)

### Step 6.1: Connect UI to Plugin Logic
**Goal**: Wire up the complete feature end-to-end

**AI Prompt**:
```
I have my UI components and plugin logic implemented separately. Now I need to connect them properly.

Current status:
- UI: [DESCRIBE YOUR UI STATE]
- Plugin: [DESCRIBE YOUR PLUGIN FUNCTIONS]
- Messages: [LIST YOUR MESSAGE TYPES]

I need help with:
1. Making sure the UI sends the right messages with the right data
2. Handling plugin responses in the UI properly  
3. Updating UI state based on plugin results
4. Showing success/error feedback to users
5. Proper loading state management throughout the flow

Can you review my implementation and help me connect everything?
```

**Testing Process**:
1. Run `npm run dev` if not already running
2. Reload the plugin in Figma
3. Test the happy path (everything works correctly)
4. Test error cases (wrong selections, empty selections, etc.)

**Validation Checklist**:
- [ ] Feature works end-to-end for happy path
- [ ] Error cases are handled gracefully  
- [ ] User gets appropriate feedback for all scenarios
- [ ] UI updates correctly after plugin operations
- [ ] No console errors during normal usage

### Step 6.2: Comprehensive Testing
**Goal**: Ensure your feature is robust and user-friendly

**AI Prompt**:
```
I want to thoroughly test my [FEATURE NAME] feature. Can you help me create a comprehensive testing checklist?

Feature description: [DESCRIBE WHAT YOUR FEATURE DOES]
User workflow: [DESCRIBE HOW USERS INTERACT WITH IT]

Please create test scenarios for:
1. Happy path (everything works perfectly)
2. Edge cases (unusual but valid usage)
3. Error scenarios (things that should fail gracefully)
4. User experience (helpful feedback, clear instructions)
5. Performance (if dealing with many objects)

For each test, tell me:
- What to do (specific steps)
- What should happen (expected result)  
- What not to accept (red flags)
```

**Manual Testing Process**:
1. **Happy Path Testing**: Test with ideal conditions
2. **Edge Case Testing**: Test with unusual selections
3. **Error Testing**: Try to break it intentionally
4. **User Experience Testing**: Is it intuitive?

**Validation Checklist**:
- [ ] All happy path scenarios work
- [ ] Edge cases are handled appropriately
- [ ] Error scenarios provide helpful feedback
- [ ] UI is intuitive and responsive
- [ ] Performance is acceptable with typical usage

## Phase 7: Polish and Documentation (30 minutes)

### Step 7.1: Code Review and Cleanup
**Goal**: Make your code production-ready

**AI Prompt**:
```
I've implemented my feature and it's working. Can you help me review and polish the code?

My implementation files:
- UI component: [PASTE YOUR COMPONENT CODE]
- Plugin logic: [PASTE YOUR PLUGIN FUNCTIONS]  
- Message types: [PASTE YOUR NEW MESSAGE INTERFACES]

Please review for:
1. Code organization and readability
2. TypeScript type safety improvements
3. Error handling completeness
4. Performance optimizations
5. Code comments and documentation
6. Adherence to project patterns and conventions

Suggest specific improvements with explanations.
```

### Step 7.2: Update Reference Documentation
**Goal**: Help the next developer (including future you)

**AI Prompt**:
```
I want to document my new feature for future reference. Can you help me:

1. Add helpful comments to my code explaining complex parts
2. Update any relevant README sections
3. Create a brief usage guide for my feature
4. Note any important implementation decisions or gotchas
5. Document the message flow for this feature

Feature: [DESCRIBE YOUR FEATURE]
Implementation approach: [DESCRIBE KEY DECISIONS YOU MADE]
```

## Common Development Patterns You'll Use

### The Basic Feature Development Loop:
1. **UI First**: Create visible interface elements
2. **Messages**: Define communication contracts  
3. **Plugin Logic**: Implement Figma API operations
4. **Integration**: Connect UI ↔ Plugin
5. **Testing**: Verify all scenarios work
6. **Polish**: Clean up code and add documentation

### Debugging Workflow:
1. **Check Console**: Look for errors in browser console
2. **Add Logging**: Use console.log to trace message flow
3. **Test Isolation**: Test UI and Plugin logic separately  
4. **Simplify**: Temporarily remove complex logic to isolate issues
5. **Ask AI**: Provide specific error messages and context

### Getting Unstuck:
1. **Break It Down**: Focus on one small piece at a time
2. **Use Examples**: Reference the demo code patterns
3. **Ask Specific Questions**: "How do I..." instead of "Fix this"
4. **Test Frequently**: Don't write too much code before testing

## Graduation: Your First Feature is Done! 🎉

### What You've Accomplished:
- ✅ Built a complete plugin feature from scratch
- ✅ Used the dual-process architecture correctly
- ✅ Handled user interactions and edge cases
- ✅ Implemented proper TypeScript typing
- ✅ Created robust error handling
- ✅ Followed UI/UX best practices

### Next Steps:
1. **Plan Feature #2**: Build on your success with a slightly more complex feature
2. **Refactor**: Can you improve your first feature with what you learned?
3. **Share**: Show your plugin to others for feedback
4. **Explore**: Look at the advanced features in the project rules

### Advanced Development Topics (When Ready):
- Performance optimization for large selections
- Storage and persistence with client storage
- Advanced UI patterns with forms and validation
- Plugin publishing and distribution
- Testing frameworks and automated testing

Remember: You've proven you can build Figma plugins! Each feature gets easier as you internalize the patterns and gain confidence with the tools.