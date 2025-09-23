# User Experience Design & User Consideration

## CRITICAL: User Feedback & Communication

**UX FAILURE**: Users will force-quit Figma if plugins don't provide clear feedback during operations.

### Progress Indication Patterns

```typescript
// ❌ SILENT DEATH - User has no idea what's happening
async function processLargeDataset(items: SceneNode[]): Promise<void> {
  for (const item of items) {
    await processComplexOperation(item); // Takes 30 seconds, no feedback
  }
}

// ✅ RESPONSIVE FEEDBACK - Keep user informed
async function processLargeDatasetWithFeedback(items: SceneNode[]): Promise<void> {
  // Initial notification
  figma.notify('Starting processing...', { timeout: 2000 });
  
  const totalItems = items.length;
  const batchSize = 10;
  
  for (let i = 0; i < totalItems; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const progress = Math.round((i / totalItems) * 100);
    
    // Update progress notification
    figma.notify(`Processing... ${progress}% (${i}/${totalItems})`, { 
      timeout: 1000 
    });
    
    // Send detailed progress to UI
    figma.ui.postMessage({
      type: 'progress-update',
      progress: i / totalItems,
      currentItem: i + 1,
      totalItems,
      message: `Processing item ${i + 1} of ${totalItems}`
    });
    
    await processBatch(batch);
    
    // Yield control to keep UI responsive
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Completion feedback
  figma.notify(`✅ Successfully processed ${totalItems} items!`, { 
    timeout: 3000,
    button: { text: 'View Results', action: () => showResults() }
  });
}
```

### Multi-Modal Feedback System

```typescript
// ✅ COMPREHENSIVE FEEDBACK - Multiple channels
interface FeedbackOptions {
  showNotification?: boolean;
  updateUI?: boolean;
  playSound?: boolean;
  vibrate?: boolean;
}

class UserFeedbackSystem {
  async provideFeedback(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options: FeedbackOptions = {}
  ): Promise<void> {
    const {
      showNotification = true,
      updateUI = true,
      playSound = false,
      vibrate = false
    } = options;
    
    // 1. Figma native notification
    if (showNotification) {
      const notificationOptions: NotificationOptions = {
        timeout: type === 'error' ? 8000 : 4000,
        error: type === 'error'
      };
      
      if (type === 'success') {
        figma.notify(`✅ ${message}`, notificationOptions);
      } else if (type === 'error') {
        figma.notify(`❌ ${message}`, notificationOptions);
      } else if (type === 'warning') {
        figma.notify(`⚠️ ${message}`, notificationOptions);
      } else {
        figma.notify(message, notificationOptions);
      }
    }
    
    // 2. Update UI state
    if (updateUI) {
      figma.ui.postMessage({
        type: 'feedback-update',
        message,
        level: type,
        timestamp: Date.now()
      });
    }
    
    // 3. Haptic feedback (if supported)
    if (vibrate && 'vibrate' in navigator) {
      navigator.vibrate(type === 'error' ? [100, 100, 100] : 100);
    }
  }
}

const feedback = new UserFeedbackSystem();

// Usage examples
await feedback.provideFeedback('Operation completed successfully!', 'success');
await feedback.provideFeedback('Network error - retrying...', 'error', { 
  showNotification: true, 
  updateUI: true 
});
```

## Destructive Operations & User Consent

### Change Impact Communication

