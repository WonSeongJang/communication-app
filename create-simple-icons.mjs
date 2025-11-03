import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create icons directory
const iconsDir = join(__dirname, 'public', 'icons');
mkdirSync(iconsDir, { recursive: true });

// Simple PNG creation function
// Creates a solid blue square PNG
function createSimplePNG(size) {
  // This is a minimal valid PNG with a blue solid color
  // PNG Header
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (image header)
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // chunk length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(size, 8); // width
  ihdr.writeUInt32BE(size, 12); // height
  ihdr.writeUInt8(8, 16); // bit depth
  ihdr.writeUInt8(2, 17); // color type (RGB)
  ihdr.writeUInt8(0, 18); // compression
  ihdr.writeUInt8(0, 19); // filter
  ihdr.writeUInt8(0, 20); // interlace

  // CRC for IHDR
  const crc = require('zlib').crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(crc, 21);

  // For simplicity, let's use a base64 encoded minimal blue PNG
  // This is a pre-generated 192x192 and 512x512 blue PNG

  // Just return the signature + basic chunks
  return Buffer.concat([pngSignature, ihdr]);
}

// Actually, let's use a simpler approach with base64
// I'll create SVG files which browsers can use as icons too

function createSVGIcon(size) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb"/>
  <text x="50%" y="50%" font-family="sans-serif" font-size="${size / 3}px" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">동아리</text>
</svg>`;
  return svg;
}

// Generate SVG icons
console.log('🎨 Generating PWA icons...\n');

const sizes = [192, 512];
sizes.forEach(size => {
  const svg = createSVGIcon(size);
  // Save as both SVG and set as src
  const svgPath = join(iconsDir, `icon-${size}x${size}.svg`);
  writeFileSync(svgPath, svg);
  console.log(`✅ Created: ${svgPath}`);
});

// Also create a simple colored PNG using a trick
// We'll create a data URL that can be converted

console.log('\n📝 SVG icons created!');
console.log('💡 Browsers can use SVG icons directly, or you can convert them to PNG later.');
console.log('\n📋 Next steps:');
console.log('1. Open http://localhost:5173/generate-icons.html');
console.log('2. Click the buttons to download PNG icons');
console.log('3. Save them to public/icons/');
