function copyError() {
    const errorContent = document.getElementById('errorContent');
    const copyBtn = document.getElementById('copyBtn');

    // Get all text content from the error section
    const textToCopy = errorContent.innerText || errorContent.textContent;

    // Use modern clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                showCopySuccess(copyBtn);
            })
            .catch(() => {
                // Fallback for clipboard API failure
                fallbackCopy(textToCopy, copyBtn);
            });
    } else {
        // Fallback for older browsers
        fallbackCopy(textToCopy, copyBtn);
    }
}

// Fallback copy method
function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showCopySuccess(button);
    } catch (err) {
        console.error('Failed to copy error message:', err);
        showCopyError(button);
    }

    document.body.removeChild(textArea);
}

// Show copy success feedback
function showCopySuccess(button) {
    button.classList.add('copied');
    button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            `;

    setTimeout(() => {
        button.classList.remove('copied');
        button.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="m5 15-2-2v-6a2 2 0 0 1 2-2h6l2 2"></path>
                    </svg>
                `;
    }, 2000);
}

// Show copy error feedback
function showCopyError(button) {
    button.style.background = 'rgba(239, 68, 68, 0.2)';
    button.style.borderColor = 'rgba(239, 68, 68, 0.4)';

    setTimeout(() => {
        button.style.background = '';
        button.style.borderColor = '';
    }, 2000);
}

// Add keyboard shortcut for copying (Ctrl+C when focused on error card)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const errorCard = document.querySelector('.error-card');
        if (
            errorCard.matches(':hover') ||
            errorCard.contains(document.activeElement)
        ) {
            e.preventDefault();
            copyError();
        }
    }
});
