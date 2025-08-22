# My Chrome Extension

This is a basic Chrome extension that demonstrates the use of background scripts, content scripts, and popup functionality.

## Project Structure

```
my-chrome-extension
├── src
│   ├── background.js       # Background script for managing extension lifecycle
│   ├── content.js          # Content script for interacting with web pages
│   └── popup
│       ├── popup.html      # HTML structure for the popup
│       └── popup.js        # JavaScript for handling popup interactions
├── manifest.json           # Configuration file for the Chrome extension
└── README.md               # Documentation for the project
```

## Getting Started

1. Clone the repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click on "Load unpacked" and select the `my-chrome-extension` directory.
5. The extension should now be loaded and ready to use.

## Features

- Background script to manage events and extension lifecycle.
- Content script to manipulate the DOM of web pages.
- Popup interface for user interactions.

## License

This project is licensed under the MIT License.