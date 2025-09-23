# Ecosystem Integration & Plugin Publishing

## Plugin Coexistence & Data Safety

### Namespace Collision Prevention

**CRITICAL**: Plugin data keys must use unique namespaces to avoid conflicts with other plugins.

```typescript
// ❌ DANGEROUS - Generic keys cause conflicts
node.setPluginData('settings', data);          // Conflicts with other plugins!
node.setPluginData('config', data);           // Too generic!
node.setSharedPluginData('team', 'data', data); // Namespace collision!

// ✅ SAFE - Use reverse domain notation
const PLUGIN_NAMESPACE = 'com.company.plugin-name';
const PLUGIN_PREFIX = 'myCompany.myPlugin';

class SafeDataStorage {
  // Private data with unique keys
  static setPluginData(node: SceneNode, key: string, data: any): void {
    const safeKey = `${PLUGIN_PREFIX}.${key}`;
    node.setPluginData(safeKey, JSON.stringify(data));
  }
  
  static getPluginData<T>(node: SceneNode, key: string, defaultValue: T): T {
    const safeKey = `${PLUGIN_PREFIX}.${key}`;
    const stored = node.getPluginData(safeKey);
    return stored ? JSON.parse(stored) : defaultValue;
  }
  
  // Shared data with proper namespace
  static setSharedData(node: SceneNode, key: string, data: any): void {
    node.setSharedPluginData(PLUGIN_NAMESPACE, key, JSON.stringify(data));
  }
  
  static getSharedData<T>(node: SceneNode, key: string, defaultValue: T): T {
    const stored = node.getSharedPluginData(PLUGIN_NAMESPACE, key);
    return stored ? JSON.parse(stored) : defaultValue;
  }
  
  // Clean up old data (migration helper)
  static migrateFromGenericKeys(node: SceneNode, oldKeys: string[]): void {
    oldKeys.forEach(oldKey => {
      const oldData = node.getPluginData(oldKey);
      if (oldData) {
        // Migrate to new namespaced key
        this.setPluginData(node, oldKey, JSON.parse(oldData));
        // Remove old key
        node.setPluginData(oldKey, '');
      }
    });
  }
}
```

### Inter-Plugin Communication

```typescript
// ✅ RESPECTFUL PLUGIN BEHAVIOR - Don't interfere with other plugins
class PolitePlugin {
  
  // Check if another plugin has already processed this node
  static isNodeProcessedByOtherPlugin(node: SceneNode): boolean {
    const pluginDataKeys = node.getPluginDataKeys();
    
    // Look for data from other plugins (different prefixes)
    const otherPluginData = pluginDataKeys.filter(key => 
      !key.startsWith(PLUGIN_PREFIX) && 
      key.includes('.') // Likely namespaced by another plugin
    );
    
    return otherPluginData.length > 0;
  }
  
  // Respect existing plugin data
  static processNodeSafely(node: SceneNode): boolean {
    // Check for conflicts first
    const hasOtherPluginData = this.isNodeProcessedByOtherPlugin(node);
    
    if (hasOtherPluginData) {
      const proceed = figma.ui && figma.ui.postMessage ? 
        await this.requestUserPermission(
          'This node has been processed by other plugins. Continue?'
        ) : true;
        
      if (!proceed) {
        figma.notify('Skipped node to preserve other plugin data');
        return false;
      }
    }
    
    // Proceed with processing
    return this.processNode(node);
  }
  
  private static async requestUserPermission(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const requestId = `permission-${Date.now()}`;
      
      const handleMessage = (event: MessageEvent) => {
        const msg = event.data.pluginMessage;
        if (msg?.type === 'permission-response' && msg.id === requestId) {
          window.removeEventListener('message', handleMessage);
          resolve(msg.granted);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      figma.ui.postMessage({
        type: 'request-permission',
        id: requestId,
        message
      });
      
      // Auto-deny after 10 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        resolve(false);
      }, 10000);
    });
  }
}
```

