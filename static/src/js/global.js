import { GeneralConfig, FileConfig } from '../../config.js';

class UIController {
    #initialized = false;
    #cache = new Map();

    constructor() {
        this.#bindMethods();
        this.#setupEventListeners();
    }

    #bindMethods() {
        this.init = this.init.bind(this);
    }

    #setupEventListeners() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init, {
                once: true,
            });
        } else {
            // DOM sudah ready
            queueMicrotask(() => this.init());
        }
    }

    // Template menggunakan tagged template literals untuk keamanan
    #createTemplate(strings, ...values) {
        return strings.reduce((result, string, i) => {
            const value = values[i]
                ? String(values[i]).replace(/[<>&"']/g, (m) => {
                      const escapes = {
                          '<': '&lt;',
                          '>': '&gt;',
                          '&': '&amp;',
                          '"': '&quot;',
                          "'": '&#39;',
                      };
                      return escapes[m];
                  })
                : '';
            return result + string + value;
        });
    }

    #createHeaderTemplate() {
        const cacheKey = 'header-template';
        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey);
        }

        // const template = this.#createTemplate`
        //     <header role="banner" class="text-center mb-8" aria-label="Site header">
        //         <div class="flex items-center justify-center mb-4 gap-3">
        //             <div class="logo">
        //                 <img src="${FileConfig.LogoUrl}" alt="${GeneralConfig.Brand} Logo" loading="eager" decoding="async" />
        //             </div>
        //             <div class="text-left">
        //                 <h1 class="text-2xl font-bold text-white">
        //                     ${GeneralConfig.Brand}
        //                 </h1>
        //             </div>
        //         </div>
        //     </header>
        // `;

        const template = this.#createTemplate`
            <header role="banner" class="text-center mb-8" aria-label="Site header">
                <div class="flex items-center justify-center mb-4 gap-3">
                    <div class="logo">
                        <img src="assets/images/Logo.webp" alt="${GeneralConfig.Brand} Logo" loading="eager" decoding="async" />
                    </div>
                    <div class="text-left">
                        <h1 class="text-2xl font-bold text-white">
                            ${GeneralConfig.Brand}
                        </h1>
                    </div>
                </div>
            </header>
        `;

        this.#cache.set(cacheKey, template);
        return template;
    }

    #createFooterTemplate() {
        const cacheKey = 'footer-template';
        if (this.#cache.has(cacheKey)) {
            return this.#cache.get(cacheKey);
        }

        const currentYear = new Date().getFullYear();
        const template = this.#createTemplate`
            <footer role="contentinfo" class="text-center" aria-label="Site footer">
                <p class="text-white/60 text-xs">
                    © <time datetime="${currentYear}">${currentYear}</time> ${GeneralConfig.Brand}. All rights reserved.
                </p>
            </footer>
        `;

        this.#cache.set(cacheKey, template);
        return template;
    }

    #updateDocumentTitle() {
        const brand = GeneralConfig.Brand;
        const current = document.title.trim();

        if (!current) {
            document.title = brand;
            return;
        }

        const suffix = ` - ${brand}`;
        if (!current.endsWith(suffix)) {
            document.title = `${current}${suffix}`;
        }
    }

    #createDocumentFragment(htmlString) {
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return document.importNode(template.content, true);
    }

    #setupHead() {
        // Gunakan DocumentFragment untuk batch DOM operations
        const fragment = document.createDocumentFragment();

        const metaConfigs = [
            { charset: 'UTF-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0',
            },
            { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
            {
                name: 'description',
                content: `${GeneralConfig.Brand} - Modern UI Framework`,
            },
            {
                name: 'keywords',
                content: `${GeneralConfig.Brand}, UI, Framework, Modern`,
            },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'theme-color', content: '#000000' },
        ];

        const linkConfigs = [
            { rel: 'icon', type: 'image/webp', href: FileConfig.LogoUrl },
            { rel: 'stylesheet', href: 'src/css/global.css' },
            // {
            //     rel: 'preload',
            //     as: 'image',
            //     href: FileConfig.LogoUrl,
            //     type: 'image/webp',
            // },
        ];

        // Batch create meta tags
        metaConfigs.forEach((attrs) => {
            const meta = document.createElement('meta');
            Object.entries(attrs).forEach(([key, value]) => {
                meta.setAttribute(key, value);
            });
            fragment.appendChild(meta);
        });

        // Batch create link tags
        linkConfigs.forEach((attrs) => {
            const link = document.createElement('link');
            Object.entries(attrs).forEach(([key, value]) => {
                link.setAttribute(key, value);
            });
            fragment.appendChild(link);
        });

        // Single DOM operation
        document.head.appendChild(fragment);
    }

    #setupHeaderFooter(targetSelector = '#app') {
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.warn(`Target element "${targetSelector}" not found`);
            return;
        }

        // Cari atau buat main element
        let main = target.querySelector('main#main-content');
        if (!main) {
            main = document.createElement('main');
            main.id = 'main-content';
            main.setAttribute('role', 'main');
            main.setAttribute('aria-label', 'Main content');
            target.appendChild(main);
        }

        // Gunakan DocumentFragment untuk efisiensi
        const headerFragment = this.#createDocumentFragment(
            this.#createHeaderTemplate()
        );
        const footerFragment = this.#createDocumentFragment(
            this.#createFooterTemplate()
        );

        // Insert header sebelum main
        target.insertBefore(headerFragment, main);

        // Append footer setelah main
        target.appendChild(footerFragment);
    }

    #disableContextMenu() {
        // Gunakan passive listener untuk performa better
        document.addEventListener(
            'contextmenu',
            (e) => {
                e.preventDefault();
                return false;
            },
            { passive: false }
        );
    }

    async init() {
        if (this.#initialized) return;

        try {
            // Jalankan operasi-operasi yang tidak bergantung pada DOM secara paralel
            const setupPromises = [
                Promise.resolve(this.#updateDocumentTitle()),
                Promise.resolve(this.#setupHead()),
            ];

            await Promise.all(setupPromises);

            // Setup DOM setelah head selesai
            this.#setupHeaderFooter();
            this.#disableContextMenu();

            this.#initialized = true;

            // Dispatch custom event untuk notifikasi bahwa UI sudah ready
            document.dispatchEvent(
                new CustomEvent('ui:ready', {
                    detail: { controller: this, timestamp: Date.now() },
                })
            );
        } catch (error) {
            console.error('Failed to initialize UI:', error);
        }
    }

    // Public method untuk manual refresh jika diperlukan
    refresh() {
        this.#cache.clear();
        this.#initialized = false;
        this.init();
    }

    // Getter untuk status
    get isInitialized() {
        return this.#initialized;
    }
}

// Singleton pattern dengan lazy initialization
let uiController;
export const getUIController = () => {
    if (!uiController) {
        uiController = new UIController();
    }
    return uiController;
};

// Auto-initialize
getUIController();
