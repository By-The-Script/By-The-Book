import { auth, db, firebase } from './firebase.js';

const subscribers = new Set();
let authInitialized = false;
let hasResolvedInitialState = false;
let currentUser = null;
let currentProfile = null;

function getFallbackUsername(user) {
    return user?.displayName || user?.email?.split('@')[0] || 'Reader';
}

function getMouseBalance(data = {}) {
    return data.mice ?? data.cheese ?? 50;
}

async function loadUserProfile(user) {
    if (!user) return null;

    const doc = await db.collection('users').doc(user.uid).get();
    return doc.exists ? doc.data() : null;
}

async function renderAuthHeader(user, profile) {
    const signInBtn = document.getElementById('open-tooltip');
    const accountName = document.getElementById('account-name');
    const profilePic = document.getElementById('profile-pic');
    const tooltip = document.getElementById('authTooltip');

    if (!user) {
        if (signInBtn) signInBtn.style.display = 'block';
        if (accountName) accountName.textContent = 'GUEST MODE';
        if (profilePic) profilePic.src = 'assets/images/default-user.png';
        return;
    }

    if (signInBtn) signInBtn.style.display = 'none';
    if (accountName) {
        accountName.textContent = profile?.username || user.displayName || user.email || 'Reader';
    }
    if (profilePic) {
        profilePic.src = user.photoURL || 'assets/images/default-user.png';
    }
    if (tooltip) tooltip.style.display = 'none';
}

async function renderCivStats(user, profile) {
    const statsBar = document.getElementById('civ-stats-bar');
    const miceEl = document.getElementById('stat-mice');
    const xpEl = document.getElementById('stat-xp');

    if (!user) {
        if (statsBar) statsBar.style.display = 'none';
        return;
    }

    const resolvedProfile = profile || await loadUserProfile(user) || {};
    const mice = getMouseBalance(resolvedProfile);
    const xp = resolvedProfile.xp ?? 0;

    if (miceEl) miceEl.textContent = `${mice} Mice`;
    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (statsBar) statsBar.style.display = 'flex';
}

async function notifySubscribers(user, profile) {
    for (const subscriber of subscribers) {
        await Promise.resolve(subscriber(user, profile));
    }
}

export async function ensureUserProfile(user) {
    if (!user) return null;

    const ref = db.collection('users').doc(user.uid);
    const doc = await ref.get();
    const data = doc.exists ? doc.data() : {};
    const mice = getMouseBalance(data);
    const username = data.username || getFallbackUsername(user);
    const patch = {};

    if (!doc.exists) {
        patch.username = username;
        patch.email = user.email || '';
        patch.mice = mice;
        patch.cheese = mice;
        patch.role = 'reader';
        patch.xp = 0;
        patch.streak = 1;
        patch.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    } else {
        if (data.username == null) patch.username = username;
        if (data.email == null && user.email) patch.email = user.email;
        if (data.mice == null) patch.mice = mice;
        if (data.cheese == null) patch.cheese = mice;
    }

    if (Object.keys(patch).length > 0) {
        await ref.set(patch, { merge: true });
    }

    return { ...data, ...patch };
}

export function subscribeToAuthState(subscriber, options = {}) {
    const { immediate = true } = options;
    subscribers.add(subscriber);

    if (immediate && hasResolvedInitialState) {
        Promise.resolve(subscriber(currentUser, currentProfile));
    }

    return () => subscribers.delete(subscriber);
}

export function getCurrentUser() {
    return currentUser;
}

export async function refreshUserStats() {
    if (!currentUser) {
        await renderCivStats(null, null);
        return;
    }

    currentProfile = await loadUserProfile(currentUser);
    await renderCivStats(currentUser, currentProfile);
    await renderAuthHeader(currentUser, currentProfile);
}

export function initAuthState() {
    if (authInitialized) return;
    authInitialized = true;

    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        currentProfile = user ? await ensureUserProfile(user) : null;
        hasResolvedInitialState = true;

        await renderAuthHeader(user, currentProfile);
        await renderCivStats(user, currentProfile);
        await notifySubscribers(user, currentProfile);
    });
}

window.refreshUserStats = refreshUserStats;

