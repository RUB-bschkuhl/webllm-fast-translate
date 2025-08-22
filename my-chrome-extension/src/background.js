// Background script for WebLLM Chrome Extension
// This handles extension lifecycle events

chrome.runtime.onInstalled.addListener(() => {
    console.log('WebLLM Translation Extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
        defaultModel: 'Llama-3.2-1B-Instruct-q4f32_1-MLC'
    });
});

chrome.runtime.onStartup.addListener(() => {
    console.log('WebLLM Translation Extension started');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['defaultModel'], (result) => {
            sendResponse(result);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'saveSettings') {
        chrome.storage.sync.set(request.settings, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});