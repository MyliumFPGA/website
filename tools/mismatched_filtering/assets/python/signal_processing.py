"""
Mismatched Filtering Workshop - Python Implementation
Based on the MATLAB workshop by SpenceraM
https://github.com/SpenceraM/MismatchedFilteringWorkshop
"""

import numpy as np
from scipy import signal
from scipy.fft import fft, ifft


class LinearFMWaveform:
    """Linear FM (Chirp) Waveform Generator"""
    
    def __init__(self, pulse_width, sample_rate, sweep_bandwidth, prf, frequency_offset=0):
        self.pulse_width = pulse_width
        self.sample_rate = sample_rate
        self.sweep_bandwidth = sweep_bandwidth
        self.prf = prf
        self.frequency_offset = frequency_offset
        
    def generate(self):
        """Generate LFM waveform samples"""
        num_samples = int(self.pulse_width * self.sample_rate)
        t = np.arange(num_samples) / self.sample_rate
        
        # Chirp rate
        chirp_rate = self.sweep_bandwidth / self.pulse_width
        
        # Generate LFM signal with optional frequency offset
        phase = 2 * np.pi * (self.frequency_offset * t + 0.5 * chirp_rate * t**2)
        waveform = np.exp(1j * phase)
        
        return waveform
    
    def get_matched_filter(self):
        """Get matched filter (time-reversed complex conjugate)"""
        waveform = self.generate()
        return np.conj(waveform[::-1])


def kaiser_window(n, beta):
    """Generate Kaiser window"""
    return np.kaiser(n, beta)


def taylor_window(n, nbar, sll_db):
    """
    Generate Taylor window
    Approximation using scipy's taylor window (closest equivalent)
    """
    return signal.windows.taylor(n, nbar=nbar, sll=abs(sll_db))


def chebyshev_window(n, sll_db):
    """Generate Chebyshev window"""
    return signal.windows.chebwin(n, at=abs(sll_db))


def mag2db(x):
    """Convert magnitude to dB"""
    return 20 * np.log10(np.abs(x) + 1e-20)


def apply_matched_filter(waveform, matched_filter, nfft=None, freq_window=None):
    """
    Apply matched filtering with optional frequency domain windowing
    
    Args:
        waveform: Input waveform
        matched_filter: Matched filter
        nfft: FFT size for interpolation (default: 2*len(waveform))
        freq_window: Optional frequency domain window
        
    Returns:
        Filtered output
    """
    if nfft is None:
        nfft = 2 * len(waveform)
    
    wfm_fft = fft(waveform, nfft)
    mf_fft = fft(matched_filter, len(waveform))
    mf_fft_padded = np.pad(mf_fft, (0, nfft - len(waveform)), mode='constant')
    
    if freq_window is not None:
        window_fft = np.pad(freq_window, (0, nfft - len(freq_window)), mode='constant')
        output = ifft(wfm_fft * window_fft * mf_fft_padded)
    else:
        output = ifft(wfm_fft * mf_fft_padded)
    
    # Extract center portion
    start_idx = nfft // 4
    end_idx = 3 * nfft // 4
    output = output[start_idx:end_idx]
    
    return output


def calculate_ranges(output_length, sample_rate, interp_factor):
    """Calculate range bins in meters"""
    c = 299792458  # Speed of light in m/s
    num_samples = len(output_length) if hasattr(output_length, '__len__') else output_length
    t = (np.arange(-num_samples/2, num_samples/2) + interp_factor - 0.5) / sample_rate / interp_factor
    ranges = c * t / 2
    return ranges


def null_to_null_half_width(response, delta_range):
    """
    Calculate Rayleigh resolution (null to null half width)
    
    Args:
        response: Impulse response
        delta_range: Range bin spacing
        
    Returns:
        Half width between nulls in meters
    """
    # Find peak
    peak_idx = np.argmax(np.abs(response))
    
    # Find first nulls on either side
    left_null = peak_idx
    right_null = peak_idx
    
    threshold = 0.01 * np.abs(response[peak_idx])
    
    # Search left
    for i in range(peak_idx - 1, 0, -1):
        if np.abs(response[i]) < threshold:
            left_null = i
            break
    
    # Search right
    for i in range(peak_idx + 1, len(response)):
        if np.abs(response[i]) < threshold:
            right_null = i
            break
    
    width_samples = (right_null - left_null) / 2
    return width_samples * delta_range


def sidelobe_level(response_db):
    """
    Calculate Peak Sidelobe Level (PSL) and Integrated Sidelobe Level (ISL)
    
    Args:
        response_db: Response in dB
        
    Returns:
        (psl, isl): Peak and integrated sidelobe levels in dB
    """
    # Find peak (mainlobe)
    peak_idx = np.argmax(response_db)
    peak_val = response_db[peak_idx]
    
    # Find first nulls to define mainlobe
    left_null = 0
    right_null = len(response_db) - 1
    
    threshold = peak_val - 40  # Look for deep nulls
    
    for i in range(peak_idx - 1, 0, -1):
        if response_db[i] < threshold:
            left_null = i
            break
    
    for i in range(peak_idx + 1, len(response_db)):
        if response_db[i] < threshold:
            right_null = i
            break
    
    # PSL: Maximum sidelobe level
    left_sidelobes = response_db[:left_null]
    right_sidelobes = response_db[right_null:]
    
    if len(left_sidelobes) > 0 and len(right_sidelobes) > 0:
        psl = max(np.max(left_sidelobes), np.max(right_sidelobes)) - peak_val
    else:
        psl = -100
    
    # ISL: Integrated sidelobe level (energy ratio)
    mainlobe_energy = np.sum(10**(response_db[left_null:right_null]/10))
    sidelobe_energy = np.sum(10**(response_db[:left_null]/10)) + np.sum(10**(response_db[right_null:]/10))
    
    if sidelobe_energy > 0:
        isl = 10 * np.log10(sidelobe_energy / mainlobe_energy)
    else:
        isl = -100
    
    return psl, isl


