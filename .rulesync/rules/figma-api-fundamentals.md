# Figma API Patterns & Pitfalls

> **For API method signatures and type definitions**, reference `plugin-api.d.ts` directly.
> This file covers only architectural patterns and common pitfalls.

## CRITICAL: Async/Await Pitfall

**MANDATORY**: Every Figma method with an `Async` suffix returns a Promise. Forgetting `await` causes silent race conditions and data corruption — no error is thrown, the operation simply hasn't completed when subsequent code runs.

Always `await` before using the result. This applies to font loading, page loading, node fetching, exports, and client storage.

## Pattern: Parallel vs Sequential Async Work

When you have multiple independent async operations, run them in parallel with `Promise.all` instead of awaiting each one sequentially.

```typescript
// SLOW — sequential, each waits for the previous
for (const item of items) {
  await someAsyncOperation(item);
}

// FAST — parallel, all run concurrently
await Promise.all(
  items.map(item =>
    someAsyncOperation(item).catch(error => {
      console.error(`Failed for ${item}:`, error);
    })
  )
);
```

Use sequential processing only when operations depend on each other's results.

## Pattern: Batch Processing with Progress

For large node sets, chunk work into batches to avoid freezing the UI thread. Yield between batches with a zero-delay timeout.

```typescript
async function processInBatches<T>(
  items: T[],
  processItem: (item: T) => Promise<void>,
  batchSize = 50
): Promise<void> {
  const totalBatches = Math.ceil(items.length / batchSize);

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    await Promise.all(batch.map(processItem));

    // Report progress to UI
    figma.ui.postMessage({
      type: 'progress-update',
      progress: batchNumber / totalBatches,
      message: `Processing batch ${batchNumber}/${totalBatches}`
    });

    // Yield to UI thread
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
```

## Philosophy: Error Handling

### Use a Result Type

Avoid throwing from async plugin code. Return a discriminated result instead so callers handle both paths explicitly.

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };
```

### Validate Node State Before Operating

Nodes can be deleted or locked between the time you obtain a reference and the time you act on it. Always guard:

```typescript
if (node.removed) return { success: false, error: new Error('Node was deleted') };
if (node.locked)  return { success: false, error: new Error('Node is locked') };
```

### Structured Error Logging

Log enough context to diagnose issues without requiring reproduction:

```typescript
console.error('Operation failed:', {
  nodeId: node.id,
  nodeType: node.type,
  error: error.message,
  stack: error.stack
});
```

### Environment-Aware Logging

Keep debug noise out of production:

```typescript
function debugLog(message: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Plugin Debug] ${message}`, data);
  }
}
```

### User-Facing Errors

Translate internal errors into actionable messages for the user. Never surface raw stack traces in `figma.notify`.

**LLM INSTRUCTION**: For actual API method signatures (page loading, node access, selection, colors, exports, plugin data, client storage), read `plugin-api.d.ts`. This file covers only the patterns and pitfalls that the type definitions do not convey.
