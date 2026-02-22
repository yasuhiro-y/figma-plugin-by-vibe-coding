# Figma Plugin Development Guide for Coding Beginners

## Welcome, New Developer! 🎉

This guide helps coding beginners build Figma plugins using AI/LLM assistance effectively. No prior plugin experience needed!

## What You'll Learn

- How to communicate with AI to build plugins step-by-step
- Essential concepts explained in simple terms
- Safe coding practices that prevent breaking your plugin
- How to fix common problems when they arise

## Understanding Figma Plugins (Simple Explanation)

Think of a Figma plugin as **two separate programs** that talk to each other:

### 1. The "Brain" (Plugin Thread)
- **Location**: `src/plugin/main.ts`
- **Job**: Talks directly to Figma, creates/modifies design objects
- **Limitation**: Can't show UI elements or access the internet
- **Think of it as**: A robot that can only manipulate Figma objects

### 2. The "Face" (UI Thread) 
- **Location**: `src/ui/` folder
- **Job**: Shows buttons, forms, and interfaces to users
- **Limitation**: Can't directly touch Figma objects
- **Think of it as**: A control panel that sends instructions to the robot

### 3. The "Messenger" (Communication)
- **Location**: `src/common/messages.ts`
- **Job**: Carries messages between Brain and Face
- **Think of it as**: A telephone line between robot and control panel

## How to Work with AI Effectively

### ✅ Good AI Prompts for Beginners

```
"I want to create a button that makes rectangles in Figma. 
Can you help me add this feature step by step?"

"I'm getting an error about fonts when creating text. 
Can you show me the correct way to handle fonts?"

"Can you explain what this error message means and how to fix it?"
```

### ❌ Avoid These AI Prompts

```
"Make my plugin better" (too vague)
"Fix everything" (AI doesn't know what's broken)  
"Add all the features" (too overwhelming)
```

### 🎯 Perfect AI Prompt Structure

1. **What you want**: "I want to create a button that..."
2. **Current state**: "I currently have..." 
3. **Specific problem**: "But when I click it, I get error..."
4. **Expected outcome**: "I expect it to..."

**Example**:
```
I want to create a button that changes the color of selected rectangles to blue.
I currently have a button in my UI, but when I click it, I get an error saying "Cannot read property 'fills' of undefined".
I expect it to change any selected rectangle to blue color.
```

## Essential File Structure (Beginner Friendly)

```
Your Plugin Project/
├── src/
│   ├── plugin/
│   │   └── main.ts          ← The "Brain" - talks to Figma
│   ├── ui/
│   │   ├── components/
│   │   │   └── App.tsx      ← The "Face" - what users see
│   │   └── main.tsx         ← Connects Face to the window
│   └── common/
│       ├── messages.ts      ← The "Messenger" - defines conversations
│       └── types.ts         ← Vocabulary - defines what words mean
├── figma.manifest.ts        ← Plugin's ID card for Figma
└── package.json             ← List of tools and libraries needed
```

## Step-by-Step: Your First Plugin Feature

### Step 1: Plan Your Feature (Talk to AI)
**Ask AI**: "I want to create a feature that [describe what you want]. Can you help me plan the steps?"

**Example**: "I want to create a feature that creates a yellow circle when I click a button. Can you help me plan the steps?"

### Step 2: Start with the UI (Visual Part)
**Ask AI**: "Can you help me add a button to my UI that says '[Button Text]'?"

**Why start here?** Because you can see buttons immediately - it's encouraging!

### Step 3: Add the Communication (Message)  
**Ask AI**: "Now I need to send a message from this button to the plugin brain. Can you help me set up the message?"

### Step 4: Handle the Action (Plugin Logic)
**Ask AI**: "Can you help me write the code that receives this message and creates a [circle/rectangle/text] in Figma?"

### Step 5: Test and Debug
**Ask AI**: "I'm getting this error: [paste error message]. Can you help me understand what went wrong?"

## Common Beginner Scenarios

### Scenario 1: "I Want to Create Shapes"
```
✅ Start with: "Can you help me create a button that makes a blue rectangle in Figma?"

The AI will help you:
1. Add a button to your UI
2. Set up message communication
3. Write the shape creation code
4. Handle errors properly
```

### Scenario 2: "I Want to Modify Selected Objects"
```
✅ Start with: "Can you help me create a feature that changes the color of whatever the user has selected?"

The AI will help you:
1. Check if anything is selected
2. Verify the selected objects can have colors
3. Apply the color change safely
4. Show helpful error messages if something goes wrong
```