## Security & Data Protection

### Secure Data Handling

```typescript
// ✅ SECURE DATA PRACTICES - Protect user information
class SecureDataManager {
  
  // Never store sensitive data in plain text
  static async storeSecureData(key: string, data: any): Promise<void> {
    try {
      // Encrypt sensitive data before storage
      const encrypted = await this.encryptData(JSON.stringify(data));
      await figma.clientStorage.setAsync(key, encrypted);
    } catch (error) {
      console.error('Failed to store secure data:', error);
      throw new Error('Data storage failed');
    }
  }
  
  static async retrieveSecureData<T>(key: string): Promise<T | null> {
    try {
      const encrypted = await figma.clientStorage.getAsync(key);
      if (!encrypted) return null;
      
      const decrypted = await this.decryptData(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }
  
  // Basic encryption (use proper crypto library in production)
  private static async encryptData(data: string): Promise<string> {
    // This is a simplified example - use proper encryption in production
    const encoder = new TextEncoder();
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
  
  // Data validation to prevent injection
  static validateUserInput(input: any, schema: any): boolean {
    try {
      // Use Zod or similar for validation
      schema.parse(input);
      return true;
    } catch (error) {
      console.error('Input validation failed:', error);
      figma.notify('Invalid input provided', { error: true });
      return false;
    }
  }
  
  // Sanitize data before external API calls
  static sanitizeForAPI(data: any): any {
    const sanitized = { ...data };
    
    // Remove internal plugin keys
    delete sanitized._pluginId;
    delete sanitized._internal;
    
    // Sanitize strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        // Basic sanitization - use proper library in production
        sanitized[key] = sanitized[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .trim();
      }
    });
    
    return sanitized;
  }
}
```

### Network Security

```typescript
// ✅ SECURE NETWORK OPERATIONS
class SecureNetworking {
  private static readonly ALLOWED_DOMAINS = [
    'https://api.yourservice.com',
    'https://secure.endpoint.com'
  ];
  
  static async makeSecureRequest(url: string, options: RequestInit = {}): Promise<Response | null> {
    // Validate URL against whitelist
    if (!this.isURLAllowed(url)) {
      console.error('URL not in allowed domains:', url);
      figma.notify('Network request blocked for security', { error: true });
      return null;
    }
    
    try {
      // Add security headers
      const secureOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          'User-Agent': 'FigmaPlugin/1.0',
          'X-Plugin-Version': '1.0.0'
        },
        // Prevent credentials from being sent
        credentials: 'omit'
      };
      
      const response = await fetch(url, secureOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.error('Secure request failed:', error);
      figma.notify('Network request failed', { error: true });
      return null;
    }
  }
  
  private static isURLAllowed(url: string): boolean {
    return this.ALLOWED_DOMAINS.some(domain => url.startsWith(domain));
  }
  
  // Rate limiting to prevent abuse
  private static requestCounts = new Map<string, number>();
  
  static async rateLimitedRequest(url: string, options?: RequestInit): Promise<Response | null> {
    const domain = new URL(url).hostname;
    const currentCount = this.requestCounts.get(domain) || 0;
    
    // Limit to 10 requests per minute per domain
    if (currentCount >= 10) {
      figma.notify('Rate limit exceeded. Please wait before retrying.', { error: true });
      return null;
    }
    
    this.requestCounts.set(domain, currentCount + 1);
    
    // Reset counter after 1 minute
    setTimeout(() => {
      this.requestCounts.set(domain, Math.max(0, (this.requestCounts.get(domain) || 0) - 1));
    }, 60000);
    
    return this.makeSecureRequest(url, options);
  }
}
```

## Figma Store Review Guidelines

### Pre-Submission Checklist

