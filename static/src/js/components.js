import { Component } from '../../config.js';

export function injectShell(targetId = 'app') {
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

    const headerNode = document.createElement('div');
    headerNode.innerHTML = Component.header;
    target.insertBefore(headerNode.firstElementChild, main);

    const footerNode = document.createElement('div');
    footerNode.innerHTML = Component.footer;
    target.appendChild(footerNode.firstElementChild);
}
