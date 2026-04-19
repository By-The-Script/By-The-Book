export function loadBookshelf() {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];

    const container = document.getElementById("favorites");
    container.innerHTML = "";

    favs.forEach(book => {
        const img = document.createElement("img");
        img.src = book.image;
        img.onclick = () => navigateTo(`book?id=${book.id}`);
        container.appendChild(img);
    });
}