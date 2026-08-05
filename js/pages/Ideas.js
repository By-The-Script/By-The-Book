import { db, firebase } from "../firebase.js"; // שנה לנתיב הנכון

export function initIdeasPage() {

    const form = document.getElementById("idea-submission-form");
    if (!form) return;

    const submitBtn = document.getElementById("btn-submit-idea");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("idea-author-name").value.trim();
        const email = document.getElementById("idea-author-email").value.trim().toLowerCase();
        const category = document.getElementById("idea-category").value;
        const title = document.getElementById("idea-title").value.trim();
        const description = document.getElementById("idea-description").value.trim();

        if (!category || !title || !description) {
            alert("Please fill all required fields.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";

        try {

            await db.collection("ideas").add({
                name,
                email,
                category,
                title,
                description,
                status: "new",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("🎉 Thank you! Dr. Meow has received your idea.");

            form.reset();

        } catch (err) {

            console.error(err);

            alert("Something went wrong. Please try again.");

        } finally {

            submitBtn.disabled = false;
            submitBtn.innerHTML = "🚀 Send Idea";

        }

    });

}