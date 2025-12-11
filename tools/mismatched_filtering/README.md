# Mismatched Filtering Workshop

A web-based Python implementation of the Mismatched Filtering Workshop, converting MATLAB examples to interactive Python demonstrations.

## Overview

This tool provides interactive examples demonstrating spectrum windowing and least squares techniques for radar sidelobe reduction. All processing happens in the browser using Pyodide (Python in WebAssembly).

## Examples

### 1. Analyzing Windows from a Radar Perspective
- Demonstrates how different window functions affect radar performance
- Supports Kaiser, Taylor, and Chebyshev windows
- Shows impact on sidelobe levels and range resolution
- Includes Doppler shift effects

### 2. Matched Filtering (Coming Soon)
- Basic matched filtering concepts for radar signal processing

### 3. Mismatched Filter Length with Least Squares (Coming Soon)
- Explores how filter length affects sidelobe reduction using least squares

### 4. Mismatched Filter Spoiling with Least Squares (Coming Soon)
- Demonstrates spoiling techniques for improved sidelobe suppression

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Material Design Components Web
- **Python Runtime**: Pyodide v0.28.3
- **Python Libraries**: NumPy, SciPy
- **Plotting**: Plotly.js

## Features

- 🚀 Runs entirely in the browser - no server required
- 🔒 Privacy-focused - all computation is client-side
- 📊 Interactive plots with zoom and pan
- 🎛️ Real-time parameter adjustment
- 📱 Responsive design for mobile and desktop

## Attribution

Based on the [Mismatched Filtering Workshop](https://github.com/SpenceraM/MismatchedFilteringWorkshop) by [SpenceraM](https://github.com/SpenceraM).

Original MATLAB implementation © SpenceraM  
Python conversion for educational purposes © 2024 Mylium

## Technical Details

### Signal Processing

The tool implements the following signal processing functions:

- Linear FM (Chirp) waveform generation
- Matched filtering
- Window functions (Kaiser, Taylor, Chebyshev)
- Mismatched filtering with frequency domain windowing
- Range resolution calculations
- Sidelobe level metrics (PSL, ISL)
- Peak loss and SNR loss calculations
- Doppler shift modeling

### Performance

First load may take 10-30 seconds to download and initialize the Python environment. Subsequent visits will be faster due to browser caching.

## Development

### File Structure

```
mismatched_filtering/
├── index.html              # Main HTML page
├── README.md              # This file
├── assets/
│   ├── css/
│   │   └── styles.css     # Custom styles
│   ├── js/
│   │   ├── app.js         # Main application logic
│   │   ├── ui-handler.js  # UI event handlers
│   │   └── pyodide-loader.js  # Python environment loader
│   └── python/
│       └── signal_processing.py  # Core signal processing functions
```

### Local Testing

Simply open `index.html` in a modern web browser. Note that some browsers may require serving via HTTP/HTTPS rather than file:// protocol due to CORS restrictions.

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (v14+)
- Mobile browsers: Supported but may be slower

## License

Educational use only. Based on open-source MATLAB code by SpenceraM.
