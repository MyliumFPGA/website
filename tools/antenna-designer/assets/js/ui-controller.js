/**
 * UI Controller
 * Manages user interface interactions and coordinates between modules
 */

const UIController = {
    // Store current design
    currentDesign: null,
    currentParams: null,

    /**
     * Initialize the UI controller
     */
    init: function() {
        this.bindEvents();
        this.updateMaterialProperties();
        this.updateWavelength();
    },

    /**
     * Bind event listeners
     */
    bindEvents: function() {
        // Frequency changes
        document.getElementById('frequency').addEventListener('input', () => this.updateWavelength());
        document.getElementById('frequency-unit').addEventListener('change', () => this.updateWavelength());

        // Material changes
        document.getElementById('material').addEventListener('change', () => this.updateMaterialProperties());
        
        // Antenna type changes
        document.getElementById('antenna-type').addEventListener('change', () => {
            if (this.currentDesign) {
                this.calculateDesign();
            }
        });

        // Calculate button
        document.getElementById('calculate-btn').addEventListener('click', () => this.calculateDesign());

        // Export buttons
        document.getElementById('export-kicad-btn').addEventListener('click', () => this.exportKiCad());
        document.getElementById('export-svg-btn').addEventListener('click', () => this.exportSVG());
        document.getElementById('export-summary-btn').addEventListener('click', () => this.exportSummary());

        // Real-time parameter updates
        const paramInputs = ['board-thickness', 'copper-thickness', 'impedance', 'turns', 'trace-width', 'trace-spacing'];
        paramInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    if (this.currentDesign) {
                        this.calculateDesign();
                    }
                });
            }
        });
    },

    /**
     * Update wavelength display
     */
    updateWavelength: function() {
        const frequency = parseFloat(document.getElementById('frequency').value);
        const unit = document.getElementById('frequency-unit').value;
        
        let frequencyMHz = frequency;
        if (unit === 'GHz') {
            frequencyMHz = frequency * 1000;
        }
        
        const wavelength = window.AntennaCalculator.calculateWavelength(frequencyMHz);
        document.getElementById('wavelength-display').textContent = `${wavelength.toFixed(2)} mm`;
    },

    /**
     * Update material properties display
     */
    updateMaterialProperties: function() {
        const materialId = document.getElementById('material').value;
        const material = window.MaterialDatabase.getMaterial(materialId);
        
        document.getElementById('er-display').textContent = material.dielectricConstant.toFixed(2);
        document.getElementById('loss-tangent-display').textContent = material.lossTangent.toFixed(4);
    },

    /**
     * Get current parameters from form
     */
    getParameters: function() {
        const frequency = parseFloat(document.getElementById('frequency').value);
        const unit = document.getElementById('frequency-unit').value;
        
        let frequencyMHz = frequency;
        if (unit === 'GHz') {
            frequencyMHz = frequency * 1000;
        }

        return {
            frequencyMHz: frequencyMHz,
            frequencyUnit: unit,
            materialId: document.getElementById('material').value,
            boardThickness: parseFloat(document.getElementById('board-thickness').value),
            copperThickness: parseFloat(document.getElementById('copper-thickness').value),
            impedance: parseFloat(document.getElementById('impedance').value),
            turns: parseFloat(document.getElementById('turns').value),
            traceWidth: parseFloat(document.getElementById('trace-width').value),
            traceSpacing: parseFloat(document.getElementById('trace-spacing').value),
            antennaType: document.getElementById('antenna-type').value
        };
    },

    /**
     * Calculate and display antenna design
     */
    calculateDesign: function() {
        try {
            // Get parameters
            const params = this.getParameters();
            this.currentParams = params;

            // Validate design
            const validation = window.AntennaCalculator.validateDesign(params);
            this.displayValidation(validation);

            if (!validation.isValid) {
                return; // Don't proceed if there are errors
            }

            // Calculate design
            const design = window.AntennaCalculator.calculateSpiralAntenna(params);
            this.currentDesign = design;

            // Display results
            this.displayResults(design);

            // Generate preview
            window.SVGGenerator.generatePreview(design, params);

            // Show results and preview cards
            document.getElementById('results-card').style.display = 'block';
            document.getElementById('preview-card').style.display = 'block';
            document.getElementById('export-card').style.display = 'block';

            // Scroll to results
            document.getElementById('results-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (error) {
            console.error('Error calculating design:', error);
            this.showError('An error occurred while calculating the design. Please check your parameters.');
        }
    },

    /**
     * Display calculation results
     */
    displayResults: function(design) {
        document.getElementById('result-eff-wavelength').textContent = `${design.wavelengthEff.toFixed(2)} mm`;
        document.getElementById('result-inner-radius').textContent = `${design.innerRadius.toFixed(2)} mm`;
        document.getElementById('result-outer-radius').textContent = `${design.outerRadius.toFixed(2)} mm`;
        document.getElementById('result-diameter').textContent = `${design.antennaDiameter.toFixed(2)} mm`;
        document.getElementById('result-board-size').textContent = `${design.boardSize.toFixed(0)} × ${design.boardSize.toFixed(0)} mm`;
        document.getElementById('result-feed-width').textContent = `${design.feedWidth.toFixed(2)} mm`;
        
        // Add bandwidth info for log-spiral
        if (design.spiralType === 'logarithmic') {
            // Add bandwidth info to results if not already there
            const resultsGrid = document.querySelector('.results-grid');
            let bandwidthItem = document.getElementById('result-bandwidth-item');
            
            if (!bandwidthItem) {
                bandwidthItem = document.createElement('div');
                bandwidthItem.id = 'result-bandwidth-item';
                bandwidthItem.className = 'result-item';
                bandwidthItem.innerHTML = `
                    <span class="label">Bandwidth (UWB):</span>
                    <span id="result-bandwidth" class="value">-</span>
                `;
                resultsGrid.appendChild(bandwidthItem);
            }
            
            document.getElementById('result-bandwidth').textContent = 
                `${design.minFrequency} - ${design.maxFrequency} MHz (${design.bandwidthRatio}:1)`;
            bandwidthItem.style.display = '';
        } else {
            // Hide bandwidth info for Archimedean
            const bandwidthItem = document.getElementById('result-bandwidth-item');
            if (bandwidthItem) {
                bandwidthItem.style.display = 'none';
            }
        }
    },

    /**
     * Display validation messages
     */
    displayValidation: function(validation) {
        const container = document.getElementById('validation-messages');
        container.innerHTML = '';

        // Show errors
        validation.errors.forEach(error => {
            const div = document.createElement('div');
            div.className = 'validation-message error';
            div.innerHTML = `<i class="material-icons">error</i><span>${error}</span>`;
            container.appendChild(div);
        });

        // Show warnings
        validation.warnings.forEach(warning => {
            const div = document.createElement('div');
            div.className = 'validation-message warning';
            div.innerHTML = `<i class="material-icons">warning</i><span>${warning}</span>`;
            container.appendChild(div);
        });

        // Show success if no issues
        if (validation.isValid && validation.warnings.length === 0) {
            const div = document.createElement('div');
            div.className = 'validation-message success';
            div.innerHTML = `<i class="material-icons">check_circle</i><span>Design validation passed. All parameters are within manufacturing limits.</span>`;
            container.appendChild(div);
        }
    },

    /**
     * Show error message
     */
    showError: function(message) {
        const container = document.getElementById('validation-messages');
        container.innerHTML = `
            <div class="validation-message error">
                <i class="material-icons">error</i>
                <span>${message}</span>
            </div>
        `;
    },

    /**
     * Export to KiCad
     */
    exportKiCad: function() {
        if (!this.currentDesign || !this.currentParams) {
            alert('Please calculate a design first.');
            return;
        }

        const filename = `spiral-antenna-${this.currentParams.frequencyMHz}MHz.kicad_pcb`;
        window.KiCadExporter.downloadKiCad(this.currentDesign, this.currentParams, filename);
    },

    /**
     * Export to SVG
     */
    exportSVG: function() {
        if (!this.currentDesign || !this.currentParams) {
            alert('Please calculate a design first.');
            return;
        }

        const filename = `spiral-antenna-${this.currentParams.frequencyMHz}MHz.svg`;
        window.SVGGenerator.downloadSVG(this.currentDesign, this.currentParams, filename);
    },

    /**
     * Export design summary
     */
    exportSummary: function() {
        if (!this.currentDesign || !this.currentParams) {
            alert('Please calculate a design first.');
            return;
        }

        const summary = this.generateSummary();
        const blob = new Blob([summary], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `spiral-antenna-${this.currentParams.frequencyMHz}MHz-summary.txt`;
        link.click();
        
        URL.revokeObjectURL(url);
    },

    /**
     * Generate design summary text
     */
    generateSummary: function() {
        const params = this.currentParams;
        const design = this.currentDesign;
        const material = window.MaterialDatabase.getMaterial(params.materialId);
        const date = new Date().toISOString().split('T')[0];
        
        const antennaTypeName = params.antennaType === 'logarithmic' ? 
            'Log-Spiral (Ultrawideband)' : 'Archimedean Spiral (Narrowband)';
        
        let bandwidthSection = '';
        if (design.spiralType === 'logarithmic') {
            bandwidthSection = `
BANDWIDTH (ULTRAWIDEBAND)
─────────────────────────────────────────────────────────
Frequency Range:         ${design.minFrequency} - ${design.maxFrequency} MHz
Bandwidth Ratio:         ${design.bandwidthRatio}:1
Center Frequency:        ${params.frequencyMHz} MHz

`;
        }
        
        // Format spiral parameters based on type
        let spiralParamsSection;
        if (design.spiralType === 'logarithmic') {
            spiralParamsSection = `Growth Rate (a):         ${design.spiralGrowthRate.toFixed(4)}
Initial Radius (r0):     ${design.spiralInnerRadius.toFixed(2)} mm`;
        } else {
            spiralParamsSection = `Growth Rate (b):         ${design.spiralB.toFixed(4)} mm/rad
Starting Radius (a):     ${design.spiralA.toFixed(2)} mm`;
        }

        return `PCB SPIRAL ANTENNA DESIGN SUMMARY
Generated: ${date}
Tool: mylium.eu Antenna Designer

═══════════════════════════════════════════════════════════

DESIGN PARAMETERS
─────────────────────────────────────────────────────────
Antenna Type:            ${antennaTypeName}
Target Frequency:        ${params.frequencyMHz} MHz
Material:                ${material.name}
Dielectric Constant:     ${material.dielectricConstant}
Loss Tangent:            ${material.lossTangent}
Board Thickness:         ${params.boardThickness} mm
Copper Thickness:        ${params.copperThickness} oz
Target Impedance:        ${params.impedance} Ω
Number of Turns:         ${params.turns}
Trace Width:             ${params.traceWidth} mm
Trace Spacing:           ${params.traceSpacing} mm

CALCULATED DIMENSIONS
─────────────────────────────────────────────────────────
Free Space Wavelength:   ${design.wavelength.toFixed(2)} mm
Effective Wavelength:    ${design.wavelengthEff.toFixed(2)} mm
Effective Dielectric:    ${design.erEff.toFixed(2)}
Inner Radius:            ${design.innerRadius.toFixed(2)} mm
Outer Radius:            ${design.outerRadius.toFixed(2)} mm
Antenna Diameter:        ${design.antennaDiameter.toFixed(2)} mm
Recommended Board Size:  ${design.boardSize.toFixed(0)} × ${design.boardSize.toFixed(0)} mm
Feed Point Width:        ${design.feedWidth.toFixed(2)} mm
Total Trace Length:      ${design.totalLength.toFixed(2)} mm

${bandwidthSection}SPIRAL PARAMETERS
─────────────────────────────────────────────────────────
Spiral Type:             ${design.spiralType === 'logarithmic' ? 'Logarithmic (Equiangular)' : 'Archimedean'} (two-arm)
${spiralParamsSection}
Total Angle:             ${(design.totalAngle / Math.PI).toFixed(2)} π rad

MANUFACTURING NOTES
─────────────────────────────────────────────────────────
✓ Design optimized for JLCPCB fabrication
✓ All dimensions within manufacturing capabilities
✓ Minimum trace/space: 0.127mm (5 mil) capable
✓ Feed points marked as SMD pads for easy connection

PERFORMANCE NOTES
─────────────────────────────────────────────────────────
• Spiral antennas are ${design.spiralType === 'logarithmic' ? 'ultrawideband' : 'broadband'} and circularly polarized
${design.spiralType === 'logarithmic' ? 
`• Log-spiral provides true ultrawideband performance (3:1 or greater)
• Frequency-independent impedance characteristics
• Excellent for UWB applications (3.1-10.6 GHz)` :
`• Expected bandwidth: ±20-30% around center frequency`}
• Radiation pattern: nearly omnidirectional
• Best performance when mounted on ground plane or in free space
• Feed impedance may require matching network

ASSEMBLY INSTRUCTIONS
─────────────────────────────────────────────────────────
1. Fabricate PCB using specified material and thickness
2. Connect coaxial feed between the two feed points
3. Center conductor to one arm, shield to other arm
4. Consider adding balun for balanced feed
5. Test with VNA for impedance matching
6. Adjust matching network if needed

═══════════════════════════════════════════════════════════
Generated by mylium.eu PCB Antenna Designer
https://www.mylium.eu/tools/antenna-designer/
`;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UIController.init());
} else {
    UIController.init();
}

// Make available globally
window.UIController = UIController;
