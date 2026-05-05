// -------------------------------------------------------
// index.js — All UI logic for index.html
// -------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {

    // --- Tooltip buttons ---
    document.getElementById('open-tooltip').addEventListener('click', () => {
        toggleTooltip('authTooltip');
    });

    document.getElementById('close-tooltip').addEventListener('click', () => {
        closeTooltip('authTooltip');
    });

    // --- Auth buttons ---
    document.getElementById('login-btn').addEventListener('click', signIn);
    document.getElementById('google-login').addEventListener('click', signInWithGoogle);
    document.getElementById('git-hub-login').addEventListener('click', SignInWithGithub);
    document.getElementById('microsoft-login').addEventListener('click', SignInWithMicrosoft);

    // --- Register / Terms / Privacy links ---
    document.getElementById('go-register-btn').addEventListener('click', () => {
        closeTooltip('authTooltip');
        window.navigateTo('register');
    });

    document.getElementById('terms-btn').addEventListener('click', () => {
        window.navigateTo('terms');
    });

    document.getElementById('privacy-btn').addEventListener('click', () => {
        window.navigateTo('privacy');
    });

});

// -------------------------------------------------------
// Auth Functions
// -------------------------------------------------------

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then(async result => {
            const user = result.user;
            const userRef = firebase.firestore().collection("users").doc(user.uid);
            const doc = await userRef.get();

            if (!doc.exists) {
                await userRef.set({
                    username: user.displayName || "Reader",
                    email: user.email,
                    cheese: 50,
                    role: "reader",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .catch(err => console.error(err));
}

function SignInWithMicrosoft() {
    const provider = new firebase.auth.OAuthProvider('microsoft.com');
    firebase.auth().signInWithPopup(provider);
}

function SignInWithGithub() {
    const provider = new firebase.auth.GithubAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then(async result => {
            const user = result.user;
            const userRef = firebase.firestore().collection("users").doc(user.uid);
            const doc = await userRef.get();

            if (!doc.exists) {
                await userRef.set({
                    username: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    cheese: 50,
                    role: "reader",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .catch(err => console.error(err));
}

function signIn() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => console.log("Logged in:", user.user.email))
        .catch(err => alert(err.message));
}

// -------------------------------------------------------
// Tooltip Functions
// -------------------------------------------------------

function toggleTooltip(elementId) {
    const tooltip = document.getElementById(elementId);
    if (tooltip) {
        tooltip.style.display = (tooltip.style.display === 'block') ? 'none' : 'block';
    } else {
        console.warn("Tooltip element not found: " + elementId);
    }
}

function closeTooltip(elementId) {
    const tooltip = document.getElementById(elementId);
    if (tooltip) {
        tooltip.style.display = 'none';
    } else {
        console.warn("Tooltip element not found: " + elementId);
    }
}
