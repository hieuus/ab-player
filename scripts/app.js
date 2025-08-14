// Main application file - Initializes and coordinates all components

class ABPlayer {
    constructor() {
        this.player = null;
        this.controls = null;
        this.keyboard = null;
        this.fileInput = null;
        this.uploadBtn = null;
        this.fileName = null;
        this.fileUploadArea = null;
        
        this.initialize();
    }
    
    /**
     * Initialize the application
     */
    initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Set up the application components
     */
    setup() {
        try {
            // Get DOM elements
            this.getElements();
            
            // Initialize core components
            this.initializePlayer();
            this.initializeControls();
            this.initializeKeyboard();
            this.initializeFileUpload();
            this.initializeDragAndDrop();
            
            // Set up additional event listeners
            this.setupAppEventListeners();
            
            // Show welcome message
            this.showWelcomeMessage();
            
            console.log('A-B Audio Player initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize A-B Audio Player:', error);
            this.showCriticalError(error);
        }
    }
    
    /**
     * Get DOM elements
     */
    getElements() {
        this.fileInput = document.getElementById('audioFile');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileName = document.getElementById('fileName');
        this.fileUploadArea = document.querySelector('.file-upload-area');
        
        // Verify required elements exist
        const requiredElements = [
            { element: this.fileInput, name: 'audioFile' },
            { element: this.uploadBtn, name: 'uploadBtn' },
            { element: this.fileName, name: 'fileName' },
            { element: document.getElementById('audioElement'), name: 'audioElement' }
        ];
        
        const missingElements = requiredElements.filter(item => !item.element);
        if (missingElements.length > 0) {
            throw new Error(`Missing required elements: ${missingElements.map(item => item.name).join(', ')}`);
        }
    }
    
    /**
     * Initialize audio player
     */
    initializePlayer() {
        const audioElement = document.getElementById('audioElement');
        this.player = new AudioPlayer(audioElement);
        
        // Set up player event listeners
        this.player.on('error', (error) => {
            console.error('Audio player error:', error);
            this.handleAudioError(error);
        });
        
        this.player.on('loaded', (data) => {
            console.log('Audio loaded:', data);
        });
    }
    
    /**
     * Initialize UI controls
     */
    initializeControls() {
        this.controls = new Controls(this.player);
    }
    
    /**
     * Initialize keyboard shortcuts
     */
    initializeKeyboard() {
        this.keyboard = new KeyboardHandler(this.player, this.controls);
    }
    
    /**
     * Initialize file upload functionality
     */
    initializeFileUpload() {
        // File input change event
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadAudioFile(file);
            }
        });
        
        // Upload button click event
        this.uploadBtn.addEventListener('click', () => {
            this.fileInput.click();
        });
    }
    
    /**
     * Initialize drag and drop functionality
     */
    initializeDragAndDrop() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
        
        // Highlight drop area
        ['dragenter', 'dragover'].forEach(eventName => {
            this.fileUploadArea.addEventListener(eventName, () => {
                this.fileUploadArea.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.fileUploadArea.addEventListener(eventName, () => {
                this.fileUploadArea.classList.remove('drag-over');
            });
        });
        
        // Handle dropped files
        this.fileUploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (isAudioFile(file)) {
                    this.loadAudioFile(file);
                } else {
                    showToast('Please drop an audio file', 'error', 3000);
                }
            }
        });
    }
    
    /**
     * Set up additional app event listeners
     */
    setupAppEventListeners() {
        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            this.controls.updateLoopRegion();
        }, 250));
        
        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.player && this.player.isPlaying) {
                // Optionally pause when tab is hidden
                // this.player.pause();
            }
        });
        
        // Handle errors
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }
    
    /**
     * Load audio file
     * @param {File} file - Audio file to load
     */
    async loadAudioFile(file) {
        try {
            // Validate file
            if (!isAudioFile(file)) {
                throw new Error('Unsupported file format. Please select an audio file.');
            }
            
            // Show loading state
            this.showLoadingState();
            
            // Update file name display
            this.fileName.textContent = file.name;
            this.fileName.style.display = 'block';
            
            // Load audio
            await this.player.loadAudio(file);
            
            // Hide loading state
            this.hideLoadingState();
            
            // Show success message
            showToast('Audio file loaded successfully', 'success', 2000);
            
        } catch (error) {
            console.error('Error loading audio file:', error);
            this.handleAudioError(error);
            
            // Reset UI
            this.fileName.textContent = '';
            this.fileName.style.display = 'none';
            this.fileInput.value = '';
        }
    }
    
    /**
     * Handle audio errors
     * @param {Error} error - Error object
     */
    handleAudioError(error) {
        let message = 'Error loading audio file';
        
        if (error.name === 'NotSupportedError' || error.message.includes('format')) {
            message = 'Unsupported audio format';
        } else if (error.name === 'NotAllowedError') {
            message = 'Audio playback not allowed';
        } else if (error.name === 'AbortError') {
            message = 'Audio loading was aborted';
        } else if (error.message) {
            message = error.message;
        }
        
        showToast(message, 'error', 4000);
        
        // Reset to initial state
        this.controls.reset();
        this.hideLoadingState();
    }
    
    /**
     * Show loading state
     */
    showLoadingState() {
        addLoadingState(this.uploadBtn);
        this.uploadBtn.textContent = 'Loading...';
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        removeLoadingState(this.uploadBtn);
        this.uploadBtn.innerHTML = '<span class="upload-icon">📁</span>Choose Audio File';
    }
    
    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        // Show welcome message after a short delay
        setTimeout(() => {
            showToast('Welcome! Drop an audio file or click to browse', 'info', 4000);
        }, 1000);
    }
    
    /**
     * Show critical error
     * @param {Error} error - Critical error
     */
    showCriticalError(error) {
        // Create error overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: #1e293b;
                color: #f8fafc;
                padding: 2rem;
                border-radius: 8px;
                max-width: 500px;
                text-align: center;
                border: 1px solid #ef4444;
            ">
                <h2 style="color: #ef4444; margin-bottom: 1rem;">Critical Error</h2>
                <p style="margin-bottom: 1rem;">The audio player failed to initialize properly.</p>
                <p style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 1.5rem;">${error.message}</p>
                <button onclick="window.location.reload()" style="
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">Reload Page</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    /**
     * Get application state
     * @returns {Object} Application state
     */
    getState() {
        return {
            player: this.player ? this.player.getState() : null,
            hasFile: !!(this.player && this.player.getState().hasFile),
            fileName: this.fileName ? this.fileName.textContent : null
        };
    }
    
    /**
     * Cleanup and destroy
     */
    destroy() {
        if (this.player) {
            this.player.destroy();
        }
        
        if (this.keyboard) {
            this.keyboard.disable();
        }
        
        // Remove event listeners
        if (this.fileInput) {
            this.fileInput.removeEventListener('change', this.loadAudioFile);
        }
        
        console.log('A-B Audio Player destroyed');
    }
}

// Initialize the application when the script loads
let abPlayer;

try {
    abPlayer = new ABPlayer();
} catch (error) {
    console.error('Failed to create A-B Audio Player:', error);
}

// Export for debugging purposes
if (typeof window !== 'undefined') {
    window.abPlayer = abPlayer;
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (abPlayer) {
        abPlayer.destroy();
    }
});
