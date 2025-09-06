import { Config } from '../../config.js';

export function injectBrand() {
    const brand = Config.Brand || 'Brand';
    const current = document.title;

    if (!current) {
        document.title = brand;
        return;
    }

    if (!current.endsWith(' - ' + brand)) {
        document.title = current + ' - ' + brand;
    }
}
