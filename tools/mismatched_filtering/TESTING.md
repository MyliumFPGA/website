# Testing Guide for Mismatched Filtering Workshop

## Quick Start

1. Navigate to `tools/mismatched_filtering/` in your browser
2. Wait for Python environment to load (10-30 seconds on first visit)
3. Once loaded, you'll see the "Analyzing Windows" example
4. Adjust parameters using the controls
5. Click "Run Analysis" to generate plots

## Expected Behavior

### Initial Load
- Hero card displays tool title and description
- Loading indicator shows while Pyodide downloads Python and libraries
- After loading, main content appears with example selector

### Analyzing Windows Example

#### Controls
- **Window Type**: Toggle between Kaiser, Taylor, and Chebyshev
- **Kaiser Beta**: Slider (0-22), controls Kaiser window shape parameter
- **Taylor SLL**: Slider (-70 to -5 dB), sets target sidelobe level
- **Taylor N-bar**: Slider (1-30), controls number of nearly constant-level sidelobes
- **Chebyshev SLL**: Slider (-70 to 10 dB), sets Chebyshev window sidelobe level
- **Plot Range**: Dropdown (1000-12000 m), sets x-axis zoom level
- **Frequency Offset**: Slider (0-200000 Hz), simulates Doppler shift
- **Apply Window to Doppler**: Checkbox, applies windowing to Doppler-shifted signal

#### Expected Results

When clicking "Run Analysis", you should see:

1. **Plot 1: Range Response**
   - Shows matched filter (no window) in blue
   - Shows mismatched filter (windowed) in orange
   - Y-axis: dB scale from -100 to 0
   - X-axis: Range in meters
   - Windowed response should show lower sidelobes but wider mainlobe

2. **Plot 2: Doppler Effect**
   - Shows impact of frequency offset on sidelobes
   - If "Apply Window" is checked: shows windowed and windowed+Doppler
   - If unchecked: shows no window and no window+Doppler
   - Demonstrates how Doppler can raise sidelobes even with windowing

3. **Statistics Table**
   - Compares matched vs. mismatched filtering
   - Metrics:
     - Range Resolution: Should increase with windowing
     - PSL (Peak Sidelobe Level): Should decrease (more negative) with windowing
     - ISL (Integrated Sidelobe Level): Should decrease with windowing
     - Peak Loss: Should be >0 for mismatched filter
     - SNR Loss: Should be >0 for mismatched filter

### Example Parameter Sets

#### Kaiser Window (Default)
- Kaiser Beta: 6
- Expected: Moderate sidelobe reduction (~-40 dB PSL)

#### Kaiser Window (Aggressive)
- Kaiser Beta: 15
- Expected: Strong sidelobe reduction (~-60 dB PSL), significant peak loss

#### Taylor Window
- SLL: -20 dB, N-bar: 14
- Expected: Sidelobes drop to approximately -20 dB

#### Chebyshev Window
- SLL: -30 dB
- Expected: Nearly flat sidelobes at -30 dB

## Browser Compatibility

### Tested Browsers
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### Requirements
- JavaScript enabled
- WebAssembly support
- ~100 MB initial download for Pyodide + NumPy + SciPy
- Modern browser with ES6+ support

## Performance Notes

- **First Load**: 10-30 seconds (downloads Pyodide, NumPy, SciPy)
- **Subsequent Loads**: 2-5 seconds (browser cache)
- **Analysis Execution**: < 1 second for typical parameters
- **Plot Rendering**: < 500ms with Plotly

## Troubleshooting

### "Python environment not ready"
- Wait for initial load to complete
- Check browser console for errors
- Verify internet connection for CDN resources

### Plots not displaying
- Check browser console for JavaScript errors
- Verify Plotly.js loaded successfully
- Try refreshing the page

### Incorrect results
- Verify Python code is executing (check console)
- Try different parameter values
- Compare with MATLAB reference implementation

### Performance issues
- Close other browser tabs
- Clear browser cache
- Use desktop browser instead of mobile

## Development Testing

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] Python environment initializes
- [ ] All window type buttons work
- [ ] All sliders update displayed values
- [ ] Plot range dropdown changes display
- [ ] Run Analysis button executes without errors
- [ ] Plot 1 displays correctly
- [ ] Plot 2 displays correctly
- [ ] Statistics table populates
- [ ] Plots are interactive (zoom, pan, hover)
- [ ] Mobile responsive design works
- [ ] Attribution links work

### Code Quality
- [x] Python syntax validated with py_compile
- [x] JavaScript syntax validated with Node.js
- [x] HTML structure follows Material Design guidelines
- [x] Consistent with registermap_gen tool style
- [x] Attribution to original MATLAB code included

## Future Enhancements

### Additional Examples to Implement
1. Matched Filtering
   - Basic matched filter concepts
   - SNR improvement demonstration
   - Range-Doppler processing

2. Mismatched Filter Length (Least Squares)
   - Variable filter lengths
   - Least squares optimization
   - Trade-offs between length and performance

3. Mismatched Filter Spoiling (Least Squares)
   - Spoiling techniques
   - Constrained optimization
   - Advanced sidelobe control

### Potential Features
- Export plots as images
- Download results as CSV
- Save/load parameter presets
- Tutorial/guided mode
- Comparison with other window types
- 3D ambiguity function plots
- Animation of parameter sweeps

## References

- Original MATLAB Code: https://github.com/SpenceraM/MismatchedFilteringWorkshop
- Pyodide Documentation: https://pyodide.org/
- Material Design Components: https://material.io/components/web
- Plotly.js Documentation: https://plotly.com/javascript/
