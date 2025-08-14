// AudioPlayer class - Core audio functionality

class AudioPlayer {
    constructor(audioElement) {
        this.audio = audioElement;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.playbackRate = 1;
        this.volume = 1;
        
        // A-B Loop properties
        this.loopA = null;
        this.loopB = null;
        this.isLooping = false;
        this.loopCheckInterval = null;
        
        // Event listeners storage
        this.eventListeners = new Map();
        
        // Initialize audio element properties
        this.audio.preservesPitch = true;
        this.audio.preload = 'metadata';
        
        this.setupEventListeners();
    }
    
    /**
     * Set up audio element event listeners
     */
    setupEventListeners() {
        const events = {
            'loadstart': () => this.emit('loadstart'),
            'loadedmetadata': () => this.handleLoadedMetadata(),
            'loadeddata': () => this.emit('loadeddata'),
            'canplay': () => this.emit('canplay'),
            'canplaythrough': () => this.emit('canplaythrough'),
            'play': () => this.handlePlay(),
            'pause': () => this.handlePause(),
            'ended': () => this.handleEnded(),
            'timeupdate': () => this.handleTimeUpdate(),
            'durationchange': () => this.handleDurationChange(),
            'ratechange': () => this.handleRateChange(),
            'volumechange': () => this.handleVolumeChange(),
            'error': (e) => this.handleError(e),
            'waiting': () => this.emit('waiting'),
            'seeking': () => this.emit('seeking'),
            'seeked': () => this.emit('seeked')
        };
        
        Object.entries(events).forEach(([event, handler]) => {
            this.audio.addEventListener(event, handler);
        });
    }
    