### Scenario 3: "I Want to Work with Text"
```
✅ Start with: "Can you help me create text objects? I heard fonts are tricky."

The AI will help you:
1. Understand font loading (very important!)  
2. Create text objects properly
3. Handle font errors gracefully
4. Choose safe fonts that always work
```

## Essential Safety Rules (Prevent Breaking Your Plugin)

### Rule 1: Always Load Fonts Before Touching Text
```typescript
// ✅ ALWAYS do this before modifying text
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
// Now you can safely modify text properties
```

### Rule 2: Check If Things Exist Before Using Them
```typescript
// ✅ Safe way to check selection
const selection = figma.currentPage.selection;
if (selection.length === 0) {
  figma.notify('Please select something first!');
  return;
}
```

### Rule 3: Handle Errors Gracefully
```typescript
// ✅ Wrap risky operations in try-catch
try {
  // Your code that might fail
  const rect = figma.createRectangle();
} catch (error) {
  figma.notify('Something went wrong: ' + error.message);
}
```

### Rule 4: Use Type Guards for Safety
```typescript
// ✅ Check node type before using type-specific properties
if (node.type === 'RECTANGLE') {
  // Now safely access rectangle properties
  node.cornerRadius = 10;
}
```

## How to Ask AI for Help When Stuck

### When You Get Errors

1. **Copy the exact error message**
2. **Tell AI what you were trying to do**  
3. **Share the relevant code**

**Template**:
```
I'm getting this error: [paste error message]

I was trying to: [describe your goal]

Here's my code:
[paste the specific function or section causing the error]

Can you help me understand what's wrong and how to fix it?
```

### When Something Doesn't Work as Expected

**Template**:
```
I have a button that should [describe expected behavior]
But when I click it, [describe what actually happens]
Here's my code: [paste relevant code]
Can you help me figure out why it's not working?
```

### When You Want to Add New Features

**Template**:
```
I have a plugin that currently [describe current functionality]
I want to add a new feature that [describe new feature]
Can you guide me through adding this step by step?
```

## Testing Your Plugin

### Quick Test Checklist
1. **Does your UI show up?** ✓
2. **Do buttons respond when clicked?** ✓  
3. **Do you see your notifications in Figma?** ✓
4. **Can you create/modify objects without errors?** ✓

### Ask AI to Help You Test
```
"Can you help me create a simple test to make sure my [feature name] is working correctly?"
```

## Common Problems and Solutions

### Problem: "My UI doesn't show up"
**Ask AI**: "My plugin loads but I don't see any UI. Can you help me check my figma.showUI() setup?"

### Problem: "I get 'font not loaded' errors"  
**Ask AI**: "I'm getting font loading errors when working with text. Can you show me the proper font loading pattern?"

### Problem: "My button clicks don't do anything"
**Ask AI**: "My button appears but clicking it doesn't trigger any action. Can you help me debug the message passing?"

### Problem: "I can't modify the selected objects"
**Ask AI**: "I'm trying to change selected objects but getting errors. Can you show me how to safely check and modify selections?"

## Building Confidence

### Start Small
- ✅ One button that creates one shape
- ✅ One feature that changes one property
- ❌ Don't try to build everything at once

### Celebrate Small Wins
- Got a button to appear? 🎉
- Successfully created your first rectangle? 🎉  
- Fixed your first error? 🎉

### Learn from Examples
This project includes reference implementations:
- Look at `src/plugin/main.ts` for examples
- Check `src/ui/components/App.tsx` for UI patterns
- Study `src/common/messages.ts` for communication examples

## Advanced Topics (When You're Ready)

### TypeScript Basics
**Ask AI**: "Can you explain TypeScript types in simple terms? I see 'interface' and 'type' everywhere."

### React Basics  
**Ask AI**: "I'm new to React. Can you explain components and hooks in the context of Figma plugins?"

### Plugin Architecture
**Ask AI**: "Can you explain why Figma plugins have this dual-process architecture? Why can't everything be in one file?"

## Getting Unstuck

### When Completely Lost
1. Take a break ☕
2. Look at the working examples in this project
3. Ask AI: "I'm feeling overwhelmed. Can you help me identify the simplest next step?"

### When Code Looks Too Complex  
**Ask AI**: "This code looks complicated. Can you break it down into simpler parts and explain each piece?"

### When You Want to Learn More
**Ask AI**: "I've got the basics working. What's a good next feature to add to improve my skills?"

## Remember: You've Got This! 💪

- Every expert was once a beginner
- AI is your patient coding partner
- Each error is a learning opportunity  
- Small progress is still progress
- The community is here to help

**Most Important**: Don't be afraid to ask "dumb" questions. AI doesn't judge, and neither do good developers!