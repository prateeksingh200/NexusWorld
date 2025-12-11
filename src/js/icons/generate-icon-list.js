const fs = require('fs');
const path = require('path');

// We need to go up 3 levels to get back to root: src -> js -> icons -> root
const rootDir = path.resolve(__dirname, '../../../'); 

const iconsDir = path.join(rootDir, 'src/icons/outline');
const outputFile = path.join(rootDir, 'dist/icon-list.js');

console.log(`🔍 Scanning directory: ${iconsDir}`);

try {
    // Check if directory exists
    if (!fs.existsSync(iconsDir)) {
        console.error(`❌ Directory not found: ${iconsDir}`);
        process.exit(1);
    }

    const files = fs.readdirSync(iconsDir);

    // Filter for SVGs
    const iconNames = files
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''));

    // Create the JS content
    const fileContent = `window.NEXUS_ICONS = ${JSON.stringify(iconNames, null, 2)};`;

    // Ensure dist folder exists
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    // Write file
    fs.writeFileSync(outputFile, fileContent);
    console.log(`✅ Icon list generated at: ${outputFile}`);

} catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
}