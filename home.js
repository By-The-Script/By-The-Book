// -- Imports ---
import { navigateTo, db } from './main.js';
//------------------------------------------------------------

// --- Functions for Home Page ---
export function showRandomBook(cachedBooks) {
    if (!cachedBooks || cachedBooks.length === 0) return;

    const randomIndex = Math.floor(Math.random() * cachedBooks.length);
    const book = cachedBooks[randomIndex];

    const recTitle = document.getElementById('rec-full');
    const recAuthor = document.getElementById('rec-author');
    const recDescription = document.getElementById('rec-description');
    const recRating = document.getElementById('rec-rating');
    const recImg = document.getElementById('rec-img');
    const recBtn = document.getElementById('rec-link-btn');

    if (recTitle) recTitle.innerText = `${book.series}: ${book.title}`;
    if (recAuthor) recAuthor.innerText = `By: ${book.author}`;
    if (recDescription) recDescription.innerText = book.description;
    if (recRating) recRating.innerText = `Rating: ${book.paws}`;
    if (recImg) {
        recImg.src = book.image;
        recImg.style.display = 'block';
    }
    if (recBtn) {
        recBtn.setAttribute('data-book-id', book.id);
        recBtn.onclick = () => {
            navigateTo(`book?id=${book.id}`);
        };
    }
}

export function displayBooksByCategory(cachedBooks) {
    if (!cachedBooks || cachedBooks.length === 0) return;

    const popularContainer = document.getElementById('popular-container');
    const newContainer = document.getElementById('new-container');

    if (popularContainer) popularContainer.innerHTML = '';
    if (newContainer) newContainer.innerHTML = '';

    cachedBooks.forEach(book => {
        const bookHTML = document.createElement('div');
        bookHTML.className = 'book-item';
        bookHTML.style.textAlign = 'center';
        bookHTML.style.margin = '10px';

        bookHTML.innerHTML = `
            <a href="javascript:void(0);" class="via-book-link" data-book-id="${book.id}">
                <img src="${book.image}" class="book-img">
            </a>
            <h3 style="font-size: 15px; margin: 10px 0; max-width: 200px;">${book.series}: ${book.title}</h3>
            <button class="abadge" data-book-id="${book.id}" style="padding: 8px 15px; font-size: 12px;">VIEW BOOK</button>
        `;

        if (book.status === 'popular' && popularContainer) {
            popularContainer.appendChild(bookHTML);
        } else if (book.status === 'new' && newContainer) {
            newContainer.appendChild(bookHTML);
        }
    });

    document.querySelectorAll('.abadge').forEach(el => {
        el.addEventListener('click', () => {
            const bookId = el.getAttribute('data-book-id');
            if (bookId) window.navigateTo(`book?id=${bookId}`);
        });
    });
}