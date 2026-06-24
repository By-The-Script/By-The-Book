import { db } from './firebase.js';
import { bindBookNavigation, renderCompactBookCard } from './ui/book-card.js';
import { normalizeImagePath } from './image-paths.js';

function getBookIdFromURL() {
    const hash = window.location.hash;
    if (!hash.includes('id=')) return null;

    return hash.split('id=')[1].split('&')[0];
}

export async function loadBookDetails() {
    const id = getBookIdFromURL();
    if (!id) return;

    try {
        const doc = await db.collection('books').doc(id).get();
        if (!doc.exists) return;

        const book = doc.data();
        book.image = normalizeImagePath(book.image);
        document.getElementById('rec-book-name').innerText = book.title;
        document.getElementById('rec-author').innerHTML = `By: ${book.author}`;
        document.getElementById('rec-summary').innerText = book.summary || book.description;
        document.getElementById('book-image').src = book.image;

        if (book.series) {
            const seriesEl = document.getElementById('rec-series');
            if (seriesEl) {
                seriesEl.innerText = `${book.series} series`;
                seriesEl.style.display = 'inline-block';
            }
            await loadRelatedBySeries(book.series, id);
        }

        if (book.tags) {
            const tagsContainer = document.getElementById('rec-tags');
            if (tagsContainer) {
                tagsContainer.innerHTML = '';
                book.tags.forEach((tag) => {
                    const span = document.createElement('span');
                    span.className = 'tag';
                    span.innerText = tag;
                    tagsContainer.appendChild(span);
                });
            }

            await loadRelatedByTags(book.tags, id, book.series);
        }
    } catch (error) {
        console.error(error);
    }
}

async function loadRelatedBySeries(seriesName, currentId) {
    const container = document.getElementById('otherInSeries');
    if (!container) return;

    const snapshot = await db.collection('books')
        .where('series', '==', seriesName)
        .limit(5)
        .get();

    renderSmallCards(container, snapshot, currentId, 'More in the Series');
}

async function loadRelatedByTags(tags, currentId, currentSeries) {
    const container = document.getElementById('relatedBooks');
    if (!container || !tags) return;

    const snapshot = await db.collection('books')
        .where('tags', 'array-contains-any', tags.slice(0, 10))
        .limit(10)
        .get();

    let html = `<div class="related-section">
        <span class="section-title">You Might Also Like</span>
        <div class="cards-grid">`;

    snapshot.forEach((doc) => {
        const book = doc.data();
        if (doc.id !== currentId && (!currentSeries || book.series !== currentSeries)) {
            html += renderCompactBookCard(doc.id, { ...book, image: normalizeImagePath(book.image) });
        }
    });

    html += '</div></div>';
    container.innerHTML = html;
    bindBookNavigation(container);
}

function renderSmallCards(container, snapshot, currentId, title) {
    let html = `<div class="related-section"><span class="section-title">${title}</span><div class="cards-grid">`;

    snapshot.forEach((doc) => {
        if (doc.id !== currentId) {
            const book = doc.data();
            html += renderCompactBookCard(doc.id, { ...book, image: normalizeImagePath(book.image) });
        }
    });

    html += '</div></div>';
    container.innerHTML = html;
    bindBookNavigation(container);
}
