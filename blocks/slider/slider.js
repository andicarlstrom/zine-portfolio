import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
    const ul = document.createElement('ul');
    [...block.children].forEach((row) => {
        const li = document.createElement('li');
        while (row.firstElementChild) li.append(row.firstElementChild);
        li.className = 'slider-image';
        ul.append(li);
        row.remove();
    });
    ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
    block.append(ul);
}