```typescript
// ✅ REVIEW-READY PLUGIN - Comprehensive quality assurance
interface PluginQuality {
  functionality: QualityCheck;
  security: QualityCheck;
  performance: QualityCheck;
  usability: QualityCheck;
  documentation: QualityCheck;
}

interface QualityCheck {
  passed: boolean;
  issues: string[];
  score: number; // 0-100
}

class ReviewPreparation {
  static async runQualityAssurance(): Promise<PluginQuality> {
    const checks = {
      functionality: await this.checkFunctionality(),
      security: await this.checkSecurity(),
      performance: await this.checkPerformance(),
      usability: await this.checkUsability(),
      documentation: await this.checkDocumentation()
    };
    
    const overallScore = Object.values(checks)
      .reduce((sum, check) => sum + check.score, 0) / 5;
    
    console.log(`Overall Plugin Quality Score: ${overallScore}/100`);
    
    if (overallScore < 80) {
      console.warn('Plugin quality below recommended threshold');
      this.generateImprovementReport(checks);
    }
    
    return checks;
  }
  
  private static async checkFunctionality(): Promise<QualityCheck> {
    const issues: string[] = [];
    let score = 100;
    
    // Test basic functionality
    try {
      // Check if plugin can handle empty selection
      if (figma.currentPage.selection.length === 0) {
        // Should handle gracefully, not crash
      }
      
      // Check error handling
      await this.testErrorHandling();
      
      // Verify all advertised features work
      await this.testAllFeatures();
      
    } catch (error) {
      issues.push('Basic functionality test failed');
      score -= 30;
    }
    
    // Check for common issues
    if (this.hasHardcodedPaths()) {
      issues.push('Contains hardcoded file paths');
      score -= 10;
    }
    
    if (this.hasUnhandledPromises()) {
      issues.push('Contains unhandled promise rejections');
      score -= 15;
    }
    
    return {
      passed: score >= 70,
      issues,
      score
    };
  }
  
  private static async checkSecurity(): Promise<QualityCheck> {
    const issues: string[] = [];
    let score = 100;
    
    // Check network access
    if (this.hasUnrestrictedNetworkAccess()) {
      issues.push('Uses unrestricted network access (*)');
      score -= 40; // Major security issue
    }
    
    // Check data storage
    if (this.storesPlainTextSecrets()) {
      issues.push('Stores sensitive data in plain text');
      score -= 30;
    }
    
    // Check input validation
    if (!this.hasInputValidation()) {
      issues.push('Missing input validation');
      score -= 20;
    }
    
    return {
      passed: score >= 80,
      issues,
      score
    };
  }
  
  private static async checkPerformance(): Promise<QualityCheck> {
    const issues: string[] = [];
    let score = 100;
    
    // Bundle size check
    const bundleSize = await this.getBundleSize();
    if (bundleSize > 2 * 1024 * 1024) { // 2MB
      issues.push('Bundle size too large (>2MB)');
      score -= 20;
    }
    
    // Memory usage simulation
    if (this.hasMemoryLeaks()) {
      issues.push('Potential memory leaks detected');
      score -= 25;
    }
    
    // Performance benchmarks
    const benchmarks = await this.runPerformanceBenchmarks();
    if (benchmarks.avgOperationTime > 1000) { // >1 second
      issues.push('Operations too slow');
      score -= 15;
    }
    
    return {
      passed: score >= 75,
      issues,
      score
    };
  }
  
  private static generateImprovementReport(checks: PluginQuality): void {
    console.group('🔍 Plugin Quality Report');
    
    Object.entries(checks).forEach(([category, check]) => {
      console.group(`${category.toUpperCase()}: ${check.score}/100`);
      
      if (check.issues.length > 0) {
        console.warn('Issues found:');
        check.issues.forEach(issue => console.log(`- ${issue}`));
      } else {
        console.log('✅ No issues found');
      }
      
      console.groupEnd();
    });
    
    // Provide specific improvement suggestions
    console.group('💡 Improvement Suggestions');
    
    if (checks.security.score < 80) {
      console.log('🔒 Security: Review network access, data encryption, input validation');
    }
    
    if (checks.performance.score < 75) {
      console.log('⚡ Performance: Optimize bundle size, fix memory leaks, improve operation speed');
    }
    
    if (checks.usability.score < 80) {
      console.log('👤 Usability: Improve error messages, add progress indicators, enhance UX');
    }
    
    console.groupEnd();
    console.groupEnd();
  }
  
  // Helper methods for quality checks
  private static hasHardcodedPaths(): boolean {
    // Check source code for hardcoded paths
    return false; // Implement actual check
  }
  
  private static hasUnhandledPromises(): boolean {
    // Static analysis for unhandled promises
    return false; // Implement actual check
  }
  
  private static hasUnrestrictedNetworkAccess(): boolean {
    // Check manifest for networkAccess: "*"
    return false; // Implement actual check
  }
  
  private static storesPlainTextSecrets(): boolean {
    // Check for plain text sensitive data storage
    return false; // Implement actual check
  }
  
  private static hasInputValidation(): boolean {
    // Check for proper input validation
    return true; // Implement actual check
  }
  
  private static async getBundleSize(): Promise<number> {
    // Calculate plugin bundle size
    return 1024 * 1024; // 1MB placeholder
  }
  
  private static hasMemoryLeaks(): boolean {
    // Memory leak detection
    return false; // Implement actual check
  }
  
  private static async runPerformanceBenchmarks(): Promise<{ avgOperationTime: number }> {
    // Run performance tests
    return { avgOperationTime: 500 }; // 500ms placeholder
  }
  
  private static async testErrorHandling(): Promise<void> {
    // Test error scenarios
  }
  
  private static async testAllFeatures(): Promise<void> {
    // Automated feature testing
  }
}
```

