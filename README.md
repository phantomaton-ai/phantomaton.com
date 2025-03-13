# Phantomaton.com 🌐

This repository contains the source code for the [Phantomaton Studios](https://phantomaton.com) website - the spectral home of our AI-powered entertainment studio.

## Overview 👁️

Phantomaton.com is a minimalist, content-focused website showcasing our projects, mission, and contact information. The site features:

- A dynamic header with subtle animation effects
- Markdown-driven content that's easy to update
- A simple build system for generating static HTML
- Dark, ghostly aesthetics fitting the Phantomaton brand

## Development 🧪

### Prerequisites

To work with this repository, you need:

- Node.js (v16 or higher recommended)
- npm (usually comes with Node.js)

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/phantomaton-ai/phantomaton.com.git
cd phantomaton.com
npm install
```

### Building the Site

To build the site:

```bash
npm run build
```

This will process all Markdown content in the `content` directory and generate the complete site in the `built` directory.

### Project Structure

```
phantomaton.com/
├── content/            # Markdown content files
│   ├── about.md        # About section content
│   ├── contact.md      # Contact section content
│   └── projects.md     # Projects section content
├── src/                # Source files for styles and scripts
│   ├── flicker.css     # Header animation effects
│   ├── framecounter.js # Animation state management
│   └── scrollkeeper.js # Scroll position tracking
├── index.html          # Main HTML template
├── index.css           # Main CSS file (imports from src/)
├── index.js            # Main JavaScript file (imports from src/)
└── build.js            # Build script to generate the site
```

## Content Management 📝

The site content is managed through Markdown files in the `content` directory. To update the site:

1. Edit the relevant Markdown file(s)
2. Run `npm run build` to regenerate the site
3. The updated content will appear in the `built` directory

## Contributing 🦄

We welcome contributions to the Phantomaton website! If you have any ideas, bug reports, or pull requests, please feel free to submit them to our GitHub repository.

## License 🔒

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.