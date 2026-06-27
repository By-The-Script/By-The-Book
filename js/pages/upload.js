import { navigateTo } from '../router.js';
import { auth } from '../firebase.js';
import { addBookToLibrary, getRecentlyAdded } from '../services/library.js';

let lastUploadedId = null;

function showError(msg) {
    const el = document.getElementById('upload-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
}

function showStatus(msg) {
    const el = document.getElementById('upload-status');
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
}

function coverLetter(title) {
    return (title || '?').charAt(0).toUpperCase();
}

function renderRecentUploads(books) {
    const grid = document.getElementById('recent-uploads-grid');
    const empty = document.getElementById('recent-uploads-empty');
    const loading = document.getElementById('recent-uploads-loading');
    if (!grid) return;

    if (loading) loading.style.display = 'none';
    grid.innerHTML = '';

    if (!books.length) {
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    books.forEach((book) => {
        const card = document.createElement('div');
        card.className = 'library-card';
        card.innerHTML = `
            <div class="lib-book-cover">${coverLetter(book.title)}</div>
            <h4>${book.title}</h4>
            <p>PDF</p>
        `;
        card.onclick = () => navigateTo(`reader?id=${book.id}`);
        grid.appendChild(card);
    });
}

async function loadRecentUploads() {
    const loading = document.getElementById('recent-uploads-loading');
    const empty = document.getElementById('recent-uploads-empty');

    if (!auth.currentUser) {
        if (empty) {
            empty.textContent = 'Please sign in to upload books.';
            empty.style.display = 'block';
        }
        return;
    }

    if (loading) loading.style.display = 'block';
    if (empty) empty.style.display = 'none';

    try {
        const books = await getRecentlyAdded(5);
        renderRecentUploads(books);
    } catch (e) {
        showError(e.message);
    }
}

function showSuccessActions() {
    const actions = document.getElementById('upload-success-actions');
    if (actions) actions.style.display = 'block';
}

async function handleUpload() {
    showError('');
    showStatus('');

    const fileInput = document.getElementById('upload-file');
    const titleInput = document.getElementById('upload-title');
    const btn = document.getElementById('upload-btn');
    const file = fileInput?.files?.[0];

    try {
        if (btn) btn.disabled = true;
        showStatus('Uploading...');
        const book = await addBookToLibrary(file, titleInput?.value?.trim());
        lastUploadedId = book.id;
        showStatus('Upload complete!');
        showSuccessActions();
        if (fileInput) fileInput.value = '';
        if (titleInput) titleInput.value = '';
        await loadRecentUploads();
    } catch (e) {
        showStatus('');
        showError(e.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

export function initUploadPage() {
    const btn = document.getElementById('upload-btn');
    if (btn && btn.dataset.bound !== 'true') {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', handleUpload);
    }

    const readNow = document.getElementById('upload-read-now');
    if (readNow && readNow.dataset.bound !== 'true') {
        readNow.dataset.bound = 'true';
        readNow.addEventListener('click', () => {
            if (lastUploadedId) navigateTo(`reader?id=${lastUploadedId}`);
        });
    }

    const goBookshelf = document.getElementById('upload-go-bookshelf');
    if (goBookshelf && goBookshelf.dataset.bound !== 'true') {
        goBookshelf.dataset.bound = 'true';
        goBookshelf.addEventListener('click', () => navigateTo('bookshelf'));
    }

    loadRecentUploads();
}
