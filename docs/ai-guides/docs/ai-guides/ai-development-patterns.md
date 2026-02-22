# AI-Assisted Development Patterns for Figma Plugins

## Overview

This guide provides specific patterns and templates for working with AI/LLMs to build Figma plugins efficiently and safely. Each pattern includes exact prompts you can use and expected AI responses.

## Pattern 1: Feature Planning and Breakdown

### When to Use
- Starting any new plugin feature
- Breaking down complex requirements  
- Getting unstuck on large tasks

### The Prompt Template
```
I want to build a Figma plugin feature that [SPECIFIC GOAL].

Current state: [DESCRIBE WHAT YOU HAVE]
Expected outcome: [DESCRIBE WHAT YOU WANT]
User interaction: [DESCRIBE HOW USERS WILL USE IT]

Can you help me break this down into step-by-step implementation tasks?
Please prioritize the steps and tell me which files I'll need to modify.
```

### Example Usage
```
I want to build a Figma plugin feature that generates color palettes from an image URL.

Current state: I have a basic plugin with a working UI and can create rectangles
Expected outcome: User enters image URL, plugin creates 5 rectangles with dominant colors
User interaction: Text input for URL + "Generate Palette" button

Can you help me break this down into step-by-step implementation tasks?
Please prioritize the steps and tell me which files I'll need to modify.
```

### Expected AI Response Structure
1. **Task breakdown** (numbered steps)
2. **File modification list** (which files to touch)
3. **Prerequisites** (what to learn/install first)
4. **Potential challenges** (what might go wrong)

## Pattern 2: Type-Safe Message Implementation

### When to Use
- Adding new communication between UI and Plugin threads
- Ensuring type safety in message contracts
- Preventing runtime message errors

### The Prompt Template
```
I need to add a new message type for my Figma plugin.

Purpose: [WHAT THE MESSAGE DOES]
Direction: [UI→Plugin OR Plugin→UI]
Data needed: [LIST THE PARAMETERS]

Can you help me:
1. Add the message interface to src/common/messages.ts
2. Update the message unions
3. Show me how to send this message from [UI/Plugin]
4. Show me how to handle this message in [Plugin/UI]

Please include full TypeScript types and error handling.
```

### Example Usage
```
I need to add a new message type for my Figma plugin.

Purpose: Change the color of all selected rectangles to a specific color
Direction: UI→Plugin  
Data needed: RGB color values (r, g, b numbers)

Can you help me:
1. Add the message interface to src/common/messages.ts
2. Update the message unions
3. Show me how to send this message from UI
4. Show me how to handle this message in Plugin

Please include full TypeScript types and error handling.
```

### What AI Should Provide
```typescript
// 1. Interface definition
interface ChangeRectangleColorMessage {
  type: 'change-rectangle-color';
  color: { r: number; g: number; b: number };
  id: string; // for response correlation
}

// 2. Union type update
export type UIMessage = 
  | ExistingMessage1
  | ExistingMessage2
  | ChangeRectangleColorMessage; // Added

// 3. UI sending code
const handleColorChange = (color: RGB) => {
  const message: ChangeRectangleColorMessage = {
    type: 'change-rectangle-color',
    color,
    id: crypto.randomUUID()
  };
  parent.postMessage({ pluginMessage: message }, '*');
};

// 4. Plugin handling code
case 'change-rectangle-color': {
  const result = await handleChangeRectangleColor(msg);
  // ... response handling
  break;
}
```

## Pattern 3: Safe Node Manipulation

### When to Use
- Working with Figma nodes (any object in Figma)
- Preventing "Cannot read property" errors
- Handling different node types safely

### The Prompt Template
```
I want to modify [SPECIFIC PROPERTY] of [NODE TYPE] nodes in Figma.

Current selection: [HOW USERS SELECT NODES]
Property to change: [WHAT TO MODIFY]
Safety concerns: [ANY SPECIFIC WORRIES]

Can you provide:
1. Type guards to check node types safely
2. Error handling for invalid selections  
3. The complete function with proper TypeScript types
4. User feedback (notifications) for success/failure cases

Please include validation for edge cases like empty selections or wrong node types.
```

