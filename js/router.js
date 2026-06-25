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
    read: 'upload',
    upload: 'upload',
    reader: 'upload',
};

export const navbars = {
    home: `
        <div class="top-nav">
            <a href="#">Reviews</a>
            <a href="#">Blogs</a>
            <a href="#">Forums</a>
            <a href="#">Quizzes</a>
            <a href="#">First Chapter</a>
            <a href="#">Search 🔍</a>
        </div>
    `,
    profile: `
        <div class="top-nav">
            <a href="#" onclick="navigateTo('profile')">My profile</a>
            <a href="#" onclick="navigateTo('my-posts')">My Posts</a>
            <a href="#" onclick="navigateTo('friends')">Friends</a>
            <a href="#" onclick="navigateTo('achievements')">Achievements</a>
            <a href="#" onclick="navigateTo('my-stats')">Statistics</a>
        </div>
    `,
    shop: `
        <div class="top-nav">
            <a href="#">Daily Deals</a>
            <a href="#">Skins</a>
            <a href="#">Quests</a>
            <a href="#">Premium</a>
        </div>
    `,
    news: `
        <div class="top-nav">
            <a href="#">Events</a>
            <a href="#">Updates</a>
            <a href="#">Community</a>
            <a href="#">Dr. Meow</a>
        </div>
    `,
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
