#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple function to read and render markdown file
async function render(filePath) {
  try {
    const markdown = await fs.readFile(filePath, 'utf8');
    return marked(markdown);
  } catch (err) {
    console.warn(`Warning: Could not read ${filePath}`);
    return '<p>Content coming soon...</p>';
  }
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

// Explicitly combine project files
async function buildProjects() {
  const projectsContent = `
    <div class="project-grid">
      <div class="project-card">
        ${await render(path.join(__dirname, 'content/projects/phantomaton.md'))}
      </div>
      <div class="project-card">
        ${await render(path.join(__dirname, 'content/projects/necronomicon.md'))}
      </div>
      <div class="project-card">
        ${await render(path.join(__dirname, 'content/projects/smarkup.md'))}
      </div>
      <div class="project-card">
        ${await render(path.join(__dirname, 'content/projects/lovecraft.md'))}
      </div>
    </div>
  `;
  
  return section('projects', 'Projects 🚀', projectsContent);
}

// Build each additional section
async function buildAbout() {
  return section('about', 'About 🔮', 
    await render(path.join(__dirname, 'content/about.md')));
}

async function buildContact() {
  return section('contact', 'Contact 📝', 
    await render(path.join(__dirname, 'content/contact.md')));
}

// Copy a file
async function copyFile(source, destination) {
  try {
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(source, destination);
    console.log(`Copied: ${path.basename(source)}`);
  } catch (err) {
    console.error(`Error copying ${source}:`, err);
  }
}

// Main build function
async function build() {
  console.log('Building website...');
  const buildDir = path.join(__dirname, 'built');
  
  try {
    // Create build directory
    await fs.mkdir(buildDir, { recursive: true });
    
    // Copy static files
    await copyFile(
      path.join(__dirname, 'index.css'), 
      path.join(buildDir, 'index.css')
    );
    await copyFile(
      path.join(__dirname, 'index.js'), 
      path.join(buildDir, 'index.js')
    );
    
    // Copy src directory (first ensure it exists)
    const srcDir = path.join(__dirname, 'src');
    const srcFiles = await fs.readdir(srcDir);
    for (const file of srcFiles) {
      await copyFile(
        path.join(srcDir, file),
        path.join(buildDir, 'src', file)
      );
    }
    
    // Read HTML template
    let html = await fs.readFile(path.join(__dirname, 'index.html'), 'utf8');
    
    // Build all sections
    const content = [
      await buildProjects(),
      await buildAbout(),
      await buildContact()
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