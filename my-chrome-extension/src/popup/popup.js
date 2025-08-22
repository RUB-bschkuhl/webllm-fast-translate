// Import WebLLM from npm package
import * as webllm from "@mlc-ai/web-llm";
// Import CSS for Vite to bundle it
import './popup.css';

class WebLLMTranslator {
    constructor() {
        this.engine = null;
        this.isLoading = false;
        this.initializeElements();
        this.setupEventListeners();
        this.loadCacheStatus();
    }

    initializeElements() {
        this.statusEl = document.getElementById('status');
        this.inputText = document.getElementById('inputText');
        this.translateButton = document.getElementById('translateButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.modelSelect = document.getElementById('modelSelect');
        this.loadModelBtn = document.getElementById('loadModelBtn');
        this.clearCacheBtn = document.getElementById('clearCacheBtn');
        this.languageDetection = document.getElementById('languageDetection');
        this.detectedLanguage = document.getElementById('detectedLanguage');
        this.debugInfo = document.getElementById('debugInfo');
        this.translationsSection = document.getElementById('translationsSection');
        this.translationResults = document.getElementById('translationResults');
    }

    setupEventListeners() {
        this.loadModelBtn.addEventListener('click', () => this.initializeWebLLM());
        this.clearCacheBtn.addEventListener('click', () => this.clearModelCache());
        this.translateButton.addEventListener('click', () => this.translateText());
        this.inputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    // Shift+Enter: Allow line break (default behavior)
                    return;
                } else {
                    // Enter: Trigger translation
                    e.preventDefault();
                    this.translateText();
                }
            }
        });
        this.inputText.addEventListener('input', () => {
            this.hideResults();
        });
    }

    updateStatus(message, type = 'loading') {
        this.statusEl.textContent = message;
        this.statusEl.className = `status ${type}`;
    }

    async initializeWebLLM() {
        const selectedModel = this.modelSelect.value;

        try {
            this.updateStatus('Initializing WebLLM engine...', 'loading');
            this.loadModelBtn.disabled = true;
            this.modelSelect.disabled = true;

            // Create new engine instance with cache configuration
            this.engine = new webllm.MLCEngine();

            // Check if model is already cached
            const isCached = await this.isModelCached(selectedModel);

            if (isCached) {
                this.updateStatus(`🚀 Loading ${selectedModel} from cache...`, 'loading');
            } else {
                this.updateStatus(`📥 Downloading ${selectedModel} (first time, will be cached)...`, 'loading');
            }

            // Load the selected model with enhanced progress tracking
            await this.engine.reload(selectedModel, {
                progress_callback: (progress) => {
                    const percent = Math.round(progress * 100);
                    if (isCached) {
                        this.updateStatus(`🚀 Loading from cache: ${percent}%`, 'loading');
                    } else {
                        this.updateStatus(`📥 Downloading ${selectedModel}: ${percent}%`, 'loading');
                    }
                },
                // Cache configuration for better persistence
                cache_scope: 'global'
            });

            // Save model info to extension storage for tracking
            await this.saveModelToCache(selectedModel);

            this.updateStatus(`✅ ${selectedModel} ready! (cached for future use)`, 'ready');
            this.inputText.disabled = false;
            this.translateButton.disabled = false;
            this.inputText.placeholder = 'Enter text in Persian (فارسی), English, or German (Deutsch)...';
            this.inputText.focus();

        } catch (error) {
            console.error('Failed to initialize WebLLM:', error);
            this.updateStatus(`❌ Error: ${error.message}`, 'error');
            this.loadModelBtn.disabled = false;
            this.modelSelect.disabled = false;
        }
    }

    async isModelCached(modelId) {
        try {
            // Check Chrome extension storage for cached models
            return new Promise((resolve) => {
                chrome.storage.local.get([`cached_model_${modelId}`], (result) => {
                    resolve(!!result[`cached_model_${modelId}`]);
                });
            });
        } catch (error) {
            console.log('Could not check cache, assuming not cached');
            return false;
        }
    }

    async saveModelToCache(modelId) {
        try {
            const cacheData = {
                modelId: modelId,
                timestamp: Date.now(),
                version: '1.0'
            };

            chrome.storage.local.set({
                [`cached_model_${modelId}`]: cacheData
            });

            // Also keep a list of all cached models
            chrome.storage.local.get(['cached_models_list'], (result) => {
                const cachedModels = result.cached_models_list || [];
                if (!cachedModels.includes(modelId)) {
                    cachedModels.push(modelId);
                    chrome.storage.local.set({ cached_models_list: cachedModels });
                }
            });
        } catch (error) {
            console.log('Could not save to cache registry');
        }
    }

    async loadCacheStatus() {
        try {
            chrome.storage.local.get(['cached_models_list'], (result) => {
                const cachedModels = result.cached_models_list || [];
                this.updateModelSelectWithCacheInfo(cachedModels);
            });
        } catch (error) {
            console.log('Could not load cache status');
        }
    }

    updateModelSelectWithCacheInfo(cachedModels) {
        const options = this.modelSelect.options;
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const modelId = option.value;

            if (cachedModels.includes(modelId)) {
                // Mark cached models
                if (!option.text.includes('💾')) {
                    option.text = option.text + ' 💾';
                }
            }
        }
    }

    async clearModelCache() {
        try {
            const result = await new Promise((resolve) => {
                chrome.storage.local.get(['cached_models_list'], resolve);
            });

            const cachedModels = result.cached_models_list || [];

            // Clear all cached model entries
            const keysToRemove = cachedModels.map(modelId => `cached_model_${modelId}`);
            keysToRemove.push('cached_models_list');

            chrome.storage.local.remove(keysToRemove, () => {
                console.log('Model cache cleared');
                this.updateStatus('🗑️ Cache cleared successfully', 'ready');

                // Update UI to remove cache indicators
                const options = this.modelSelect.options;
                for (let i = 0; i < options.length; i++) {
                    options[i].text = options[i].text.replace(' 💾', '');
                }
            });
        } catch (error) {
            console.log('Could not clear cache');
        }
    }

    hideResults() {
        this.languageDetection.classList.remove('show');
        this.translationsSection.classList.remove('show');
    }

    showResults() {
        this.languageDetection.classList.add('show');
        this.translationsSection.classList.add('show');
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'block' : 'none';
    }

    async detectLanguage(text) {
        console.log('Detecting language for text:', text);
        
        // First try quick pattern-based detection for obvious cases
        const persianPattern = /[\u0600-\u06FF]/;
        const germanPattern = /[äöüÄÖÜß]/;

        // If we find Persian characters, it's definitely Persian
        if (persianPattern.test(text)) {
            console.log('Persian detected by character pattern');
            return 'persian';
        }

        // If we find German special characters, it's likely German
        if (germanPattern.test(text)) {
            console.log('German detected by special characters');
            return 'german';
        }

        // For ambiguous cases, use the AI model to detect language (if available)
        if (this.engine) {
            try {
                const completion = await this.engine.chat.completions.create({
                    messages: [
                        { 
                            role: 'user', 
                            content: `What language is this text? Answer only with one word: english, german, or persian.

Text: "${text}"

Language:` 
                        }
                    ],
                    temperature: 0.0,
                    max_tokens: 10,
                });
                
                const response = completion.choices[0].message.content.trim().toLowerCase();
                console.log('AI response:', response);
                
                // Extract language from response more flexibly
                let detectedLanguage = '';
                if (response.includes('english')) detectedLanguage = 'english';
                else if (response.includes('german')) detectedLanguage = 'german';
                else if (response.includes('persian')) detectedLanguage = 'persian';
                
                console.log('AI detected language:', detectedLanguage);
                
                // Validate the response
                if (['english', 'german', 'persian'].includes(detectedLanguage)) {
                    return detectedLanguage;
                }
            } catch (error) {
                console.log('AI language detection failed:', error);
            }
        }

        // Fallback: enhanced pattern-based detection
        const fallbackResult = this.fallbackLanguageDetection(text);
        console.log('Fallback detection result:', fallbackResult);
        return fallbackResult;
    }

    fallbackLanguageDetection(text) {
        const lowerText = text.toLowerCase();

        // Check for Persian characters (if somehow missed earlier)
        const persianPattern = /[\u0600-\u06FF]/;
        if (persianPattern.test(text)) {
            return 'persian';
        }

        // Common German words and patterns
        const germanWords = ['der', 'die', 'das', 'und', 'ich', 'ist', 'zu', 'ein', 'eine', 'haben', 'werden', 'sie', 'von', 'mit', 'sich', 'auf', 'für', 'als', 'bei', 'nach', 'über', 'durch', 'gegen', 'ohne', 'wem', 'wer', 'wie', 'wo', 'was', 'wann', 'gehört', 'katze', 'schwarze'];
        const germanWordCount = germanWords.filter(word =>
            new RegExp(`\\b${word}\\b`).test(lowerText)
        ).length;

        // Common English words
        const englishWords = ['the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'their', 'who', 'does', 'belong', 'black', 'cat'];
        const englishWordCount = englishWords.filter(word =>
            new RegExp(`\\b${word}\\b`).test(lowerText)
        ).length;

        // German-specific character combinations
        const germanPatterns = /\b(sch|tsch|ung|keit|heit|lich|ig|er|en|em|es|ch|ß|hört|gehört)\b/g;
        const germanPatternMatches = (lowerText.match(germanPatterns) || []).length;

        // Calculate scores
        const germanScore = germanWordCount + (germanPatternMatches * 0.5);
        const englishScore = englishWordCount;

        console.log(`Language scores - German: ${germanScore}, English: ${englishScore}`);

        // Decide based on scores
        if (germanScore > englishScore && germanScore > 0) {
            return 'german';
        } else if (englishScore > 0) {
            return 'english';
        } else {
            // Default fallback if no patterns match
            return 'english';
        }
    }

    getLanguageDisplay(language) {
        const languages = {
            'persian': '🇮🇷 Persian (فارسی)',
            'english': '🇬🇧 English',
            'german': '🇩🇪 German (Deutsch)'
        };
        return languages[language] || language;
    }

    getTargetLanguages(sourceLanguage) {
        const translations = {
            'persian': ['english', 'german'],
            'english': ['persian', 'german'],
            'german': ['english', 'persian']
        };
        return translations[sourceLanguage] || [];
    }

    isWordOnly(text) {
        // Check if text is a single word (no spaces, punctuation, multiple words)
        const trimmed = text.trim();
        return trimmed.split(/\s+/).length === 1 && /^[\w\u0600-\u06FFäöüÄÖÜß]+$/.test(trimmed);
    }

    async translateText() {
        if (!this.engine || this.isLoading || !this.inputText.value.trim()) {
            return;
        }

        const inputText = this.inputText.value.trim();
        this.isLoading = true;
        this.translateButton.disabled = true;
        this.inputText.disabled = true;

        // Show loading first
        this.showLoading(true);

        try {
            // Detect language using AI
            const detectedLanguage = await this.detectLanguage(inputText);
            this.detectedLanguage.textContent = this.getLanguageDisplay(detectedLanguage);
            this.debugInfo.textContent = `Debug: Input="${inputText.substring(0, 20)}..." → Language="${detectedLanguage}"`;
            
            // Show language detection results
            this.showResults();

            const targetLanguages = this.getTargetLanguages(detectedLanguage);
            const isWord = this.isWordOnly(inputText);

            // Clear previous results
            this.translationResults.innerHTML = '';

            // Translate to each target language
            for (const targetLanguage of targetLanguages) {
                const translation = await this.performTranslation(inputText, detectedLanguage, targetLanguage, isWord);
                this.displayTranslation(targetLanguage, translation, isWord);
            }

            this.showLoading(false);

        } catch (error) {
            console.error('Error during translation:', error);
            this.showLoading(false);
            this.translationResults.innerHTML = '<div style="color: #dc3545; padding: 15px; text-align: center;">❌ Translation failed. Please try again.</div>';
        } finally {
            this.isLoading = false;
            this.translateButton.disabled = false;
            this.inputText.disabled = false;
            this.inputText.focus();
        }
    }

    async performTranslation(text, sourceLanguage, targetLanguage, isWord) {
        const languageNames = {
            'persian': 'Persian',
            'english': 'English',
            'german': 'German'
        };

        let prompt;
        if (isWord) {
            prompt = `Translate the ${languageNames[sourceLanguage]} word "${text}" to ${languageNames[targetLanguage]}. Provide the translation and an example sentence.

Format:
Translation: [word]
Example: [sentence]`;
        } else {
            prompt = `Translate this ${languageNames[sourceLanguage]} text to ${languageNames[targetLanguage]}:

"${text}"

Only provide the translation:`;
        }
        
        const completion = await this.engine.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: 'You are a professional translator. Translate the given text accurately without adding explanations or answering questions. Only provide the translation.' 
                },
                { 
                    role: 'user', 
                    content: prompt 
                }
            ],
            temperature: 0.1,
            max_tokens: 200,
            top_p: 0.8,
        });

        return completion.choices[0].message.content.trim();
    }



    displayTranslation(targetLanguage, translation, isWord) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'translation-result';

        let translationText = '';
        let exampleSentence = '';

        if (isWord) {
            // Parse the response for word translations
            const lines = translation.split('\n').map(line => line.trim()).filter(line => line);
            
            for (const line of lines) {
                if (line.toLowerCase().startsWith('translation:')) {
                    translationText = line.replace(/^translation:\s*/i, '').trim();
                } else if (line.toLowerCase().startsWith('example:')) {
                    exampleSentence = line.replace(/^example:\s*/i, '').trim();
                }
            }
            
            // Fallback: if no proper format, take first line as translation
            if (!translationText && lines.length > 0) {
                translationText = lines[0];
                if (lines.length > 1) {
                    exampleSentence = lines[1];
                }
            }
        } else {
            // For sentences, clean up the response
            translationText = translation
                .replace(/^(translated text:|translation:)/i, '')
                .replace(/^['"`]/g, '')
                .replace(/['"`]$/g, '')
                .trim();
        }

        const flagEmoji = {
            'persian': '🇮🇷',
            'english': '🇬🇧',
            'german': '🇩🇪'
        };

        resultDiv.innerHTML = `
            <h3><span class="flag-icon">${flagEmoji[targetLanguage]}</span> ${this.getLanguageDisplay(targetLanguage)}</h3>
            <div class="translation-text">${translationText || 'Translation error'}</div>
            ${exampleSentence ? `<div class="example-sentence">Example: ${exampleSentence}</div>` : ''}
        `;

        this.translationResults.appendChild(resultDiv);
    }
}

// Initialize the translation app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebLLMTranslator();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WebLLMTranslator();
    });
} else {
    new WebLLMTranslator();
}