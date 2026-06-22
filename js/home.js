import { navigateTo } from './router.js';
import { bindBookNavigation, renderBookCard } from './ui/book-card.js';

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
        recBtn.dataset.bookId = book.id;
        recBtn.onclick = () => navigateTo(`book?id=${book.id}`);
    }
}

export function displayBooksByCategory(cachedBooks) {
    if (!cachedBooks || cachedBooks.length === 0) return;

    const popularContainer = document.getElementById('popular-container');
    const newContainer = document.getElementById('new-container');

    if (popularContainer) popularContainer.innerHTML = '';
    if (newContainer) newContainer.innerHTML = '';

    cachedBooks.forEach((book) => {
        const bookHtml = renderBookCard(book);

        if (book.status === 'popular' && popularContainer) {
            popularContainer.insertAdjacentHTML('beforeend', bookHtml);
        } else if (book.status === 'new' && newContainer) {
            newContainer.insertAdjacentHTML('beforeend', bookHtml);
        }
    });

    bindBookNavigation(popularContainer);
    bindBookNavigation(newContainer);
}