## Dependency Management & Third-Party Libraries

### Smart Library Selection

```typescript
// ✅ DEPENDENCY OPTIMIZATION - Avoid wheel reinvention while maintaining quality
interface LibraryEvaluation {
  name: string;
  bundleSize: number;
  lastUpdated: Date;
  securityIssues: number;
  alternatives: string[];
  recommendation: 'use' | 'avoid' | 'consider-alternative';
  reason: string;
}

class DependencyManager {
  // Recommended libraries for common tasks
  static readonly RECOMMENDED_LIBRARIES = {
    dateTime: {
      name: 'date-fns',
      reason: 'Small bundle size, tree-shakable, well maintained',
      bundleImpact: 'Low'
    },
    uuid: {
      name: 'uuid',
      reason: 'Standard, secure UUID generation',
      bundleImpact: 'Minimal'
    },
    validation: {
      name: 'zod',
      reason: 'TypeScript-first, runtime validation',
      bundleImpact: 'Medium'
    },
    colorManipulation: {
      name: 'chroma-js',
      reason: 'Comprehensive color operations',
      bundleImpact: 'Medium'
    },
    mathUtils: {
      name: 'lodash/math',
      reason: 'Use specific functions, not full lodash',
      bundleImpact: 'Low'
    }
  };
  
  // Avoid these libraries in plugins
  static readonly AVOID_LIBRARIES = [
    {
      name: 'moment',
      reason: 'Large bundle size, use date-fns instead',
      alternative: 'date-fns'
    },
    {
      name: 'lodash',
      reason: 'Large bundle, import specific functions instead',
      alternative: 'lodash/[function]'
    },
    {
      name: 'axios',
      reason: 'Native fetch is sufficient for most cases',
      alternative: 'fetch'
    },
    {
      name: 'jquery',
      reason: 'Not needed with modern JavaScript',
      alternative: 'vanilla JavaScript'
    }
  ];
  
  static evaluateLibrary(packageName: string): LibraryEvaluation {
    // Check against avoid list
    const avoidItem = this.AVOID_LIBRARIES.find(lib => lib.name === packageName);
    if (avoidItem) {
      return {
        name: packageName,
        bundleSize: 0, // Would need actual calculation
        lastUpdated: new Date(),
        securityIssues: 0,
        alternatives: [avoidItem.alternative],
        recommendation: 'avoid',
        reason: avoidItem.reason
      };
    }
    
    // Check recommended list
    const recommended = Object.values(this.RECOMMENDED_LIBRARIES)
      .find(lib => lib.name === packageName);
    
    if (recommended) {
      return {
        name: packageName,
        bundleSize: 0,
        lastUpdated: new Date(),
        securityIssues: 0,
        alternatives: [],
        recommendation: 'use',
        reason: recommended.reason
      };
    }
    
    return {
      name: packageName,
      bundleSize: 0,
      lastUpdated: new Date(),
      securityIssues: 0,
      alternatives: [],
      recommendation: 'consider-alternative',
      reason: 'Not in recommended list, evaluate carefully'
    };
  }
  
  // Bundle size analysis
  static async analyzeBundleImpact(): Promise<BundleAnalysis> {
    const analysis: BundleAnalysis = {
      totalSize: 0,
      librariesBySize: [],
      recommendations: []
    };
    
    // This would integrate with bundle analyzer
    // Placeholder implementation
    
    if (analysis.totalSize > 1024 * 1024) { // 1MB
      analysis.recommendations.push('Consider reducing bundle size');
    }
    
    return analysis;
  }
}

interface BundleAnalysis {
  totalSize: number;
  librariesBySize: Array<{ name: string; size: number }>;
  recommendations: string[];
}

// ✅ CUSTOM UTILITY FUNCTIONS - Avoid dependencies for simple tasks
class PluginUtils {
  // Instead of importing lodash
  static debounce<T extends (...args: any[]) => any>(
    func: T, 
    wait: number
  ): T & { cancel(): void } {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const debounced = (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), wait);
    };
    
    debounced.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
    
    return debounced as T & { cancel(): void };
  }
  
  // Instead of importing uuid
  static generateId(): string {
    return 'id-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  
  // Instead of importing color manipulation library for simple tasks
  static hexToRgb(hex: string): RGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  }
  
  static rgbToHex(rgb: RGB): string {
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }
}
```

