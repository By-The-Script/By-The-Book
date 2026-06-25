import { navigateTo } from '../router.js';
import { auth } from '../firebase.js';
import { getUserBooks, uploadPdf } from '../services/user-books.js';

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

function renderLibrary(books) {
    const grid = document.getElementById('library-grid');
    const empty = document.getElementById('library-empty');
    const loading = document.getElementById('library-loading');
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
        const page = book.currentPage || 1;
        const total = book.totalPages || '?';
        card.innerHTML = `<h4>${book.title}</h4><p>Page ${page} / ${total}</p><p>PDF</p>`;
        card.onclick = () => navigateTo(`reader?id=${book.id}`);
        grid.appendChild(card);
    });
}

async function loadLibrary() {
    const loading = document.getElementById('library-loading');
    const empty = document.getElementById('library-empty');
    if (!auth.currentUser) {
        if (loading) loading.style.display = 'none';
        if (empty) {
            empty.textContent = 'Please sign in to view your library.';
            empty.style.display = 'block';
        }
        return;
    }

    if (loading) loading.style.display = 'block';
    if (empty) empty.style.display = 'none';

    try {
        const books = await getUserBooks();
        renderLibrary(books);
    } catch (e) {
        showError(e.message);
    }
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
        await uploadPdf(file, titleInput?.value?.trim());
        showStatus('Upload complete!');
        if (fileInput) fileInput.value = '';
        if (titleInput) titleInput.value = '';
        await loadLibrary();
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
    loadLibrary();
}
