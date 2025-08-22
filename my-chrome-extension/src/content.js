// Content script for WebLLM Translation Extension
// This script runs on web pages and can provide translation features

console.log('WebLLM Translation Extension content script loaded');

// Listen for text selection events to potentially offer translation
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText.length > 0 && selectedText.length < 500) {
        // Could add a small translate button near selected text
        // For now, just log the selection
        console.log('Text selected:', selectedText);
    }
});

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
        const selectedText = window.getSelection().toString().trim();
        sendResponse({ text: selectedText });
    }
    
    if (request.action === 'translatePage') {
        // Could implement page translation functionality here
        console.log('Page translation requested');
        sendResponse({ success: true });
    }
});