```typescript
// ✅ TRANSPARENT CHANGE COMMUNICATION
interface ChangeImpact {
  affectedNodes: number;
  changeType: 'destructive' | 'additive' | 'modification';
  reversible: boolean;
  estimatedTime?: number;
}

async function executeWithConsent(
  operation: () => Promise<void>,
  impact: ChangeImpact,
  description: string
): Promise<boolean> {
  // Analyze impact severity
  const severity = assessChangeSeverity(impact);
  
  if (severity === 'high') {
    // Show detailed warning for major changes
    const consent = await requestUserConsent({
      title: 'Major Changes Ahead',
      description,
      details: [
        `${impact.affectedNodes} nodes will be modified`,
        impact.reversible 
          ? 'This action can be undone with Cmd+Z' 
          : '⚠️ This action cannot be undone',
        impact.estimatedTime 
          ? `Estimated time: ${impact.estimatedTime} seconds`
          : 'Processing time may vary'
      ],
      confirmText: impact.reversible ? 'Proceed' : 'Proceed (Cannot Undo)',
      cancelText: 'Cancel'
    });
    
    if (!consent) return false;
  }
  
  // Execute with proper progress tracking
  try {
    await operation();
    
    // Post-execution summary
    figma.notify(
      `✅ Successfully modified ${impact.affectedNodes} nodes. ` +
      (impact.reversible ? 'Use Cmd+Z to undo.' : ''),
      { timeout: 5000 }
    );
    
    return true;
  } catch (error) {
    figma.notify(`❌ Operation failed: ${error.message}`, { 
      error: true,
      timeout: 8000,
      button: { text: 'Report Issue', action: () => reportError(error) }
    });
    
    return false;
  }
}

function assessChangeSeverity(impact: ChangeImpact): 'low' | 'medium' | 'high' {
  if (!impact.reversible || impact.changeType === 'destructive') return 'high';
  if (impact.affectedNodes > 100) return 'medium';
  return 'low';
}

// Usage
await executeWithConsent(
  () => deleteAllTextNodes(),
  {
    affectedNodes: selectedTextNodes.length,
    changeType: 'destructive',
    reversible: true,
    estimatedTime: 2
  },
  'This will delete all selected text nodes'
);
```

### Undo History Integration

```typescript
// ✅ UNDO-FRIENDLY OPERATIONS
class UndoFriendlyOperations {
  async performBatchOperation(
    operations: Array<() => void>,
    description: string
  ): Promise<void> {
    // All operations will be grouped as single undo step
    try {
      operations.forEach(op => op());
      
      figma.notify(`${description} completed. Use Cmd+Z to undo all changes.`, {
        timeout: 4000
      });
    } catch (error) {
      figma.notify(`${description} failed: ${error.message}`, { error: true });
      throw error;
    }
  }
  
  // Set up relaunch data for easy re-execution
  setupRelaunch(nodes: SceneNode[], action: string, parameters: any): void {
    nodes.forEach(node => {
      node.setRelaunchData({
        [action]: `Re-run ${action} with same settings`
      });
      
      // Store parameters for relaunch
      node.setPluginData('relaunch-params', JSON.stringify({
        action,
        parameters,
        timestamp: Date.now()
      }));
    });
  }
}
```

## Context-Aware User Interface

### Smart State Detection

```typescript
// ✅ CONTEXT-AWARE UI - Adapt to current state
interface PluginContext {
  selectionCount: number;
  selectionTypes: string[];
  hasTextNodes: boolean;
  hasLocked: boolean;
  hasHidden: boolean;
  canProcess: boolean;
  suggestedAction?: string;
}

function analyzeContext(): PluginContext {
  const selection = figma.currentPage.selection;
  const types = [...new Set(selection.map(n => n.type))];
  
  const hasTextNodes = selection.some(n => n.type === 'TEXT');
  const hasLocked = selection.some(n => n.locked);
  const hasHidden = selection.some(n => !n.visible);
  const canProcess = selection.length > 0 && !hasLocked;
  
  // Smart suggestions based on context
  let suggestedAction: string | undefined;
  if (selection.length === 0) {
    suggestedAction = 'Select nodes to begin processing';
  } else if (hasLocked) {
    suggestedAction = 'Unlock selected nodes to enable processing';
  } else if (hasTextNodes && selection.every(n => n.type === 'TEXT')) {
    suggestedAction = 'Text formatting options available';
  } else if (types.length === 1 && types[0] === 'RECTANGLE') {
    suggestedAction = 'Rectangle-specific tools available';
  }
  
  return {
    selectionCount: selection.length,
    selectionTypes: types,
    hasTextNodes,
    hasLocked,
    hasHidden,
    canProcess,
    suggestedAction
  };
}

// ✅ ADAPTIVE UI COMPONENT
function ContextualInterface(): JSX.Element {
  const [context, setContext] = useState<PluginContext>(analyzeContext());
  
  useEffect(() => {
    const updateContext = () => setContext(analyzeContext());
    
    // Listen for selection changes
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === 'selection-changed') {
        updateContext();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current Selection
          <Badge variant={context.canProcess ? 'default' : 'destructive'}>
            {context.selectionCount} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Context-aware messaging */}
        {context.suggestedAction && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>{context.suggestedAction}</AlertDescription>
          </Alert>
        )}
        
        {/* Contextual controls */}
        {context.hasTextNodes && (
          <Button variant="outline" disabled={!context.canProcess}>
            Format Text
          </Button>
        )}
        
        {context.selectionTypes.includes('RECTANGLE') && (
          <Button variant="outline" disabled={!context.canProcess}>
            Round Corners
          </Button>
        )}
        
        {context.hasLocked && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some nodes are locked. Unlock to enable processing.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

## Persistent Settings & User Preferences

### Smart Settings Management

```typescript
// ✅ INTELLIGENT SETTINGS PERSISTENCE
interface UserPreferences {
  lastUsedSettings: Record<string, any>;
  shortcuts: Record<string, string>;
  uiPreferences: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    showAdvanced: boolean;
  };
  recentActions: Array<{
    action: string;
    parameters: any;
    timestamp: number;
  }>;
}

