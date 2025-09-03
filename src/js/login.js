/**
 * Enhanced Login Form with Liquid Glass UI
 * Optimized for performance and accessibility
 */
(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        // username_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MIN_PASSWORD_LENGTH: 6,
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 300,
    };

    // DOM Elements
    const elements = {
        form: document.getElementById('loginForm'),
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        button: document.getElementById('loginButton'),
        buttonText: document.getElementById('buttonText'),
        buttonLoader: document.getElementById('buttonLoader'),
        status: document.getElementById('login-status'),
    };

    // Utility Functions
    const utils = {
        debounce: function (func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // isValidusername: function (username) {
        //     return CONFIG.username_REGEX.test(username);
        // },

        sanitize: function (str) {
            return str.replace(/<[^>]*>/g, '').trim();
        },
    };

    // Floating Label Management
    function initFloatingLabels() {
        [elements.username, elements.password].forEach((input) => {
            const label = input.nextElementSibling;

            function updateLabel() {
                if (input.value || document.activeElement === input) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            }

            updateLabel(); // Initial state

            input.addEventListener('focus', updateLabel, {
                passive: true,
            });
            input.addEventListener('blur', updateLabel, {
                passive: true,
            });
            input.addEventListener('input', updateLabel, {
                passive: true,
            });
        });
    }

    // Validation System
    const validation = {
        validateField: function (fieldName) {
            const field = elements[fieldName];
            const value = field.value.trim();
            let isValid = true;
            let message = '';

            switch (fieldName) {
                case 'username':
                    if (!value) {
                        message = 'username is required';
                        isValid = false;
                    }
                    // else if (!utils.isValidusername(value)) {
                    //     message = 'Please enter a valid username address';
                    //     isValid = false;
                    // }
                    break;

                case 'password':
                    if (!value) {
                        message = 'Password is required';
                        isValid = false;
                    } else if (value.length < CONFIG.MIN_PASSWORD_LENGTH) {
                        message = `Password must be at least ${CONFIG.MIN_PASSWORD_LENGTH} characters`;
                        isValid = false;
                    }
                    break;
            }

            if (isValid) {
                this.clearError(fieldName);
            } else {
                this.showError(fieldName, message);
            }

            return isValid;
        },

        showError: function (fieldName, message) {
            const field = elements[fieldName];
            const errorDiv = document.getElementById(`${fieldName}-error`);

            field.classList.add('input-error', 'shake');
            field.setAttribute('aria-invalid', 'true');

            errorDiv.textContent = utils.sanitize(message);
            errorDiv.classList.add('show');

            // Remove shake animation
            setTimeout(() => {
                field.classList.remove('shake');
            }, 500);
        },

        clearError: function (fieldName) {
            const field = elements[fieldName];
            const errorDiv = document.getElementById(`${fieldName}-error`);

            field.classList.remove('input-error');
            field.setAttribute('aria-invalid', 'false');

            errorDiv.classList.remove('show');

            setTimeout(() => {
                if (!errorDiv.classList.contains('show')) {
                    errorDiv.textContent = '';
                }
            }, CONFIG.ANIMATION_DURATION);
        },

        validateAll: function () {
            const usernameValid = this.validateField('username');
            const passwordValid = this.validateField('password');
            return usernameValid && passwordValid;
        },
    };

    // UI State Management
    const ui = {
        setLoading: function (loading) {
            if (loading) {
                elements.button.disabled = true;
                elements.button.setAttribute('aria-busy', 'true');
                elements.buttonText.classList.add('hidden');
                elements.buttonLoader.classList.remove('hidden');
            } else {
                elements.button.disabled = false;
                elements.button.setAttribute('aria-busy', 'false');
                elements.buttonText.classList.remove('hidden');
                elements.buttonLoader.classList.add('hidden');
            }
        },

        showStatus: function (message, isError = false) {
            elements.status.textContent = message;
            elements.status.className = `text-center text-sm transition-all duration-200 ${
                isError ? 'text-red-300' : 'text-green-300'
            }`;

            // Auto-clear status
            setTimeout(() => {
                if (elements.status.textContent === message) {
                    elements.status.style.opacity = '0';
                    setTimeout(() => {
                        elements.status.textContent = '';
                        elements.status.style.opacity = '1';
                    }, 200);
                }
            }, 5000);
        },
    };

    // Event Handlers
    function handleFormSubmit(e) {
        // Client-side validation only
        if (!validation.validateAll()) {
            e.preventDefault();

            // Focus first invalid field
            if (elements.username.classList.contains('input-error')) {
                elements.username.focus();
            } else if (elements.password.classList.contains('input-error')) {
                elements.password.focus();
            }

            ui.showStatus('Please correct the errors above', true);
            return false;
        }

        // Show loading state for visual feedback
        ui.setLoading(true);
        ui.showStatus('Signing in...', false);

        // Form will submit normally to server
        return true;
    }

    function handleKeyNavigation(e) {
        if (e.key === 'Enter' && e.target !== elements.button) {
            e.preventDefault();

            if (e.target === elements.username) {
                elements.password.focus();
            } else if (e.target === elements.password) {
                if (validation.validateAll()) {
                    elements.button.click();
                }
            }
        }

        // Clear field with Escape
        if (
            e.key === 'Escape' &&
            (e.target === elements.username || e.target === elements.password)
        ) {
            e.target.value = '';
            validation.clearError(e.target.id);
            e.target.nextElementSibling.classList.remove('active');
        }
    }

    // Initialize
    function init() {
        if (!elements.form) return;

        initFloatingLabels();

        // Form submission
        elements.form.addEventListener('submit', handleFormSubmit, {
            passive: false,
        });

        // Real-time validation with debouncing
        const debouncedValidation = utils.debounce((fieldName) => {
            validation.validateField(fieldName);
        }, CONFIG.DEBOUNCE_DELAY);

        // Input event listeners
        elements.username.addEventListener(
            'blur',
            () => validation.validateField('username'),
            { passive: true },
        );
        elements.password.addEventListener(
            'blur',
            () => validation.validateField('password'),
            { passive: true },
        );
        elements.username.addEventListener(
            'input',
            () => {
                validation.clearError('username');
                debouncedValidation('username');
            },
            { passive: true },
        );
        elements.password.addEventListener(
            'input',
            () => {
                validation.clearError('password');
                debouncedValidation('password');
            },
            { passive: true },
        );

        // Keyboard navigation
        elements.form.addEventListener('keydown', handleKeyNavigation, {
            passive: false,
        });

        // Auto-focus first field
        elements.username.focus();

        // Performance optimization for older devices
        if (
            navigator.hardwareConcurrency &&
            navigator.hardwareConcurrency <= 2
        ) {
            document.documentElement.style.setProperty(
                '--animation-duration',
                '0.1s',
            );
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
