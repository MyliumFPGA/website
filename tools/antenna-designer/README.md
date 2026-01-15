# PCB Spiral Antenna Designer

A web-based tool for designing spiral antennas optimized for PCB fabrication using JLCPCB materials and manufacturing capabilities.

## Overview

This tool generates Archimedean spiral antenna designs with automatic calculation of dimensions based on target frequency, material properties, and PCB specifications. It provides KiCad PCB file exports and SVG drawings for documentation.

## Features

- **Frequency-based Design**: Automatically calculates antenna dimensions from target frequency
- **JLCPCB Material Database**: Pre-configured with FR4 and Rogers material properties
- **Real-time Validation**: Checks against JLCPCB manufacturing constraints
- **Multiple Export Formats**:
  - KiCad PCB files (.kicad_pcb) ready for fabrication
  - SVG drawings with dimensions and annotations
  - Text summary with complete design specifications
- **Interactive Preview**: Real-time visualization of antenna design
- **Impedance Matching**: Automatic feed point trace width calculation
- **Manufacturing Validation**: Ensures designs meet minimum trace width/spacing requirements

## How to Use

### 1. Enter Target Frequency

- Input your desired operating frequency
- Choose units (MHz or GHz)
- The tool automatically calculates the free-space wavelength

### 2. Select PCB Material

Choose from JLCPCB-available materials:

**FR4 Grades** (suitable for frequencies up to ~4 GHz):
- Standard FR4 (TG130-140): εr = 4.6, tan δ = 0.02
- FR4 TG155: εr = 4.5, tan δ = 0.015
- FR4 TG170: εr = 4.4, tan δ = 0.013

**Rogers Materials** (for high-frequency applications):
- RO4003C: εr = 3.38, tan δ = 0.0027 @ 10 GHz
- RO4350B: εr = 3.48, tan δ = 0.0037 @ 10 GHz

### 3. Configure PCB Specifications

**Board Thickness**: Choose from 0.4mm to 2.0mm
- Standard: 1.6mm
- Thinner boards (0.8-1.0mm) can improve high-frequency performance

**Copper Thickness**: 0.5 oz, 1 oz, or 2 oz
- Standard: 1 oz (35 μm)
- Thicker copper for higher current capacity

### 4. Set Antenna Parameters

**Target Impedance**: 50Ω (standard) or 75Ω
- Most RF systems use 50Ω
- Some video/cable systems use 75Ω

**Number of Turns**: 1-5 turns
- Typical: 1.5-3 turns
- More turns = wider bandwidth
- Fewer turns = smaller size

**Trace Width & Spacing**:
- Minimum: 0.127mm (5 mil) for JLCPCB
- Recommended: ≥0.15mm for better yield
- Adjust based on frequency and impedance requirements

### 5. Calculate and Review

Click "Calculate Design" to:
- Compute antenna dimensions
- Validate against manufacturing limits
- Generate real-time preview
- Display warnings if any parameters are outside recommended ranges

### 6. Export Your Design

**KiCad PCB File**:
- Ready to import into KiCad 6+
- Includes spiral traces, feed pads, and board outline
- Text annotations on silkscreen layer

**SVG Drawing**:
- Scaled technical drawing with dimensions
- Includes design specifications legend
- Suitable for documentation and presentations

**Design Summary**:
- Complete text file with all parameters
- Manufacturing notes and assembly instructions
- Performance characteristics

## Design Theory

### Archimedean Spiral

The tool generates two-arm Archimedean spiral antennas with the equation:

```
r = a + b·θ
```

Where:
- `r` is the radius at angle θ
- `a` is the starting radius (inner radius)
- `b` is the growth rate
- `θ` is the angle in radians

### Key Calculations

**Effective Wavelength**:
```
λeff = λ0 / √εeff
```
Where εeff is the effective dielectric constant accounting for substrate effects.

**Spiral Dimensions**:
- Inner radius: λeff / 15 (typical)
- Outer radius: λeff / 3 (typical)
- Total diameter: 2 × outer radius

**Feed Point Design**:
- Microstrip line width calculated for target impedance
- Uses Wheeler's synthesis formulas
- Accounts for substrate thickness and dielectric constant

### Antenna Characteristics

**Bandwidth**: Spiral antennas are inherently broadband
- Typical: ±20-30% around center frequency
- Can be extended with proper feed design

**Polarization**: Circular polarization
- Right-hand or left-hand depending on feed
- Axial ratio typically 3-6 dB

**Radiation Pattern**: Nearly omnidirectional
- Maximum gain in broadside direction
- Typical gain: 3-5 dBi

**Feed Impedance**: Frequency-dependent
- Design targets 50Ω or 75Ω at center frequency
- May require matching network for optimal VSWR

## Material Selection Guide

### When to Use FR4

✅ Frequencies below 3-4 GHz
✅ Cost-sensitive applications
✅ Prototyping and development
✅ General-purpose antennas

### When to Use Rogers Materials

✅ Frequencies above 3 GHz
✅ Low-loss requirements
✅ Stable performance over temperature
✅ Precision impedance control
✅ High-reliability applications

### Dielectric Constant Impact

**Higher εr (FR4 ~4.5)**:
- Smaller antenna size
- Lower bandwidth
- Higher substrate loss

**Lower εr (Rogers ~3.4)**:
- Larger antenna size
- Wider bandwidth
- Lower loss
- Better efficiency

## Manufacturing Considerations