class PreferencesManager {
  private static instance: PreferencesManager;
  private preferences: UserPreferences | null = null;
  
  static getInstance(): PreferencesManager {
    if (!PreferencesManager.instance) {
      PreferencesManager.instance = new PreferencesManager();
    }
    return PreferencesManager.instance;
  }
  
  async loadPreferences(): Promise<UserPreferences> {
    if (this.preferences) return this.preferences;
    
    try {
      const saved = await figma.clientStorage.getAsync('user-preferences');
      this.preferences = saved ? JSON.parse(saved) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Failed to load preferences:', error);
      this.preferences = this.getDefaultPreferences();
    }
    
    return this.preferences;
  }
  
  async savePreferences(updates: Partial<UserPreferences>): Promise<void> {
    const current = await this.loadPreferences();
    const updated = { ...current, ...updates };
    
    try {
      await figma.clientStorage.setAsync('user-preferences', JSON.stringify(updated));
      this.preferences = updated;
      
      figma.ui.postMessage({
        type: 'preferences-updated',
        preferences: updated
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      figma.notify('Failed to save preferences', { error: true });
    }
  }
  
  async recordAction(action: string, parameters: any): Promise<void> {
    const prefs = await this.loadPreferences();
    const newAction = { action, parameters, timestamp: Date.now() };
    
    // Keep only last 20 actions
    const recentActions = [newAction, ...prefs.recentActions].slice(0, 20);
    
    await this.savePreferences({ 
      lastUsedSettings: { ...prefs.lastUsedSettings, [action]: parameters },
      recentActions 
    });
  }
  
  async getLastSettings(action: string): Promise<any> {
    const prefs = await this.loadPreferences();
    return prefs.lastUsedSettings[action] || null;
  }
  
  private getDefaultPreferences(): UserPreferences {
    return {
      lastUsedSettings: {},
      shortcuts: {},
      uiPreferences: {
        theme: 'system',
        compactMode: false,
        showAdvanced: false
      },
      recentActions: []
    };
  }
}

// ✅ SMART DEFAULTS - Remember user choices
function useSmartDefaults(action: string, defaultValues: any) {
  const [values, setValues] = useState(defaultValues);
  const [loaded, setLoaded] = useState(false);
  const prefs = PreferencesManager.getInstance();
  
  // Load saved settings
  useEffect(() => {
    prefs.getLastSettings(action).then(saved => {
      if (saved) {
        setValues({ ...defaultValues, ...saved });
      }
      setLoaded(true);
    });
  }, [action, defaultValues]);
  
  // Save on change (debounced)
  const debouncedSave = useMemo(
    () => debounce((newValues: any) => {
      prefs.recordAction(action, newValues);
    }, 1000),
    [action, prefs]
  );
  
  useEffect(() => {
    if (loaded) {
      debouncedSave(values);
    }
  }, [values, loaded, debouncedSave]);
  
  return [values, setValues, loaded] as const;
}
```

## Error Recovery & Graceful Degradation

### User-Friendly Error Handling

```typescript
// ✅ COMPREHENSIVE ERROR RECOVERY
interface ErrorContext {
  action: string;
  userInput: any;
  environment: {
    selectionCount: number;
    pluginVersion: string;
    figmaVersion: string;
  };
}

class ErrorRecoverySystem {
  async handleError(
    error: Error, 
    context: ErrorContext,
    recoverySuggestions?: string[]
  ): Promise<void> {
    // Log structured error data
    console.error('Plugin Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Determine error severity and recovery options
    const recovery = this.analyzeError(error, context);
    
    // Provide user feedback
    const message = this.getUserFriendlyMessage(error, recovery);
    
    figma.notify(message.text, {
      error: true,
      timeout: recovery.severity === 'critical' ? 10000 : 6000,
      button: recovery.hasRecovery ? {
        text: recovery.recoveryAction,
        action: () => this.attemptRecovery(error, context, recovery)
      } : undefined
    });
    
    // Send detailed error to UI for advanced users
    figma.ui.postMessage({
      type: 'error-occurred',
      error: {
        message: error.message,
        recovery: recovery.userActions,
        canRetry: recovery.canRetry,
        needsRestart: recovery.needsPluginRestart
      }
    });
  }
  
  private analyzeError(error: Error, context: ErrorContext) {
    // Font-related errors
    if (error.message.includes('font')) {
      return {
        severity: 'medium' as const,
        hasRecovery: true,
        canRetry: true,
        needsPluginRestart: false,
        recoveryAction: 'Try Different Font',
        userActions: [
          'Check if the font is installed on your system',
          'Select text with a different font',
          'Install missing fonts and try again'
        ]
      };
    }
    
    // Selection-related errors
    if (error.message.includes('selection') || error.message.includes('node')) {
      return {
        severity: 'low' as const,
        hasRecovery: true,
        canRetry: true,
        needsPluginRestart: false,
        recoveryAction: 'Refresh Selection',
        userActions: [
          'Check your selection and try again',
          'Make sure selected objects are not locked',
          'Ensure objects are visible on the canvas'
        ]
      };
    }
    
    // Network or external service errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        severity: 'medium' as const,
        hasRecovery: true,
        canRetry: true,
        needsPluginRestart: false,
        recoveryAction: 'Retry Connection',
        userActions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Contact support if problem persists'
        ]
      };
    }
    
    // Critical system errors
    return {
      severity: 'critical' as const,
      hasRecovery: false,
      canRetry: false,
      needsPluginRestart: true,
      recoveryAction: 'Restart Plugin',
      userActions: [
        'Close and restart the plugin',
        'Save your work before trying again',
        'Report this issue to the developers'
      ]
    };
  }
  
