// -------------------------------------------------------
// core.js — App startup, auth listener, register logic
// -------------------------------------------------------

import { navigateTo, auth, pageToTab, navbars } from './main.js';

// -------------------------------------------------------
// App Init
// -------------------------------------------------------

export async function initApp() {
    initAuthListener();
    console.log("Dr. Meow is starting the engine...");

    firebase.auth().onAuthStateChanged(user => {
        if (user && typeof updateSidebarForUser === 'function') {
            updateSidebarForUser(user);
        }
    });

    const hash = window.location.hash.replace('#', '').split('?')[0] || 'home';
    navigateTo(hash);
}

// -------------------------------------------------------
// Auth Listener — updates header button
// -------------------------------------------------------

export function initAuthListener() {
    auth.onAuthStateChanged(async user => {
        const nameEl = document.querySelector('.account-btn');
        const statsBar = document.getElementById('civ-stats-bar');

        if (user) {
            if (nameEl) nameEl.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${user.displayName || user.email.split('@')[0]}`;

            if (statsBar) {
                // Fetch mice + xp from Firestore
                let mice = 0, xp = 0;
                try {
                    const userDoc = await firebase.firestore().collection("users").doc(user.uid).get();
                    if (userDoc.exists) {
                        const data = userDoc.data();
                        mice = data.cheese ?? data.mice ?? 0;
                        xp   = data.xp ?? 0;
                    }
                } catch (e) { console.warn("Could not load user stats", e); }

                const miceEl = document.getElementById('stat-mice');
                const xpEl   = document.getElementById('stat-xp');
                if (miceEl) miceEl.textContent = mice + ' Mice';
                if (xpEl)   xpEl.textContent   = xp + ' XP';

                statsBar.style.display = 'flex';
            }
        } else {
            if (nameEl) nameEl.innerHTML = `<i class="fa-solid fa-circle-user"></i> GUEST MODE`;
            if (statsBar) statsBar.style.display = 'none';
        }
    });
}

export function updateTopNav(pageName) {

    const nav = document.getElementById("top-nav");

    if (!nav) return;

    const tab = pageToTab[pageName] || 'home';

    nav.innerHTML = navbars[tab] || navbars.home;
}

// -------------------------------------------------------
// Logout
// -------------------------------------------------------

export function logout() {
    auth.signOut()
        .then(() => console.log("Logged out"))
        .catch(err => console.error(err));
}

// -------------------------------------------------------
// Sign Up (email/password — basic)
// -------------------------------------------------------

export function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => console.log("Signed up:", user.user.email))
        .catch(err => alert(err.message));
}

// -------------------------------------------------------
// Register Page — wire up buttons after page loads
// -------------------------------------------------------

export function initRegisterPage() {
    const submitBtn = document.getElementById('register-submit-btn');
    const signInBtn = document.getElementById('go-signin-btn');

    if (submitBtn) {
        submitBtn.addEventListener('click', handleRegister);
    }

    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            navigateTo('home');
			toggleAuthTooltip(auth-tooltip);
        });
    }
}

// -------------------------------------------------------
// Handle Registration
// -------------------------------------------------------

export async function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const errorBox = document.getElementById('error-message');

    const showError = (msg) => {
        errorBox.innerText = msg;
        errorBox.style.display = 'block';
    };

    if (password !== confirmPassword) {
        return showError("Passwords do not match!");
    }
    if (password.length < 6) {
        return showError("Password must be at least 6 characters.");
    }

    try {
        const userRef = firebase.firestore().collection("users");
        const snapshot = await userRef.where("username", "==", username).get();

        if (!snapshot.empty) {
            return showError("Username is already taken. Try another one!");
        }

        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await userRef.doc(user.uid).set({
            username: username,
            email: email,
            cheese: 50,
            role: "reader",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("Registration successful!");
        navigateTo('profile');

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showError("This email is already registered.");
        } else {
            showError(error.message);
        }
    }
}
