// Keyboard shortcuts handler

class KeyboardHandler {
    constructor(player, controls) {
        this.player = player;
        this.controls = controls;
        this.isEnabled = true;
        this.activeKeys = new Set();
        
        // Speed options for keyboard control
        this.speedOptions = [0.25, 0.5, 1, 1.25, 1.5, 2];
        
        this.setupEventListeners();
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent default behavior when typing in input fields
        document.addEventListener('keydown', (e) => {
            if (this.shouldIgnoreEvent(e)) {
                return;
            }
            
            // Prevent default for our handled keys
            if (this.isHandledKey(e.code || e.key)) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        if (!this.isEnabled || this.shouldIgnoreEvent(event)) {
            return;
        }
        
        const key = event.code || event.key;
        
        // Prevent repeated events for held keys
        if (this.activeKeys.has(key)) {
            return;
        }
        
        this.activeKeys.add(key);
        
        // Handle the key press
        this.processKeyPress(key, event);
    }
    
    /**
     * Handle keyup events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        const key = event.code || event.key;
        this.activeKeys.delete(key);
    }
    
    /**
     * Process the actual key press
     * @param {string} key - Key code or key value
     * @param {KeyboardEvent} event - Original keyboard event
     */
    processKeyPress(key, event) {
        switch (key) {
            // Play/Pause
            case 'Space':
            case ' ':
                this.handlePlayPause();
                break;
                
            // Seek backward
            case 'ArrowLeft':
                this.handleSeek(-10);
                break;
                
            // Seek forward
            case 'ArrowRight':
                this.handleSeek(10);
                break;
                
            // Speed down
            case 'ArrowDown':
                this.handleSpeedChange(-1);
                break;
                
            // Speed up
            case 'ArrowUp':
                this.handleSpeedChange(1);
                break;
                
            // Set A point
            case 'KeyA':
            case 'a':
            case 'A':
                this.handleSetA();
                break;
                
            // Set B point
            case 'KeyB':
            case 'b':
            case 'B':
                this.handleSetB();
                break;
                
            // Toggle loop
            case 'KeyL':
            case 'l':
            case 'L':
                this.handleToggleLoop();
                break;
                
            // Clear loop
            case 'KeyC':
            case 'c':
            case 'C':
                this.handleClearLoop();
                break;
                
            // Speed presets (1-6)
            case 'Digit1':
            case '1':
                this.handleSpeedPreset(0);
                break;
            case 'Digit2':
            case '2':
                this.handleSpeedPreset(1);
                break;
            case 'Digit3':
            case '3':
                this.handleSpeedPreset(2);
                break;
            case 'Digit4':
            case '4':
                this.handleSpeedPreset(3);
                break;
            case 'Digit5':
            case '5':
                this.handleSpeedPreset(4);
                break;
            case 'Digit6':
            case '6':
                this.handleSpeedPreset(5);
                break;
                
            // Additional shortcuts
            case 'Home':
                this.handleSeekToStart();
                break;
            case 'End':
                this.handleSeekToEnd();
                break;
            case 'PageUp':
                this.handleSeek(30);
                break;
            case 'PageDown':
                this.handleSeek(-30);
                break;
        }
    }
    
    /**
     * Handle play/pause
     */
    handlePlayPause() {
        if (!this.player.getState().hasFile) {
            showToast('No audio file loaded', 'error', 2000);
            return;
        }
        
        this.player.togglePlayPause();
        const isPlaying = this.player.getState().isPlaying;
        showToast(isPlaying ? 'Playing' : 'Paused', 'info', 1000);
    }
    
    /**
     * Handle seek
     * @param {number} seconds - Seconds to seek (positive for forward, negative for backward)
     */
    handleSeek(seconds) {
        if (!this.player.getState().hasFile) {
            return;
        }
        
        this.player.seekBy(seconds);
        const direction = seconds > 0 ? 'forward' : 'backward';
        const amount = Math.abs(seconds);
        showToast(`Seek ${direction} ${amount}s`, 'info', 1000);
    }
    
    /**
     * Handle speed change
     * @param {number} direction - Direction of change (-1 for slower, 1 for faster)
     */
    handleSpeedChange(direction) {
        if (!this.player.getState().hasFile) {
            return;
        }
        
        const currentRate = this.player.getState().playbackRate;
        const currentIndex = this.speedOptions.indexOf(currentRate);
        
        if (currentIndex === -1) {
            // If current rate is not in our options, find closest
            const newIndex = direction > 0 ? 
                this.speedOptions.findIndex(speed => speed > currentRate) :
                this.speedOptions.slice().reverse().findIndex(speed => speed < currentRate);
            
            if (newIndex !== -1) {
                const targetIndex = direction > 0 ? newIndex : this.speedOptions.length - 1 - newIndex;
                this.player.setPlaybackRate(this.speedOptions[targetIndex]);
                showToast(`Speed: ${this.speedOptions[targetIndex]}x`, 'info', 1500);
            }
        } else {
            // Current rate is in our options
            const newIndex = currentIndex + direction;
            
            if (newIndex >= 0 && newIndex < this.speedOptions.length) {
                this.player.setPlaybackRate(this.speedOptions[newIndex]);
                showToast(`Speed: ${this.speedOptions[newIndex]}x`, 'info', 1500);
            } else {
                // At min/max speed
                const limit = direction > 0 ? 'maximum' : 'minimum';
                showToast(`Already at ${limit} speed`, 'warning', 1500);
            }
        }
    }
    
    /**
     * Handle speed preset
     * @param {number} index - Index in speedOptions array
     */
    handleSpeedPreset(index) {
        if (!this.player.getState().hasFile) {
            return;
        }
        
        if (index >= 0 && index < this.speedOptions.length) {
            this.player.setPlaybackRate(this.speedOptions[index]);
            showToast(`Speed: ${this.speedOptions[index]}x`, 'info', 1500);
        }
    }
    
    /**
     * Handle set A point
     */
    handleSetA() {
        if (!this.player.getState().hasFile) {
            showToast('No audio file loaded', 'error', 2000);
            return;
        }
        
        this.player.setLoopA();
        const currentTime = this.player.getState().currentTime;
        showToast(`A point set at ${formatTime(currentTime)}`, 'success', 2000);
    }
    
    /**
     * Handle set B point
     */
    handleSetB() {
        if (!this.player.getState().hasFile) {
            showToast('No audio file loaded', 'error', 2000);
            return;
        }
        
        this.player.setLoopB();
        const currentTime = this.player.getState().currentTime;
        showToast(`B point set at ${formatTime(currentTime)}`, 'success', 2000);
    }
    
    /**
     * Handle toggle loop
     */
    handleToggleLoop() {
        if (!this.player.getState().hasFile) {
            showToast('No audio file loaded', 'error', 2000);
            return;
        }
        
        const state = this.player.getState();
        
        if (state.loopA !== null && state.loopB !== null) {
            this.player.toggleLoop();
            const message = this.player.getState().isLooping ? 'Loop enabled' : 'Loop disabled';
            showToast(message, 'info', 2000);
        } else {
            showToast('Set A and B points first', 'error', 2000);
        }
    }
    
    /**
     * Handle clear loop
     */
    handleClearLoop() {
        if (!this.player.getState().hasFile) {
            return;
        }
        
        this.player.clearLoop();
        showToast('Loop points cleared', 'info', 1500);
    }
    
    /**
     * Handle seek to start
     */
    handleSeekToStart() {
        if (!this.player.getState().hasFile) {
            return;
        }
        
        this.player.seek(0);
        showToast('Seek to start', 'info', 1000);
    }
    
    /**
     * Handle seek to end
     */
    handleSeekToEnd() {
        if (!this.player.getState().hasFile) {
            return;
        }
        
        const duration = this.player.getState().duration;
        this.player.seek(duration - 1); // Seek to 1 second before end to avoid ending
        showToast('Seek to end', 'info', 1000);
    }
    
    /**
     * Check if event should be ignored
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {boolean} True if event should be ignored
     */
    shouldIgnoreEvent(event) {
        // Ignore if keyboard handler is disabled
        if (!this.isEnabled) {
            return true;
        }
        
        // Ignore if user is typing in an input field
        const activeElement = document.activeElement;
        const inputTypes = ['input', 'textarea', 'select'];
        
        if (activeElement && inputTypes.includes(activeElement.tagName.toLowerCase())) {
            return true;
        }
        
        // Ignore if contenteditable element is focused
        if (activeElement && activeElement.contentEditable === 'true') {
            return true;
        }
        
        // Ignore if modifier keys are pressed (except for specific combinations)
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if key is handled by this handler
     * @param {string} key - Key code or key value
     * @returns {boolean} True if key is handled
     */
    isHandledKey(key) {
        const handledKeys = [
            'Space', ' ',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'KeyA', 'a', 'A',
            'KeyB', 'b', 'B',
            'KeyL', 'l', 'L',
            'KeyC', 'c', 'C',
            'Digit1', '1',
            'Digit2', '2',
            'Digit3', '3',
            'Digit4', '4',
            'Digit5', '5',
            'Digit6', '6',
            'Home', 'End',
            'PageUp', 'PageDown'
        ];
        
        return handledKeys.includes(key);
    }
    
    /**
     * Enable keyboard shortcuts
     */
    enable() {
        this.isEnabled = true;
    }
    
    /**
     * Disable keyboard shortcuts
     */
    disable() {
        this.isEnabled = false;
        this.activeKeys.clear();
    }
    
    /**
     * Get help text for shortcuts
     * @returns {string} Help text
     */
    getHelpText() {
        return `
Keyboard Shortcuts:
• Space: Play/Pause
• ← →: Seek ±10 seconds
• ↑ ↓: Change speed
• A: Set A loop point
• B: Set B loop point
• L: Toggle loop
• C: Clear loop points
• 1-6: Speed presets (0.25x - 2x)
• Home: Seek to start
• End: Seek to end
• Page Up/Down: Seek ±30 seconds
        `.trim();
    }
    
    /**
     * Show help tooltip
     */
    showHelp() {
        showToast(this.getHelpText(), 'info', 5000);
    }
}
