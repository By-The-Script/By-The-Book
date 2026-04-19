//--- Imports ---
import { db } from './main.js';

//--------------------------------------------------------------------------------------

//--- BookDetails Functions---
function getBookIdFromURL() {
    const hash = window.location.hash;
    if (hash.includes('id=')) {
        return hash.split('id=')[1].split('&')[0];
    }
    return null;
}

export async function loadBookDetails() {
    const id = getBookIdFromURL();
    if (!id) return;

    try {
        const doc = await db.collection("books").doc(id).get();
        if (!doc.exists) return;

        const book = doc.data();
        document.getElementById('rec-book-name').innerText = book.title;
        document.getElementById('rec-author').innerHTML = "By: " + book.author;
        document.getElementById('rec-summary').innerText = book.summary || book.description;
        document.getElementById('book-image').src = book.image;

        if (book.series) {
            const seriesEl = document.getElementById('rec-series');
            seriesEl.innerText = book.series + " series";
            seriesEl.style.display = "inline-block";
            loadRelatedBySeries(book.series, id);
        }
        
        if (book.tags) {
            const tagsContainer = document.getElementById('rec-tags');
            tagsContainer.innerHTML = '';
            book.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.innerText = tag;
                tagsContainer.appendChild(span);
            });
            loadRelatedByTags(book.tags, id, book.series);
        }
    } catch (e) { console.error(e); }
}

async function loadRelatedBySeries(seriesName, currentId) {
    const container = document.getElementById('otherInSeries');
    if (!container) return;
    const snap = await db.collection("books").where("series", "==", seriesName).limit(5).get();
    renderSmallCards(container, snap, currentId, "More in the Series");
}

async function loadRelatedByTags(tags, currentId, currentSeries) {
    const container = document.getElementById('relatedBooks');
    if (!container || !tags) return;

    const snap = await db.collection("books")
        .where("tags", "array-contains-any", tags.slice(0, 10))
        .limit(10)
        .get();

    let html = `<div class="related-section">
        <span class="section-title">You Might Also Like</span>
        <div class="cards-grid">`;

    snap.forEach(doc => {
        const b = doc.data();

        if (
            doc.id !== currentId &&
            (!currentSeries || b.series !== currentSeries)
        ) {
            html += renderSmallBookCard(doc.id, b);
        }
    });

    html += '</div></div>';
    container.innerHTML = html;
}

function renderSmallCards(container, snapshot, currentId, title) {
    let html = `<div class="related-section"><span class="section-title">${title}</span><div class="cards-grid">`;
    snapshot.forEach(doc => {
        if (doc.id !== currentId) {
            const b = doc.data();
            html += renderSmallBookCard(doc.id, b);
        }
    });
    html += '</div></div>';
    container.innerHTML = html;
	document.querySelectorAll('.abadge').forEach(el => {
    el.addEventListener('click', () => {
        const bookId = el.getAttribute('data-book-id');
        if (bookId) window.navigateTo(`book?id=${bookId}`);
        });
    });
}

function renderSmallBookCard(id, book) {
    return `
        <div class="small-card">
            <a href="#book?id=${id}" onclick="event.preventDefault(); navigateTo('book?id=${id}')">
                <img src="${book.image}" class="book-img"><br><br>
                <span class="abadge" data-book-id="${id}">${book.title}</span>
            </a>
        </div>`;
}