  private getUserFriendlyMessage(error: Error, recovery: any) {
    const baseMessages = {
      font: '🔤 Font loading issue',
      selection: '🎯 Selection problem',
      network: '🌐 Connection issue',
      critical: '⚠️ Something went wrong'
    };
    
    let category = 'critical';
    if (error.message.includes('font')) category = 'font';
    else if (error.message.includes('selection')) category = 'selection';
    else if (error.message.includes('network')) category = 'network';
    
    return {
      text: `${baseMessages[category]} - ${recovery.userActions[0]}`,
      category
    };
  }
  
  private async attemptRecovery(
    error: Error, 
    context: ErrorContext, 
    recovery: any
  ): Promise<void> {
    try {
      // Implement recovery logic based on error type
      if (error.message.includes('selection')) {
        // Refresh selection and retry
        figma.ui.postMessage({ type: 'refresh-selection' });
      } else if (error.message.includes('network')) {
        // Retry the failed operation
        figma.ui.postMessage({ type: 'retry-operation', context });
      }
      
      figma.notify('Recovery attempt initiated...', { timeout: 2000 });
    } catch (recoveryError) {
      figma.notify('Recovery failed. Please restart the plugin.', { 
        error: true 
      });
    }
  }
}

const errorRecovery = new ErrorRecoverySystem();

// Usage
try {
  await riskyOperation();
} catch (error) {
  await errorRecovery.handleError(error, {
    action: 'process-text',
    userInput: { fontSize: 16, fontFamily: 'Custom Font' },
    environment: {
      selectionCount: figma.currentPage.selection.length,
      pluginVersion: '1.0.0',
      figmaVersion: figma.version
    }
  });
}
```

**LLM INSTRUCTION**: These UX patterns ensure plugins are user-friendly, provide clear feedback, respect user context, and handle errors gracefully. Users should never feel confused or frustrated when using the plugin.
