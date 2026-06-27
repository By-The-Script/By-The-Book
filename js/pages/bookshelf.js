import { navigateTo } from '../router.js';
import { auth } from '../firebase.js';
import {
    getLibrary,
    getContinueReading,
    getRecentlyAdded,
    getLibraryStats,
    getReadingProgress,
} from '../services/library.js';

function coverLetter(title) {
    return (title || '?').charAt(0).toUpperCase();
}

function renderBookCard(book, options = {}) {
    const { showContinue = false } = options;
    const progress = getReadingProgress(book);
    const page = book.currentPage || 1;
    const total = book.totalPages || '?';

    const card = document.createElement('div');
    card.className = `feature-card lib-book-card${showContinue ? ' continue-card' : ''}`;
    card.innerHTML = `
        <div class="lib-book-cover">${coverLetter(book.title)}</div>
        <h4>${book.title}</h4>
        <p>Page ${page} / ${total}${book.totalPages ? ` (${progress}%)` : ''}</p>
        <p>PDF</p>
        ${showContinue ? '<button type="button" class="fake-btn continue-btn">Continue Reading</button>' : ''}
    `;

    const open = () => navigateTo(`reader?id=${book.id}`);
    card.onclick = (e) => {
        if (e.target.classList.contains('continue-btn')) return;
        open();
    };
    card.querySelector('.continue-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        open();
    });

    return card;
}

function renderGrid(container, books, emptyEl) {
    if (!container) return;
    container.innerHTML = '';
    if (!books.length) {
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    books.forEach((book) => container.appendChild(renderBookCard(book)));
}

async function loadBookshelf() {
    const loading = document.getElementById('bookshelf-loading');
    const guest = document.getElementById('bookshelf-guest');
    const content = document.getElementById('bookshelf-content');

    if (!auth.currentUser) {
        if (loading) loading.style.display = 'none';
        if (guest) guest.style.display = 'block';
        return;
    }

    try {
        const [library, continueBook, recent, stats] = await Promise.all([
            getLibrary(),
            getContinueReading(),
            getRecentlyAdded(5),
            getLibraryStats(),
        ]);

        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';

        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-reading').textContent = stats.reading;
        document.getElementById('stat-finished').textContent = stats.finished;

        const continueEl = document.getElementById('continue-reading');
        const continueEmpty = document.getElementById('continue-empty');
        if (continueEl) continueEl.innerHTML = '';
        if (continueBook) {
            if (continueEmpty) continueEmpty.style.display = 'none';
            continueEl?.appendChild(renderBookCard(continueBook, { showContinue: true }));
        } else {
            if (continueEmpty) continueEmpty.style.display = 'block';
        }

        renderGrid(document.getElementById('recently-added'), recent, null);
        renderGrid(document.getElementById('my-books'), library, document.getElementById('my-books-empty'));
    } catch (e) {
        if (loading) loading.textContent = e.message;
    }
}

export function loadBookshelfPage() {
    const uploadBtn = document.getElementById('bookshelf-upload-btn');
    if (uploadBtn && uploadBtn.dataset.bound !== 'true') {
        uploadBtn.dataset.bound = 'true';
        uploadBtn.addEventListener('click', () => navigateTo('upload'));
    }
    loadBookshelf();
}