    /**
     * Load audio file
     * @param {File|string} source - File object or URL
     */
    async loadAudio(source) {
        try {
            this.emit('loadstart');
            
            if (source instanceof File) {
                const url = URL.createObjectURL(source);
                this.audio.src = url;
                
                // Store file reference for cleanup
                this.currentFile = source;
                this.currentUrl = url;
            } else if (typeof source === 'string') {
                this.audio.src = source;
                this.currentFile = null;
                this.currentUrl = source;
            } else {
                throw new Error('Invalid audio source');
            }
            
            // Wait for metadata to load
            await new Promise((resolve, reject) => {
                const onLoadedMetadata = () => {
                    this.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
                    this.audio.removeEventListener('error', onError);
                    resolve();
                };
                
                const onError = (e) => {
                    this.audio.removeEventListener('loadedmetadata', onLoadedMetadata);
                    this.audio.removeEventListener('error', onError);
                    reject(e);
                };
                
                this.audio.addEventListener('loadedmetadata', onLoadedMetadata);
                this.audio.addEventListener('error', onError);
                
                // Load the audio
                this.audio.load();
            });
            
            this.resetLoopPoints();
            this.emit('loaded', {
                duration: this.duration,
                file: this.currentFile
            });
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * Play audio
     */
    async play() {
        try {
            await this.audio.play();
            this.startLoopCheck();
        } catch (error) {
            this.emit('error', error);
        }
    }
    
    /**
     * Pause audio
     */
    pause() {
        this.audio.pause();
        this.stopLoopCheck();
    }
    
    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * Seek to specific time
     * @param {number} time - Time in seconds
     */
    seek(time) {
        const clampedTime = clamp(time, 0, this.duration);
        this.audio.currentTime = clampedTime;
    }
    
    /**
     * Seek by offset
     * @param {number} offset - Offset in seconds (can be negative)
     */
    seekBy(offset) {
        this.seek(this.currentTime + offset);
    }
    
    /**
     * Set playback rate
     * @param {number} rate - Playback rate (0.25 to 2.0)
     */
    setPlaybackRate(rate) {
        const clampedRate = clamp(rate, 0.25, 2.0);
        this.audio.playbackRate = clampedRate;
        this.playbackRate = clampedRate;
        this.emit('ratechange', this.playbackRate);
    }
    
    /**
     * Set volume
     * @param {number} volume - Volume (0 to 1)
     */
    setVolume(volume) {
        const clampedVolume = clamp(volume, 0, 1);
        this.audio.volume = clampedVolume;
        this.volume = clampedVolume;
    }
    
    /**
     * Set A point for loop
     * @param {number} time - Time in seconds (optional, uses current time if not provided)
     */
    setLoopA(time = null) {
        this.loopA = time !== null ? time : this.currentTime;
        this.emit('loopaset', this.loopA);
        
        // If B is set and A > B, swap them
        if (this.loopB !== null && this.loopA > this.loopB) {
            [this.loopA, this.loopB] = [this.loopB, this.loopA];
            this.emit('loopbset', this.loopB);
        }
    }
    
    /**
     * Set B point for loop
     * @param {number} time - Time in seconds (optional, uses current time if not provided)
     */
    setLoopB(time = null) {
        this.loopB = time !== null ? time : this.currentTime;
        this.emit('loopbset', this.loopB);
        
        // If A is set and B < A, swap them
        if (this.loopA !== null && this.loopB < this.loopA) {
            [this.loopA, this.loopB] = [this.loopB, this.loopA];
            this.emit('loopaset', this.loopA);
        }
    }
    
    /**
     * Toggle loop on/off
     */
    toggleLoop() {
        if (this.loopA !== null && this.loopB !== null) {
            this.isLooping = !this.isLooping;
            this.emit('looptoggle', this.isLooping);
            
            if (this.isLooping && this.isPlaying) {
                this.startLoopCheck();
            } else {
                this.stopLoopCheck();
            }
        }
    }
    
    /**
     * Clear loop points
     */
    clearLoop() {
        this.loopA = null;
        this.loopB = null;
        this.isLooping = false;
        this.stopLoopCheck();
        this.emit('loopclear');
    }
    
    /**
     * Reset loop points
     */
    resetLoopPoints() {
        this.clearLoop();
    }
    
    /**
     * Start loop checking interval
     */
    startLoopCheck() {
        if (this.isLooping && this.loopA !== null && this.loopB !== null) {
            this.stopLoopCheck(); // Clear existing interval
            
            this.loopCheckInterval = setInterval(() => {
                if (this.isLooping && this.currentTime >= this.loopB) {
                    this.seek(this.loopA);
                    this.emit('looped');
                }
            }, 100); // Check every 100ms for smooth looping
        }
    }
    
    /**
     * Stop loop checking interval
     */
    stopLoopCheck() {
        if (this.loopCheckInterval) {
            clearInterval(this.loopCheckInterval);
            this.loopCheckInterval = null;
        }
    }
    
    /**
     * Handle loaded metadata event
     */
    handleLoadedMetadata() {
        this.duration = this.audio.duration;
        this.emit('loadedmetadata', this.duration);
    }
    
    /**
     * Handle play event
     */
    handlePlay() {
        this.isPlaying = true;
        this.startLoopCheck();
        this.emit('play');
    }
    
    /**
     * Handle pause event
     */
    handlePause() {
        this.isPlaying = false;
        this.stopLoopCheck();
        this.emit('pause');
    }
    
    /**
     * Handle ended event
     */
    handleEnded() {
        this.isPlaying = false;
        this.stopLoopCheck();
        this.emit('ended');
    }
    
    /**
     * Handle time update event
     */
    handleTimeUpdate() {
        this.currentTime = this.audio.currentTime;
        this.emit('timeupdate', this.currentTime);
    }
    
    /**
     * Handle duration change event
     */
    handleDurationChange() {
        this.duration = this.audio.duration;
        this.emit('durationchange', this.duration);
    }
    
    /**
     * Handle rate change event
     */
    handleRateChange() {
        this.playbackRate = this.audio.playbackRate;
        this.emit('ratechange', this.playbackRate);
    }
    
    /**
     * Handle volume change event
     */
    handleVolumeChange() {
        this.volume = this.audio.volume;
        this.emit('volumechange', this.volume);
    }
    
    /**
     * Handle error event
     */
    handleError(event) {
        const error = this.audio.error || new Error('Audio playback error');
        this.emit('error', error);
    }
    
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const callbacks = this.eventListeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * Emit event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }
    
    /**
     * Get current state
     * @returns {Object} Current player state
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            duration: this.duration,
            playbackRate: this.playbackRate,
            volume: this.volume,
            loopA: this.loopA,
            loopB: this.loopB,
            isLooping: this.isLooping,
            hasFile: !!this.currentFile || !!this.currentUrl
        };
    }
    
    /**
     * Cleanup resources
     */
    destroy() {
        this.pause();
        this.stopLoopCheck();
        this.eventListeners.clear();
        
        // Cleanup object URL if it was created
        if (this.currentUrl && this.currentFile) {
            URL.revokeObjectURL(this.currentUrl);
        }
        
        this.audio.src = '';
        this.audio.load();
    }
}
