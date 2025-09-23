import { useCallback, useEffect, useRef, useState } from 'react';
import type { PluginMessage, UIMessage } from '../../../common/messages';

interface UseFigmaPluginOptions {
  readonly onSelectionChange?: (
    selection: Array<{ id: string; name: string; type: string }>,
  ) => void;
}

interface UseFigmaPluginReturn {
  readonly selection: Array<{ id: string; name: string; type: string }>;
  readonly sendMessage: (message: UIMessage) => void;
  readonly getSelection: () => void;
  readonly closePlugin: () => void;
  readonly isConnected: boolean;
}

// Define iframe window interface to avoid any usage
interface IFrameWindow {
  readonly parent: {
    readonly postMessage: (data: { pluginMessage: UIMessage }, targetOrigin: string) => void;
  };
  readonly addEventListener: (type: string, listener: (event: MessageEvent) => void) => void;
  readonly removeEventListener: (type: string, listener: (event: MessageEvent) => void) => void;
}

/**
 * Core Figma Plugin Communication Hook
 *
 * This hook provides ONLY the basic communication infrastructure between
 * the UI thread and Plugin thread. It does NOT contain any specific business logic.
 *
 * Core responsibilities:
 * - Connection management
 * - Message sending/receiving
 * - Selection tracking
 * - Plugin lifecycle (close)
 *
 * For specific feature functionality, use feature hooks that build upon this core hook.
 */
export function useFigmaPlugin(options: UseFigmaPluginOptions = {}): UseFigmaPluginReturn {
  const [selection, setSelection] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const pendingRequestsRef = useRef(new Map<string, (result: unknown) => void>());

  // Check if we're in the plugin environment
  useEffect(() => {
    const checkConnection = (): void => {
      setIsConnected(
        typeof globalThis !== 'undefined' &&
          'parent' in globalThis &&
          (globalThis as unknown as { parent: unknown }).parent !== globalThis,
      );
    };

    checkConnection();
    // Check periodically in case the iframe is moved or parent changes
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle messages from the plugin thread
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const { pluginMessage } = event.data as { pluginMessage?: PluginMessage };
      if (!pluginMessage) return;

      switch (pluginMessage.type) {
        case 'selection-changed':
          setSelection(pluginMessage.selection);
          options.onSelectionChange?.(pluginMessage.selection);
          break;
        case 'operation-result':
          if (pluginMessage.id && pendingRequestsRef.current.has(pluginMessage.id)) {
            const resolver = pendingRequestsRef.current.get(pluginMessage.id);
            if (resolver) {
              resolver(pluginMessage.result);
              pendingRequestsRef.current.delete(pluginMessage.id);
            }
          }
          break;
        default:
          console.warn('Unhandled plugin message:', pluginMessage);
      }
    };

    if ('addEventListener' in globalThis) {
      (globalThis as unknown as IFrameWindow).addEventListener('message', handleMessage);
    }

    return () => {
      if ('removeEventListener' in globalThis) {
        (globalThis as unknown as IFrameWindow).removeEventListener('message', handleMessage);
      }
    };
  }, [options]);

  // Core message sending functionality
  const sendMessage = useCallback(
    (message: UIMessage): void => {
      if (!isConnected) {
        console.warn('Plugin not connected, cannot send message:', message);
        return;
      }

      try {
        if ('parent' in globalThis) {
          (globalThis as unknown as IFrameWindow).parent.postMessage(
            { pluginMessage: message },
            '*',
          );
        }
      } catch (error) {
        console.error('Failed to send message to plugin:', error);
        setIsConnected(false);
      }
    },
    [isConnected],
  );

  // Core functionality - get current selection
  const getSelection = useCallback((): void => {
    const message: UIMessage = {
      type: 'get-selection',
      id: `selection-${Date.now()}`,
    };
    sendMessage(message);
  }, [sendMessage]);

  // Core functionality - close plugin
  const closePlugin = useCallback((): void => {
    const message: UIMessage = { type: 'close-plugin' };
    sendMessage(message);
  }, [sendMessage]);

  return {
    selection,
    sendMessage,
    getSelection,
    closePlugin,
    isConnected,
  };
}

export default useFigmaPlugin;
