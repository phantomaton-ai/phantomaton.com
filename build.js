#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  contentDir: path.join(__dirname, 'content'),
  buildDir: path.join(__dirname, 'built'),
  sourceFiles: {
    html: path.join(__dirname, 'index.html'),
    css: path.join(__dirname, 'index.css'),
    js: path.join(__dirname, 'index.js')
  },
  sections: {
    'projects.md': 'section:nth-of-type(1)',
    'about.md': 'section:nth-of-type(2)',
    'contact.md': 'section:nth-of-type(3)'
  }
};

// Ensure build directory exists
async function ensureBuildDir() {
  try {
    await fs.mkdir(config.buildDir, { recursive: true });
    console.log('Build directory created or already exists.');
  } catch (err) {
    console.error('Error creating build directory:', err);
    process.exit(1);
  }
}

// Copy static assets (CSS and JS files)
async function copyStaticAssets() {
  try {
    // Copy CSS file
    await fs.copyFile(config.sourceFiles.css, path.join(config.buildDir, 'index.css'));
    console.log('CSS file copied.');
    
    // Copy JS file
    await fs.copyFile(config.sourceFiles.js, path.join(config.buildDir, 'index.js'));
    console.log('JS file copied.');
    
    // Copy src directory
    await copyDirectory(path.join(__dirname, 'src'), path.join(config.buildDir, 'src'));
    console.log('src directory copied.');
  } catch (err) {
    console.error('Error copying static assets:', err);
    process.exit(1);
  }
}

// Helper function to copy a directory recursively
async function copyDirectory(source, destination) {
  try {
    await fs.mkdir(destination, { recursive: true });
    
    const entries = await fs.readdir(source, { withFileTypes: true });
    
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, destPath);
      } else {
        await fs.copyFile(sourcePath, destPath);
      }
    }
  } catch (err) {
    console.error(`Error copying directory ${source}:`, err);
    throw err;
  }
}

// Process Markdown content
async function processContent() {
  try {
    let htmlContent = await fs.readFile(config.sourceFiles.html, 'utf8');
    
    // Check which content files exist and process them
    for (const [mdFile, sectionSelector] of Object.entries(config.sections)) {
      const mdPath = path.join(config.contentDir, mdFile);
      
      try {
        // Check if file exists
        await fs.access(mdPath);
        
        // Read and convert markdown to HTML
        const markdown = await fs.readFile(mdPath, 'utf8');
        const html = marked(markdown);
        
        // Simple replacement - in a more complex app, you'd use a proper HTML parser
        const sectionMatch = new RegExp(`(<${sectionSelector.split(':')[0]}[^>]*>).*?(</${sectionSelector.split(':')[0]}>)`, 's');
        
        if (sectionMatch.test(htmlContent)) {
          htmlContent = htmlContent.replace(sectionMatch, function(match, openTag, closeTag) {
            // Extract the header from the original section
            const headerMatch = /<header>.*?<\/header>/s.exec(match);
            const header = headerMatch ? headerMatch[0] : '<header><h2>Section</h2></header>';
            
            return `${openTag}\n      ${header}\n      <div class="content">\n        ${html}\n      </div>\n    ${closeTag}`;
          });
          
          console.log(`Processed ${mdFile} into ${sectionSelector}`);
        } else {
          console.warn(`Section selector "${sectionSelector}" not found in HTML.`);
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.warn(`Content file ${mdFile} not found. Skipping.`);
        } else {
          throw err;
        }
      }
    }
    
    // Write the processed HTML to the build directory
    await fs.writeFile(path.join(config.buildDir, 'index.html'), htmlContent);
    console.log('HTML file processed and written.');
    
  } catch (err) {
    console.error('Error processing content:', err);
    process.exit(1);
  }
}

// Main build function
async function build() {
  console.log('Building website...');
  
  try {
    await ensureBuildDir();
    await copyStaticAssets();
    await processContent();
    
    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

// Run the build process
build();