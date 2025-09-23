# UI Development & iframe Integration

## CRITICAL: iframe Environment Limitations

Figma plugin UIs run in a **sandboxed iframe** with specific constraints that differ from normal web development.

### iframe Origin & Security Context

```typescript
// ✅ UNDERSTAND IFRAME ENVIRONMENT
console.log(window.location.origin);  // "null" (not https://figma.com)
console.log(window.parent !== window); // true (running in iframe)

// ❌ LIMITATIONS in iframe
window.open('https://example.com');     // May be blocked
window.history.pushState();           // May not work as expected
window.localStorage;                  // Available but isolated
```

### External Navigation Risks

```typescript
// ❌ DANGEROUS - Breaks plugin communication
window.location.href = "https://external-site.com";
// Changes iframe origin, postMessage may fail

// ✅ SAFE - Open in new tab/window
function openExternalLink(url: string): void {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  } catch (error) {
    // Fallback: send to plugin thread
    parent.postMessage({ 
      pluginMessage: { type: 'open-url', url } 
    }, '*');
  }
}
```

## Figma Theme Integration

### Native Theme Colors

```typescript
// ✅ FIGMA THEME INTEGRATION - Enable in showUI
figma.showUI(__html__, {
  width: 320,
  height: 480,
  themeColors: true  // CRITICAL: Enables CSS custom properties
});
```

### CSS Custom Properties Usage

```css
/* ✅ FIGMA-PROVIDED THEME VARIABLES */
.plugin-container {
  background-color: var(--figma-color-bg);
  color: var(--figma-color-text);
  border: 1px solid var(--figma-color-border);
}

.button-primary {
  background-color: var(--figma-color-bg-brand);
  color: var(--figma-color-text-onbrand);
}

.input-field {
  background-color: var(--figma-color-bg-secondary);
  border: 1px solid var(--figma-color-border-secondary);
  color: var(--figma-color-text-secondary);
}

/* ✅ SUPPORT BOTH LIGHT AND DARK MODES */
:root {
  /* Fallback values if Figma theme not available */
  --figma-color-bg: #ffffff;
  --figma-color-text: #000000;
}

@media (prefers-color-scheme: dark) {
  :root {
    --figma-color-bg: #2c2c2c;
    --figma-color-text: #ffffff;
  }
}
```

### shadcn/ui Theme Alignment

```css
/* ✅ INTEGRATE shadcn/ui WITH FIGMA THEME */
:root.dark {
  /* Map Figma variables to shadcn/ui CSS variables */
  --background: var(--figma-color-bg, hsl(240 10% 3.9%));
  --foreground: var(--figma-color-text, hsl(0 0% 98%));
  --card: var(--figma-color-bg-secondary, hsl(240 10% 3.9%));
  --card-foreground: var(--figma-color-text, hsl(0 0% 98%));
  --border: var(--figma-color-border, hsl(240 3.7% 15.9%));
  
  /* Override with Figma-specific values when available */
  --primary: var(--figma-color-bg-brand, hsl(221.2 83.2% 53.3%));
  --primary-foreground: var(--figma-color-text-onbrand, hsl(210 40% 98%));
}
```

## Window & Browser API Constraints

### VS Code Extension Limitations

```typescript
// ❌ NOT AVAILABLE in VS Code extension environment
// window.alert('message');    // Silently fails or errors
// window.confirm('question'); // May not display

// ✅ ALTERNATIVES - Use custom UI components
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';

function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    // Custom alert implementation using shadcn/ui
    setAlertConfig({ message, onClose: resolve });
    setShowAlert(true);
  });
}

// ✅ OR - Send to plugin thread for figma.notify
function notifyUser(message: string, isError = false): void {
  parent.postMessage({
    pluginMessage: { 
      type: 'show-notification', 
      message, 
      error: isError 
    }
  }, '*');
}
```

### Keyboard Event Handling

