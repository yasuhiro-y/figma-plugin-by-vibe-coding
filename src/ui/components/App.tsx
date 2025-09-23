/**
 * Main App Component - Random Shape Generator Demo
 *
 * This demonstrates:
 * - Clean shadcn/ui-only approach
 * - Figma native notifications (figma.notify)
 * - Simple random generation functionality
 * - Browser → Figma → shadcn/ui priority pattern
 */

import React from 'react';
import { useFigmaPlugin, useRandomShapeGenerator } from '../hooks';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function App(): JSX.Element {
  const { closePlugin, isConnected } = useFigmaPlugin();
  const { createdCount, createRandomShape } = useRandomShapeGenerator();

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header with connection status */}
      <header className="border-b bg-background/95">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-violet-500 to-pink-500" />
            <h1 className="font-semibold text-lg">Random Shape</h1>
          </div>
          <Badge variant={isConnected ? 'default' : 'destructive'} className="gap-1">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Random Shape Generator */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">🎲 Random Shape Generator</CardTitle>
              <CardDescription>
                Click the button to create random shapes with random colors and sizes!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Button
                  onClick={createRandomShape}
                  disabled={!isConnected}
                  size="lg"
                  className="px-8 py-3 text-base"
                >
                  ✨ Create Random Shape
                </Button>
              </div>

              <div className="text-center">
                <div className="text-muted-foreground text-sm">
                  Shapes created:{' '}
                  <span className="font-semibold text-foreground">{createdCount}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-center text-muted-foreground text-xs">
                  Generates random rectangles, ellipses, and polygons with vibrant colors
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={closePlugin}
              className="w-full"
              disabled={!isConnected}
            >
              Close Plugin
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
