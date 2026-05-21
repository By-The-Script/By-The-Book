// -------------------------------------------------------
// main.js — Firebase init, routing, data management
// -------------------------------------------------------

const firebaseConfig = {
    apiKey: "AIzaSyCVC-CQK_umSHnPT5FOvvclut_WN2Ll0to",
    authDomain: "by-the-book-3120c.firebaseapp.com",
    projectId: "by-the-book-3120c",
    storageBucket: "by-the-book-3120c.firebasestorage.app",
    messagingSenderId: "795787841752",
    appId: "1:795787841752:web:52b7657d0ffe31739847ad",
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
export const db = firebase.firestore();
export const auth = firebase.auth();
window.firebaseAuth = firebase.auth();
let cachedBooks = null;
window.navigateTo = navigateTo;

// -------------------------------------------------------
// Imports
// -------------------------------------------------------

import { initApp, signUp, initRegisterPage, handleRegister, updateTopNav } from './core.js';
import { showRandomBook, displayBooksByCategory } from './home.js';
import { loadBookDetails } from './book.js';
import { switchProfileTab, updateUsername, updatePasswordCustom,  } from './profile.js';
import { loadBookshelf } from './bookshelf.js';

// -------------------------------------------------------
// App Startup
// -------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
    initApp();

    const container = document.getElementById('load-page');
    container.addEventListener('click', e => {
        const target = e.target;
        if (target.matches('.abadge') || target.matches('.view-book-link')) {
            const bookId = target.dataset.bookId;
            if (bookId) navigateTo(`book?id=${bookId}`);
        }
    });

    const hash = window.location.hash.replace('#', '');
    if (hash) {
        navigateTo(hash);
    } else {
        navigateTo('home');
    }

    document.querySelectorAll('.side-item').forEach(el => {
        el.addEventListener('click', () => {
            const page = el.dataset.page;
            if (page) navigateTo(page);
        });
    });

    const checkbox = document.getElementById("termsCheckbox");
    const buttons = document.querySelectorAll(".requires-terms");

    buttons.forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            if (!checkbox.checked) btn.style.cursor = "not-allowed";
        });
        btn.addEventListener("mouseleave", () => {
            btn.style.cursor = "pointer";
        });
        btn.addEventListener("click", (e) => {
            if (!checkbox.checked) {
                e.preventDefault();
                e.stopImmediatePropagation();
                shakeTerms();
                return false;
            }
        }, true);
    });
});

// -------------------------------------------------------
// Shake Terms Animation
// -------------------------------------------------------

function shakeTerms() {
    const termsBox = document.querySelector(".terms-box");
    if (!termsBox) return;
    termsBox.classList.add("shake");
    setTimeout(() => termsBox.classList.remove("shake"), 400);
}

// -------------------------------------------------------
// Auth State — hide tooltip on login
// -------------------------------------------------------

auth.onAuthStateChanged(user => {
    const tooltip = document.getElementById('authTooltip');
    if (user && tooltip) tooltip.style.display = 'none';
});

firebase.auth().onAuthStateChanged(user => {

    const signInBtn = document.getElementById("open-tooltip");
    const accountName = document.getElementById("account-name");
    const profilePic = document.getElementById("profile-pic");

    if (user) {

        // hide sign in button
        signInBtn.style.display = "none";

        // update account button
        accountName.textContent =
            user.displayName || user.email;

        // profile picture
        if (user.photoURL) {
            profilePic.src = user.photoURL;
        }

    } else {

        // show sign in button
        signInBtn.style.display = "block";

        // guest mode
        accountName.textContent = "GUEST MODE";

        // default image
        profilePic.src = "pictures/default-user.png";
    }
});

// -------------------------------------------------------
// Hash-based Routing
// -------------------------------------------------------

let currentPage = '';

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash !== currentPage) navigateTo(hash);
});

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
	read: 'upload'
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
			<a href="" onclick="navigateTo('profile')"> My profile</a>
            <a href="#" onclick="navigateTo('my-posts')">My Posts</a>
            <a href="#" onclick="navigateTo('friends')">Friends</a>
            <a href="#" onclick="navigateTo('achievements')">Achievements</a>
            <a href="#"onclick="navigateTo('my-stats')">Statistics</a>
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
    `
};

function setActiveSidebar(page) {
    const tab = pageToTab[page];
    document.querySelectorAll('.side-item').forEach(el => el.classList.remove('side-item-active'));
    const active = document.querySelector(`.side-item[data-page="${tab}"]`);
    if (active) active.classList.add('side-item-active');
}

// -------------------------------------------------------
// Router
// -------------------------------------------------------

export async function navigateTo(path) {
    try {
        const fileName = path.split('?')[0];
        currentPage = path;
        setActiveSidebar(fileName);

        const response = await fetch(`${fileName}.html`);
        if (!response.ok) throw new Error(`Page ${fileName} missing`);

        const content = await response.text();
        document.getElementById('load-page').innerHTML = content;

        if (window.location.hash !== `#${path}`) {
            window.location.hash = `#${path}`;
        }
		
		updateTopNav(fileName);

        loadSiteData(fileName);

    } catch (err) {
        console.error("Meow! Routing error:", err);
    }
}

// -------------------------------------------------------
// Data & Page Logic
// -------------------------------------------------------

async function loadSiteData(pageName) {
    if (!cachedBooks) {
        console.log("Dr. Meow is fetching data for the first time...");
        try {
            const snapshot = await db.collection("books").get();
            cachedBooks = [];
            snapshot.forEach(doc => cachedBooks.push({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Cloud Error:", error);
            return;
        }
    }

    switch (pageName) {
        case 'home':
            showRandomBook(cachedBooks);
            displayBooksByCategory(cachedBooks);
            break;
        case 'book':
            loadBookDetails();
            break;
        case 'profile':
            break;
        case 'bookshelf':
            loadBookshelf();
            break;
        case 'news':
            // loadNews() — coming soon
            break;
        case 'register':
            initRegisterPage();
            break;
    }

    if (typeof refreshUserStats === 'function') refreshUserStats();
}


// Basic starter backend helpers
async function createStarterProfile(user){
    const ref = firebase.firestore().collection('users').doc(user.uid);

    const doc = await ref.get();

    if(!doc.exists){
        await ref.set({
            username: user.displayName || "Reader",
            email: user.email || "",
            mice: 100,
            xp: 0,
            streak: 1,
            createdAt: new Date().toISOString()
        });
    }
}

firebase.auth().onAuthStateChanged(async(user)=>{
    if(user){
        await createStarterProfile(user);
    }
});
