# WebLLM Translation Chrome Extension

A privacy-focused Chrome extension that provides AI-powered translation between Persian (فارسی), English, and German using WebLLM technology - all running locally in your browser.

## What is WebLLM?

[WebLLM](https://webllm.mlc.ai/) is a cutting-edge technology that brings large language models (LLMs) directly to web browsers. Instead of sending your data to external servers, WebLLM runs AI models like Llama and Phi locally using:

- **WebGPU**: Leverages your device's GPU for fast inference
- **WebAssembly**: Efficient execution of AI models in browsers  
- **Local Processing**: Zero data leaves your device - complete privacy

## Features

- 🔒 **100% Private**: All translation happens locally, no data sent to servers
- 🌍 **Multi-language**: Persian (فارسی), English, and German translation
- 🧠 **Smart Detection**: Automatically detects input language
- 📝 **Context-Aware**: Provides example sentences for single-word translations
- ⚡ **Fast**: Optimized models for quick translation (1-3GB cache after first download)
- 🎯 **Offline Ready**: Works without internet after initial model download

## How It Works

1. **First Use**: Download and cache an AI model (Llama 3.2 1B or Phi 3.5 Mini)
2. **Translation**: Enter text in any supported language
3. **AI Processing**: WebLLM detects language and translates locally
4. **Results**: Get translations to the other two languages instantly

## Quick Start

```bash
cd my-chrome-extension
npm install
npm run build
```

Then load the `dist/` folder as an unpacked extension in Chrome Developer Mode.

## Project Structure

- `my-chrome-extension/` - Main Chrome extension with WebLLM integration
- `public/` - Static web assets (legacy)

See the [detailed README](my-chrome-extension/README.md) in the extension folder for full setup instructions.

## Technical Stack

- **WebLLM**: Local AI model execution
- **Vite**: Modern build tooling
- **Chrome Extension Manifest V3**: Latest extension standards
- **WebGPU**: Hardware-accelerated AI inference