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
  contentMarker: '<!-- CONTENT -->'
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
    // Read the HTML template
    let htmlTemplate = await fs.readFile(config.sourceFiles.html, 'utf8');
    
    // Check if content marker exists
    if (!htmlTemplate.includes(config.contentMarker)) {
      console.error(`Content marker "${config.contentMarker}" not found in HTML template.`);
      process.exit(1);
    }
    
    // Read content files from the content directory
    const contentFiles = await fs.readdir(config.contentDir);
    
    // Generate sections from the content files
    let sectionsHtml = '';
    
    for (const file of contentFiles) {
      if (file.endsWith('.md')) {
        const mdPath = path.join(config.contentDir, file);
        const markdown = await fs.readFile(mdPath, 'utf8');
        const html = marked(markdown);
        
        // Create a section with the content
        sectionsHtml += `
    <section id="${file.replace('.md', '').toLowerCase()}">
      <div class="content">
        ${html}
      </div>
    </section>`;
      }
    }
    
    // Replace the content marker with the generated sections
    const processedHtml = htmlTemplate.replace(config.contentMarker, sectionsHtml);
    
    // Write the processed HTML to the build directory
    await fs.writeFile(path.join(config.buildDir, 'index.html'), processedHtml);
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