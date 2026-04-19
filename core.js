//--- Imports ---
import { navigateTo, auth } from './main.js';

//-------------------------------------------------------------------------------------

//--- Functions ---
export async function initApp() {
	initAuthListener();
    console.log("Dr. Meow is starting the engine...");

    firebase.auth().onAuthStateChanged(user => {
        if (user && typeof updateSidebarForUser === 'function') {
            updateSidebarForUser(user);
        }
    });

    const hash = window.location.hash.replace('#', '').split('?')[0] || 'home';
    navigateTo(hash);
}

//--------------------------------------------------


// 🔴 LOGOUT
export function logout() {
    auth.signOut()
        .then(() => console.log("Logged out"))
        .catch(err => console.error(err));
}

// 👤 LISTENER 
export function initAuthListener() {
    auth.onAuthStateChanged(user => {
        const nameEl = document.querySelector('.account-btn');

        if (user) {
            if (nameEl) {
                nameEl.innerHTML = `<i class="fa-solid fa-circle-user"></i> ${user.displayName}`;
            }
        } else {
            if (nameEl) {
                nameEl.innerHTML = `<i class="fa-solid fa-circle-user"></i> GUEST MODE`;
            }
        }
    });
}
export function signUp() {
    const email = emailInput.value;
    const password = passwordInput.value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => console.log("Signed up:", user.user.email))
        .catch(err => alert(err.message));
}

export async function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const errorBox = document.getElementById('error-message');

    const showError = (msg) => {
        errorBox.innerText = msg;
        errorBox.style.display = 'block';
    };

    if (password !== confirmPassword) {
        return showError("Passwords do not match!");
    }
    if (password.length < 6) {
        return showError("Password must be at least 6 characters.");
    }

    try {
    
        const userRef = firebase.firestore().collection("users");
        const snapshot = await userRef.where("username", "==", username).get();
        
        if (!snapshot.empty) {
            return showError("Username is already taken. Try another one!");
        }

        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await userRef.doc(user.uid).set({
            username: username,
            email: email,
            cheese: 50, 
            role: "reader",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("Registration successful!");
        navigateTo('home'); 

    } catch (error) {
        if (error.code === 'auth/email-already-in-box') {
            showError("This email is already registered.");
        } else {
            showError(error.message);
        }
    }
}
