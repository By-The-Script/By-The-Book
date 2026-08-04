let currentPage = '';
let pageLoader = async () => {};
let topNavUpdater = () => {};
let pageBasePath = '';
let hashListenerInitialized = false;

export const pageToTab = {
    home: 'home',
    book: 'home',
    search: 'home',
    terms: 'home',
    privacy: 'home',
    profile: 'profile',
    register: 'profile',
    friends: 'profile',
    achievements: 'profile',
    'my-stats': 'profile',
    'my-posts': 'profile',
    bookshelf: 'bookshelf',
    news: 'news',
    shop: 'shop',
    settings: 'settings',
    'book-list': 'book-list',
    community: 'community',
    'community-create': 'community',
    'community-details': 'community',
    read: 'bookshelf',
    upload: 'bookshelf',
    reader: 'bookshelf',
    Ideas: 'Versions',
    Waitlist: 'Versions',
    Visions: 'Versions',
    Versions: 'Versions'
};

export const navbars = {
    home: `
        <div class="top-nav">
            <a href="#" data-page="reviews">Reviews</a>
            <a href="#" data-page="blogs">Blogs</a>
            <a href="#" data-page="forums">Forums</a>
            <a href="#" data-page="quizzes">Quizzes</a>
            <a href="#" data-page="first-chapter">First Chapter</a>
            <a href="#" data-page="search">Search 🔍</a>
        </div>
    `,
    profile: `
        <div class="top-nav">
            <a href="#" data-page="profile">My profile</a>
            <a href="#" data-page="my-posts">My Posts</a>
            <a href="#" data-page="friends">Friends</a>
            <a href="#" data-page="achievements">Achievements</a>
            <a href="#" data-page="my-stats">Statistics</a>
        </div>
    `,
    shop: `
        <div class="top-nav">
            <a href="#" data-page="daily-deals">Daily Deals</a>
            <a href="#" data-page="skins">Skins</a>
            <a href="#" data-page="quests">Quests</a>
            <a href="#" data-page="premium">Premium</a>
        </div>
    `,
    news: `
        <div class="top-nav">
            <a href="#" data-page="events">Events</a>
            <a href="#" data-page="updates">Updates</a>
            <a href="#" data-page="community">Community</a>
            <a href="#" data-page="dr-meow">Dr. Meow</a>
        </div>
    `,
    Versions: `
        <div class="top-nav">
            <a href="#" data-page="Ideas">Ideas</a>
            <a href="#" data-page="Waitlist">Waitlist</a>
            <a href="#" data-page="Visions">Vision</a>
            <a href="#" data-page="Versions">Versions</a>
        </div>
    `
};

function setActiveSidebar(page) {
    const tab = pageToTab[page];
    document.querySelectorAll('.side-item').forEach((element) => {
        element.classList.remove('side-item-active');
    });

    const active = document.querySelector(`.side-item[data-page="${tab}"]`);
    if (active) active.classList.add('side-item-active');
}

export function configureRouter(options = {}) {
    pageLoader = options.loadPage || pageLoader;
    topNavUpdater = options.updateTopNav || topNavUpdater;
    pageBasePath = options.pageBasePath || pageBasePath;
}

export function initHashListener() {
    if (hashListenerInitialized) return;
    hashListenerInitialized = true;

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash !== currentPage) navigateTo(hash || 'home');
    });
}

export async function navigateTo(path) {
    try {
        const targetPath = path || 'home';
        const fileName = targetPath.split('?')[0];

        currentPage = targetPath;
        setActiveSidebar(fileName);

        const response = await fetch(`${pageBasePath}${fileName}.html`);
        if (!response.ok) throw new Error(`Page ${fileName} missing`);

        const content = await response.text();
        const container = document.getElementById('load-page');
        if (container) container.innerHTML = content;

        if (window.location.hash !== `#${targetPath}`) {
            window.location.hash = `#${targetPath}`;
        }

        topNavUpdater(fileName);
        await pageLoader(fileName);
    } catch (error) {
        console.error('Meow! Routing error:', error);
    }
}

window.navigateTo = navigateTo;
