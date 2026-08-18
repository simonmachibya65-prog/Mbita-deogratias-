// Quick script to add dynamic config to all API routes
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function addDynamicConfig(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Check if already has dynamic config
    if (content.includes('export const dynamic')) {
      console.log(`✓ ${filePath} already has dynamic config`);
      return;
    }
    
    // Add dynamic config at the top after imports
    const lines = content.split('\n');
    const lastImportIndex = lines.findLastIndex(line => line.startsWith('import '));
    
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, '', "export const dynamic = 'force-dynamic';");
      await writeFile(filePath, lines.join('\n'));
      console.log(`✅ Added dynamic config to ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        await addDynamicConfig(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
}

console.log('🔧 Adding dynamic config to all API routes...\n');
await processDirectory('./app/api');
console.log('\n✅ Done!');
