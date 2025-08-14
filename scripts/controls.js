// Controls handler - Manages UI controls and their interactions

class Controls {
    constructor(player) {
        this.player = player;
        this.isDragging = false;
        this.updateInterval = null;
        
        // Get DOM elements
        this.elements = {
            playPauseBtn: document.getElementById('playPauseBtn'),
            speedSelect: document.getElementById('speedSelect'),
            progressBar: document.getElementById('progressBar'),
            progressFill: document.getElementById('progressFill'),
            progressHandle: document.getElementById('progressHandle'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            trackTitle: document.getElementById('trackTitle'),
            trackDuration: document.getElementById('trackDuration'),
            setABtn: document.getElementById('setABtn'),
            setBBtn: document.getElementById('setBBtn'),
            toggleLoopBtn: document.getElementById('toggleLoopBtn'),
            clearLoopBtn: document.getElementById('clearLoopBtn'),
            aMarker: document.getElementById('aMarker'),
            bMarker: document.getElementById('bMarker'),
            loopRegion: document.getElementById('loopRegion')
        };
        
        this.setupEventListeners();
        this.setupPlayerEventListeners();
        this.updateUI();
    }
    
    /**
     * Set up UI event listeners
     */
    setupEventListeners() {
        // Play/Pause button
        this.elements.playPauseBtn.addEventListener('click', (e) => {
            createRipple(e, this.elements.playPauseBtn);
            this.player.togglePlayPause();
        });
        
        // Speed selection
        this.elements.speedSelect.addEventListener('change', (e) => {
            const rate = parseFloat(e.target.value);
            this.player.setPlaybackRate(rate);
        });
        
        // Progress bar interactions
        this.setupProgressBarListeners();
        
        // Loop control buttons
        this.elements.setABtn.addEventListener('click', (e) => {
            createRipple(e, this.elements.setABtn);
            this.player.setLoopA();
            showToast('A point set', 'success', 1500);
        });
        
        this.elements.setBBtn.addEventListener('click', (e) => {
            createRipple(e, this.elements.setBBtn);
            this.player.setLoopB();
            showToast('B point set', 'success', 1500);
        });
        
        this.elements.toggleLoopBtn.addEventListener('click', (e) => {
            createRipple(e, this.elements.toggleLoopBtn);
            
            if (this.player.loopA !== null && this.player.loopB !== null) {
                this.player.toggleLoop();
                const message = this.player.isLooping ? 'Loop enabled' : 'Loop disabled';
                showToast(message, 'info', 1500);
            } else {
                showToast('Set A and B points first', 'error', 2000);
            }
        });
        
        this.elements.clearLoopBtn.addEventListener('click', (e) => {
            createRipple(e, this.elements.clearLoopBtn);
            this.player.clearLoop();
            showToast('Loop cleared', 'info', 1500);
        });
    }
    
    /**
     * Set up progress bar mouse/touch interactions
     */
    setupProgressBarListeners() {
        let isMouseDown = false;
        
        // Mouse events
        this.elements.progressBar.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                isMouseDown = true;
                this.startDragging(e);
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isMouseDown && this.isDragging) {
                this.handleDrag(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                this.stopDragging();
            }
        });
        
