// Import WebLLM from CDN
import * as webllm from './libs/webllm.js';


class StaticWebLLMChat {
    constructor() {
        this.engine = null;
        this.isLoading = false;
        this.conversationHistory = [];
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.statusEl = document.getElementById('status');
        this.messagesEl = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.modelSelect = document.getElementById('modelSelect');
        this.loadModelBtn = document.getElementById('loadModelBtn');
    }

    setupEventListeners() {
        this.loadModelBtn.addEventListener('click', () => this.initializeWebLLM());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    updateStatus(message, type = 'loading') {
        this.statusEl.textContent = message;
        this.statusEl.className = `status ${type}`;
    }

    async initializeWebLLM() {
        console.log('Initializing WebLLM...');
        const selectedModel = this.modelSelect.value;

        try {
            this.updateStatus('Initializing WebLLM engine...', 'loading');
            this.loadModelBtn.disabled = true;
            this.modelSelect.disabled = true;

            // Create new engine instance
            this.engine = new webllm.MLCEngine();

            // Load the selected model with progress callback
            await this.engine.reload(selectedModel, {
                progress_callback: (progress) => {
                    const percent = Math.round(progress * 100);
                    this.updateStatus(`Loading ${selectedModel}: ${percent}%`, 'loading');
                }
            });

            this.updateStatus(`✅ ${selectedModel} loaded successfully!`, 'ready');
            this.messageInput.disabled = false;
            this.sendButton.disabled = false;
            this.messageInput.placeholder = 'Type your message here...';
            this.messageInput.focus();

            // Add welcome message
            this.addMessage('🎉 Great! I\'m now ready to chat. What would you like to talk about?', 'assistant');

        } catch (error) {
            console.error('Failed to initialize WebLLM:', error);
            this.updateStatus(`❌ Error: ${error.message}`, 'error');
            this.loadModelBtn.disabled = false;
            this.modelSelect.disabled = false;

            // Add error message to chat
            this.addMessage(`Sorry, I couldn't load the model. Error: ${error.message}. Please try refreshing the page or selecting a different model.`, 'assistant');
        }
    }

    addMessage(content, role) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;

        // Simple markdown-like formatting
        const formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        messageEl.innerHTML = formattedContent;
        this.messagesEl.appendChild(messageEl);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;

        // Store in conversation history
        this.conversationHistory.push({ role, content });

        // Keep conversation history manageable (last 10 exchanges)
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'block' : 'none';
        if (show) {
            this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
        }
    }

    async sendMessage() {
        if (!this.engine || this.isLoading || !this.messageInput.value.trim()) {
            return;
        }

        const userMessage = this.messageInput.value.trim();
        this.messageInput.value = '';
        this.isLoading = true;
        this.sendButton.disabled = true;
        this.messageInput.disabled = true;

        // Add user message to chat
        this.addMessage(userMessage, 'user');
        this.showLoading(true);

        try {
            // Prepare conversation context (last few messages)
            const messages = this.conversationHistory.slice(-10);

            // Create chat completion
            const completion = await this.engine.chat.completions.create({
                messages: messages,
                temperature: 0.8,
                max_tokens: 1024,
                top_p: 0.9,
            });

            const assistantMessage = completion.choices[0].message.content;
            this.showLoading(false);
            this.addMessage(assistantMessage, 'assistant');

        } catch (error) {
            console.error('Error generating response:', error);
            this.showLoading(false);
            this.addMessage('Sorry, I encountered an error generating a response. Please try again or refresh the page if the problem persists.', 'assistant');
        } finally {
            this.isLoading = false;
            this.sendButton.disabled = false;
            this.messageInput.disabled = false;
            this.messageInput.focus();
        }
    }
}

// Initialize the chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Initializing StaticWebLLMChat...');
    new StaticWebLLMChat();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM is still loading. Adding DOMContentLoaded event listener...'); 
    document.addEventListener('DOMContentLoaded', () => {
        new StaticWebLLMChat();
    });
} else {
    console.log('DOM is already loaded. Initializing StaticWebLLMChat...');
    new StaticWebLLMChat();
}