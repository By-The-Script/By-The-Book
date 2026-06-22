function removeFriend(button, name) {
    if (!confirm(`Remove ${name} from your friends?`)) return;

    const card = button.closest('.friend-card');
    if (!card) return;

    card.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
        card.remove();
        const remaining = document.querySelectorAll('.friend-card').length;
        const count = document.getElementById('friend-count');
        const empty = document.getElementById('no-friends-msg');

        if (count) count.innerText = remaining;
        if (remaining === 0 && empty) empty.style.display = 'flex';
    }, 300);
}

export function initFriendsPage() {
    const search = document.getElementById('friend-search');
    if (search && search.dataset.bound !== 'true') {
        search.dataset.bound = 'true';
        search.addEventListener('input', function onSearch() {
            const query = this.value.toLowerCase();
            document.querySelectorAll('.friend-card').forEach((card) => {
                const name = card.querySelector('.friend-name')?.innerText.toLowerCase() || '';
                card.style.display = name.includes(query) ? '' : 'none';
            });
        });
    }

    window.removeFriend = removeFriend;
}
