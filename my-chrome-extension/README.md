# WebLLM Chrome Extension

A Chrome extension that provides AI-powered translation between Persian (فارسی), English, and German using WebLLM - all running locally in your browser with no data sent to external servers.

## Features

- **Local AI Translation**: Uses WebLLM models (Llama 3.2, Phi 3.5) running entirely in browser
- **Multi-language Support**: Persian (فارسی), English, and German
- **Automatic Language Detection**: Detects input language and translates to other supported languages
- **Smart Word Translation**: Single words get translation + example sentences
- **Privacy First**: No data sent to external servers, everything runs locally
- **Modern UI**: Clean, responsive interface with real-time feedback

## Project Structure

```
my-chrome-extension/
├── src/
│   ├── background.js           # Background service worker
│   ├── content.js              # Content script for web pages
│   ├── popup/
│   │   ├── popup.html          # Extension popup interface
│   │   ├── popup.js            # Main translation logic with WebLLM
│   │   └── popup.css           # Styling for the popup
│   └── assets/
│       └── icons/              # Extension icons
├── manifest.json               # Chrome extension configuration
├── package.json                # npm dependencies and scripts
├── vite.config.js              # Vite build configuration
└── README.md                   # This file
```

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Modern browser with WebGPU support
- Chrome/Chromium browser for testing

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd my-chrome-extension
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run build
   ```

3. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder
   - The extension should now appear in your toolbar

### Development Workflow

- **Development build with watch mode:**
  ```bash
  npm run dev
  ```
  This will rebuild the extension automatically when files change.

- **Production build:**
  ```bash
  npm run build
  ```

- **After building, reload the extension in Chrome:**
  - Go to `chrome://extensions/`
  - Click the refresh button on your extension

## Usage

1. **Load a Model:**
   - Click the extension icon in your Chrome toolbar
   - Select a model (Llama 3.2 1B recommended for speed)
   - Click "Load Model" and wait for download (first time only)

2. **Translate Text:**
   - Enter text in Persian, English, or German in the textarea
   - Click "🌐 Translate" or press Ctrl+Enter
   - View translations and example sentences

3. **Translation Rules:**
   - **German** → English + Persian
   - **Persian** → English + German  
   - **English** → Persian + German

## Technical Details

### Dependencies

- `@mlc-ai/web-llm`: Local AI model execution
- `vite`: Build tool and bundler
- `vite-plugin-static-copy`: Copy static assets during build

### Build Process

The extension uses Vite to:
- Bundle the WebLLM npm package with the extension code
- Handle ES modules and import statements
- Copy static assets (manifest, icons) to the dist folder
- Generate optimized builds for Chrome extension security policies

### Chrome Extension Permissions

- `storage`: Save user preferences and model settings
- `activeTab`: Access to current tab for content script features
- `host_permissions`: Access to Hugging Face for model downloads

## Troubleshooting

### WebGPU Support
- Ensure your browser supports WebGPU
- Try enabling WebGPU in Chrome flags: `chrome://flags/#enable-unsafe-webgpu`

### Model Loading Issues
- First-time downloads can be 800MB-2GB
- Ensure stable internet connection
- Try refreshing the extension if download fails

### Build Issues
- Clear `dist` folder and rebuild: `rm -rf dist && npm run build`
- Ensure Node.js version is 16+

## License

This project is licensed under the MIT License.