import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db } from "../firebase.js"; // שנה לנתיב הנכון אצלך

export function initWaitlistPage() {
    const waitlistForm = document.getElementById("waitlist-form");
    if (!waitlistForm) return;

    const submitBtn = document.getElementById("submit-btn");
    const feedbackEl = document.getElementById("waitlist-feedback");

    waitlistForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("user-email").value.trim();
        const name = document.getElementById("user-name").value.trim();
        const phone = document.getElementById("user-phone").value.trim();

        if (!email) {
            showFeedback("Please enter a valid email address.", "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = "Submitting...";

        try {
            const snapshot = await db
            .collection("waitlist")
            .where("email", "==", email)
            .get();

            if (!snapshot.empty) {
                showFeedback(
                    "😺 Dr. Meow already has your email! You're already on the waitlist.",
                    "success"
                );
                return;
            }
            await db.collection("waitlist").add({
                email,
                name: name || "",
                phone: phone || "",
                source: "Dr. Meow's Lab",
                status: "waiting",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            waitlistForm.reset();

            showFeedback(
                "🎉 Welcome to Dr. Meow's Lab! You're officially on the waitlist.",
                "success"
            );

        } catch (error) {
            console.error("Waitlist Error:", error);
            showFeedback(
                "Something went wrong. Please try again.",
                "error"
            );
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML =
                '<span class="btn-icon">🚀</span> Join the Waitlist';
        }
    });

    function showFeedback(message, type) {
        feedbackEl.textContent = message;
        feedbackEl.className = `waitlist-feedback ${type}`;
    }
}