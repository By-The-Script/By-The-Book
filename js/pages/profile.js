import { auth, db } from '../firebase.js';
import { subscribeToAuthState } from '../auth-state.js';
import { showInlineMessage } from '../ui/feedback.js';

let authSubscriptionInitialized = false;

export function switchProfileTab(tabId, button) {
    document.querySelectorAll('.profile-tab-content')
        .forEach((tab) => tab.classList.remove('active-tab'));

    document.querySelectorAll('.profile-tab')
        .forEach((tab) => tab.classList.remove('active'));

    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add('active-tab');
    if (button) button.classList.add('active');
}

function showMessage(message, success = true) {
    showInlineMessage('profile-msg', message, success);
}

function renderGuestProfile() {
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const avatar = document.getElementById('profile-pic');

    if (nameEl) nameEl.textContent = 'Guest Reader';
    if (emailEl) emailEl.textContent = 'Not signed in';
    if (avatar) avatar.src = 'assets/images/default-user.png';
}

async function syncProfilePage(user, profile) {
    if (!document.getElementById('profile-name')) return;

    if (!user) {
        renderGuestProfile();
        return;
    }

    const resolvedProfile = profile || {};
    const username = resolvedProfile.username || user.displayName || user.email?.split('@')[0] || 'Reader';

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const avatar = document.getElementById('profile-pic');
    const usernameInput = document.getElementById('edit-username');
    const displayInput = document.getElementById('edit-displayname');
    const emailInput = document.getElementById('edit-email');
    const bioInput = document.getElementById('edit-bio');

    if (nameEl) nameEl.textContent = username;
    if (emailEl) emailEl.textContent = user.email || 'No email';
    if (avatar) avatar.src = user.photoURL || 'assets/images/default-user.png';
    if (usernameInput) usernameInput.value = username;
    if (displayInput) displayInput.value = user.displayName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (bioInput) bioInput.value = resolvedProfile.bio || '';

    const xp = resolvedProfile.xp ?? 0;
    const mice = resolvedProfile.mice ?? resolvedProfile.cheese ?? 0;
    const streak = resolvedProfile.streak ?? 0;
    const bestStreak = resolvedProfile.bestStreak ?? streak;
    const level = Math.max(1, Math.floor(xp / 500) + 1);

    const streakEl = document.getElementById('day-streak');
    const bestEl = document.getElementById('best-streak');
    const levelEl = document.getElementById('user-level');
    const xpCurrent = document.getElementById('xp-current');
    const xpNext = document.getElementById('xp-next');
    const xpBar = document.getElementById('xp-bar');

    if (streakEl) streakEl.textContent = streak;
    if (bestEl) bestEl.textContent = bestStreak;
    if (levelEl) levelEl.textContent = level;
    if (xpCurrent) xpCurrent.textContent = `${xp} XP`;
    if (xpNext) xpNext.textContent = `${(level * 500) - xp} XP to next level`;
    if (xpBar) xpBar.style.width = `${((xp % 500) / 500) * 100}%`;

    const balanceEl = document.getElementById('mice-balance');
    if (balanceEl) balanceEl.textContent = `🐭 ${mice} Mice`;
}

export function initProfilePage() {
    if (!authSubscriptionInitialized) {
        authSubscriptionInitialized = true;
        subscribeToAuthState(syncProfilePage);
    }

    syncProfilePage(auth.currentUser);
}

export async function updateUsername() {
    const user = auth.currentUser;
    if (!user) return;

    const newName = document.getElementById('edit-username')?.value?.trim();
    if (!newName) {
        showMessage('Enter a username first', false);
        return;
    }

    try {
        await user.updateProfile({ displayName: newName });
        await db.collection('users').doc(user.uid).set({
            username: newName,
        }, { merge: true });

        const nameEl = document.getElementById('profile-name');
        if (nameEl) nameEl.textContent = newName;

        showMessage('Username updated!');
    } catch (error) {
        showMessage(error.message, false);
    }
}

async function updateDisplayName() {
    const user = auth.currentUser;
    if (!user) return;

    const displayName = document.getElementById('edit-displayname')?.value?.trim();
    if (!displayName) {
        showMessage('Enter a display name first', false);
        return;
    }

    try {
        await user.updateProfile({ displayName });
        showMessage('Display name updated!');
    } catch (error) {
        showMessage(error.message, false);
    }
}

async function updateEmailAddress() {
    const user = auth.currentUser;
    if (!user) return;

    const email = document.getElementById('edit-email')?.value?.trim();
    if (!email) {
        showMessage('Enter an email first', false);
        return;
    }

    try {
        await user.updateEmail(email);
        await db.collection('users').doc(user.uid).set({ email }, { merge: true });
        showMessage('Email updated!');
    } catch (error) {
        showMessage(error.message, false);
    }
}

export async function updatePasswordCustom() {
    const user = auth.currentUser;
    if (!user) return;

    const password = document.getElementById('edit-password')?.value;
    const confirm = document.getElementById('edit-confirm-password')?.value;

    if (password !== confirm) {
        showMessage('Passwords do not match', false);
        return;
    }

    if (!password || password.length < 6) {
        showMessage('Password must be at least 6 characters', false);
        return;
    }

    try {
        await user.updatePassword(password);
        showMessage('Password updated!');
    } catch (error) {
        showMessage(error.message, false);
    }
}

async function saveBio() {
    const user = auth.currentUser;
    if (!user) return;

    const bio = document.getElementById('edit-bio')?.value || '';
    await db.collection('users').doc(user.uid).set({ bio }, { merge: true });
    showMessage('Bio updated!');
}

document.addEventListener('click', (event) => {
    if (!event.target.classList.contains('save-field-btn')) return;

    const group = event.target.closest('.edit-field-group');

    if (group?.querySelector('#edit-username')) {
        updateUsername();
    } else if (group?.querySelector('#edit-displayname')) {
        updateDisplayName();
    } else if (group?.querySelector('#edit-email')) {
        updateEmailAddress();
    } else if (group?.querySelector('#edit-bio')) {
        saveBio();
    } else if (group?.querySelector('#edit-confirm-password')) {
        updatePasswordCustom();
    }
});

