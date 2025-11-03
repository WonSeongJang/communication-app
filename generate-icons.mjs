import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create icons directory
const iconsDir = join(__dirname, 'public', 'icons');
mkdirSync(iconsDir, { recursive: true });

// Generate icon with size
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Blue background
  ctx.fillStyle = '#2563eb'; // blue-600
  ctx.fillRect(0, 0, size, size);

  // White text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Font size based on icon size
  const fontSize = Math.floor(size / 3);
  ctx.font = `bold ${fontSize}px sans-serif`;

  // Draw text
  ctx.fillText('동아리', size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = join(iconsDir, `icon-${size}x${size}.png`);
  writeFileSync(filename, buffer);
  console.log(`✅ Created: ${filename}`);
}

// Generate icons
console.log('🎨 Generating PWA icons...\n');
generateIcon(192);
generateIcon(512);
console.log('\n✨ All icons generated successfully!');
