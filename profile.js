export function loadProfile() {
    const user = firebase.auth().currentUser;

    if (!user) return;

    document.getElementById("profile-name").innerText = user.displayName;
    document.getElementById("profile-email").innerText = user.email;
    document.getElementById("profile-pic").src = user.photoURL;
}