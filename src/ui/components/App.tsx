/**
 * ❌❌❌ DEMO UI - REPLACE THIS ENTIRE LAYOUT WITH YOUR OPTIMAL DESIGN ❌❌❌
 * 
 * 🚨 WARNING: This layout is designed for "Random Shape Generator" demo only!
 * 🚨 DO NOT copy this layout for your actual plugin - it won't be optimal!
 * 
 * ✅ INSTEAD: Design fresh UI from scratch using shadcn/ui components
 * ✅ OPTIMIZE: Create layout specifically for YOUR plugin's workflow
 * ✅ ANALYZE: What does your user need? List view? Form? Dashboard? Tool panel?
 * 
 * This demo shows:
 * - Clean shadcn/ui-only approach (✅ Keep this principle)
 * - Figma native notifications (✅ Keep this pattern)
 * - Simple demo functionality (❌ Replace with your features)
 * - Browser → Figma → shadcn/ui priority (✅ Keep this pattern)
 * 
 * 🗑️ DELETE: header design, card layout, button arrangement, spacing patterns
 * 🎨 CREATE: Fresh design optimized for your specific plugin functionality
 */

import React from 'react';
import { useFigmaPlugin, useRandomShapeGenerator } from '../hooks';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function App(): React.JSX.Element {
  const { closePlugin, isConnected } = useFigmaPlugin();
  const { createdCount, createRandomShape } = useRandomShapeGenerator();

  return (
    // ❌❌❌ DEMO LAYOUT - REPLACE WITH OPTIMAL DESIGN FOR YOUR PLUGIN ❌❌❌
    // 🚨 This header + main structure is ONLY for Random Shape Generator demo
    // ✅ Design fresh layout: Maybe you need tabs? Maybe a sidebar? Maybe just a simple form?
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* ❌ DEMO HEADER - Replace with header optimal for YOUR plugin (or remove entirely) */}
      <header className="border-b bg-background/95">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-violet-500 to-pink-500" />
            {/* ❌ UPDATE THIS: Replace with your actual plugin name */}
            <h1 className="font-semibold text-lg">Random Shape</h1>
          </div>
        </div>
      </header>

      {/* ❌ DEMO MAIN AREA - Design fresh layout structure for YOUR plugin */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* ❌❌❌ DEMO CARD LAYOUT - DESIGN FRESH LAYOUT FOR YOUR PLUGIN ❌❌❌ */}
        {/* 🚨 This card structure (space-y-6, centered header, single card) is ONLY for demo! */}
        {/* ✅ Maybe you need: Grid layout? List view? Form sections? Tabs? Accordion? */}
        <div className="space-y-6">
          {/* ❌ DEMO CARD - Replace entire structure with layout optimal for YOUR features */}
          <Card>
            <CardHeader className="text-center"> {/* ❌ DEMO: Centered header - maybe you need left-aligned? No header? Multiple sections? */}
              {/* ❌❌❌ UPDATE THIS TITLE WHEN YOUR PLUGIN IDEA IS FINALIZED ❌❌❌ */}
              <CardTitle className="text-xl">🎲 Random Shape Generator</CardTitle> {/* ✅ Replace with your actual plugin name */}
              <CardDescription>
                Click the button to create random shapes with random colors and sizes! {/* ❌ Update with your plugin description */}
              </CardDescription>
            </CardHeader>
            {/* ❌ DEMO CONTENT AREA - Design content structure for YOUR specific features */}
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
