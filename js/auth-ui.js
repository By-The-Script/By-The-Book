import { auth, firebase } from './firebase.js';
import { navigateTo } from './router.js';

let authUiInitialized = false;

function getTooltip() {
    return document.getElementById('authTooltip');
}

export function openTooltip(elementId = 'authTooltip') {
    const tooltip = document.getElementById(elementId);
    if (tooltip) tooltip.style.display = 'block';
}

export function closeTooltip(elementId = 'authTooltip') {
    const tooltip = document.getElementById(elementId);
    if (tooltip) tooltip.style.display = 'none';
}

export function toggleTooltip(elementId = 'authTooltip') {
    const tooltip = document.getElementById(elementId);
    if (!tooltip) return;

    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
}

async function signInWithProvider(provider) {
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function signIn() {
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    try {
        const user = await auth.signInWithEmailAndPassword(email, password);
        console.log('Logged in:', user.user.email);
    } catch (error) {
        alert(error.message);
    }
}

function bindTermsGate() {
    const checkbox = document.getElementById('termsCheckbox');
    const buttons = document.querySelectorAll('.requires-terms');

    if (!checkbox) return;

    buttons.forEach((button) => {
        if (button.dataset.termsBound === 'true') return;

        button.dataset.termsBound = 'true';
        button.addEventListener('mouseenter', () => {
            if (!checkbox.checked) button.style.cursor = 'not-allowed';
        });
        button.addEventListener('mouseleave', () => {
            button.style.cursor = 'pointer';
        });
        button.addEventListener('click', (event) => {
            if (checkbox.checked) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            const termsBox = document.querySelector('.terms-box');
            if (!termsBox) return;

            termsBox.classList.add('shake');
            setTimeout(() => termsBox.classList.remove('shake'), 400);
        }, true);
    });
}

export function initAuthUI() {
    if (authUiInitialized) return;
    authUiInitialized = true;

    document.getElementById('open-tooltip')?.addEventListener('click', () => {
        toggleTooltip('authTooltip');
    });

    document.getElementById('close-tooltip')?.addEventListener('click', () => {
        closeTooltip('authTooltip');
    });

    document.getElementById('login-btn')?.addEventListener('click', signIn);
    document.getElementById('google-login')?.addEventListener('click', () => {
        signInWithProvider(new firebase.auth.GoogleAuthProvider());
    });
    document.getElementById('git-hub-login')?.addEventListener('click', () => {
        signInWithProvider(new firebase.auth.GithubAuthProvider());
    });
    document.getElementById('microsoft-login')?.addEventListener('click', () => {
        signInWithProvider(new firebase.auth.OAuthProvider('microsoft.com'));
    });

    document.getElementById('go-register-btn')?.addEventListener('click', () => {
        closeTooltip('authTooltip');
        navigateTo('register');
    });

    document.getElementById('terms-btn')?.addEventListener('click', () => {
        navigateTo('terms');
    });

    document.getElementById('privacy-btn')?.addEventListener('click', () => {
        navigateTo('privacy');
    });

    bindTermsGate();
}

window.toggleTooltip = toggleTooltip;
window.closeTooltip = closeTooltip;
window.openTooltip = openTooltip;
window.getAuthTooltip = getTooltip;