def peak_loss(freq_window):
    """
    Calculate peak loss due to windowing
    
    Args:
        freq_window: Frequency domain window
        
    Returns:
        Peak loss in dB
    """
    n = len(freq_window)
    loss = 10 * np.log10(n**2 / np.abs(np.sum(freq_window))**2)
    return loss


def snr_loss(waveform, windowed_waveform):
    """
    Calculate SNR loss (matching loss)
    
    Args:
        waveform: Original waveform
        windowed_waveform: Windowed waveform
        
    Returns:
        SNR loss in dB
    """
    wfm_fft = fft(waveform)
    win_fft = fft(windowed_waveform)
    
    # Matched filter gain
    matched_gain = np.abs(np.sum(np.conj(wfm_fft) * wfm_fft))
    mismatched_gain = np.abs(np.sum(np.conj(wfm_fft) * win_fft))
    
    if mismatched_gain > 0:
        loss = 10 * np.log10(matched_gain / mismatched_gain**2 * np.sum(np.abs(win_fft)**2))
    else:
        loss = 0
    
    return loss


def run_analyzing_windows_example(window_type='Kaiser', kaiser_beta=6, 
                                   taylor_sll=-20, taylor_nbar=14,
                                   cheby_sll=-30, plot_range=12000,
                                   freq_offset=90000, window_flag=True):
    """
    Run the Analyzing Windows example
    
    Returns:
        dict with results including plots and statistics
    """
    # Define waveform parameters
    pulse_width = 50 / 1e6  # 50 microseconds
    sample_rate = 1e6
    sweep_bandwidth = 1e6
    prf = 1e3
    
    # Create waveform
    wfm_obj = LinearFMWaveform(pulse_width, sample_rate, sweep_bandwidth, prf)
    wfm = wfm_obj.generate()
    mf = wfm_obj.get_matched_filter()
    
    # Interpolation for plotting
    interp_factor = 2
    nfft = interp_factor * len(wfm)
    
    # Matched filter response (no window)
    y_mf = apply_matched_filter(wfm, mf, nfft=nfft)
    
    # Calculate ranges
    ranges = calculate_ranges(y_mf, sample_rate, interp_factor)
    
    # Generate window based on type
    if window_type == 'Kaiser':
        freq_window = kaiser_window(len(wfm), kaiser_beta)
    elif window_type == 'Taylor':
        freq_window = taylor_window(len(wfm), taylor_nbar, taylor_sll)
    elif window_type == 'Chebyshev':
        freq_window = chebyshev_window(len(wfm), cheby_sll)
    else:
        freq_window = np.ones(len(wfm))
    
    # Mismatched filter response (with window)
    y_mmf = apply_matched_filter(wfm, mf, nfft=nfft, freq_window=freq_window)
    
    # Calculate metrics
    delta_range = ranges[1] - ranges[0]
    mf_range_res = null_to_null_half_width(y_mf, delta_range)
    mmf_range_res = null_to_null_half_width(y_mmf, delta_range)
    
    mf_psl, mf_isl = sidelobe_level(mag2db(np.abs(y_mf)))
    mmf_psl, mmf_isl = sidelobe_level(mag2db(np.abs(y_mmf)))
    
    pk_loss = peak_loss(freq_window)
    snr_loss_val = snr_loss(wfm, wfm * freq_window)
    
    # Doppler effect
    wfm_dop_obj = LinearFMWaveform(pulse_width, sample_rate, sweep_bandwidth, prf, freq_offset)
    wfm_dop = wfm_dop_obj.generate()
    
    if window_flag:
        y_dop = apply_matched_filter(wfm_dop, mf, nfft=nfft, freq_window=freq_window)
    else:
        y_dop = apply_matched_filter(wfm_dop, mf, nfft=nfft)
    
    # Normalize responses
    y_mf_norm = np.abs(y_mf) / np.max(np.abs(y_mf))
    y_mmf_norm = np.abs(y_mmf) / np.max(np.abs(y_mmf))
    y_dop_norm = np.abs(y_dop) / np.max(np.abs(y_mmf if window_flag else y_mf))
    
    # Filter ranges for plotting
    range_mask = np.abs(ranges) <= plot_range
    
    results = {
        'ranges': ranges[range_mask].tolist(),
        'y_mf_db': mag2db(y_mf_norm)[range_mask].tolist(),
        'y_mmf_db': mag2db(y_mmf_norm)[range_mask].tolist(),
        'y_dop_db': mag2db(y_dop_norm)[range_mask].tolist(),
        'window_flag': window_flag,
        'window_type': window_type,
        'stats': {
            'matched_filter': {
                'range_res': mf_range_res,
                'psl': mf_psl,
                'isl': mf_isl,
                'peak_loss': 0,
                'snr_loss': 0
            },
            'mismatched_filter': {
                'range_res': mmf_range_res,
                'psl': mmf_psl,
                'isl': mmf_isl,
                'peak_loss': pk_loss,
                'snr_loss': snr_loss_val
            }
        }
    }
    
    return results
