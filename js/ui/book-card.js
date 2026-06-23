import { navigateTo } from '../router.js';
import { normalizeImagePath } from '../image-paths.js';

export function renderBookCard(book, options = {}) {
    const {
        title = `${book.series}: ${book.title}`,
        buttonLabel = 'VIEW BOOK',
        linkClass = 'view-book-link',
    } = options;

    const image = normalizeImagePath(book.image);

    return `
        <div class="book-item" style="text-align: center; margin: 10px;">
            <a href="#book?id=${book.id}" class="${linkClass}" data-book-id="${book.id}">
                <img src="${image}" class="book-img">
            </a>
            <h3 style="font-size: 15px; margin: 10px 0; max-width: 200px;">${title}</h3>
            <button class="abadge" data-book-id="${book.id}" style="padding: 8px 15px; font-size: 12px;">${buttonLabel}</button>
        </div>
    `;
}

export function renderCompactBookCard(id, book) {
    const image = normalizeImagePath(book.image);

    return `
        <div class="small-card">
            <a href="#book?id=${id}" class="view-book-link" data-book-id="${id}">
                <img src="${image}" class="book-img"><br><br>
                <span class="abadge" data-book-id="${id}">${book.title}</span>
            </a>
        </div>
    `;
}

export function bindBookNavigation(container = document) {
    if (!container) return;

    container.querySelectorAll('[data-book-id]').forEach((element) => {
        if (element.dataset.navBound === 'true') return;

        element.dataset.navBound = 'true';
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const { bookId } = element.dataset;
            if (bookId) navigateTo(`book?id=${bookId}`);
        });
    });
}
