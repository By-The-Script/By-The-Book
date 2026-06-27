import { navigateTo } from '../router.js';
import { getAllCommunities } from '../services/communities.js';

function showMsg(text, type = '') {
    const el = document.getElementById('community-list-msg');
    if (!el) return;
    el.textContent = text;
    el.className = type;
    el.style.display = text ? 'block' : 'none';
}

function renderCover(coverImage) {
    if (coverImage) {
        return `<img src="${coverImage}" alt="Community cover">`;
    }
    return '<div class="cover-placeholder">No cover</div>';
}

function renderList(communities) {
    const grid = document.getElementById('community-list-grid');
    const empty = document.getElementById('community-list-empty');
    const loading = document.getElementById('community-list-loading');
    if (!grid) return;

    if (loading) loading.style.display = 'none';
    grid.innerHTML = '';

    if (!communities.length) {
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    communities.forEach((c) => {
        const card = document.createElement('div');
        card.className = 'feature-card community-card';
        card.innerHTML = `
            ${renderCover(c.coverImage)}
            <h3>${c.name}</h3>
            <p>${c.category || 'General'}</p>
            <p>${c.membersCount || 0} members</p>
        `;
        card.onclick = () => navigateTo(`community-details?id=${c.id}`);
        grid.appendChild(card);
    });
}

async function loadCommunities() {
    const loading = document.getElementById('community-list-loading');
    if (loading) loading.style.display = 'block';
    showMsg('');

    try {
        const communities = await getAllCommunities();
        renderList(communities);
    } catch (e) {
        if (loading) loading.style.display = 'none';
        showMsg(e.message, 'error');
    }
}

export function initCommunityPage() {
    const createBtn = document.getElementById('community-create-btn');
    if (createBtn && createBtn.dataset.bound !== 'true') {
        createBtn.dataset.bound = 'true';
        createBtn.addEventListener('click', () => navigateTo('community-create'));
    }
    loadCommunities();
}