## Community & Ecosystem Best Practices

### Plugin Discoverability

```typescript
// ✅ PLUGIN METADATA - Optimize for discovery and usage
interface PluginMetadata {
  manifest: {
    name: string;
    description: string;
    tags: string[];
    category: string;
  };
  documentation: {
    readme: string;
    changelog: string;
    usage_examples: string[];
  };
  marketing: {
    screenshots: string[];
    demo_video?: string;
    use_cases: string[];
  };
}

class PluginPublishing {
  static optimizeForDiscovery(): PluginMetadata {
    return {
      manifest: {
        name: 'Clear, Descriptive Name',
        description: 'Concise description focusing on value proposition',
        tags: ['productivity', 'design-system', 'automation'], // Relevant tags
        category: 'productivity' // Proper categorization
      },
      documentation: {
        readme: 'Comprehensive setup and usage instructions',
        changelog: 'Version history with clear feature descriptions',
        usage_examples: [
          'Quick start guide',
          'Advanced use cases',
          'Integration examples'
        ]
      },
      marketing: {
        screenshots: [
          'Plugin interface overview',
          'Before/after results',
          'Feature highlights'
        ],
        demo_video: 'Short video showing key functionality',
        use_cases: [
          'Design system management',
          'Workflow automation',
          'Quality assurance'
        ]
      }
    };
  }
  
  static generateReleaseNotes(version: string, changes: string[]): string {
    return `
## Version ${version}

${changes.map(change => `- ${change}`).join('\n')}

### Installation
1. Open Figma
2. Go to Plugins menu
3. Search for "[Plugin Name]"
4. Click Install

### Support
- Documentation: [link]
- Issues: [github/issues]
- Contact: [email]
    `.trim();
  }
}
```

**LLM INSTRUCTION**: These ecosystem integration patterns ensure plugins work well with others, pass Figma's review process, maintain security standards, and contribute positively to the plugin community.
