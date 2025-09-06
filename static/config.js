export const Config = {
    Brand: 'MHA',
};

export const Component = {
    header: `
        <header role="banner" class="text-center mb-8">
                <div class="flex items-center justify-center mb-4 gap-3">
                    <div class="logo">
                        <img src="assets/images/Logo.webp" alt="Logo" />
                    </div>
                    <div class="text-left">
                        <h1 class="text-2xl font-bold text-white">
                            ${Config.Brand}
                        </h1>
                    </div>
                </div>
            </header>
      `,

    footer: `
            <footer role="contentInfo" class="text-center">
                <p class="text-white/60 text-xs">
                    ©
                    <span id="currentYear">
                    ${new Date().getFullYear()}
                    </span>
                    ${Config.Brand}. All rights reserved.
                </p>
            </footer>
      `,
};