```typescript
// ✅ HANDLE FIGMA SHORTCUT CONFLICTS
function setupKeyboardHandlers(): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Prevent Figma shortcuts when input is focused
      const isInputFocused = document.activeElement?.tagName === 'INPUT' ||
                           document.activeElement?.tagName === 'TEXTAREA';
      
      if (isInputFocused) {
        // Allow normal text input shortcuts
        if (event.metaKey || event.ctrlKey) {
          const key = event.key.toLowerCase();
          if (['a', 'c', 'v', 'x', 'z'].includes(key)) {
            event.stopPropagation();
          }
        }
      }
      
      // Handle plugin-specific shortcuts
      if (event.key === 'Escape') {
        parent.postMessage({ 
          pluginMessage: { type: 'close-plugin' } 
        }, '*');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);
}
```

## Component Architecture for Plugins

### Plugin-Specific Component Patterns

```typescript
// ✅ PLUGIN COMPONENT STRUCTURE
interface PluginComponentProps {
  isConnected: boolean;
  onAction: (action: string, data?: any) => void;
}

function PluginFeature({ isConnected, onAction }: PluginComponentProps): JSX.Element {
  // Handle disabled states when plugin disconnected
  const handleClick = useCallback(() => {
    if (!isConnected) {
      console.warn('Plugin not connected');
      return;
    }
    onAction('create-shape', { width: 100, height: 100 });
  }, [isConnected, onAction]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Name</CardTitle>
        <CardDescription>
          Feature description with connection status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleClick} 
          disabled={!isConnected}
          className="w-full"
        >
          {isConnected ? 'Execute Action' : 'Plugin Disconnected'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### State Management for Plugin Communication

```typescript
// ✅ PLUGIN COMMUNICATION STATE PATTERN
interface PluginState {
  isConnected: boolean;
  selection: SelectionData[];
  isProcessing: boolean;
  lastResult?: OperationResult;
}

function usePluginState() {
  const [state, setState] = useState<PluginState>({
    isConnected: true,
    selection: [],
    isProcessing: false
  });
  
  // Monitor plugin connection
  useEffect(() => {
    const checkConnection = (): void => {
      const connected = window.parent !== window;
      setState(prev => ({ ...prev, isConnected: connected }));
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Handle plugin messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      
      setState(prev => {
        switch (msg.type) {
          case 'selection-changed':
            return { ...prev, selection: msg.selection };
          case 'operation-complete':
            return { ...prev, isProcessing: false, lastResult: msg.result };
          case 'operation-started':
            return { ...prev, isProcessing: true };
          default:
            return prev;
        }
      });
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  return state;
}
```

## Form Handling & Input Management

### Figma-Style Form Components

```typescript
// ✅ FIGMA-CONSISTENT FORM PATTERN
interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
}

function FormField({ label, value, onChange, type = 'text', placeholder, disabled }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => {
          const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
          onChange(newValue);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="h-8 text-sm" // Figma-style compact sizing
      />
    </div>
  );
}
```

### Real-time Value Updates

```typescript
// ✅ DEBOUNCED UPDATES TO PLUGIN
function usePluginUpdate<T>(
  value: T, 
  onUpdate: (value: T) => void, 
  delay = 300
) {
  const debouncedUpdate = useMemo(
    () => debounce(onUpdate, delay),
    [onUpdate, delay]
  );
  
  useEffect(() => {
    debouncedUpdate(value);
  }, [value, debouncedUpdate]);
  
  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);
}

// Usage in component
function SizeControls(): JSX.Element {
  const [width, setWidth] = useState<number>(100);
  const [height, setHeight] = useState<number>(100);
  
  const updatePlugin = useCallback((params: { width: number; height: number }) => {
    parent.postMessage({
      pluginMessage: { type: 'update-size', ...params }
    }, '*');
  }, []);
  
  usePluginUpdate({ width, height }, updatePlugin);
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField 
        label="Width" 
        type="number" 
        value={width} 
        onChange={setWidth} 
      />
      <FormField 
        label="Height" 
        type="number" 
        value={height} 
        onChange={setHeight} 
      />
    </div>
  );
}
```

## File Operations & Drag-Drop

### File Upload Handling

```typescript
// ✅ SECURE FILE UPLOAD - Validate and process in UI
function FileUploadArea(): JSX.Element {
  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(async (file) => {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        notifyUser('Only image files are supported', true);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        notifyUser('File size must be under 10MB', true);
        return;
      }
      
      try {
        // Process file in UI thread
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Send to plugin thread for Figma operations
        parent.postMessage({
          pluginMessage: {
            type: 'process-image',
            imageData: Array.from(uint8Array),
            fileName: file.name,
            mimeType: file.type
          }
        }, '*');
      } catch (error) {
        notifyUser('Failed to process file', true);
      }
    });
  }, []);
  
  return (
    <div 
      className="border-2 border-dashed border-border rounded-lg p-6 text-center"
      onDrop={(e) => {
        e.preventDefault();
        handleFileUpload(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
        id="file-input"
      />
      <Label htmlFor="file-input" className="cursor-pointer">
        Drop images here or click to select
      </Label>
    </div>
  );
}
```

### Canvas-to-Plugin Integration

```typescript
// ✅ CANVAS PROCESSING - Generate data for plugin
function CanvasProcessor(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const generateImageData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw something on canvas
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Convert to image data for plugin
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      blob.arrayBuffer().then(arrayBuffer => {
        parent.postMessage({
          pluginMessage: {
            type: 'create-from-canvas',
            imageData: Array.from(new Uint8Array(arrayBuffer)),
            width: canvas.width,
            height: canvas.height
          }
        }, '*');
      });
    }, 'image/png');
  }, []);
  
  return (
    <div className="space-y-4">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={200} 
        className="border border-border rounded"
      />
      <Button onClick={generateImageData}>
        Send Canvas to Figma
      </Button>
    </div>
  );
}
```

## Performance & Memory Management

### Component Optimization

```typescript
// ✅ OPTIMIZED COMPONENT PATTERNS
const ExpensivePluginComponent = memo(({ data }: { data: ComplexData }) => {
  // Heavy computation or rendering
  const processedData = useMemo(() => {
    return processComplexData(data);
  }, [data]);
  
  return <ComplexVisualization data={processedData} />;
});

