/**
 * Main Application Logic
 */

// Snackbar notification system
let snackbar = null;

function showNotification(message, type = 'info') {
    if (!snackbar) {
        const snackbarElement = document.querySelector('.mdc-snackbar');
        if (snackbarElement) {
            snackbar = new mdc.snackbar.MDCSnackbar(snackbarElement);
        }
    }
    
    if (snackbar) {
        snackbar.labelText = message;
        snackbar.open();
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Initialize Material Design Components
document.addEventListener('DOMContentLoaded', () => {
    // Initialize buttons
    document.querySelectorAll('.mdc-button').forEach(button => {
        mdc.ripple.MDCRipple.attachTo(button);
    });
    
    // Initialize snackbar
    const snackbarElement = document.querySelector('.mdc-snackbar');
    if (snackbarElement) {
        snackbar = new mdc.snackbar.MDCSnackbar(snackbarElement);
    }
    
    console.log('Mismatched Filtering Workshop initialized');
});
