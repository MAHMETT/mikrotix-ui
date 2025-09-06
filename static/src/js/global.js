import { Component } from '../../config.js';
import { injectBrand } from './getBrand.js';

// Component Header and Footer
(function () {
    'use strict';

    // Fungsi utama: sisipkan header & footer ke dalam elemen target
    function injectShell(targetId = 'app') {
        const target = document.getElementById(targetId);
        if (!target) {
            console.warn('Target element not found:', targetId);
            return;
        }

        // cari main di dalam target; jika tidak ada, buat
        let main = target.querySelector('main');
        if (!main) {
            main = document.createElement('main');
            main.id = 'main-content';
            target.appendChild(main);
        }

        // buat wrapper elemen untuk header/footer, lalu insert BEFORE and AFTER main
        // Hindari meng-overwrite main.innerHTML supaya konten unik tetap aman
        const headerNode = document.createElement('div');
        headerNode.innerHTML = Component.header;
        target.insertBefore(headerNode.firstElementChild, main);

        const footerNode = document.createElement('div');
        footerNode.innerHTML = Component.footer;
        target.appendChild(footerNode.firstElementChild);
    }

    // Jalankan setelah DOM siap
    document.addEventListener('DOMContentLoaded', () => {
        injectShell('app');
        injectBrand();

        // Add subtle entrance animation delay
        setTimeout(() => {
            document.querySelector('.glass-card').classList.add('fade-in');
        }, 100);
    });
})();
