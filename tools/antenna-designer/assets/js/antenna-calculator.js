/**
 * Antenna Calculator
 * Calculates spiral antenna dimensions based on input parameters
 */

const AntennaCalculator = {
    // Physical constants
    SPEED_OF_LIGHT: 299792458, // m/s

    /**
     * Calculate free space wavelength
     * @param {number} frequencyMHz - Frequency in MHz
     * @returns {number} Wavelength in mm
     */
    calculateWavelength: function(frequencyMHz) {
        const frequencyHz = frequencyMHz * 1e6;
        const wavelengthM = this.SPEED_OF_LIGHT / frequencyHz;
        return wavelengthM * 1000; // Convert to mm
    },

    /**
     * Calculate effective dielectric constant for microstrip
     * Uses approximate formula for microstrip lines
     * @param {number} er - Relative dielectric constant
     * @param {number} h - Substrate thickness (mm)
     * @param {number} w - Trace width (mm)
     * @returns {number} Effective dielectric constant
     */
    calculateEffectiveDielectric: function(er, h, w) {
        // Hammerstad and Jensen approximation for microstrip effective dielectric constant
        const u = w / h;
        // Constants from Hammerstad and Jensen empirical formulas
        const a = 1 + (1/49) * Math.log((Math.pow(u, 4) + Math.pow(u/52, 2)) / (Math.pow(u, 4) + 0.432));
        const b = 1 + (1/18.7) * Math.log(1 + Math.pow(u/18.1, 3));
        
        const erEff = (er + 1) / 2 + ((er - 1) / 2) * Math.pow(1 + 10/u, -a * b);
        return erEff;
    },

    /**
     * Calculate effective wavelength in substrate
     * @param {number} wavelength - Free space wavelength (mm)
     * @param {number} erEff - Effective dielectric constant
     * @returns {number} Effective wavelength (mm)
     */
    calculateEffectiveWavelength: function(wavelength, erEff) {
        return wavelength / Math.sqrt(erEff);
    },

    /**
     * Calculate microstrip line width for target impedance
     * Uses Wheeler's formulas
     * @param {number} z0 - Target impedance (ohms)
     * @param {number} er - Dielectric constant
     * @param {number} h - Substrate thickness (mm)
     * @returns {number} Trace width (mm)
     */
    calculateMicrostripWidth: function(z0, er, h) {
        // Wheeler's synthesis formulas for microstrip line width
        // Synthesis formulas to calculate width for target impedance
        const A = (z0 / 60) * Math.sqrt((er + 1) / 2) + ((er - 1) / (er + 1)) * (0.23 + 0.11 / er);
        
        let w_h;
        if (A > 1.52) {
            // Wide strip approximation
            w_h = (8 * Math.exp(A)) / (Math.exp(2 * A) - 2);
        } else {
            // Narrow strip approximation
            const numerator = 2 * (A - 1);
            const denominator = Math.PI - Math.log(2 * Math.PI - 1) + ((er - 1) / (2 * er)) * (Math.log(Math.PI - 1) + 0.39 - 0.61 / er);
            w_h = numerator / denominator;
        }
        
        return w_h * h;
    },

    /**
     * Calculate log-spiral antenna dimensions (Ultrawideband)
     * @param {object} params - Design parameters
     * @returns {object} Calculated antenna dimensions
     */
    calculateLogSpiralAntenna: function(params) {
        const {
            frequencyMHz,
            materialId,
            boardThickness,
            copperThickness,
            impedance,
            turns,
            traceWidth
        } = params;

        // Get material properties
        const material = window.MaterialDatabase.getMaterial(materialId);
        const er = material.dielectricConstant;

        // Calculate wavelengths
        const wavelength = this.calculateWavelength(frequencyMHz);
        
        // Calculate effective dielectric constant
        const erEff = this.calculateEffectiveDielectric(er, boardThickness, traceWidth);
        
        // Calculate effective wavelength
        const wavelengthEff = this.calculateEffectiveWavelength(wavelength, erEff);

        // Log-spiral parameters
        // Growth rate for log-spiral (typically 0.22 to 0.3 for UWB)
        const growthRate = 0.25; // This gives good UWB performance
        
        // Inner radius - start at λ_min/20 for UWB coverage
        // For UWB, we want to cover 3:1 or greater bandwidth
        const innerRadius = wavelengthEff / 20;
        
        // Outer radius based on turns and growth rate
        // For log-spiral: r = r0 * exp(a * θ)
        const totalAngle = turns * 2 * Math.PI;
        const outerRadius = innerRadius * Math.exp(growthRate * totalAngle);

        // Calculate total antenna diameter
        const antennaDiameter = 2 * outerRadius;
        
        // Recommended board size (add 10mm margin on each side)
        const boardSize = antennaDiameter + 20;

        // Calculate feed point trace width for impedance matching
        const feedWidth = this.calculateMicrostripWidth(impedance, er, boardThickness);

        // Calculate total trace length (approximate)
        let totalLength = 0;
        const steps = 1000;
        const dTheta = totalAngle / steps;
        for (let i = 0; i < steps; i++) {
            const theta1 = i * dTheta;
            const theta2 = (i + 1) * dTheta;
            const r1 = innerRadius * Math.exp(growthRate * theta1);
            const r2 = innerRadius * Math.exp(growthRate * theta2);
            const dx = r2 * Math.cos(theta2) - r1 * Math.cos(theta1);
            const dy = r2 * Math.sin(theta2) - r1 * Math.sin(theta1);
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }

        // Calculate bandwidth (log-spiral typically provides 3:1 or better)
        const bandwidthRatio = Math.exp(growthRate * totalAngle);
        const minFrequency = frequencyMHz / bandwidthRatio;
        const maxFrequency = frequencyMHz * bandwidthRatio;

        return {
            wavelength,
            wavelengthEff,
            erEff,
            innerRadius,
            outerRadius,
            antennaDiameter,
            boardSize,
            feedWidth,
            totalLength,
            spiralType: 'logarithmic',
            spiralGrowthRate: growthRate,
            spiralInnerRadius: innerRadius,
            totalAngle,
            material: material.name,
            bandwidthRatio: bandwidthRatio.toFixed(2),
            minFrequency: minFrequency.toFixed(0),
            maxFrequency: maxFrequency.toFixed(0)
        };
    },

    /**
     * Calculate spiral antenna dimensions
     * @param {object} params - Design parameters
     * @returns {object} Calculated antenna dimensions
     */
    calculateSpiralAntenna: function(params) {
        const {
            frequencyMHz,
            materialId,
            boardThickness,
            copperThickness,
            impedance,
            turns,
            traceWidth,
            antennaType
        } = params;

        // Route to appropriate calculator based on antenna type
        if (antennaType === 'logarithmic') {
            return this.calculateLogSpiralAntenna(params);
        }

        // Continue with Archimedean spiral calculation
        // Get material properties
        const material = window.MaterialDatabase.getMaterial(materialId);
        const er = material.dielectricConstant;

        // Calculate wavelengths
        const wavelength = this.calculateWavelength(frequencyMHz);
        
        // Calculate effective dielectric constant
        const erEff = this.calculateEffectiveDielectric(er, boardThickness, traceWidth);
        
        // Calculate effective wavelength
        const wavelengthEff = this.calculateEffectiveWavelength(wavelength, erEff);

        // Calculate spiral dimensions
        // Inner radius typically λ/20 to λ/10
        const innerRadius = wavelengthEff / 15;
        
        // Outer radius based on frequency and number of turns
        // For Archimedean spiral: r = a + b*θ
        // Typically outer radius is around λ/4 to λ/2
        const outerRadius = wavelengthEff / 3;
        
        // Calculate spiral parameters
        const totalAngle = turns * 2 * Math.PI;
        const b = (outerRadius - innerRadius) / totalAngle; // Growth rate
        const a = innerRadius; // Starting radius

        // Calculate total antenna diameter
        const antennaDiameter = 2 * outerRadius;
        
        // Recommended board size (add 10mm margin on each side)
        const boardSize = antennaDiameter + 20;

        // Calculate feed point trace width for impedance matching
        const feedWidth = this.calculateMicrostripWidth(impedance, er, boardThickness);

        // Calculate total trace length (approximate)
        let totalLength = 0;
        const steps = 1000;
        const dTheta = totalAngle / steps;
        for (let i = 0; i < steps; i++) {
            const theta1 = i * dTheta;
            const theta2 = (i + 1) * dTheta;
            const r1 = a + b * theta1;
            const r2 = a + b * theta2;
            const dx = r2 * Math.cos(theta2) - r1 * Math.cos(theta1);
            const dy = r2 * Math.sin(theta2) - r1 * Math.sin(theta1);
            totalLength += Math.sqrt(dx * dx + dy * dy);
        }

        return {
            wavelength,
            wavelengthEff,
            erEff,
            innerRadius,
            outerRadius,
            antennaDiameter,
            boardSize,
            feedWidth,
            totalLength,
            spiralType: 'archimedean',
            spiralA: a,
            spiralB: b,
            totalAngle,
            material: material.name
        };
    },

    /**
     * Generate log-spiral points for rendering
     * @param {number} r0 - Initial radius
     * @param {number} a - Growth rate
     * @param {number} totalAngle - Total angle in radians
     * @param {number} steps - Number of points to generate
     * @returns {Array} Array of {x, y} points
     */
    generateLogSpiralPoints: function(r0, a, totalAngle, steps = 500) {
        const points = [];
        const dTheta = totalAngle / steps;
        
        for (let i = 0; i <= steps; i++) {
            const theta = i * dTheta;
            const r = r0 * Math.exp(a * theta);
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            points.push({ x, y });
        }
        
        return points;
    },

    /**
     * Generate two-arm log-spiral points
     * @param {number} r0 - Initial radius
     * @param {number} a - Growth rate
     * @param {number} totalAngle - Total angle in radians
     * @param {number} steps - Number of points per arm
     * @returns {object} Object with arm1 and arm2 point arrays
     */
    generateTwoArmLogSpiral: function(r0, a, totalAngle, steps = 500) {
        const arm1 = this.generateLogSpiralPoints(r0, a, totalAngle, steps);
        
        // Second arm is 180 degrees offset
        const arm2 = [];
        const dTheta = totalAngle / steps;
        
        for (let i = 0; i <= steps; i++) {
            const theta = i * dTheta + Math.PI; // 180 degree offset
            const r = r0 * Math.exp(a * theta);
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            arm2.push({ x, y });
        }
        
        return { arm1, arm2 };
    },

    /**
     * Generate spiral points for rendering
     * @param {number} a - Spiral parameter a
     * @param {number} b - Spiral parameter b
     * @param {number} totalAngle - Total angle in radians
     * @param {number} steps - Number of points to generate
     * @returns {Array} Array of {x, y} points
     */
    generateSpiralPoints: function(a, b, totalAngle, steps = 500) {
        const points = [];
        const dTheta = totalAngle / steps;
        
        for (let i = 0; i <= steps; i++) {
            const theta = i * dTheta;
            const r = a + b * theta;
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            points.push({ x, y });
        }
        
        return points;
    },

    /**
     * Generate two-arm spiral points (both arms of the antenna)
     * @param {number} a - Spiral parameter a
     * @param {number} b - Spiral parameter b
     * @param {number} totalAngle - Total angle in radians
     * @param {number} steps - Number of points per arm
     * @returns {object} Object with arm1 and arm2 point arrays
     */
    generateTwoArmSpiral: function(a, b, totalAngle, steps = 500) {
        const arm1 = this.generateSpiralPoints(a, b, totalAngle, steps);
        
        // Second arm is 180 degrees offset
        const arm2 = [];
        const dTheta = totalAngle / steps;
        
        for (let i = 0; i <= steps; i++) {
            const theta = i * dTheta + Math.PI; // 180 degree offset
            const r = a + b * theta;
            const x = r * Math.cos(theta);
            const y = r * Math.sin(theta);
            arm2.push({ x, y });
        }
        
        return { arm1, arm2 };
    },

    /**
     * Validate design parameters
     * @param {object} params - Design parameters
     * @returns {object} Validation result with warnings and errors
     */
    validateDesign: function(params) {
        const warnings = [];
        const errors = [];

        // Validate trace dimensions
        const traceValidation = window.MaterialDatabase.validateTraceDimensions(
            params.traceWidth,
            params.traceSpacing
        );
        warnings.push(...traceValidation.warnings);
        errors.push(...traceValidation.errors);

        // Validate frequency range
        const freqWarning = window.MaterialDatabase.getFrequencyWarning(
            params.materialId,
            params.frequencyMHz
        );
        if (freqWarning) {
            warnings.push(freqWarning);
        }

        // Check if turns are reasonable
        if (params.turns < 1 || params.turns > 5) {
            warnings.push(`Number of turns (${params.turns}) is unusual. Typically 1.5-3 turns work best.`);
        }

        return {
            isValid: errors.length === 0,
            warnings,
            errors
        };
    }
};

// Make available globally
window.AntennaCalculator = AntennaCalculator;
