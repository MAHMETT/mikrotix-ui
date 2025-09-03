(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        UPDATE_INTERVAL: 30000, // 30 seconds
        ANIMATION_DURATION: 300,
        SESSION_CHECK_INTERVAL: 5000, // 5 seconds
    };

    // Sample data - replace with actual API calls
    const statusData = {
        username: $(username),
        ip: $(ip),
        mac: $(mac),
        uptime: $(uptime),
        sessionTimeLeft: $(session - time - left),
        download: $(bytes - out - nice), // bytes
        upload: $(bytes - out - nice), // bytes
        quotaLimit: $(limit - bytes - total), // 10 GB in bytes
        quotaUsed: $(limit - bytes - out), // ~1.5 GB used
        // connectionSpeed: 25.6,
        hasSessionTimeLimit: true,
    };

    // DOM elements
    const elements = {
        username: document.getElementById('username'),
        ip: document.getElementById('ip'),
        mac: document.getElementById('mac'),
        timeLabel: document.getElementById('time-label'),
        timeValue: document.getElementById('time-value'),
        download: document.getElementById('download'),
        upload: document.getElementById('upload'),
        quotaValue: document.getElementById('quota-value'),
        // speed: document.getElementById('speed'),
        usagePercent: document.getElementById('usage-percent'),
        lastUpdate: document.getElementById('lastUpdate'),
        refreshBtn: document.getElementById('refreshBtn'),
        refreshContent: document.getElementById('refreshContent'),
    };

    // State management
    let updateTimer = null;
    let sessionTimer = null;

    /**
     * Initialize the status page
     */
    function init() {
        updateStatusDisplay();
        updateTimestamp();
        setupAutoUpdate();
        setupAccessibility();

        // Focus management for accessibility
        elements.refreshBtn.focus();
    }

    /**
     * Update all status information
     */
    function updateStatusDisplay() {
        // Basic info
        elements.username.textContent = statusData.username;
        elements.ip.textContent = statusData.ip;
        elements.mac.textContent = statusData.mac;

        // Time information
        if (statusData.hasSessionTimeLimit && statusData.sessionTimeLeft) {
            elements.timeLabel.textContent = 'Connected / Left';
            elements.timeValue.textContent = `${statusData.uptime} / ${statusData.sessionTimeLeft}`;
        } else {
            elements.timeLabel.textContent = 'Connected';
            elements.timeValue.textContent = statusData.uptime;
        }

        // Traffic data
        elements.download.textContent = formatBytes(statusData.download);
        elements.upload.textContent = formatBytes(statusData.upload);

        // Quota information
        const remainingQuota = statusData.quotaLimit - statusData.quotaUsed;
        if (statusData.quotaLimit > 0) {
            elements.quotaValue.textContent = formatBytes(remainingQuota);
        } else {
            elements.quotaValue.textContent = 'Unlimited';
        }

        // Connection speed
        // elements.speed.textContent = `${statusData.connectionSpeed} Mbps`;

        // Usage percentage
        const usagePercent =
            statusData.quotaLimit > 0
                ? Math.round(
                      (statusData.quotaUsed / statusData.quotaLimit) * 100,
                  )
                : 0;
        elements.usagePercent.textContent =
            statusData.quotaLimit > 0 ? `${usagePercent}%` : 'N/A';

        // Update quota status indicator
        updateQuotaStatus(usagePercent);
    }

    /**
     * Update quota status indicator
     */
    function updateQuotaStatus(usagePercent) {
        const quotaElement = document.getElementById('quota');
        const indicator = quotaElement.querySelector('.bg-green-500');

        if (usagePercent > 90) {
            indicator.className =
                'ml-2 px-2 py-1 bg-red-500 bg-opacity-20 text-red-300 text-xs rounded-full';
            indicator.textContent = 'Critical';
        } else if (usagePercent > 75) {
            indicator.className =
                'ml-2 px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-300 text-xs rounded-full';
            indicator.textContent = 'Warning';
        } else {
            indicator.className =
                'ml-2 px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 text-xs rounded-full';
            indicator.textContent = 'Available';
        }
    }

    /**
     * Format bytes to human readable format
     */
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Update timestamp
     */
    function updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        elements.lastUpdate.textContent = timeString;
    }

    /**
     * Setup auto-update functionality
     */
    function setupAutoUpdate() {
        updateTimer = setInterval(() => {
            // Simulate data updates
            simulateDataUpdate();
            updateStatusDisplay();
            updateTimestamp();
        }, CONFIG.UPDATE_INTERVAL);
    }

    /**
     * Simulate data updates (replace with real API calls)
     */
    function simulateDataUpdate() {
        // Update uptime
        const uptimeMinutes =
            parseInt(statusData.uptime.split('h')[0]) * 60 +
            parseInt(statusData.uptime.split('h')[1].split('m')[0]) +
            1;
        const hours = Math.floor(uptimeMinutes / 60);
        const minutes = uptimeMinutes % 60;
        statusData.uptime = `${hours}h ${minutes}m`;

        // Update session time left (if applicable)
        if (statusData.hasSessionTimeLimit && statusData.sessionTimeLeft) {
            const sessionMinutes =
                parseInt(statusData.sessionTimeLeft.split('h')[0]) * 60 +
                parseInt(
                    statusData.sessionTimeLeft.split('h')[1].split('m')[0],
                ) -
                1;
            if (sessionMinutes > 0) {
                const sessionHours = Math.floor(sessionMinutes / 60);
                const sessionMins = sessionMinutes % 60;
                statusData.sessionTimeLeft = `${sessionHours}h ${sessionMins}m`;
            } else {
                statusData.sessionTimeLeft = '0h 0m';
            }
        }

        // Simulate traffic growth
        statusData.download += Math.random() * 1024 * 1024; // Random MB increase
        statusData.upload += Math.random() * 256 * 1024; // Random KB increase

        // Update used quota
        const trafficIncrease = Math.random() * 1024 * 1024;
        statusData.quotaUsed += trafficIncrease;

        // Simulate speed fluctuation
        // statusData.connectionSpeed = (20 + Math.random() * 15).toFixed(1);
    }

    /**
     * Setup accessibility features
     */
    function setupAccessibility() {
        // Announce status updates to screen readers
        const announceUpdate = () => {
            announceToScreenReader('Status information updated');
        };

        // Handle keyboard navigation
        document.addEventListener('keydown', handleKeyPress);

        // Add aria-live region for dynamic updates
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'status-announcements';
        document.body.appendChild(liveRegion);
    }

    /**
     * Handle keyboard interactions
     */
    function handleKeyPress(e) {
        switch (e.key) {
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    refreshStatus();
                }
                break;
            case 'F5':
                e.preventDefault();
                refreshStatus();
                break;
            case 'Escape':
                // Cancel any ongoing operations
                break;
        }
    }

    /**
     * Announce message to screen readers
     */
    function announceToScreenReader(message) {
        const announcements = document.getElementById('status-announcements');
        if (announcements) {
            announcements.textContent = message;
            setTimeout(() => {
                announcements.textContent = '';
            }, 1000);
        }
    }

    /**
     * Show loading state for buttons
     */
    function showButtonLoading(button, loadingText = 'Loading...') {
        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
                    <span class="flex items-center justify-center">
                        <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ${loadingText}
                    </span>
                `;

        return originalContent;
    }

    /**
     * Restore button to original state
     */
    function restoreButton(button, originalContent) {
        button.disabled = false;
        button.innerHTML = originalContent;
    }

    /**
     * Global functions for button handlers
     */
    window.refreshStatus = async function () {
        const originalContent = showButtonLoading(
            elements.refreshBtn,
            'Refreshing...',
        );
        announceToScreenReader('Refreshing status information');

        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Update data (in real implementation, fetch from API)
            simulateDataUpdate();
            updateStatusDisplay();
            updateTimestamp();

            announceToScreenReader('Status refreshed successfully');

            // Add visual feedback
            const statusRows = document.querySelectorAll('.status-row');
            statusRows.forEach((row, index) => {
                setTimeout(() => {
                    row.style.animation = 'none';
                    row.offsetHeight; // Trigger reflow
                    row.style.animation = 'slideInLeft 0.4s ease-out';
                }, index * 100);
            });
        } catch (error) {
            console.error('Failed to refresh status:', error);
            announceToScreenReader('Failed to refresh status');
        } finally {
            setTimeout(() => {
                restoreButton(elements.refreshBtn, originalContent);
            }, 500);
        }
    };

    window.logout = function () {
        const button = event.target.closest('button');

        // Confirm logout
        if (confirm('Are you sure you want to logout?')) {
            const originalContent = showButtonLoading(button, 'Logging out...');
            announceToScreenReader('Logging out');

            setTimeout(() => {
                // In real implementation, handle logout
                console.log('Logging out...');
                window.location.href = 'logout.html?erase-cookie=true';
                restoreButton(button, originalContent);
            }, 1500);
        } else {
            announceToScreenReader('Logout canceled');
        }
    };

    /**
     * Parse URL parameters for dynamic data
     */
    function parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);

        // Update status data from URL parameters if available
        if (urlParams.get('username'))
            statusData.username = urlParams.get('username');
        if (urlParams.get('ip')) statusData.ip = urlParams.get('ip');
        if (urlParams.get('mac')) statusData.mac = urlParams.get('mac');
        if (urlParams.get('uptime'))
            statusData.uptime = urlParams.get('uptime');
        if (urlParams.get('session-time-left')) {
            statusData.sessionTimeLeft = urlParams.get('session-time-left');
            statusData.hasSessionTimeLimit = true;
        }
        if (urlParams.get('bytes-out')) {
            statusData.download = parseInt(urlParams.get('bytes-out'));
        }
        if (urlParams.get('bytes-in')) {
            statusData.upload = parseInt(urlParams.get('bytes-in'));
        }
        if (urlParams.get('limit-bytes-total')) {
            statusData.quotaLimit = parseInt(
                urlParams.get('limit-bytes-total'),
            );
        }
    }

    /**
     * Handle MikroTik template variables (if present)
     */
    function handleTemplateVariables() {
        // Replace template variables with actual values when used with MikroTik
        const templateMappings = {
            '$(username)': statusData.username,
            '$(ip)': statusData.ip,
            '$(mac)': statusData.mac,
            '$(uptime)': statusData.uptime,
            '$(session-time-left)': statusData.sessionTimeLeft,
            '$(bytes-out-nice)': formatBytes(statusData.download),
            '$(bytes-in-nice)': formatBytes(statusData.upload),
        };

        // Process quota calculation similar to original template
        let quotaDisplay = 'Unlimited';
        if (statusData.quotaLimit > 0) {
            const quotaInMB = (statusData.quotaLimit / 1000000).toFixed(2);
            quotaDisplay = `${quotaInMB} MiB`;
        }

        // Update quota display
        if (elements.quotaValue) {
            const remainingQuota = statusData.quotaLimit - statusData.quotaUsed;
            if (statusData.quotaLimit > 0) {
                const remainingMB = (remainingQuota / 1000000).toFixed(2);
                elements.quotaValue.textContent = `${remainingMB} MiB`;
            } else {
                elements.quotaValue.textContent = 'Unlimited';
            }
        }
    }

    /**
     * Cleanup function
     */
    function cleanup() {
        if (updateTimer) {
            clearInterval(updateTimer);
            updateTimer = null;
        }
        if (sessionTimer) {
            clearInterval(sessionTimer);
            sessionTimer = null;
        }
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cleanup();
        } else {
            setupAutoUpdate();
            refreshStatus();
        }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            parseUrlParams();
            handleTemplateVariables();
            init();
        });
    } else {
        parseUrlParams();
        handleTemplateVariables();
        init();
    }
})();
