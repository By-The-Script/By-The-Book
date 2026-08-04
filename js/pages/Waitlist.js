// ייבוא פונקציות ה-Realtime Database מ-Firebase SDK v9+
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// במידה ואתה משתמש ב-App הקיים של האפליקציה:
// import { db } from './firebase-config.js'; 
// או אותחול ה-Database:
const db = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
  const waitlistForm = document.getElementById('waitlist-form');
  const submitBtn = document.getElementById('submit-btn');
  const feedbackEl = document.getElementById('waitlist-feedback');

  if (!waitlistForm) return;

  waitlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // שליפת הערכים מהטופס
    const email = document.getElementById('user-email').value.trim();
    const name = document.getElementById('user-name').value.trim();
    const phone = document.getElementById('user-phone').value.trim();

    if (!email) {
      showFeedback('Please enter a valid email address.', 'error');
      return;
    }

    // שינוי מצב כפתור בזמן שליחה
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';
    feedbackEl.classList.add('hidden');

    try {
      // שמירה ב-Firebase Realtime Database תחת ה-Node "waitlist"
      const waitlistRef = ref(db, 'waitlist');
      await push(waitlistRef, {
        email: email,
        name: name || null,
        phone: phone || null,
        createdAt: serverTimestamp()
      });

      // איפוס הטופס והצגת הודעת הצלחה
      waitlistForm.reset();
      showFeedback('🎉 You are on the list! Welcome to the lab.', 'success');

    } catch (error) {
      console.error('Error adding to waitlist:', error);
      showFeedback('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="btn-icon">🚀</span> Join the Waitlist';
    }
  });

  function showFeedback(message, type) {
    feedbackEl.textContent = message;
    feedbackEl.className = `waitlist-feedback ${type}`;
  }
});