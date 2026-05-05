//--- Imports ---
import { navigateTo, auth } from './main.js';

//-------------------------------------------------------------------------------------

//--- Functions ---
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

//--------------------------------------------------


// 🔴 LOGOUT
export function logout() {
    auth.signOut()
        .then(() => console.log("Logged out"))
        .catch(err => console.error(err));
}

// 👤 LISTENER 
export function initAuthListener() {
    auth.onAuthStateChanged(user => {
        const nameEl = document.querySelector('.account-btn');

        if (user) {
            if (nameEl) {
                nameEl.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${user.displayName}`;
            }
        } else {
            if (nameEl) {
                nameEl.innerHTML = `<i class="fa-solid fa-circle-user"></i> GUEST MODE`;
            }
        }
    });
}
export function signUp() {
    const email = emailInput.value;
    const password = passwordInput.value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => console.log("Signed up:", user.user.email))
        .catch(err => alert(err.message));
}
