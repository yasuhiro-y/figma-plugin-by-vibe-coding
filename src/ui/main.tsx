/**
 * React UI Entry Point
 *
 * This is the main entry point for the plugin's UI thread.
 * It sets up the React application and establishes communication with the plugin thread.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/globals.css';

// Get the root element
const rootElement =
  'document' in globalThis
    ? (
        globalThis as unknown as {
          document: { getElementById: (id: string) => HTMLElement | null };
        }
      ).document.getElementById('root')
    : null;

if (!rootElement) {
  throw new Error('Root element not found. Make sure your HTML has a div with id="root"');
}

// Force apply dark theme and CSS stability for HMR
const htmlElement = (
  globalThis as unknown as {
    document: { documentElement: HTMLElement; body: HTMLElement };
  }
).document?.documentElement;

const bodyElement = (
  globalThis as unknown as {
    document: { body: HTMLElement };
  }
).document?.body;

function forceCSSSafety(): void {
  if (!htmlElement || !bodyElement) return;

  // 1. Force dark theme class
  htmlElement.classList.add('dark');

  // 2. Force inline styles as backup (HMR-resistant)
  const criticalStyles = {
    backgroundColor: 'hsl(240 10% 3.9%)',
    color: 'hsl(0 0% 98%)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  // Apply to html
  Object.assign(htmlElement.style, criticalStyles, {
    fontSize: '14px',
    lineHeight: '1.4',
  });

  // Apply to body
  Object.assign(bodyElement.style, criticalStyles, {
    margin: '0',
    padding: '0',
    overflow: 'hidden',
    minHeight: '100vh',
  });

  // Apply to root
  if (rootElement) {
    Object.assign(rootElement.style, criticalStyles, {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    });
  }

  // 3. Force CSS custom properties
  htmlElement.style.setProperty('--background', '240 10% 3.9%');
  htmlElement.style.setProperty('--foreground', '0 0% 98%');
  htmlElement.style.setProperty('--card', '240 10% 3.9%');
  htmlElement.style.setProperty('--card-foreground', '0 0% 98%');
  htmlElement.style.setProperty('--border', '240 3.7% 15.9%');
  htmlElement.style.setProperty('--muted', '240 3.7% 15.9%');
  htmlElement.style.setProperty('--muted-foreground', '240 5% 64.9%');
}

// Initial safety application
forceCSSSafety();

// Create and render the React application
const root = createRoot(rootElement);

function renderApp(): void {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

// Initial render
renderApp();

// Handle hot module replacement in development
// @ts-ignore
if (import.meta?.hot) {
  // Development-only logging
  if (process.env.NODE_ENV === 'development') {
    console.info('🔥 HMR enabled - CSS stability enhanced');
  }

  // @ts-ignore
  import.meta.hot.accept('./components/App', () => {
    if (process.env.NODE_ENV === 'development') {
      console.info('🔄 App component reloaded');
    }
    // Force re-apply ALL styles before re-render
    forceCSSSafety();
    renderApp();
  });

  // @ts-ignore
  import.meta.hot.accept('./styles/globals.css', () => {
    if (process.env.NODE_ENV === 'development') {
      console.info('🎨 CSS styles reloaded');
    }
    // Aggressive CSS safety re-application
    setTimeout(() => forceCSSSafety(), 0);
    setTimeout(() => forceCSSSafety(), 50);
    setTimeout(() => forceCSSSafety(), 100);
  });
}
