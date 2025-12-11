/**
 * UI Handler for Mismatched Filtering Workshop
 */

let currentExample = 'analyzing-windows';
let currentParams = {
    window_type: 'Kaiser',
    kaiser_beta: 6,
    taylor_sll: -20,
    taylor_nbar: 14,
    cheby_sll: -30,
    plot_range: 12000,
    freq_offset: 90000,
    window_flag: true
};

// Example tab switching
function setupExampleTabs() {
    const tabButtons = document.querySelectorAll('.example-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const example = button.dataset.example;
            switchExample(example);
        });
    });
}

function switchExample(example) {
    currentExample = example;
    
    // Update tab buttons
    document.querySelectorAll('.example-tab').forEach(btn => {
        if (btn.dataset.example === example) {
            btn.classList.add('active');
            btn.classList.remove('mdc-button--outlined');
            btn.classList.add('mdc-button--raised');
        } else {
            btn.classList.remove('active');
            btn.classList.add('mdc-button--outlined');
            btn.classList.remove('mdc-button--raised');
        }
    });
    
    // Update example containers
    document.querySelectorAll('.example-container').forEach(container => {
        if (container.id === `example-${example}`) {
            container.classList.add('active');
            container.style.display = 'block';
        } else {
            container.classList.remove('active');
            container.style.display = 'none';
        }
    });
}

// Window type switching
function setupWindowTypeButtons() {
    const buttons = document.querySelectorAll('.window-type-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const windowType = button.dataset.window;
            selectWindowType(windowType);
        });
    });
}

function selectWindowType(windowType) {
    // Capitalize first letter
    currentParams.window_type = windowType.charAt(0).toUpperCase() + windowType.slice(1);
    
    // Update button states
    document.querySelectorAll('.window-type-btn').forEach(btn => {
        if (btn.dataset.window === windowType) {
            btn.classList.add('active');
            btn.classList.remove('mdc-button--outlined');
            btn.classList.add('mdc-button--raised');
        } else {
            btn.classList.remove('active');
            btn.classList.add('mdc-button--outlined');
            btn.classList.remove('mdc-button--raised');
        }
    });
    
    // Show/hide parameter groups
    document.getElementById('kaiser-params').style.display = 
        windowType === 'kaiser' ? 'block' : 'none';
    document.getElementById('taylor-params').style.display = 
        windowType === 'taylor' ? 'block' : 'none';
    document.getElementById('chebyshev-params').style.display = 
        windowType === 'chebyshev' ? 'block' : 'none';
}

// Parameter controls
function setupParameterControls() {
    // Kaiser beta
    const kaiserBetaSlider = document.getElementById('kaiser-beta');
    const kaiserBetaValue = document.getElementById('kaiser-beta-value');
    kaiserBetaSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        kaiserBetaValue.textContent = value;
        currentParams.kaiser_beta = value;
    });
    
    // Taylor SLL
    const taylorSllSlider = document.getElementById('taylor-sll');
    const taylorSllValue = document.getElementById('taylor-sll-value');
    taylorSllSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        taylorSllValue.textContent = value;
        currentParams.taylor_sll = value;
    });
    
    // Taylor N-bar
    const taylorNbarSlider = document.getElementById('taylor-nbar');
    const taylorNbarValue = document.getElementById('taylor-nbar-value');
    taylorNbarSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        taylorNbarValue.textContent = value;
        currentParams.taylor_nbar = value;
    });
    
    // Chebyshev SLL
    const chebySllSlider = document.getElementById('cheby-sll');
    const chebySllValue = document.getElementById('cheby-sll-value');
    chebySllSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        chebySllValue.textContent = value;
        currentParams.cheby_sll = value;
    });
    
    // Plot range
    const plotRangeSelect = document.getElementById('plot-range');
    const plotRangeValue = document.getElementById('plot-range-value');
    plotRangeSelect.addEventListener('change', (e) => {
        const value = parseFloat(e.target.value);
        plotRangeValue.textContent = value;
        currentParams.plot_range = value;
    });
    
    // Frequency offset
    const freqOffsetSlider = document.getElementById('freq-offset');
    const freqOffsetValue = document.getElementById('freq-offset-value');
    freqOffsetSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        freqOffsetValue.textContent = value;
        currentParams.freq_offset = value;
    });
    
    // Window flag checkbox
    const windowFlagCheckbox = document.getElementById('window-flag');
    windowFlagCheckbox.addEventListener('change', (e) => {
        currentParams.window_flag = e.target.checked;
    });
}

// Run button
function setupRunButton() {
    const runButton = document.getElementById('run-analyzing-windows');
    runButton.addEventListener('click', async () => {
        await runAnalysis();
    });
}

