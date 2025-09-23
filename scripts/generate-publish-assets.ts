#!/usr/bin/env tsx
/**
 * Generate Plugin Publishing Assets
 *
 * This script automatically generates all assets needed for Figma Community publishing:
 * - Plugin icon (128x128px)
 * - Thumbnail image (1920x1080px)
 * - Asset templates and checklists
 *
 * Based on Figma Community publishing requirements
 */

import path from 'path';
import fs from 'fs/promises';
import jpeg from 'jpeg-js';

// Plugin configuration interface
interface PluginConfig {
  name: string;
  description: string;
  tagline: string;
  category:
    | 'Design tools'
    | 'Software development'
    | 'Productivity'
    | 'Data visualization'
    | 'Other';
  supportContact: string;
  author: string;
  pricing?: {
    type: 'free' | 'one-time' | 'subscription';
    amount?: number;
    yearlyDiscount?: number;
  };
}

// Default plugin configuration
const defaultConfig: PluginConfig = {
  name: 'My Awesome Plugin',
  description:
    'A powerful Figma plugin that enhances your design workflow with advanced features and automation.',
  tagline: 'Enhance your design workflow',
  category: 'Design tools',
  supportContact: 'support@example.com',
  author: 'Plugin Developer',
  pricing: {
    type: 'free',
  },
};

// Create directories if they don't exist
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Generate a simple gradient icon using jpeg-js
function generateIcon(
  width: number,
  height: number,
  colors: [number, number, number, number][],
): Buffer {
  const frameData = new ArrayBuffer(width * height * 4);
  const pixels = new Uint8Array(frameData);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      // Create a gradient from top-left to bottom-right
      const gradientX = x / width;
      const gradientY = y / height;
      const gradient = (gradientX + gradientY) / 2;

      // Interpolate between colors based on gradient
      const colorIndex = Math.floor(gradient * (colors.length - 1));
      const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1);
      const localGradient = gradient * (colors.length - 1) - colorIndex;

      const color1 = colors[colorIndex];
      const color2 = colors[nextColorIndex];

      pixels[i] = Math.round(color1[0] + (color2[0] - color1[0]) * localGradient); // R
      pixels[i + 1] = Math.round(color1[1] + (color2[1] - color1[1]) * localGradient); // G
      pixels[i + 2] = Math.round(color1[2] + (color2[2] - color1[2]) * localGradient); // B
      pixels[i + 3] = 255; // A
    }
  }

  const rawImageData = {
    data: pixels,
    width,
    height,
  };

  const jpegImageData = jpeg.encode(rawImageData, 90);
  return jpegImageData.data;
}

// Generate plugin icon (128x128)
async function generatePluginIcon(outputDir: string, config: PluginConfig): Promise<void> {
  console.log('🎨 Generating plugin icon (128x128px)...');

  // Nice gradient colors for plugin icon
  const iconColors: [number, number, number, number][] = [
    [99, 102, 241, 255], // Indigo
    [147, 51, 234, 255], // Purple
    [236, 72, 153, 255], // Pink
    [251, 146, 60, 255], // Orange
  ];

  const iconBuffer = generateIcon(128, 128, iconColors);
  const iconPath = path.join(outputDir, 'plugin-icon.jpg');
  await fs.writeFile(iconPath, iconBuffer);

  console.log(`✅ Plugin icon generated: ${iconPath}`);
}

// Generate thumbnail image (1920x1080)
async function generateThumbnail(outputDir: string, config: PluginConfig): Promise<void> {
  console.log('🖼️  Generating thumbnail image (1920x1080px)...');

  // Different gradient for thumbnail
  const thumbnailColors: [number, number, number, number][] = [
    [59, 130, 246, 255], // Blue
    [16, 185, 129, 255], // Green
    [245, 158, 11, 255], // Yellow
    [239, 68, 68, 255], // Red
  ];

  const thumbnailBuffer = generateIcon(1920, 1080, thumbnailColors);
  const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
  await fs.writeFile(thumbnailPath, thumbnailBuffer);

  console.log(`✅ Thumbnail generated: ${thumbnailPath}`);
}

