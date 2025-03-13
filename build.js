#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple function to read and render markdown file
async function render(contentPath) {
  const filePath = path.join(__dirname, contentPath);
  const markdown = await fs.readFile(filePath, 'utf8');
  return marked(markdown);
}

// Combine multiple content pieces under a section
function section(id, title, content) {
  return `
    <section id="${id}">
      <header><h2>${title}</h2></header>
      <div class="content">
        ${content}
      </div>
    </section>`;
}

// Copy a file
async function copyFile(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
  console.log(`Copied: ${path.basename(source)}`);
}

// Main build function
async function build() {
  console.log('Building website...');
  const buildDir = path.join(__dirname, 'built');
  
  try {
    // Create build directory
    await fs.mkdir(buildDir, { recursive: true });
    
    // Copy src directory (first ensure it exists)
    const srcDir = path.join(__dirname, 'src');
    const srcFiles = await fs.readdir(srcDir);
    for (const file of srcFiles) {
      await copyFile(
        path.join(srcDir, file),
        path.join(buildDir, file)
      );
    }
    
    // Read HTML template
    let html = await fs.readFile(path.join(__dirname, 'templates/index.html'), 'utf8');
    
    // Build all sections
    const projects = ['phantomaton', 'necronomicon', 'smarkup', 'lovecraft'];
    const content = [
      section('projects', 'Projects 🚀', await render('content/projects.md')),
      section('about', 'About 🔮', await render('content/about.md')),
      section('contact', 'Contact 📝', await render('content/contact.md'))
    ].join('\n');
    
    // Replace content marker
    html = html.replace('<!-- CONTENT -->', content);
    
    // Write final HTML
    await fs.writeFile(path.join(buildDir, 'index.html'), html);
    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

// Run the build
build();