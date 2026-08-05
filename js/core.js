import { auth, db, firebase } from './firebase.js';
import { navigateTo, navbars, pageToTab } from './router.js';
import { bindShellNavigation } from './app.js';

export function updateTopNav(pageName) {
    const nav = document.getElementById('top-nav');
    if (!nav) return;

    const tab = pageToTab[pageName] || 'home';
    nav.innerHTML = navbars[tab] || navbars.home;
    bindShellNavigation(nav);
}

export function logout() {
    auth.signOut()
        .then(() => console.log('Logged out'))
        .catch((error) => console.error(error));
}

export function initRegisterPage() {
    const submitBtn = document.getElementById('register-submit-btn');
    const signInBtn = document.getElementById('go-signin-btn');

    if (submitBtn && submitBtn.dataset.bound !== 'true') {
        submitBtn.dataset.bound = 'true';
        submitBtn.addEventListener('click', handleRegister);
    }

    if (signInBtn && signInBtn.dataset.bound !== 'true') {
        signInBtn.dataset.bound = 'true';
        signInBtn.addEventListener('click', () => {
            navigateTo('home');
            const tooltip = document.getElementById('authTooltip');
            if (tooltip) tooltip.style.display = 'none';
        });
    }
}

export async function handleRegister() {
    const username = document.getElementById('reg-username')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const confirmPassword = document.getElementById('reg-confirm-password')?.value;
    const errorBox = document.getElementById('error-message');

    const showError = (message) => {
        if (!errorBox) return;
        errorBox.innerText = message;
        errorBox.style.display = 'block';
    };

    if (!username || !email || !password) {
        showError('Please fill in every field.');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match!');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters.');
        return;
    }

    try {
        const userRef = db.collection('users');
        const snapshot = await userRef.where('username', '==', username).get();

        if (!snapshot.empty) {
            showError('Username is already taken. Try another one!');
            return;
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const { user } = userCredential;

        await userRef.doc(user.uid).set({
            username,
            email,
            mice: 50,
            cheese: 50,
            role: 'reader',
            xp: 0,
            streak: 1,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        console.log('Registration successful!');
        navigateTo('profile');
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showError('This email is already registered.');
        } else {
            showError(error.message);
        }
    }
}