### Example Usage
```
I want to modify the corner radius of RECTANGLE nodes in Figma.

Current selection: User selects objects in Figma before running the plugin
Property to change: Set corner radius to a specific value (e.g., 10px)
Safety concerns: What if user selects non-rectangle nodes?

Can you provide:
1. Type guards to check node types safely
2. Error handling for invalid selections
3. The complete function with proper TypeScript types  
4. User feedback (notifications) for success/failure cases

Please include validation for edge cases like empty selections or wrong node types.
```

### Expected AI Response
```typescript
// Type guard
function isRectangleNode(node: SceneNode): node is RectangleNode {
  return node.type === 'RECTANGLE';
}

// Complete safe implementation
async function setCornerRadius(radius: number): Promise<void> {
  const selection = figma.currentPage.selection;
  
  // Validate selection exists
  if (selection.length === 0) {
    figma.notify('Please select at least one object');
    return;
  }
  
  // Filter valid rectangles
  const rectangles = selection.filter(isRectangleNode);
  
  if (rectangles.length === 0) {
    figma.notify('Please select at least one rectangle');
    return;  
  }
  
  try {
    // Apply changes
    rectangles.forEach(rect => {
      rect.cornerRadius = radius;
    });
    
    figma.notify(`Updated ${rectangles.length} rectangle(s)`);
  } catch (error) {
    figma.notify(`Error: ${error.message}`, { error: true });
  }
}
```

## Pattern 4: UI Component with shadcn/ui

### When to Use
- Adding new UI elements to your plugin
- Maintaining design consistency
- Using the project's component system

### The Prompt Template
```
I need to add a [UI COMPONENT TYPE] to my Figma plugin UI.

Component purpose: [WHAT IT DOES]
User interaction: [HOW USERS INTERACT]  
Data it handles: [WHAT DATA/STATE]
Visual requirements: [APPEARANCE NEEDS]

Please help me:
1. Create the component using shadcn/ui components only (no custom CSS)
2. Add proper TypeScript types for all props
3. Include proper error states and loading states
4. Show me how to integrate it into App.tsx
5. Add the necessary message handling if it communicates with the plugin thread

Current shadcn/ui components available: Button, Card, Input, Select, Badge, Separator
```

### Example Usage
```
I need to add a color picker to my Figma plugin UI.

Component purpose: Let users pick a color that will be applied to selected rectangles
User interaction: Click to open color picker, select color, see preview
Data it handles: RGB color values and current selection count
Visual requirements: Should match the existing plugin design, show color preview

Please help me:
1. Create the component using shadcn/ui components only (no custom CSS)
2. Add proper TypeScript types for all props
3. Include proper error states and loading states  
4. Show me how to integrate it into App.tsx
5. Add the necessary message handling if it communicates with the plugin thread

Current shadcn/ui components available: Button, Card, Input, Select, Badge, Separator
```

### Expected AI Structure
1. **Component interface** (TypeScript types)
2. **Component implementation** (using shadcn/ui)
3. **Integration steps** (how to add to App.tsx)
4. **Message handling** (if needed)
5. **Error handling** (user feedback)

## Pattern 5: Font Handling (Critical for Text)

### When to Use
- Creating or modifying text nodes
- Preventing font-related errors
- Working with custom fonts

### The Prompt Template
```
I need to work with text nodes in my Figma plugin.

Text operation: [CREATE NEW / MODIFY EXISTING]
Font requirements: [SPECIFIC FONT / ANY FONT / USER CHOICE]
Text content: [STATIC / DYNAMIC / USER INPUT]

Can you help me:
1. Set up proper font loading with error handling
2. Create/modify text nodes safely
3. Handle missing fonts gracefully
4. Provide fallback font options
5. Show proper user notifications for font issues

Please include complete error handling and explain why font loading is required.
```

### Example Usage
```
I need to work with text nodes in my Figma plugin.

Text operation: Create new text nodes with user-provided content
Font requirements: Use Inter font family, Regular style as default
Text content: User types text in an input field

Can you help me:
1. Set up proper font loading with error handling
2. Create/modify text nodes safely  
3. Handle missing fonts gracefully
4. Provide fallback font options
5. Show proper user notifications for font issues

Please include complete error handling and explain why font loading is required.
```

