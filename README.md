# A-B Audio Player

A modern, feature-rich audio player web application with A-B loop functionality and comprehensive keyboard controls.

## Features

### 🎵 Audio Playback
- Support for multiple audio formats (MP3, WAV, OGG, M4A, AAC, FLAC, WebM)
- High-quality audio playback with preserved pitch
- Drag & drop file loading
- Visual progress tracking

### ⚡ Speed Control
- Variable playback speeds: 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
- Smooth speed transitions
- Keyboard shortcuts for quick speed adjustment

### 🔄 A-B Loop System
- Set custom loop points (A and B markers)
- Visual loop region display
- Toggle loop on/off
- Automatic loop playback between markers
- Clear loop points functionality

### ⌨️ Keyboard Shortcuts
- **Space**: Play/Pause
- **← →**: Seek ±10 seconds
- **↑ ↓**: Speed up/down by 0.25x
- **A**: Set A loop point
- **B**: Set B loop point  
- **L**: Toggle loop on/off
- **C**: Clear loop points
- **1-6**: Direct speed selection (0.25x - 2x)
- **Home**: Seek to start
- **End**: Seek to end
- **Page Up/Down**: Seek ±30 seconds

### 🎨 Modern UI
- Dark theme with gradient backgrounds
- Smooth animations and transitions
- Responsive design for all devices
- Touch-friendly controls
- Visual feedback for all interactions
- Accessibility support

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Audio**: Web Audio API + HTML5 Audio Element
- **Styling**: Modern CSS with Flexbox/Grid
- **Architecture**: Modular component-based design

## File Structure

```
ab-player/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css            # Base styles and layout
│   ├── components.css      # Component-specific styles
│   └── responsive.css      # Responsive design rules
├── scripts/
│   ├── app.js              # Main application logic
│   ├── audio-player.js     # Core audio functionality
│   ├── controls.js         # UI controls management
│   ├── keyboard.js         # Keyboard shortcuts handler
│   └── utils.js            # Utility functions
└── README.md               # This file
```

## Getting Started

1. **Clone or download** the project files
2. **Open `index.html`** in a modern web browser
3. **Load an audio file** by:
   - Clicking "Choose Audio File" button, or
   - Dragging and dropping an audio file onto the upload area
4. **Start using** the player with mouse/touch or keyboard controls

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (iOS 9+)
- **Mobile browsers**: Optimized for touch devices

## Usage Tips

### Setting Up A-B Loops
1. Play your audio file
2. At the desired start point, press **A** or click "Set A"
3. At the desired end point, press **B** or click "Set B"
4. Press **L** or click "Loop On" to enable looping
5. Use **C** or "Clear" to remove loop points

### Speed Control
- Use **↑↓** arrow keys for gradual speed changes
- Use number keys **1-6** for instant speed presets
- Speed changes preserve audio pitch for natural sound

### Navigation
- **←→** for quick 10-second jumps
- **Page Up/Down** for 30-second jumps
- Click anywhere on the progress bar to seek
- Drag the progress handle for precise seeking

## Development

### Core Components

1. **AudioPlayer Class** (`audio-player.js`)
   - Handles audio loading, playback, and A-B loop logic
   - Event-driven architecture with custom events
   - Error handling and state management

2. **Controls Class** (`controls.js`)
   - Manages all UI elements and interactions
   - Progress bar with drag support
   - Loop markers and visual feedback

3. **KeyboardHandler Class** (`keyboard.js`)
   - Comprehensive keyboard shortcut system
   - Context-aware key handling
   - Help system integration

4. **Utils** (`utils.js`)
   - Time formatting functions
   - File validation
   - UI utility functions
   - Toast notifications

### Customization

The player is designed to be easily customizable:

- **Colors**: Modify CSS custom properties in `:root`
- **Shortcuts**: Add/modify key bindings in `keyboard.js`
- **Speeds**: Adjust `speedOptions` array in relevant components
- **UI Elements**: Modify HTML structure and CSS as needed

## Performance

- **Memory efficient**: Proper cleanup of audio resources
- **Smooth animations**: Hardware-accelerated CSS transitions
- **Responsive**: Optimized for different screen sizes
- **Touch-friendly**: Large touch targets on mobile devices

## Accessibility

- Keyboard navigation support
- Screen reader friendly markup
- High contrast mode support
- Reduced motion preferences honored
- Focus indicators for all interactive elements

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

---

**Enjoy your enhanced audio playback experience with A-B Audio Player!** 🎵
