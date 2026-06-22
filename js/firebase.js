const firebase = window.firebase;
const firebaseConfig = {
    apiKey: "AIzaSyCVC-CQK_umSHnPT5FOvvclut_WN2Ll0to",
    authDomain: "by-the-book-3120c.firebaseapp.com",
    projectId: "by-the-book-3120c",
    storageBucket: "by-the-book-3120c.firebasestorage.app",
    messagingSenderId: "795787841752",
    appId: "1:795787841752:web:52b7657d0ffe31739847ad",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };
export const auth = firebase.auth();
export const db = firebase.firestore();

window.auth = auth;
window.db = db;
window.firebaseAuth = auth;
