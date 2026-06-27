import { navigateTo } from '../router.js';
import { auth } from '../firebase.js';
import {
    getCommunity,
    joinCommunity,
    leaveCommunity,
    isMember,
} from '../services/communities.js';

function getCommunityId() {
    const hash = window.location.hash;
    if (!hash.includes('id=')) return null;
    return hash.split('id=')[1].split('&')[0];
}

function showMsg(text, type = '') {
    const el = document.getElementById('cd-msg');
    if (!el) return;
    el.textContent = text;
    el.className = type;
    el.style.display = text ? 'block' : 'none';
}

function formatDate(ts) {
    if (!ts) return 'Unknown';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString();
}

function renderCover(coverImage) {
    const wrap = document.getElementById('cd-cover-wrap');
    if (!wrap) return;
    wrap.innerHTML = coverImage
        ? `<img src="${coverImage}" alt="Community cover">`
        : '<div class="cover-placeholder">No cover image</div>';
}

function updateJoinLeave(community) {
    const user = auth.currentUser;
    const joinBtn = document.getElementById('cd-join-btn');
    const leaveBtn = document.getElementById('cd-leave-btn');
    const member = isMember(community, user?.uid);
    const isOwner = user?.uid === community.ownerId;

    if (joinBtn) joinBtn.style.display = (!member && user) ? 'inline-block' : 'none';
    if (leaveBtn) leaveBtn.style.display = (member && !isOwner) ? 'inline-block' : 'none';
}

function renderCommunity(community) {
    document.getElementById('cd-name').textContent = community.name;
    document.getElementById('cd-category').textContent = community.category || 'General';
    document.getElementById('cd-owner').textContent = community.ownerName || 'Unknown';
    document.getElementById('cd-members-count').textContent = community.membersCount || 0;
    document.getElementById('cd-created').textContent = formatDate(community.createdAt);
    document.getElementById('cd-description').textContent = community.description || 'No description.';
    renderCover(community.coverImage);
    updateJoinLeave(community);
}

async function reload() {
    const id = getCommunityId();
    const community = await getCommunity(id);
    if (!community) throw new Error('Community not found.');
    renderCommunity(community);
    return community;
}

async function handleJoin() {
    const id = getCommunityId();
    showMsg('');
    try {
        await joinCommunity(id);
        showMsg('You joined the community!', 'success');
        await reload();
    } catch (e) {
        showMsg(e.message, 'error');
    }
}

async function handleLeave() {
    const id = getCommunityId();
    showMsg('');
    try {
        await leaveCommunity(id);
        showMsg('You left the community.', 'success');
        await reload();
    } catch (e) {
        showMsg(e.message, 'error');
    }
}

export async function initCommunityDetailsPage() {
    const loading = document.getElementById('cd-loading');
    const error = document.getElementById('cd-error');
    const content = document.getElementById('cd-content');
    const id = getCommunityId();

    if (!id) {
        if (loading) loading.style.display = 'none';
        if (error) {
            error.textContent = 'No community selected.';
            error.style.display = 'block';
        }
        return;
    }

    const back = document.getElementById('cd-back-btn');
    if (back && back.dataset.bound !== 'true') {
        back.dataset.bound = 'true';
        back.addEventListener('click', () => navigateTo('community'));
    }

    const joinBtn = document.getElementById('cd-join-btn');
    if (joinBtn && joinBtn.dataset.bound !== 'true') {
        joinBtn.dataset.bound = 'true';
        joinBtn.addEventListener('click', handleJoin);
    }

    const leaveBtn = document.getElementById('cd-leave-btn');
    if (leaveBtn && leaveBtn.dataset.bound !== 'true') {
        leaveBtn.dataset.bound = 'true';
        leaveBtn.addEventListener('click', handleLeave);
    }

    try {
        const community = await getCommunity(id);
        if (!community) throw new Error('Community not found.');

        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';
        renderCommunity(community);
    } catch (e) {
        if (loading) loading.style.display = 'none';
        if (error) {
            error.textContent = e.message;
            error.style.display = 'block';
        }
    }
}