        // Touch events for mobile
        this.elements.progressBar.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDragging(touch);
        });
        
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                this.handleDrag(touch);
            }
        });
        
        document.addEventListener('touchend', () => {
            this.stopDragging();
        });
        
        // Click to seek
        this.elements.progressBar.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.seekToPosition(e);
            }
        });
    }
    
    /**
     * Start dragging the progress handle
     * @param {MouseEvent|Touch} event - Mouse or touch event
     */
    startDragging(event) {
        this.isDragging = true;
        this.elements.progressHandle.classList.add('dragging');
        this.pauseUpdates();
        this.handleDrag(event);
    }
    
    /**
     * Handle dragging movement
     * @param {MouseEvent|Touch} event - Mouse or touch event
     */
    handleDrag(event) {
        if (!this.isDragging || this.player.duration === 0) return;
        
        const percentage = getPercentageFromMouse(event, this.elements.progressBar);
        const newTime = percentage * this.player.duration;
        
        // Update UI immediately for smooth feedback
        this.updateProgressVisual(percentage);
        this.elements.currentTime.textContent = formatTime(newTime);
    }
    
    /**
     * Stop dragging and seek to final position
     */
    stopDragging() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.elements.progressHandle.classList.remove('dragging');
        
        // Seek to the final position
        const percentage = parseFloat(this.elements.progressFill.style.width) / 100;
        const newTime = percentage * this.player.duration;
        this.player.seek(newTime);
        
        this.resumeUpdates();
    }
    
    /**
     * Seek to clicked position
     * @param {MouseEvent} event - Click event
     */
    seekToPosition(event) {
        if (this.player.duration === 0) return;
        
        const percentage = getPercentageFromMouse(event, this.elements.progressBar);
        const newTime = percentage * this.player.duration;
        this.player.seek(newTime);
    }
    
    /**
     * Set up player event listeners
     */
    setupPlayerEventListeners() {
        this.player.on('play', () => this.updatePlayPauseButton(true));
        this.player.on('pause', () => this.updatePlayPauseButton(false));
        this.player.on('ended', () => this.updatePlayPauseButton(false));
        
        this.player.on('timeupdate', (time) => {
            if (!this.isDragging) {
                this.updateProgress(time);
            }
        });
        
        this.player.on('durationchange', (duration) => {
            this.updateDuration(duration);
        });
        
        this.player.on('ratechange', (rate) => {
            this.updateSpeedSelect(rate);
        });
        
        this.player.on('loaded', (data) => {
            this.updateTrackInfo(data);
            this.enableControls();
        });
        
        this.player.on('loopaset', (time) => {
            this.updateLoopMarker('a', time);
            this.updateLoopControls();
        });
        
        this.player.on('loopbset', (time) => {
            this.updateLoopMarker('b', time);
            this.updateLoopControls();
        });
        
        this.player.on('looptoggle', (isLooping) => {
            this.updateLoopToggleButton(isLooping);
        });
        
        this.player.on('loopclear', () => {
            this.clearLoopMarkers();
            this.updateLoopControls();
        });
        
        this.player.on('error', (error) => {
            this.handleError(error);
        });
        
        this.player.on('loadstart', () => {
            this.showLoadingState();
        });
        
        this.player.on('canplay', () => {
            this.hideLoadingState();
        });
    }
    
    /**
     * Update play/pause button
     * @param {boolean} isPlaying - Whether audio is playing
     */
    updatePlayPauseButton(isPlaying) {
        const icon = this.elements.playPauseBtn.querySelector('.play-icon');
        icon.textContent = isPlaying ? '⏸️' : '▶️';
        this.elements.playPauseBtn.setAttribute('data-tooltip', isPlaying ? 'Pause' : 'Play');
    }
    
    /**
     * Update progress bar
     * @param {number} currentTime - Current playback time
     */
    updateProgress(currentTime) {
        if (this.player.duration === 0) return;
        
        const percentage = (currentTime / this.player.duration) * 100;
        this.updateProgressVisual(percentage);
        this.elements.currentTime.textContent = formatTime(currentTime);
    }
    
    /**
     * Update progress bar visual
     * @param {number} percentage - Progress percentage (0-100)
     */
    updateProgressVisual(percentage) {
        const clampedPercentage = clamp(percentage, 0, 100);
        this.elements.progressFill.style.width = `${clampedPercentage}%`;
    }
    
    /**
     * Update duration display
     * @param {number} duration - Audio duration
     */
    updateDuration(duration) {
        this.elements.totalTime.textContent = formatTime(duration);
        this.elements.trackDuration.textContent = formatTime(duration);
    }
    
    /**
     * Update speed select
     * @param {number} rate - Current playback rate
     */
    updateSpeedSelect(rate) {
        this.elements.speedSelect.value = rate.toString();
    }
    
    /**
     * Update track information
     * @param {Object} data - Track data
     */
    updateTrackInfo(data) {
        const fileName = data.file ? data.file.name : 'Audio File';
        const name = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
        this.elements.trackTitle.textContent = name;
        this.elements.trackDuration.textContent = formatTime(data.duration);
    }
    
    /**
     * Update loop marker position
     * @param {string} type - 'a' or 'b'
     * @param {number} time - Time position
     */
    updateLoopMarker(type, time) {
        if (this.player.duration === 0) return;
        
        const percentage = (time / this.player.duration) * 100;
        const marker = type === 'a' ? this.elements.aMarker : this.elements.bMarker;
        
        marker.style.left = `${percentage}%`;
        marker.classList.add('visible');
        
        this.updateLoopRegion();
    }
    
    /**
     * Update loop region visualization
     */
    updateLoopRegion() {
        if (this.player.loopA !== null && this.player.loopB !== null && this.player.duration > 0) {
            const aPercentage = (this.player.loopA / this.player.duration) * 100;
            const bPercentage = (this.player.loopB / this.player.duration) * 100;
            
            this.elements.loopRegion.style.left = `${aPercentage}%`;
            this.elements.loopRegion.style.width = `${bPercentage - aPercentage}%`;
            this.elements.loopRegion.classList.add('visible');
        } else {
            this.elements.loopRegion.classList.remove('visible');
        }
    }
    
    /**
     * Clear loop markers
     */
    clearLoopMarkers() {
        this.elements.aMarker.classList.remove('visible');
        this.elements.bMarker.classList.remove('visible');
        this.elements.loopRegion.classList.remove('visible');
    }
    
    /**
     * Update loop control buttons
     */
    updateLoopControls() {
        // Update A button
        if (this.player.loopA !== null) {
            this.elements.setABtn.classList.add('a-set');
            this.elements.setABtn.textContent = `A: ${formatTime(this.player.loopA)}`;
        } else {
            this.elements.setABtn.classList.remove('a-set');
            this.elements.setABtn.textContent = 'Set A';
        }
        
        // Update B button
        if (this.player.loopB !== null) {
            this.elements.setBBtn.classList.add('b-set');
            this.elements.setBBtn.textContent = `B: ${formatTime(this.player.loopB)}`;
        } else {
            this.elements.setBBtn.classList.remove('b-set');
            this.elements.setBBtn.textContent = 'Set B';
        }
        
        // Update toggle button state
        this.updateLoopToggleButton(this.player.isLooping);
    }
    
    /**
     * Update loop toggle button
     * @param {boolean} isLooping - Whether loop is active
     */
    updateLoopToggleButton(isLooping) {
        if (isLooping) {
            this.elements.toggleLoopBtn.classList.add('loop-active');
            this.elements.toggleLoopBtn.textContent = 'Loop On';
        } else {
            this.elements.toggleLoopBtn.classList.remove('loop-active');
            this.elements.toggleLoopBtn.textContent = 'Loop Off';
        }
    }
    
    /**
     * Enable all controls
     */
    enableControls() {
        Object.values(this.elements).forEach(element => {
            if (element && element.disabled !== undefined) {
                element.disabled = false;
            }
        });
    }
    
    /**
     * Disable all controls
     */
    disableControls() {
        Object.values(this.elements).forEach(element => {
            if (element && element.disabled !== undefined) {
                element.disabled = true;
            }
        });
    }
    
    /**
     * Show loading state
     */
    showLoadingState() {
        this.elements.playPauseBtn.classList.add('loading');
        this.elements.trackTitle.textContent = 'Loading...';
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        this.elements.playPauseBtn.classList.remove('loading');
    }
    
    /**
     * Handle errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('Audio error:', error);
        showToast('Error loading audio file', 'error', 3000);
        this.elements.trackTitle.textContent = 'Error loading file';
        this.disableControls();
    }
    
    /**
     * Pause UI updates
     */
    pauseUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    /**
     * Resume UI updates
     */
    resumeUpdates() {
        // Updates are handled by player events, no interval needed
    }
    
    /**
     * Update entire UI
     */
    updateUI() {
        const state = this.player.getState();
        
        this.updatePlayPauseButton(state.isPlaying);
        this.updateProgress(state.currentTime);
        this.updateDuration(state.duration);
        this.updateSpeedSelect(state.playbackRate);
        this.updateLoopControls();
        
        if (!state.hasFile) {
            this.disableControls();
        }
    }
    
    /**
     * Reset UI to initial state
     */
    reset() {
        this.elements.trackTitle.textContent = 'No file selected';
        this.elements.trackDuration.textContent = '00:00';
        this.elements.currentTime.textContent = '00:00';
        this.elements.totalTime.textContent = '00:00';
        this.elements.progressFill.style.width = '0%';
        this.elements.speedSelect.value = '1';
        
        this.clearLoopMarkers();
        this.updateLoopControls();
        this.updatePlayPauseButton(false);
        this.disableControls();
    }
}
