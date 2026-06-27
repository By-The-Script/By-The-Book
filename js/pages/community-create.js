import { navigateTo } from '../router.js';
import { createCommunity } from '../services/communities.js';

function showMsg(text, type = '') {
    const el = document.getElementById('cc-msg');
    if (!el) return;
    el.textContent = text;
    el.className = type;
    el.style.display = text ? 'block' : 'none';
}

async function handleSubmit() {
    const btn = document.getElementById('cc-submit');
    showMsg('');

    try {
        if (btn) btn.disabled = true;
        showMsg('Creating community...', 'success');

        const community = await createCommunity({
            name: document.getElementById('cc-name')?.value,
            description: document.getElementById('cc-description')?.value,
            category: document.getElementById('cc-category')?.value,
            coverFile: document.getElementById('cc-cover')?.files?.[0] || null,
        });

        showMsg('Community created!', 'success');
        navigateTo(`community-details?id=${community.id}`);
    } catch (e) {
        showMsg(e.message, 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}

export function initCommunityCreatePage() {
    const submit = document.getElementById('cc-submit');
    const cancel = document.getElementById('cc-cancel');

    if (submit && submit.dataset.bound !== 'true') {
        submit.dataset.bound = 'true';
        submit.addEventListener('click', handleSubmit);
    }

    if (cancel && cancel.dataset.bound !== 'true') {
        cancel.dataset.bound = 'true';
        cancel.addEventListener('click', () => navigateTo('community'));
    }
}
