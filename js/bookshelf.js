import { navigateTo } from '../router.js';

export function loadBookshelf() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const container = document.getElementById('favorites');
    if (!container) return;

    container.innerHTML = '';

    favorites.forEach((book) => {
        const image = document.createElement('img');
        image.src = book.image;
        image.onclick = () => navigateTo(`book?id=${book.id}`);
        container.appendChild(image);
    });
}
