import { getUserBook, saveReadingProgress } from '../services/user-books.js';

let pdfDoc = null;
let currentPage = 1;
let bookId = null;
let saving = false;

function getBookIdFromURL() {
    const hash = window.location.hash;
    if (!hash.includes('id=')) return null;
    return hash.split('id=')[1].split('&')[0];
}

function updateUI() {
    const total = pdfDoc?.numPages || 0;
    const cur = document.getElementById('reader-current');
    const tot = document.getElementById('reader-total');
    const pct = document.getElementById('reader-percent');
    if (cur) cur.textContent = currentPage;
    if (tot) tot.textContent = total;
    if (pct && total) pct.textContent = `${Math.round((currentPage / total) * 100)}%`;
}

async function persistProgress() {
    if (!bookId || !pdfDoc || saving) return;
    saving = true;
    try {
        await saveReadingProgress(bookId, currentPage, pdfDoc.numPages);
    } finally {
        saving = false;
    }
}

async function renderPage(num) {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(num);
    const canvas = document.getElementById('reader-canvas');
    const ctx = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: 1.2 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: ctx, viewport }).promise;
    updateUI();
    await persistProgress();
}

async function goPage(delta) {
    if (!pdfDoc) return;
    const next = currentPage + delta;
    if (next < 1 || next > pdfDoc.numPages) return;
    currentPage = next;
    await renderPage(currentPage);
}

function showError(msg) {
    const el = document.getElementById('reader-error');
    const loading = document.getElementById('reader-loading');
    if (loading) loading.style.display = 'none';
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}

export async function initReaderPage() {
    bookId = getBookIdFromURL();
    if (!bookId) {
        showError('No book selected.');
        return;
    }

    const loading = document.getElementById('reader-loading');
    if (loading) loading.style.display = 'block';

    try {
        const book = await getUserBook(bookId);
        if (!book) throw new Error('Book not found.');
        if (!book.downloadURL) throw new Error('Missing PDF URL.');

        const pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) throw new Error('PDF viewer failed to load.');

        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const task = pdfjsLib.getDocument(book.downloadURL);
        pdfDoc = await task.promise;

        currentPage = Math.min(Math.max(book.currentPage || 1, 1), pdfDoc.numPages);
        if (loading) loading.style.display = 'none';
        await renderPage(currentPage);

        const prev = document.getElementById('reader-prev');
        const next = document.getElementById('reader-next');
        if (prev && prev.dataset.bound !== 'true') {
            prev.dataset.bound = 'true';
            prev.addEventListener('click', () => goPage(-1));
        }
        if (next && next.dataset.bound !== 'true') {
            next.dataset.bound = 'true';
            next.addEventListener('click', () => goPage(1));
        }

        window.addEventListener('beforeunload', persistProgress);
        window.addEventListener('hashchange', persistProgress);
    } catch (e) {
        showError(e.message);
    }
}
