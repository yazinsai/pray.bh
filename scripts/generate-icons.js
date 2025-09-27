const fs = require('fs');
const path = require('path');

// Create simple placeholder SVG icons if actual icons don't exist
const icon192 = `<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#000000"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">P</text>
</svg>`;

const icon512 = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="192" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">P</text>
</svg>`;

// Convert SVG to a simple PNG-like format (this is a placeholder - in production you'd use sharp or canvas)
// For now, we'll just save the SVGs
fs.writeFileSync(path.join(__dirname, '../public/icon-192.svg'), icon192);
fs.writeFileSync(path.join(__dirname, '../public/icon-512.svg'), icon512);

console.log('Icon placeholders created successfully!');