// ✅ VIRTUALIZATION for large lists
function LargeSelectionList({ items }: { items: SelectionItem[] }) {
  const [visibleStart, setVisibleStart] = useState(0);
  const ITEM_HEIGHT = 40;
  const VISIBLE_COUNT = Math.ceil(300 / ITEM_HEIGHT); // Plugin height / item height
  
  const visibleItems = items.slice(visibleStart, visibleStart + VISIBLE_COUNT);
  
  return (
    <div className="h-[300px] overflow-auto">
      <div style={{ height: items.length * ITEM_HEIGHT }}>
        <div style={{ transform: `translateY(${visibleStart * ITEM_HEIGHT}px)` }}>
          {visibleItems.map((item, index) => (
            <SelectionItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Memory Leak Prevention

```typescript
// ✅ CLEANUP PATTERNS for plugin UI
function usePluginCleanup() {
  useEffect(() => {
    // Cleanup function for plugin shutdown
    const cleanup = (): void => {
      // Clear any intervals/timeouts
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      
      // Remove event listeners
      document.removeEventListener('keydown', handleKeyDown);
      
      // Cancel pending requests
      pendingRequests.forEach(request => request.cancel());
      pendingRequests.clear();
    };
    
    // Listen for plugin close
    const handleBeforeUnload = (): void => {
      cleanup();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
```

## Responsive Design for Plugin Windows

### Adaptive Layout

```typescript
// ✅ RESPONSIVE PLUGIN LAYOUT
function AdaptivePluginLayout({ children }: { children: ReactNode }) {
  const [windowSize, setWindowSize] = useState({ width: 320, height: 480 });
  
  useEffect(() => {
    const updateSize = (): void => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Adapt layout based on plugin size
  const isCompact = windowSize.width < 400 || windowSize.height < 500;
  
  return (
    <div 
      className={cn(
        "flex flex-col h-screen",
        isCompact ? "text-sm" : "text-base"
      )}
      style={{ '--plugin-width': `${windowSize.width}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
```

**LLM INSTRUCTION**: These UI development patterns ensure reliable, performant plugin interfaces that integrate seamlessly with Figma's design system and handle iframe constraints properly.
