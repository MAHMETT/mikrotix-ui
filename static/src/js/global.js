import { injectShell } from './components.js';
import { injectBrand } from './getBrand.js';

(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        injectShell('app');
        injectBrand();
    });
})();
