function filterPosts(type) {
    document.querySelectorAll('.post-filter-btn').forEach((button) => {
        button.classList.remove('active');
    });

    document.querySelector(`.post-filter-btn[data-type="${type}"]`)?.classList.add('active');

    let visible = 0;
    document.querySelectorAll('.post-item').forEach((item) => {
        if (type === 'all' || item.dataset.type === type) {
            item.style.display = '';
            visible += 1;
        } else {
            item.style.display = 'none';
        }
    });

    const count = document.getElementById('posts-count');
    const empty = document.getElementById('no-posts-msg');

    if (count) count.innerText = visible;
    if (empty) empty.style.display = visible === 0 ? 'flex' : 'none';
}

export function initMyPostsPage() {
    window.filterPosts = filterPosts;
}
