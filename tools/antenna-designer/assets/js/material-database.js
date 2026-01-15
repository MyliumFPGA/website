/**
 * Material Database for JLCPCB PCB Materials
 * Contains dielectric constants, loss tangents, and specifications
 */

const MaterialDatabase = {
    materials: {
        'fr4-standard': {
            name: 'Standard FR4 (TG130-140)',
            type: 'FR4',
            dielectricConstant: 4.6,
            lossTangent: 0.02,
            frequency: 1, // MHz reference frequency
            description: 'Standard FR4 material suitable for general purpose applications',
            recommended: {
                minFreq: 0,
                maxFreq: 2000 // MHz
            }
        },
        'fr4-tg155': {
            name: 'FR4 TG155',
            type: 'FR4',
            dielectricConstant: 4.5,
            lossTangent: 0.015,
            frequency: 1, // MHz
            description: 'Higher temperature FR4 with improved performance',
            recommended: {
                minFreq: 0,
                maxFreq: 3000 // MHz
            }
        },
        'fr4-tg170': {
            name: 'FR4 TG170',
            type: 'FR4',
            dielectricConstant: 4.4,
            lossTangent: 0.013,
            frequency: 1, // MHz
            description: 'High temperature FR4 with better electrical properties',
            recommended: {
                minFreq: 0,
                maxFreq: 4000 // MHz
            }
        },
        'ro4003c': {
            name: 'RO4003C',
            type: 'Rogers',
            dielectricConstant: 3.38,
            lossTangent: 0.0027,
            frequency: 10000, // MHz (10 GHz)
            description: 'Low-loss Rogers material for high-frequency applications',
            recommended: {
                minFreq: 1000,
                maxFreq: 20000 // MHz
            }
        },
        'ro4350b': {
            name: 'RO4350B',
            type: 'Rogers',
            dielectricConstant: 3.48,
            lossTangent: 0.0037,
            frequency: 10000, // MHz (10 GHz)
            description: 'Rogers material with good balance of performance and cost',
            recommended: {
                minFreq: 1000,
                maxFreq: 18000 // MHz
            }
        }
    },

    copperThickness: {
        '0.5': {
            oz: 0.5,
            micrometers: 17.5,
            inches: 0.0007,
            description: '0.5 oz (17.5 μm)'
        },
        '1': {
            oz: 1,
            micrometers: 35,
            inches: 0.0014,
            description: '1 oz (35 μm)'
        },
        '2': {
            oz: 2,
            micrometers: 70,
            inches: 0.0028,
            description: '2 oz (70 μm)'
        }
    },

    boardThickness: {
        '0.4': { mm: 0.4, inches: 0.0157 },
        '0.6': { mm: 0.6, inches: 0.0236 },
        '0.8': { mm: 0.8, inches: 0.0315 },
        '1.0': { mm: 1.0, inches: 0.0394 },
        '1.2': { mm: 1.2, inches: 0.0472 },
        '1.6': { mm: 1.6, inches: 0.063 },
        '2.0': { mm: 2.0, inches: 0.0787 }
    },

    manufacturingLimits: {
        minTraceWidth: 0.127, // mm (5 mil)
        minTraceSpacing: 0.127, // mm (5 mil)
        minHoleSize: 0.2, // mm
        recommendedMinTraceWidth: 0.15, // mm for better yields
        recommendedMinSpacing: 0.15 // mm for better yields
    },

    /**
     * Get material properties by ID
     */
    getMaterial: function(materialId) {
        return this.materials[materialId] || this.materials['fr4-standard'];
    },

    /**
     * Get copper thickness data
     */
    getCopperThickness: function(thickness) {
        return this.copperThickness[thickness] || this.copperThickness['1'];
    },

    /**
     * Get board thickness data
     */
    getBoardThickness: function(thickness) {
        return this.boardThickness[thickness] || this.boardThickness['1.6'];
    },

    /**
     * Check if frequency is in recommended range for material
     */
    isFrequencyInRange: function(materialId, frequencyMHz) {
        const material = this.getMaterial(materialId);
        return frequencyMHz >= material.recommended.minFreq && 
               frequencyMHz <= material.recommended.maxFreq;
    },

    /**
     * Get frequency range warning message
     */
    getFrequencyWarning: function(materialId, frequencyMHz) {
        const material = this.getMaterial(materialId);
        if (frequencyMHz < material.recommended.minFreq) {
            return `Frequency below recommended range for ${material.name}. Consider using FR4 for lower frequencies.`;
        }
        if (frequencyMHz > material.recommended.maxFreq) {
            return `Frequency above recommended range for ${material.name}. Consider using Rogers materials for higher frequencies.`;
        }
        return null;
    },

    /**
     * Validate trace dimensions against manufacturing limits
     */
    validateTraceDimensions: function(traceWidth, traceSpacing) {
        const warnings = [];
        const errors = [];

        if (traceWidth < this.manufacturingLimits.minTraceWidth) {
            errors.push(`Trace width (${traceWidth.toFixed(3)} mm) is below minimum (${this.manufacturingLimits.minTraceWidth} mm)`);
        } else if (traceWidth < this.manufacturingLimits.recommendedMinTraceWidth) {
            warnings.push(`Trace width (${traceWidth.toFixed(3)} mm) is below recommended minimum (${this.manufacturingLimits.recommendedMinTraceWidth} mm) - may reduce yield`);
        }

        if (traceSpacing < this.manufacturingLimits.minTraceSpacing) {
            errors.push(`Trace spacing (${traceSpacing.toFixed(3)} mm) is below minimum (${this.manufacturingLimits.minTraceSpacing} mm)`);
        } else if (traceSpacing < this.manufacturingLimits.recommendedMinSpacing) {
            warnings.push(`Trace spacing (${traceSpacing.toFixed(3)} mm) is below recommended minimum (${this.manufacturingLimits.recommendedMinSpacing} mm) - may reduce yield`);
        }

        return { warnings, errors };
    }
};

// Make available globally
window.MaterialDatabase = MaterialDatabase;
