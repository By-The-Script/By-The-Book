function filterAchievements(filter) {
    document.querySelectorAll('.toggle-ach-btn').forEach((button) => {
        button.classList.remove('active');
    });

    document.getElementById(`btn-${filter}`)?.classList.add('active');

    document.querySelectorAll('.ach-card').forEach((card) => {
        if (filter === 'all') {
            card.style.display = '';
        } else {
            card.style.display = card.dataset.status === filter ? '' : 'none';
        }
    });
}

export function initAchievementsPage() {
    window.filterAchievements = filterAchievements;
}
