(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const defaultMetas = [
            { 'http-equiv': 'pragma', content: 'no-cache' },
            { 'http-equiv': 'expires', content: '-1' },
            { 'http-equiv': 'sdf', content: '-1' },
        ];

        defaultMetas.forEach((attrs) => {
            const meta = document.createElement('meta');
            Object.entries(attrs).forEach(([key, value]) => {
                meta.setAttribute(key, value);
            });
            document.head.appendChild(meta);
        });

        document.oncontextmenu = () => false;
    });
})();