### JLCPCB Capabilities

**Minimum Specifications**:
- Trace width: 0.127mm (5 mil)
- Trace spacing: 0.127mm (5 mil)
- Minimum hole: 0.2mm

**Recommended for Better Yield**:
- Trace width: ≥0.15mm
- Trace spacing: ≥0.15mm
- Via diameter: ≥0.3mm

### Board Thickness Selection

**0.4-0.8mm**: High-frequency applications (>5 GHz)
- Lower loss
- Better high-frequency performance
- More fragile

**1.0-1.6mm**: General purpose (1-5 GHz)
- Good mechanical strength
- Standard availability
- Balanced performance

**2.0mm**: High-power applications
- Maximum strength
- Higher thermal mass
- May impact high-frequency performance

### Design Tips

1. **Add Mounting Holes**: Place outside antenna radius
2. **Ground Plane**: Consider adding on back layer for some applications
3. **Feed Connection**: Use U.FL, SMA, or direct coax solder
4. **Test Points**: Add pads near feed for VNA measurement
5. **Keep-Out Areas**: Mark on documentation layer

## Assembly and Testing

### Assembly Steps

1. **PCB Fabrication**
   - Upload KiCad file to JLCPCB
   - Select correct material and thickness
   - Choose copper weight
   - Order with ENIG finish for best RF performance

2. **Feed Connection**
   - Solder coaxial cable between feed points
   - Center conductor to one arm
   - Shield/ground to other arm
   - Consider using miniature coax (RG316, RG178)

3. **Balun (Optional)**
   - Add 1:1 balun for balanced feed
   - Improves pattern symmetry
   - Reduces common-mode currents

### Testing

**Visual Inspection**:
- Check for short circuits between arms
- Verify trace integrity
- Inspect solder joints

**VNA Measurement**:
- Measure S11 (return loss)
- Target: <-10 dB across bandwidth
- Adjust matching network if needed

**Radiation Pattern** (Optional):
- Use anechoic chamber or outdoor range
- Measure gain and polarization
- Compare to simulated results

## Troubleshooting

### Poor Return Loss

**Problem**: High VSWR, poor matching

**Solutions**:
- Add series inductor or shunt capacitor
- Adjust feed point location
- Modify trace width at feed
- Check for manufacturing defects

### Narrow Bandwidth

**Problem**: Works only at one frequency

**Solutions**:
- Increase number of turns
- Verify material dielectric constant
- Check substrate thickness
- Consider tapered feed design

### Asymmetric Pattern

**Problem**: Radiation favors one direction

**Solutions**:
- Add ground plane on back
- Balance feed connection
- Add balun transformer
- Check for nearby metal objects

### Manufacturing Issues

**Problem**: Traces too small, spacing violations

**Solutions**:
- Increase trace width/spacing
- Reduce number of turns
- Use thicker substrate
- Select lower frequency

## Examples

### Example 1: 2.4 GHz WiFi Antenna

**Parameters**:
- Frequency: 2400 MHz
- Material: Standard FR4
- Board: 1.6mm
- Copper: 1 oz
- Impedance: 50Ω
- Turns: 2

**Results**:
- Diameter: ~41mm
- Board: 61×61mm
- Bandwidth: 2.2-2.6 GHz
- Application: WiFi, Bluetooth, Zigbee

### Example 2: 5.8 GHz FPV Antenna

**Parameters**:
- Frequency: 5800 MHz
- Material: FR4 TG170 or RO4003C
- Board: 0.8mm
- Copper: 0.5 oz
- Impedance: 50Ω
- Turns: 1.5

**Results**:
- Diameter: ~17mm
- Board: 37×37mm
- Bandwidth: 5.6-6.0 GHz
- Application: FPV video, 5G

### Example 3: 915 MHz ISM Antenna

**Parameters**:
- Frequency: 915 MHz
- Material: Standard FR4
- Board: 1.6mm
- Copper: 1 oz
- Impedance: 50Ω
- Turns: 2.5

**Results**:
- Diameter: ~107mm
- Board: 127×127mm
- Bandwidth: 850-980 MHz
- Application: LoRa, ISM band

## Technical References

### Antenna Design
- J.D. Dyson, "The Equiangular Spiral Antenna," IRE Trans. Antennas Propagat., 1959
- IEEE Standard 145-2013: "Definitions of Terms for Antennas"

### Microstrip Design
- Brian C. Wadell, "Transmission Line Design Handbook"
- Hammerstad & Jensen, "Accurate Models for Microstrip Computer-Aided Design"

### PCB Materials
- JLCPCB Material Specifications: https://jlcpcb.com/capabilities/pcb-capabilities
- Rogers Corporation High Frequency Materials: https://www.rogerscorp.com/

### KiCad
- KiCad PCB File Format: https://dev-docs.kicad.org/en/file-formats/
- KiCad Documentation: https://docs.kicad.org/

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

All processing happens client-side. No data is sent to any server.

## License

This tool is provided free for personal and commercial use. Generated designs are yours to use without restriction.

## Credits

Developed by mylium.eu

Based on established antenna design principles and JLCPCB manufacturing capabilities.

## Support

For issues, suggestions, or questions:
- Visit: https://www.mylium.eu
- Email: info@mylium.eu

## Version History

**v1.0.0** (2024)
- Initial release
- Support for FR4 and Rogers materials
- KiCad and SVG export
- JLCPCB manufacturing validation
- Real-time preview
- Design summary export
