/**
 * Pyodide Loader for Mismatched Filtering Workshop
 */

let pyodide = null;
let pythonReady = false;

async function loadPyodideAndPackages() {
    try {
        // Load Pyodide
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/"
        });
        
        console.log("Pyodide loaded successfully");
        
        // Load required packages
        await pyodide.loadPackage(['numpy', 'scipy']);
        console.log("NumPy and SciPy loaded");
        
        // Load the Python signal processing module
        const response = await fetch('assets/python/signal_processing.py');
        const pythonCode = await response.text();
        await pyodide.runPythonAsync(pythonCode);
        
        console.log("Signal processing module loaded");
        
        pythonReady = true;
        
        // Hide loading indicator
        document.getElementById('loading-pyodide').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // Show version info
        const versionSpan = document.getElementById('tool-version');
        if (versionSpan) {
            versionSpan.textContent = 'Python ' + pyodide.runPython('import sys; sys.version.split()[0]');
        }
        
        showNotification('Python environment ready!', 'success');
        
    } catch (error) {
        console.error("Error loading Pyodide:", error);
        showNotification('Error loading Python environment: ' + error.message, 'error');
        document.getElementById('loading-pyodide').innerHTML = `
            <p class="mdc-typography--body1" style="color: red;">
                Failed to load Python environment. Please refresh the page to try again.
            </p>
            <p class="mdc-typography--body2">${error.message}</p>
        `;
    }
}

async function runPythonCode(code) {
    if (!pythonReady) {
        showNotification('Python environment not ready yet. Please wait...', 'warning');
        return null;
    }
    
    try {
        const result = await pyodide.runPythonAsync(code);
        return result;
    } catch (error) {
        console.error("Python execution error:", error);
        showNotification('Error executing Python code: ' + error.message, 'error');
        throw error;
    }
}

async function runAnalyzingWindows(params) {
    if (!pythonReady) {
        showNotification('Python environment not ready. Please wait...', 'warning');
        return null;
    }
    
    try {
        // Build Python function call
        const pythonCall = `
import json
result = run_analyzing_windows_example(
    window_type='${params.window_type}',
    kaiser_beta=${params.kaiser_beta},
    taylor_sll=${params.taylor_sll},
    taylor_nbar=${params.taylor_nbar},
    cheby_sll=${params.cheby_sll},
    plot_range=${params.plot_range},
    freq_offset=${params.freq_offset},
    window_flag=${params.window_flag ? 'True' : 'False'}
)
json.dumps(result)
`;
        
        const resultJson = await pyodide.runPythonAsync(pythonCall);
        return JSON.parse(resultJson);
        
    } catch (error) {
        console.error("Error running analysis:", error);
        showNotification('Error running analysis: ' + error.message, 'error');
        throw error;
    }
}

// Initialize Pyodide when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPyodideAndPackages();
});
