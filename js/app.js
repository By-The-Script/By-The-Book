import { db } from './firebase.js';
import { initAuthState } from './auth-state.js';
import { initAuthUI } from './auth-ui.js';
import { configureRouter, initHashListener, navigateTo } from './router.js';
import { updateTopNav, initRegisterPage } from './core.js';
import { loadBookDetails } from './pages/book.js';
import { showRandomBook, displayBooksByCategory } from './home.js';
import { loadBookshelfPage } from './pages/bookshelf.js';
import { initProfilePage } from './pages/profile.js';
import { initAchievementsPage } from './pages/achievements.js';
import { initFriendsPage } from './pages/friends.js';
import { initMyPostsPage } from './pages/my-posts.js';
import { initSettingsPage } from './pages/settings.js';
import { initShopPage } from './pages/shop.js';
import { initUploadPage } from './pages/upload.js';
import { initReaderPage } from './pages/reader.js';
import { initCommunityPage } from './pages/community.js';
import { initCommunityCreatePage } from './pages/community-create.js';
import { initCommunityDetailsPage } from './pages/community-details.js';
import { normalizeImagePath } from './image-paths.js';

let cachedBooks = null;

async function loadBooks() {
    if (cachedBooks) return cachedBooks;

    console.log('Dr. Meow is fetching data for the first time...');

    const snapshot = await db.collection('books').get();
    cachedBooks = [];
    snapshot.forEach((doc) => {
        const book = doc.data();
        cachedBooks.push({ id: doc.id, ...book, image: normalizeImagePath(book.image) });
    });
    return cachedBooks;
}

export function bindShellNavigation(container = document, nav) {
    container.querySelectorAll('[data-page]').forEach((element) => {
        if (element.dataset.navBound === 'true') return;

        element.dataset.navBound = 'true';

        element.addEventListener('click', () => {
            navigateTo(element.dataset.page);
        });
    });
}

export async function loadSiteData(pageName) {
    try {
        switch (pageName) {
            case 'home': {
                const books = await loadBooks();
                showRandomBook(books);
                displayBooksByCategory(books);
                break;
            }
            case 'book':
                await loadBookDetails();
                break;
            case 'profile':
                initProfilePage();
                break;
            case 'friends':
                initFriendsPage();
                break;
            case 'achievements':
                initAchievementsPage();
                break;
            case 'my-posts':
                initMyPostsPage();
                break;
            case 'bookshelf':
                loadBookshelfPage();
                break;
            case 'shop':
                initShopPage();
                break;
            case 'settings':
                initSettingsPage();
                break;
            case 'register':
                initRegisterPage();
                break;
            case 'news':
            case 'my-stats':
            case 'community':
                initCommunityPage();
                break;
            case 'community-create':
                initCommunityCreatePage();
                break;
            case 'community-details':
                await initCommunityDetailsPage();
                break;
            case 'search':
            case 'reviews':
            case 'forums':
            case 'quizzes':
            case 'terms':
            case 'privacy':
            case 'upload':
                initUploadPage();
                break;
            case 'reader':
                await initReaderPage();
                break;
            case 'read':
            case 'book-list':
                break;
            default:
                break;
        }
    } catch (error) {
        console.error('Cloud Error:', error);
    }
}

export function startApp() {
    initAuthUI();
    initAuthState();
    bindShellNavigation();

    configureRouter({
        loadPage: loadSiteData,
        updateTopNav,
        pageBasePath: 'pages/',
    });

    initHashListener();
    navigateTo(window.location.hash.replace('#', '') || 'home');
}
