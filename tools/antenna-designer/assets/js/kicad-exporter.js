/**
 * KiCad Exporter
 * Generates KiCad PCB files (.kicad_pcb) in S-expression format
 */

const KiCadExporter = {
    /**
     * Generate KiCad PCB file content
     * @param {object} design - Design calculations
     * @param {object} params - Design parameters
     * @returns {string} KiCad PCB file content
     */
    generateKiCadPCB: function(design, params) {
        const material = window.MaterialDatabase.getMaterial(params.materialId);
        const boardThickness = window.MaterialDatabase.getBoardThickness(params.boardThickness);
        const copperThickness = window.MaterialDatabase.getCopperThickness(params.copperThickness);

        // Generate file header
        let pcb = this.generateHeader();
        
        // Add general settings
        pcb += this.generateGeneralSettings();
        
        // Add layers
        pcb += this.generateLayers();
        
        // Add setup (board specs)
        pcb += this.generateSetup(boardThickness, copperThickness);
        
        // Add board outline
        pcb += this.generateBoardOutline(design.boardSize);
        
        // Add spiral antenna traces
        pcb += this.generateSpiralTraces(design, params);
        
        // Add feed point pads
        pcb += this.generateFeedPads(design, params);
        
        // Add text annotations
        pcb += this.generateTextAnnotations(design, params);
        
        // Close the file
        pcb += ')\n';
        
        return pcb;
    },

    /**
     * Generate file header
     */
    generateHeader: function() {
        return `(kicad_pcb (version 20221018) (generator pcb_antenna_designer)

  (general
    (thickness 1.6)
  )

`;
    },

    /**
     * Generate general settings
     */
    generateGeneralSettings: function() {
        return `  (paper "A4")

`;
    },

    /**
     * Generate layer definitions
     */
    generateLayers: function() {
        return `  (layers
    (0 "F.Cu" signal)
    (31 "B.Cu" signal)
    (32 "B.Adhes" user "B.Adhesive")
    (33 "F.Adhes" user "F.Adhesive")
    (34 "B.Paste" user)
    (35 "F.Paste" user)
    (36 "B.SilkS" user "B.Silkscreen")
    (37 "F.SilkS" user "F.Silkscreen")
    (38 "B.Mask" user)
    (39 "F.Mask" user)
    (40 "Dwgs.User" user "User.Drawings")
    (41 "Cmts.User" user "User.Comments")
    (42 "Eco1.User" user "User.Eco1")
    (43 "Eco2.User" user "User.Eco2")
    (44 "Edge.Cuts" user)
    (45 "Margin" user)
    (46 "B.CrtYd" user "B.Courtyard")
    (47 "F.CrtYd" user "F.Courtyard")
    (48 "B.Fab" user)
    (49 "F.Fab" user)
  )

`;
    },

    /**
     * Generate setup section
     */
    generateSetup: function(boardThickness, copperThickness) {
        return `  (setup
    (pad_to_mask_clearance 0)
    (pcbplotparams
      (layerselection 0x00010fc_ffffffff)
      (plot_on_all_layers_selection 0x0000000_00000000)
      (disableapertmacros false)
      (usegerberextensions false)
      (usegerberattributes true)
      (usegerberadvancedattributes true)
      (creategerberjobfile true)
      (dashed_line_dash_ratio 12.000000)
      (dashed_line_gap_ratio 3.000000)
      (svgprecision 4)
      (plotframeref false)
      (viasonmask false)
      (mode 1)
      (useauxorigin false)
      (hpglpennumber 1)
      (hpglpenspeed 20)
      (hpglpendiameter 15.000000)
      (dxfpolygonmode true)
      (dxfimperialunits true)
      (dxfusepcbnewfont true)
      (psnegative false)
      (psa4output false)
      (plotreference true)
      (plotvalue true)
      (plotinvisibletext false)
      (sketchpadsonfab false)
      (subtractmaskfromsilk false)
      (outputformat 1)
      (mirror false)
      (drillshape 1)
      (scaleselection 1)
      (outputdirectory "")
    )
  )

`;
    },

    /**
     * Generate board outline (Edge.Cuts layer)
     */
    generateBoardOutline: function(boardSize) {
        const half = boardSize / 2;
        const cornerRadius = 3;
        
        return `  (gr_rect (start ${-half} ${-half}) (end ${half} ${half})
    (stroke (width 0.1) (type solid)) (fill none) (layer "Edge.Cuts") (tstamp ${this.generateUUID()}))

`;
    },

    /**
     * Generate spiral antenna traces
     */
    generateSpiralTraces: function(design, params) {
        let traces = '';
        
        // Generate spiral arms
        const spiralArms = window.AntennaCalculator.generateTwoArmSpiral(
            design.spiralA,
            design.spiralB,
            design.totalAngle,
            200 // Fewer points for KiCad to keep file size manageable
        );

        // Generate trace segments for arm 1
        traces += this.generateArmTraces(spiralArms.arm1, params.traceWidth, 'F.Cu');
        
        // Generate trace segments for arm 2
        traces += this.generateArmTraces(spiralArms.arm2, params.traceWidth, 'F.Cu');
        
        return traces;
    },

    /**
     * Generate trace segments for one arm
     */
    generateArmTraces: function(points, width, layer) {
        let traces = '';
        const net = 0; // Net number for the trace
        
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            
            traces += `  (segment (start ${p1.x.toFixed(4)} ${p1.y.toFixed(4)}) (end ${p2.x.toFixed(4)} ${p2.y.toFixed(4)})
    (width ${width}) (layer "${layer}") (net ${net}) (tstamp ${this.generateUUID()}))
`;
        }
        
        return traces;
    },

    /**
     * Generate feed point pads
     */
    generateFeedPads: function(design, params) {
        const spiralArms = window.AntennaCalculator.generateTwoArmSpiral(
            design.spiralA,
            design.spiralB,
            design.totalAngle,
            100
        );

        const p1 = spiralArms.arm1[0];
        const p2 = spiralArms.arm2[0];
        const padSize = Math.max(params.traceWidth * 2, 2);

        let pads = `  (footprint "Antenna:Feed_Point" (layer "F.Cu")
    (tstamp ${this.generateUUID()})
    (at ${p1.x.toFixed(4)} ${p1.y.toFixed(4)})
    (fp_text reference "ANT1" (at 0 -3) (layer "F.SilkS")
      (effects (font (size 1 1) (thickness 0.15)))
      (tstamp ${this.generateUUID()})
    )
    (fp_text value "Feed1" (at 0 3) (layer "F.Fab")
      (effects (font (size 1 1) (thickness 0.15)))
      (tstamp ${this.generateUUID()})
    )
    (pad "1" smd circle (at 0 0) (size ${padSize} ${padSize}) (layers "F.Cu" "F.Paste" "F.Mask")
      (tstamp ${this.generateUUID()}))
  )

  (footprint "Antenna:Feed_Point" (layer "F.Cu")
    (tstamp ${this.generateUUID()})
    (at ${p2.x.toFixed(4)} ${p2.y.toFixed(4)})
    (fp_text reference "ANT2" (at 0 -3) (layer "F.SilkS")
      (effects (font (size 1 1) (thickness 0.15)))
      (tstamp ${this.generateUUID()})
    )
    (fp_text value "Feed2" (at 0 3) (layer "F.Fab")
      (effects (font (size 1 1) (thickness 0.15)))
      (tstamp ${this.generateUUID()})
    )
    (pad "2" smd circle (at 0 0) (size ${padSize} ${padSize}) (layers "F.Cu" "F.Paste" "F.Mask")
      (tstamp ${this.generateUUID()}))
  )

`;
        return pads;
    },

    /**
     * Generate text annotations
     */
    generateTextAnnotations: function(design, params) {
        const material = window.MaterialDatabase.getMaterial(params.materialId);
        const y = design.boardSize / 2 - 5;
        
        return `  (gr_text "Spiral Antenna ${params.frequencyMHz} ${params.frequencyUnit}" (at 0 ${-y})
    (layer "F.SilkS") (tstamp ${this.generateUUID()})
    (effects (font (size 1.5 1.5) (thickness 0.3)) (justify center))
  )
  (gr_text "${material.name}" (at 0 ${-y + 3})
    (layer "F.SilkS") (tstamp ${this.generateUUID()})
    (effects (font (size 1 1) (thickness 0.15)) (justify center))
  )
  (gr_text "${params.impedance}Ω" (at 0 ${-y + 6})
    (layer "F.SilkS") (tstamp ${this.generateUUID()})
    (effects (font (size 1 1) (thickness 0.15)) (justify center))
  )

`;
    },

    /**
     * Generate a UUID for KiCad timestamps
     * Uses crypto API when available for better randomness
     */
    generateUUID: function() {
        // Use crypto.randomUUID if available (modern browsers)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        
        // Fallback to crypto.getRandomValues for better randomness than Math.random()
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const array = new Uint8Array(1);
                crypto.getRandomValues(array);
                const r = array[0] % 16;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        // Final fallback to Math.random (less secure but works everywhere)
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Trigger KiCad file download
     */
    downloadKiCad: function(design, params, filename = 'spiral-antenna.kicad_pcb') {
        const content = this.generateKiCadPCB(design, params);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }
};

// Make available globally
window.KiCadExporter = KiCadExporter;
