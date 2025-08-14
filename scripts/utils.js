// Utility functions for the audio player

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) {
        return '00:00';
    }
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse time string (MM:SS) to seconds
 * @param {string} timeString - Time string in MM:SS format
 * @returns {number} Time in seconds
 */
function parseTime(timeString) {
    const parts = timeString.split(':');
    if (parts.length !== 2) return 0;
    
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    return minutes * 60 + seconds;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} File extension in lowercase
 */
function getFileExtension(filename) {
    return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is a supported audio format
 * @param {File} file - File object
 * @returns {boolean} True if supported
 */
function isAudioFile(file) {
    const supportedTypes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/m4a',
        'audio/aac',
        'audio/flac',
        'audio/webm'
    ];
    
    const supportedExtensions = [
        'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'webm'
    ];
    
    return supportedTypes.includes(file.type) || 
           supportedExtensions.includes(getFileExtension(file.name));
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Get element position relative to page
 * @param {HTMLElement} element - DOM element
 * @returns {Object} Position object with x, y, width, height
 */
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
    };
}

/**
 * Calculate percentage from mouse position on element
 * @param {MouseEvent} event - Mouse event
 * @param {HTMLElement} element - Target element
 * @returns {number} Percentage (0-1)
 */
function getPercentageFromMouse(event, element) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = clamp(x / rect.width, 0, 1);
    return percentage;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? 'var(--error)' : 
                   type === 'success' ? 'var(--success)' : 'var(--primary-color)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 'var(--border-radius)',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '10000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease-in-out',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * Create ripple effect on button click
 * @param {MouseEvent} event - Click event
 * @param {HTMLElement} element - Button element
 */
function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
    `;
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 600);
}

/**
 * Add loading state to element
 * @param {HTMLElement} element - Element to add loading state
 */
function addLoadingState(element) {
    element.classList.add('loading');
    element.disabled = true;
}

/**
 * Remove loading state from element
 * @param {HTMLElement} element - Element to remove loading state
 */
function removeLoadingState(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Check if device supports touch
 * @returns {boolean} True if touch is supported
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get safe area insets for mobile devices
 * @returns {Object} Safe area insets
 */
function getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10)
    };
}
