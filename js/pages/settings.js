import { auth } from '../firebase.js';
import { showToast } from '../ui/feedback.js';

const STORAGE_KEY = 'btb_settings';

function bindOnce(element, handler, eventName = 'click') {
    if (!element || element.dataset.bound === 'true') return;

    element.dataset.bound = 'true';
    element.addEventListener(eventName, handler);
}

function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

        Object.entries(saved).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (!element) return;

            if (element.type === 'checkbox') element.checked = value;
            else element.value = value;
        });

        if (saved.genres) {
            document.querySelectorAll('.genre-tag').forEach((button) => {
                button.classList.toggle('active', saved.genres.includes(button.dataset.genre));
            });
        }
    } catch (error) {
        console.warn('Could not load settings', error);
    }
}

function hideSaveBar() {
    const saveBar = document.getElementById('save-bar');
    if (saveBar) saveBar.style.display = 'none';
}

function markDirty() {
    const saveBar = document.getElementById('save-bar');
    if (saveBar) saveBar.style.display = 'flex';
}

function saveSettings() {
    const data = {};

    document.querySelectorAll('[id^="toggle-"], #daily-goal, #yearly-goal, #lang-select').forEach((element) => {
        if (element.type === 'checkbox') data[element.id] = element.checked;
        else data[element.id] = element.value;
    });

    data.genres = [...document.querySelectorAll('.genre-tag.active')].map((button) => button.dataset.genre);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    hideSaveBar();
    showToast('✅ Settings saved!');
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const confirmInput = document.getElementById('delete-confirm-input');

    if (modal) modal.style.display = 'none';
    if (confirmInput) confirmInput.value = '';
}

export function initSettingsPage() {
    document.querySelectorAll('.snav-btn').forEach((button) => {
        bindOnce(button, () => {
            document.querySelectorAll('.snav-btn').forEach((navButton) => navButton.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach((panel) => panel.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(button.dataset.target)?.classList.add('active');
        });
    });

    document.querySelectorAll('.genre-tag').forEach((button) => {
        bindOnce(button, () => {
            button.classList.toggle('active');
            markDirty();
        });
    });

    document.querySelectorAll('[id^="toggle-"], #daily-goal, #yearly-goal, #lang-select').forEach((element) => {
        bindOnce(element, markDirty, 'change');
    });

    const darkModeToggle = document.getElementById('toggle-dark-mode');
    bindOnce(darkModeToggle, function onToggle() {
            document.body.classList.toggle('dark-mode', this.checked);
            markDirty();
    }, 'change');

    const sizes = ['Small', 'Medium', 'Large', 'X-Large'];
    let sizeIndex = 1;
    const display = document.getElementById('font-display');

    bindOnce(document.getElementById('font-increase'), () => {
        if (display && sizeIndex < sizes.length - 1) {
            sizeIndex += 1;
            display.innerText = sizes[sizeIndex];
            markDirty();
        }
    });

    bindOnce(document.getElementById('font-decrease'), () => {
        if (display && sizeIndex > 0) {
            sizeIndex -= 1;
            display.innerText = sizes[sizeIndex];
            markDirty();
        }
    });

    bindOnce(document.getElementById('global-save-btn'), saveSettings);
    bindOnce(document.getElementById('save-reading-btn'), saveSettings);

    bindOnce(document.getElementById('discard-btn'), () => {
        loadSettings();
        hideSaveBar();
        showToast('↩️ Changes discarded.');
    });

    bindOnce(document.getElementById('reset-prefs-btn'), () => {
        if (!confirm('Reset all settings to default?')) return;
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    });

    bindOnce(document.getElementById('export-btn'), () => {
        const data = {
            note: 'Full data export coming soon. This is a placeholder.',
            timestamp: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bythebook-data.json';
        link.click();
        URL.revokeObjectURL(url);
    });

    bindOnce(document.getElementById('signout-all-btn'), () => {
        if (confirm('Sign out of all devices?')) {
            auth.signOut();
        }
    });

    bindOnce(document.getElementById('delete-content-btn'), () => {
        document.getElementById('modal-heading').innerText = 'Delete All Content?';
        document.getElementById('modal-body').innerText = 'This will permanently delete all your reviews, blog posts, and comments. Your account, Mice, and XP are not affected.';
        document.getElementById('delete-modal').style.display = 'flex';
    });

    bindOnce(document.getElementById('delete-account-btn'), () => {
        document.getElementById('modal-heading').innerText = 'Delete Account?';
        document.getElementById('modal-body').innerText = 'This will permanently delete your account, all your data, your Mice balance, your XP, and all your achievements. There is no going back.';
        document.getElementById('delete-modal').style.display = 'flex';
    });

    bindOnce(document.getElementById('modal-confirm-delete'), () => {
        const value = document.getElementById('delete-confirm-input')?.value.trim();
        if (value !== 'DELETE') {
            showToast('⚠️ Type DELETE in all caps to confirm.');
            return;
        }

        showToast('Account deletion requested. Goodbye 😿');
        closeDeleteModal();
    });

    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal && deleteModal.dataset.modalBound !== 'true') {
        deleteModal.dataset.modalBound = 'true';
        deleteModal.addEventListener('click', function onBackdropClick(event) {
            if (event.target === this) closeDeleteModal();
        });
    }

    loadSettings();
}

window.closeDeleteModal = closeDeleteModal;