### Expected AI Response Pattern
```typescript
async function createTextWithContent(content: string): Promise<void> {
  try {
    // 1. Load font FIRST (required!)
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    
    // 2. Create text node
    const textNode = figma.createText();
    textNode.characters = content;
    
    // 3. Position and add to page
    figma.currentPage.appendChild(textNode);
    
    figma.notify('Text created successfully');
  } catch (fontError) {
    // 4. Font fallback handling
    try {
      await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
      // ... retry with fallback font
    } catch (fallbackError) {
      figma.notify('Font loading failed. Please install Inter or Roboto font.', { error: true });
    }
  }
}
```

## Pattern 6: Debugging and Error Investigation

### When to Use
- Plugin is throwing errors
- Unexpected behavior occurs
- Need to understand error messages

### The Prompt Template
```
I'm getting an error in my Figma plugin:

Error message: [EXACT ERROR TEXT]
When it happens: [WHAT ACTION TRIGGERS IT]
Expected behavior: [WHAT SHOULD HAPPEN]
Current code: [PASTE RELEVANT CODE SECTION]

Browser console shows: [ANY CONSOLE ERRORS]
Figma notifications show: [ANY FIGMA ERROR MESSAGES]

Can you:
1. Explain what this error means in simple terms
2. Identify the root cause
3. Provide a fix with explanation
4. Suggest how to prevent this error in the future
5. Add better error handling to make debugging easier
```

### Example Usage
```
I'm getting an error in my Figma plugin:

Error message: Cannot read property 'fills' of undefined
When it happens: When I click my "Change Color" button
Expected behavior: Selected rectangles should turn blue
Current code: 
const selection = figma.currentPage.selection;
selection.forEach(node => {
  node.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }];
});

Browser console shows: TypeError: Cannot read property 'fills' of undefined
Figma notifications show: Plugin error occurred

Can you:
1. Explain what this error means in simple terms
2. Identify the root cause  
3. Provide a fix with explanation
4. Suggest how to prevent this error in the future
5. Add better error handling to make debugging easier
```

## Pattern 7: Performance Optimization

### When to Use
- Plugin feels slow or unresponsive
- Working with many objects
- Complex operations taking too long

### The Prompt Template
```
My Figma plugin is running slowly when [SPECIFIC OPERATION].

Current implementation: [DESCRIBE CURRENT APPROACH]
Performance issue: [WHAT FEELS SLOW]
Scale: [HOW MANY OBJECTS/OPERATIONS]

Can you help me:
1. Identify performance bottlenecks in my code
2. Suggest optimization strategies
3. Implement batch processing if needed
4. Add progress feedback for users
5. Ensure the UI stays responsive

Please explain why each optimization improves performance.
```

### Expected AI Optimizations
- Batch operations instead of individual API calls
- Use `findAll()` instead of recursive traversal
- Implement progress notifications
- Add `setTimeout` breaks for UI responsiveness
- Cache frequently accessed data

## Pattern 8: Testing and Validation

### When to Use
- Want to verify plugin works correctly
- Before sharing with others
- After making changes

### The Prompt Template
```
I want to test my Figma plugin feature: [FEATURE NAME]

Feature functionality: [WHAT IT DOES]
User workflow: [STEP BY STEP USAGE]
Edge cases I'm worried about: [LIST CONCERNS]

Can you help me:
1. Create a testing checklist for this feature
2. Identify potential edge cases I should test
3. Write simple test helper functions  
4. Suggest manual testing steps
5. Add validation to prevent common user errors

Please include both happy path and error scenarios.
```

## Advanced AI Collaboration Techniques

### Iterative Refinement
```
"The solution you provided works, but I'd like to improve [SPECIFIC ASPECT]. 
Can you help me refine it to be more [user-friendly/performant/robust]?"
```

### Code Review Requests
```
"Can you review this code I wrote and suggest improvements? 
I'm particularly concerned about [SPECIFIC AREAS]"
```

### Architecture Discussions
```
"I'm planning to add [NEW FEATURE] to my plugin. 
Can you suggest the best architecture approach given my current codebase?"
```

## Remember: AI as Your Coding Partner

### Do:
- ✅ Be specific about your goals
- ✅ Provide context about your current state
- ✅ Ask for explanations, not just code
- ✅ Request error handling and edge cases
- ✅ Ask for TypeScript types and safety

### Don't:
- ❌ Ask for vague improvements  
- ❌ Copy/paste code without understanding
- ❌ Skip the explanation parts
- ❌ Ignore error handling suggestions
- ❌ Rush through complex features

AI is most helpful when you work together as partners, with you providing the creative direction and AI providing technical expertise and implementation details.