// Generate publishing checklist
async function generatePublishingChecklist(outputDir: string, config: PluginConfig): Promise<void> {
  console.log('📋 Generating publishing checklist...');

  const checklist = `# Figma Plugin Publishing Checklist

## Pre-Publishing Requirements ✅

### 1. Plugin Development
- [ ] Plugin functionality is complete and tested
- [ ] Code is properly formatted and linted
- [ ] TypeScript compilation succeeds without errors
- [ ] All dependencies are properly declared

### 2. Assets Preparation
- [ ] Plugin icon (128x128px) is ready: \`${path.join(outputDir, 'plugin-icon.jpg')}\`
- [ ] Thumbnail image (1920x1080px) is ready: \`${path.join(outputDir, 'thumbnail.jpg')}\`
- [ ] Additional carousel images/videos (optional, max 9)
- [ ] Playground file for user testing (optional)

### 3. Plugin Information
- [ ] **Name**: "${config.name}"
- [ ] **Tagline**: "${config.tagline}"
- [ ] **Description**: "${config.description}"
- [ ] **Category**: ${config.category}
- [ ] **Support Contact**: ${config.supportContact}

### 4. Technical Requirements
- [ ] Network access is properly configured in manifest
- [ ] Security disclosure form completed (if applicable)
- [ ] Two-factor authentication enabled on Figma account
- [ ] Using Figma Desktop app (not web version)

### 5. Pricing Configuration
- [ ] **Pricing Type**: ${config.pricing?.type || 'free'}
${config.pricing?.type === 'one-time' ? `- [ ] **Price**: $${config.pricing.amount}` : ''}
${config.pricing?.type === 'subscription' ? `- [ ] **Monthly Price**: $${config.pricing.amount}` : ''}
${config.pricing?.yearlyDiscount ? `- [ ] **Yearly Discount**: ${config.pricing.yearlyDiscount}%` : ''}

## Publishing Process 🚀

### Step 1: Submit for Review
1. Open Figma Desktop app
2. Go to **Figma logo** → **Plugins** → **Manage plugins**
3. Click **⋯** next to your plugin → **Publish**
4. Fill in all required information using the assets generated in this folder

### Step 2: Review Process
- [ ] Initial submission completed
- [ ] Plugin moved to "Published" section with "In review" badge
- [ ] Figma review decision received (5-10 business days)
- [ ] Address any feedback if rejected

### Step 3: Post-Approval
- [ ] Plugin approved and "Published" badge added
- [ ] Share plugin URL: https://www.figma.com/community/plugin/[ID]/${config.name.toLowerCase().replace(/\\s+/g, '-')}
- [ ] Announce to community/social media
- [ ] Monitor user feedback and comments

## Asset Files Generated 📁

- \`plugin-icon.jpg\` - Plugin icon (128x128px)
- \`thumbnail.jpg\` - Main thumbnail (1920x1080px)
- \`publishing-info.json\` - Plugin metadata for reference
- \`security-disclosure.md\` - Security disclosure template

## Need Help? 🆘

- **Figma Plugin Documentation**: https://www.figma.com/plugin-docs/
- **Community Guidelines**: https://help.figma.com/hc/en-us/articles/360040530533-Plugin-review-guidelines
- **Support**: ${config.supportContact}

---
*Generated by Figma Plugin Vibe Coding Boilerplate*
`;

  const checklistPath = path.join(outputDir, 'PUBLISHING_CHECKLIST.md');
  await fs.writeFile(checklistPath, checklist);

  console.log(`✅ Publishing checklist generated: ${checklistPath}`);
}