async function runAnalysis() {
    try {
        showNotification('Running analysis...', 'info');
        
        // Run Python analysis
        const results = await runAnalyzingWindows(currentParams);
        
        if (results) {
            displayResults(results);
            showNotification('Analysis complete!', 'success');
        }
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Error running analysis: ' + error.message, 'error');
    }
}

function displayResults(results) {
    const resultsCard = document.getElementById('results-analyzing-windows');
    resultsCard.style.display = 'block';
    
    // Plot 1: Range Response
    const plot1Data = [
        {
            x: results.ranges,
            y: results.y_mf_db,
            name: 'No Window',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#1f77b4', width: 2 }
        },
        {
            x: results.ranges,
            y: results.y_mmf_db,
            name: 'Windowed',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#ff7f0e', width: 2 }
        }
    ];
    
    const plot1Layout = {
        title: `Range Response with ${results.window_type} Window`,
        xaxis: { title: 'Range from Point Target (m)' },
        yaxis: { title: 'Normalized Magnitude (dB)', range: [-100, 0] },
        showlegend: true,
        legend: { x: 0.5, y: 0.98, xanchor: 'center', yanchor: 'top', orientation: 'h' },
        margin: { l: 60, r: 40, t: 60, b: 60 }
    };
    
    Plotly.newPlot('plot-container-1', plot1Data, plot1Layout, { responsive: true });
    
    // Plot 2: Doppler Effect
    const plot2Data = results.window_flag ? [
        {
            x: results.ranges,
            y: results.y_mmf_db,
            name: 'Windowed',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#ff7f0e', width: 2 }
        },
        {
            x: results.ranges,
            y: results.y_dop_db,
            name: 'Windowed with Doppler',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#2ca02c', width: 2 }
        }
    ] : [
        {
            x: results.ranges,
            y: results.y_mf_db,
            name: 'No Window',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#1f77b4', width: 2 }
        },
        {
            x: results.ranges,
            y: results.y_dop_db,
            name: 'No Window with Doppler',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#d62728', width: 2 }
        }
    ];
    
    const ymax = results.window_flag ? 
        Math.max(...results.y_mmf_db.filter(v => !isNaN(v))) : 
        Math.max(...results.y_mf_db.filter(v => !isNaN(v)));
    
    const plot2Layout = {
        title: "Doppler's Effect on Sidelobes",
        xaxis: { title: 'Range (m)' },
        yaxis: { title: 'Normalized Magnitude (dB)', range: [-40, Math.min(ymax + 5, 5)] },
        showlegend: true,
        legend: { x: 0.5, y: 0.98, xanchor: 'center', yanchor: 'top', orientation: 'h' },
        margin: { l: 60, r: 40, t: 60, b: 60 }
    };
    
    Plotly.newPlot('plot-container-2', plot2Data, plot2Layout, { responsive: true });
    
    // Stats table
    const stats = results.stats;
    const tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Matched Filter</th>
                    <th>Mismatched Filter</th>
                    <th>Units</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Range Resolution</td>
                    <td>${stats.matched_filter.range_res.toFixed(2)}</td>
                    <td>${stats.mismatched_filter.range_res.toFixed(2)}</td>
                    <td>m</td>
                </tr>
                <tr>
                    <td>Peak Sidelobe Level (PSL)</td>
                    <td>${stats.matched_filter.psl.toFixed(2)}</td>
                    <td>${stats.mismatched_filter.psl.toFixed(2)}</td>
                    <td>dB</td>
                </tr>
                <tr>
                    <td>Integrated Sidelobe Level (ISL)</td>
                    <td>${stats.matched_filter.isl.toFixed(2)}</td>
                    <td>${stats.mismatched_filter.isl.toFixed(2)}</td>
                    <td>dB</td>
                </tr>
                <tr>
                    <td>Peak Loss</td>
                    <td>${stats.matched_filter.peak_loss.toFixed(2)}</td>
                    <td>${stats.mismatched_filter.peak_loss.toFixed(2)}</td>
                    <td>dB</td>
                </tr>
                <tr>
                    <td>SNR Loss</td>
                    <td>${stats.matched_filter.snr_loss.toFixed(2)}</td>
                    <td>${stats.mismatched_filter.snr_loss.toFixed(2)}</td>
                    <td>dB</td>
                </tr>
            </tbody>
        </table>
    `;
    
    document.getElementById('stats-table').innerHTML = tableHtml;
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupExampleTabs();
    setupWindowTypeButtons();
    setupParameterControls();
    setupRunButton();
});
