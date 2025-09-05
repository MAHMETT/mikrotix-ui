// Component Header and Footer
(function () {
    'use strict';

    // Template header + footer — edit sesuai kebutuhan
    const headerTemplate = `
        <header role="banner" class="text-center mb-8">
                <div class="flex items-center justify-center mb-4 gap-3">
                    <div class="logo">
                        <img src="assets/images/Logo.webp" alt="Logo" />
                    </div>
                    <div class="text-left">
                        <h1 class="text-2xl font-bold text-white">
                            MikrotixUI
                        </h1>
                    </div>
                </div>
            </header>
      `;

    const footerTemplate = `
            <footer role="contentInfo" class="text-center">
                <p class="text-white/60 text-xs">
                    ©
                    <span id="currentYear"></span>
                    MikrotixUI. All rights reserved.
                </p>
            </footer>
      `;

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
        headerNode.innerHTML = headerTemplate;
        target.insertBefore(headerNode.firstElementChild, main);

        const footerNode = document.createElement('div');
        footerNode.innerHTML = footerTemplate;
        target.appendChild(footerNode.firstElementChild);
    }

    // Jalankan setelah DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectShell('app');

            // Get current year for copyright
            document.getElementById('currentYear').textContent =
                new Date().getFullYear();

            // Add subtle entrance animation delay
            setTimeout(() => {
                document.querySelector('.glass-card').classList.add('fade-in');
            }, 100);
        });
    } else {
        injectShell('app');
    }
})();
