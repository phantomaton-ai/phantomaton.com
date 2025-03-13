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
  projectsDir: path.join(__dirname, 'content', 'projects'),
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
    console.log('Build directory created.');
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error('Error creating build directory:', err);
      process.exit(1);
    }
  }
}

// Ensure projects directory exists
async function ensureProjectsDir() {
  try {
    await fs.mkdir(config.projectsDir, { recursive: true });
    console.log('Projects directory created or already exists.');
  } catch (err) {
    console.error('Error creating projects directory:', err);
    process.exit(1);
  }
}

// Copy a file from source to destination
async function copyFile(source, destination) {
  try {
    await fs.copyFile(source, destination);
    console.log(`Copied: ${path.basename(source)}`);
  } catch (err) {
    console.error(`Error copying ${source}:`, err);
    throw err;
  }
}

// Copy static assets (CSS and JS files)
async function copyStaticAssets() {
  try {
    // Copy main files
    await copyFile(config.sourceFiles.css, path.join(config.buildDir, 'index.css'));
    await copyFile(config.sourceFiles.js, path.join(config.buildDir, 'index.js'));
    
    // Copy src directory
    await copyDirectory(path.join(__dirname, 'src'), path.join(config.buildDir, 'src'));
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
        await copyFile(sourcePath, destPath);
      }
    }
  } catch (err) {
    console.error(`Error copying directory ${source}:`, err);
    throw err;
  }
}

// Read and convert a markdown file to HTML
async function markdownToHtml(filePath) {
  const markdown = await fs.readFile(filePath, 'utf8');
  return marked(markdown);
}

// Process the main content sections
async function processMainContent() {
  // Read the HTML template
  let htmlTemplate = await fs.readFile(config.sourceFiles.html, 'utf8');
  
  // Check if content marker exists
  if (!htmlTemplate.includes(config.contentMarker)) {
    console.error(`Content marker "${config.contentMarker}" not found in HTML template.`);
    process.exit(1);
  }
  
  // Define our sections - explicit list
  const sections = [
    { id: 'projects', title: 'Projects', type: 'projects' },
    { id: 'about', title: 'About', file: 'about.md' },
    { id: 'contact', title: 'Contact', file: 'contact.md' }
  ];
  
  // Generate HTML for each section
  let sectionsHtml = '';
  
  for (const section of sections) {
    if (section.type === 'projects') {
      // For projects section, we'll process project cards
      const projectsHtml = await processProjects();
      sectionsHtml += `
    <section id="${section.id}">
      <header><h2>${section.title}</h2></header>
      <div class="project-container">
        ${projectsHtml}
      </div>
    </section>`;
    } else if (section.file) {
      // For regular content files
      try {
        const filePath = path.join(config.contentDir, section.file);
        await fs.access(filePath); // Check if file exists
        
        const html = await markdownToHtml(filePath);
        
        sectionsHtml += `
    <section id="${section.id}">
      <header><h2>${section.title}</h2></header>
      <div class="content">
        ${html}
      </div>
    </section>`;
      } catch (err) {
        // If file doesn't exist, create a placeholder
        console.warn(`Content file ${section.file} not found. Adding placeholder.`);
        sectionsHtml += `
    <section id="${section.id}">
      <header><h2>${section.title}</h2></header>
      <div class="content">
        <p>Content coming soon...</p>
      </div>
    </section>`;
      }
    }
  }
  
  // Replace the content marker with the generated sections
  const processedHtml = htmlTemplate.replace(config.contentMarker, sectionsHtml);
  
  // Write the processed HTML to the build directory
  await fs.writeFile(path.join(config.buildDir, 'index.html'), processedHtml);
  console.log('HTML file processed and written.');
}

// Process project files and generate HTML for project cards
async function processProjects() {
  // Check if we have a projects directory
  try {
    await fs.access(config.projectsDir);
  } catch (err) {
    // If we don't have project files yet, use the main projects.md file
    try {
      const projectsMdPath = path.join(config.contentDir, 'projects.md');
      const html = await markdownToHtml(projectsMdPath);
      return `<div class="content">${html}</div>`;
    } catch (err) {
      return '<div class="content"><p>Projects coming soon...</p></div>';
    }
  }
  
  // Read all project files
  const projectFiles = await fs.readdir(config.projectsDir);
  
  if (projectFiles.length === 0) {
    return '<div class="content"><p>Projects coming soon...</p></div>';
  }
  
  // Generate HTML for each project as a card
  let projectsHtml = '';
  
  for (const file of projectFiles) {
    if (file.endsWith('.md')) {
      const projectPath = path.join(config.projectsDir, file);
      const html = await markdownToHtml(projectPath);
      
      // Extract project ID from filename (remove extension)
      const projectId = file.replace('.md', '');
      
      projectsHtml += `
      <div class="project-card" id="project-${projectId}">
        ${html}
      </div>`;
    }
  }
  
  return projectsHtml;
}

// Main build function
async function build() {
  console.log('Building website...');
  
  try {
    await ensureBuildDir();
    await ensureProjectsDir();
    await copyStaticAssets();
    await processMainContent();
    
    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

// Run the build process
build();