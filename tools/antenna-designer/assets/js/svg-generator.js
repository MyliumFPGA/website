/**
 * SVG Generator
 * Generates SVG visualizations of the antenna design
 */

const SVGGenerator = {
    /**
     * Generate preview SVG in the page
     * @param {object} design - Design calculations
     * @param {object} params - Design parameters
     */
    generatePreview: function(design, params) {
        const svg = document.getElementById('antenna-preview');
        if (!svg) return;

        // Clear existing content
        svg.innerHTML = '';

        // Calculate viewBox based on outer radius
        const margin = 10;
        const size = design.outerRadius * 2 + margin * 2;
        svg.setAttribute('viewBox', `${-size/2} ${-size/2} ${size} ${size}`);

        // Draw PCB substrate (green background)
        const boardRadius = design.outerRadius + margin;
        const substrate = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        substrate.setAttribute('cx', '0');
        substrate.setAttribute('cy', '0');
        substrate.setAttribute('r', boardRadius);
        substrate.setAttribute('fill', '#4CAF50');
        substrate.setAttribute('opacity', '0.3');
        svg.appendChild(substrate);

        // Generate spiral arms based on type
        let spiralArms;
        if (design.spiralType === 'logarithmic') {
            spiralArms = window.AntennaCalculator.generateTwoArmLogSpiral(
                design.spiralInnerRadius,
                design.spiralGrowthRate,
                design.totalAngle,
                500
            );
        } else {
            spiralArms = window.AntennaCalculator.generateTwoArmSpiral(
                design.spiralA,
                design.spiralB,
                design.totalAngle,
                500
            );
        }

        // Draw first arm (gold copper)
        this.drawSpiralArm(svg, spiralArms.arm1, params.traceWidth, '#d4af37');
        
        // Draw second arm
        this.drawSpiralArm(svg, spiralArms.arm2, params.traceWidth, '#d4af37');

        // Draw feed points (red dots)
        this.drawFeedPoint(svg, spiralArms.arm1[0], params.traceWidth);
        this.drawFeedPoint(svg, spiralArms.arm2[0], params.traceWidth);

        // Draw center point
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('cx', '0');
        center.setAttribute('cy', '0');
        center.setAttribute('r', '0.5');
        center.setAttribute('fill', '#333');
        svg.appendChild(center);

        // Add dimension annotations
        this.addDimensionAnnotations(svg, design);
    },

    /**
     * Draw a spiral arm
     */
    drawSpiralArm: function(svg, points, width, color) {
        if (points.length < 2) return;

        // Create path
        let pathData = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            pathData += ` L ${points[i].x} ${points[i].y}`;
        }

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', width);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
    },

    /**
     * Draw feed point marker
     */
    drawFeedPoint: function(svg, point, width) {
        const feedPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        feedPoint.setAttribute('cx', point.x);
        feedPoint.setAttribute('cy', point.y);
        feedPoint.setAttribute('r', width * 1.5);
        feedPoint.setAttribute('fill', '#ff4444');
        feedPoint.setAttribute('stroke', '#cc0000');
        feedPoint.setAttribute('stroke-width', '0.2');
        svg.appendChild(feedPoint);
    },

    /**
     * Add dimension annotations
     */
    addDimensionAnnotations: function(svg, design) {
        // Draw outer radius dimension line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', '0');
        line.setAttribute('x2', design.outerRadius);
        line.setAttribute('y2', '0');
        line.setAttribute('stroke', '#666');
        line.setAttribute('stroke-width', '0.3');
        line.setAttribute('stroke-dasharray', '1,1');
        svg.appendChild(line);

        // Add text label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', design.outerRadius / 2);
        text.setAttribute('y', '-2');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '3');
        text.setAttribute('fill', '#333');
        text.textContent = `R=${design.outerRadius.toFixed(1)}mm`;
        svg.appendChild(text);
    },

    /**
     * Generate downloadable SVG file
     * @param {object} design - Design calculations
     * @param {object} params - Design parameters
     * @returns {string} SVG content as string
     */
    generateDownloadableSVG: function(design, params) {
        const margin = 20;
        const size = design.boardSize;
        const center = size / 2;

        let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}mm" height="${size}mm" viewBox="0 0 ${size} ${size}">
    <defs>
        <style>
            .substrate { fill: #4CAF50; opacity: 0.3; }
            .copper { stroke: #d4af37; fill: none; stroke-linecap: round; stroke-linejoin: round; }
            .feed { fill: #ff4444; stroke: #cc0000; stroke-width: 0.3; }
            .dimension { stroke: #666; stroke-width: 0.4; stroke-dasharray: 2,2; fill: none; }
            .text { font-family: Arial, sans-serif; font-size: 4px; fill: #333; }
            .title { font-family: Arial, sans-serif; font-size: 6px; fill: #333; font-weight: bold; }
        </style>
    </defs>
    
    <!-- Title -->
    <text x="${center}" y="10" class="title" text-anchor="middle">PCB Spiral Antenna Design</text>
    
    <!-- Board outline -->
    <rect x="${margin}" y="${margin}" width="${size - 2*margin}" height="${size - 2*margin}" 
          class="substrate" rx="2"/>
    
    <!-- Substrate circle -->
    <circle cx="${center}" cy="${center}" r="${design.outerRadius + 5}" class="substrate"/>
`;

        // Generate spiral arms based on type
        let spiralArms;
        if (design.spiralType === 'logarithmic') {
            spiralArms = window.AntennaCalculator.generateTwoArmLogSpiral(
                design.spiralInnerRadius,
                design.spiralGrowthRate,
                design.totalAngle,
                500
            );
        } else {
            spiralArms = window.AntennaCalculator.generateTwoArmSpiral(
                design.spiralA,
                design.spiralB,
                design.totalAngle,
                500
            );
        }

        // Draw first arm
        svg += this.generateSpiralPath(spiralArms.arm1, center, center, params.traceWidth);
        
        // Draw second arm
        svg += this.generateSpiralPath(spiralArms.arm2, center, center, params.traceWidth);

        // Draw feed points
        svg += `    <!-- Feed Points -->
    <circle cx="${center + spiralArms.arm1[0].x}" cy="${center + spiralArms.arm1[0].y}" 
            r="${params.traceWidth * 1.5}" class="feed"/>
    <circle cx="${center + spiralArms.arm2[0].x}" cy="${center + spiralArms.arm2[0].y}" 
            r="${params.traceWidth * 1.5}" class="feed"/>
    
    <!-- Center point -->
    <circle cx="${center}" cy="${center}" r="0.8" fill="#333"/>
`;

        // Add dimensions and annotations
        svg += this.generateDimensionAnnotations(design, center, size);

        // Add legend and specifications
        svg += this.generateLegend(design, params, size);

        svg += '</svg>';
        return svg;
    },

    /**
     * Generate spiral path for SVG
     */
    generateSpiralPath: function(points, offsetX, offsetY, width) {
        if (points.length < 2) return '';

        let path = `    <!-- Spiral Arm -->\n    <path class="copper" stroke-width="${width}" d="`;
        path += `M ${offsetX + points[0].x} ${offsetY + points[0].y}`;
        
        for (let i = 1; i < points.length; i++) {
            path += ` L ${offsetX + points[i].x} ${offsetY + points[i].y}`;
        }
        
        path += '"/>\n';
        return path;
    },

    /**
     * Generate dimension annotations for downloadable SVG
     */
    generateDimensionAnnotations: function(design, center, boardSize) {
        let annotations = `    <!-- Dimensions -->\n`;
        
        // Outer radius dimension
        annotations += `    <line x1="${center}" y1="${center}" x2="${center + design.outerRadius}" y2="${center}" class="dimension"/>
    <text x="${center + design.outerRadius/2}" y="${center - 3}" class="text" text-anchor="middle">
        R outer = ${design.outerRadius.toFixed(2)} mm
    </text>
`;

        // Inner radius dimension
        annotations += `    <line x1="${center}" y1="${center}" x2="${center + design.innerRadius}" y2="${center + design.innerRadius}" class="dimension"/>
    <text x="${center + design.innerRadius * 0.7}" y="${center + design.innerRadius * 0.7 - 1}" class="text" text-anchor="middle">
        R inner = ${design.innerRadius.toFixed(2)} mm
    </text>
`;

        // Diameter dimension
        annotations += `    <line x1="${center - design.outerRadius}" y1="${boardSize - 15}" 
          x2="${center + design.outerRadius}" y2="${boardSize - 15}" class="dimension"/>
    <text x="${center}" y="${boardSize - 12}" class="text" text-anchor="middle">
        Diameter = ${design.antennaDiameter.toFixed(2)} mm
    </text>
`;

        return annotations;
    },

    /**
     * Generate legend and specifications
     */
    generateLegend: function(design, params, boardSize) {
        const x = 10;
        const y = boardSize - 60;
        
        let legend = `    <!-- Legend and Specifications -->\n`;
        legend += `    <rect x="${x}" y="${y}" width="80" height="50" fill="white" stroke="#333" stroke-width="0.5" opacity="0.9" rx="2"/>\n`;
        
        // frequencyMHz is stored in MHz; convert to the selected display unit if needed
        const rawFrequencyMHz = params.frequencyMHz;
        const frequencyUnit = params.frequencyUnit || 'MHz';
        let frequencyDisplayValue = rawFrequencyMHz;

        if (frequencyUnit === 'GHz') {
            frequencyDisplayValue = rawFrequencyMHz / 1000;
        }
        
        const antennaTypeName = design.spiralType === 'logarithmic' ? 
            'Log-Spiral (UWB)' : 'Archimedean';

        const specs = [
            `Type: ${antennaTypeName}`,
            `Frequency: ${frequencyDisplayValue} ${frequencyUnit}`,
            `Material: ${design.material}`,
            `Turns: ${params.turns}`,
            `Trace: ${params.traceWidth} mm`,
            `Impedance: ${params.impedance} Ω`
        ];

        let textY = y + 8;
        specs.forEach(spec => {
            legend += `    <text x="${x + 5}" y="${textY}" class="text">${spec}</text>\n`;
            textY += 7;
        });

        return legend;
    },

    /**
     * Trigger SVG download
     */
    downloadSVG: function(design, params, filename = 'antenna-design.svg') {
        const svgContent = this.generateDownloadableSVG(design, params);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }
};

// Make available globally
window.SVGGenerator = SVGGenerator;