// Generate plugin metadata JSON
async function generatePluginMetadata(outputDir: string, config: PluginConfig): Promise<void> {
  console.log('📄 Generating plugin metadata...');

  const metadata = {
    name: config.name,
    description: config.description,
    tagline: config.tagline,
    category: config.category,
    author: config.author,
    supportContact: config.supportContact,
    pricing: config.pricing,
    assets: {
      icon: 'plugin-icon.jpg',
      thumbnail: 'thumbnail.jpg',
    },
    figmaRequirements: {
      desktopApp: true,
      twoFactorAuth: true,
      networkAccess: 'specified', // Update based on your plugin's needs
    },
    generatedAt: new Date().toISOString(),
  };

  const metadataPath = path.join(outputDir, 'publishing-info.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`✅ Plugin metadata generated: ${metadataPath}`);
}

// Generate security disclosure template
async function generateSecurityDisclosure(outputDir: string, config: PluginConfig): Promise<void> {
  console.log('🔒 Generating security disclosure template...');

  const securityDisclosure = `# Security Disclosure for ${config.name}

## Data Security Practices

Please complete this security disclosure form when publishing your plugin to Figma Community.

### 1. Data Collection
- [ ] **Does not collect user data**
- [ ] **Collects user data** (specify what data below)

**What user data does your plugin collect?**
- [ ] Selected objects/layers information
- [ ] Canvas content
- [ ] User preferences/settings
- [ ] Analytics data
- [ ] Other: _______________

### 2. Data Usage
**How do you use the collected data?**
- [ ] Plugin functionality only
- [ ] Analytics and improvement
- [ ] User support
- [ ] Other: _______________

### 3. Data Storage
**Where is user data stored?**
- [ ] Not stored (processed locally only)
- [ ] Local storage only
- [ ] External servers (specify location)
- [ ] Third-party services (specify which)

### 4. Data Sharing
**Do you share user data with third parties?**
- [ ] No data sharing
- [ ] Anonymous analytics only
- [ ] With specified partners
- [ ] Other: _______________

### 5. Network Access
**What network access does your plugin require?**
- [ ] No network access needed
- [ ] Restricted to specific domains: _______________
- [ ] Unrestricted network access

### 6. User Control
**What control do users have over their data?**
- [ ] Users can delete their data
- [ ] Users can export their data
- [ ] Users can opt-out of data collection
- [ ] Other: _______________

### 7. Contact Information
**Data Protection Officer/Privacy Contact:** ${config.supportContact}

---

**Important Notes:**
- Review and approval may take up to two weeks
- Your answers will be visible to logged-in users viewing your plugin
- Ensure all information is accurate and up-to-date
- Update this form if your data practices change

*Generated by Figma Plugin Vibe Coding Boilerplate*
`;

  const securityPath = path.join(outputDir, 'security-disclosure.md');
  await fs.writeFile(securityPath, securityDisclosure);

  console.log(`✅ Security disclosure template generated: ${securityPath}`);
}

// Main function
async function main(): Promise<void> {
  console.log('🚀 Generating Figma Plugin Publishing Assets...\n');

  // Read configuration from file or use defaults
  let config: PluginConfig = defaultConfig;

  try {
    const configPath = path.join(process.cwd(), 'plugin-config.json');
    const configFile = await fs.readFile(configPath, 'utf-8');
    config = { ...defaultConfig, ...JSON.parse(configFile) };
    console.log('📝 Using plugin configuration from plugin-config.json');
  } catch {
    console.log('📝 Using default plugin configuration');
    console.log('💡 Tip: Create plugin-config.json to customize your plugin info');
  }

  // Create output directory
  const outputDir = path.join(process.cwd(), 'publish-assets');
  await ensureDir(outputDir);

  try {
    // Generate all assets
    await generatePluginIcon(outputDir, config);
    await generateThumbnail(outputDir, config);
    await generatePublishingChecklist(outputDir, config);
    await generatePluginMetadata(outputDir, config);
    await generateSecurityDisclosure(outputDir, config);

    console.log('\\n🎉 All publishing assets generated successfully!');
    console.log(`📁 Assets location: ${outputDir}`);
    console.log('\\n📋 Next steps:');
    console.log('1. Review the PUBLISHING_CHECKLIST.md');
    console.log('2. Customize plugin-config.json if needed');
    console.log('3. Replace generated images with custom designs if desired');
    console.log('4. Complete security-disclosure.md');
    console.log('5. Submit your plugin for review in Figma Desktop app');
  } catch (error) {
    console.error('❌ Error generating publishing assets:', error);
    process.exit(1);
  }
}

// Execute if run directly
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
