
import { auth, db } from './firebase-init.js';

export function switchProfileTab(tabId, button){
    document.querySelectorAll('.profile-tab-content')
    .forEach(tab => tab.classList.remove('active-tab'));

    document.querySelectorAll('.profile-tab')
    .forEach(tab => tab.classList.remove('active'));

    const activeTab = document.getElementById(tabId);
    if(activeTab) activeTab.classList.add('active-tab');

    if(button) button.classList.add('active');
}

function showMessage(message, success = true){
    const box = document.getElementById('profile-msg');
    if(!box) return;

    box.style.display = 'block';
    box.textContent = message;
    box.style.background = success ? '#e8f7ec' : '#ffe9e9';
    box.style.color = success ? '#207245' : '#941C04';
    box.style.border = success
        ? '1px solid #8ed1a5'
        : '1px solid #e3a2a2';

    setTimeout(() => {
        box.style.display = 'none';
    }, 3000);
}

async function loadProfile(user){

    if(!user) return;

    const username =
        user.displayName ||
        user.email?.split('@')[0] ||
        'Reader';

    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');

    if(nameEl) nameEl.textContent = username;
    if(emailEl) emailEl.textContent = user.email || 'No email';

    const avatar = document.getElementById('profile-pic');
    if(avatar && user.photoURL){
        avatar.src = user.photoURL;
    }

    const usernameInput = document.getElementById('edit-username');
    const displayInput = document.getElementById('edit-displayname');
    const emailInput = document.getElementById('edit-email');

    if(usernameInput) usernameInput.value = username;
    if(displayInput) displayInput.value = user.displayName || '';
    if(emailInput) emailInput.value = user.email || '';

    try{
        const doc = await db.collection('users').doc(user.uid).get();

        if(doc.exists){
            const data = doc.data();

            const xp = data.xp || 0;
            const mice = data.mice || data.cheese || 0;
            const streak = data.streak || 0;
            const bestStreak = data.bestStreak || streak;
            const level = Math.max(1, Math.floor(xp / 500) + 1);

            const streakEl = document.getElementById('day-streak');
            const bestEl = document.getElementById('best-streak');
            const lvlEl = document.getElementById('user-level');
            const xpCurrent = document.getElementById('xp-current');
            const xpNext = document.getElementById('xp-next');
            const xpBar = document.getElementById('xp-bar');

            if(streakEl) streakEl.textContent = streak;
            if(bestEl) bestEl.textContent = bestStreak;
            if(lvlEl) lvlEl.textContent = level;
            if(xpCurrent) xpCurrent.textContent = `${xp} XP`;
            if(xpNext) xpNext.textContent = `${(level * 500) - xp} XP to next level`;

            if(xpBar){
                const progress = ((xp % 500) / 500) * 100;
                xpBar.style.width = `${progress}%`;
            }

            const bio = document.getElementById('edit-bio');
            if(bio && data.bio){
                bio.value = data.bio;
            }
        }
    }catch(err){
        console.warn(err);
    }
}

auth.onAuthStateChanged(async user => {

    if(!user){
        const nameEl = document.getElementById('profile-name');
        if(nameEl){
            nameEl.textContent = 'Guest Reader';
        }
        return;
    }

    loadProfile(user);
});

export async function updateUsername(){

    const user = auth.currentUser;
    if(!user) return;

    const newName =
        document.getElementById('edit-username')?.value?.trim();

    if(!newName){
        showMessage('Enter a username first', false);
        return;
    }

    try{
        await user.updateProfile({
            displayName: newName
        });

        await db.collection('users')
        .doc(user.uid)
        .set({
            username: newName
        }, { merge:true });

        const nameEl = document.getElementById('profile-name');
        if(nameEl) nameEl.textContent = newName;

        showMessage('Username updated!');
    }catch(err){
        showMessage(err.message, false);
    }
}

export async function updatePasswordCustom(){

    const user = auth.currentUser;
    if(!user) return;

    const password =
        document.getElementById('edit-password')?.value;

    const confirm =
        document.getElementById('edit-confirm-password')?.value;

    if(password !== confirm){
        showMessage('Passwords do not match', false);
        return;
    }

    if(!password || password.length < 6){
        showMessage('Password must be at least 6 characters', false);
        return;
    }

    try{
        await user.updatePassword(password);
        showMessage('Password updated!');
    }catch(err){
        showMessage(err.message, false);
    }
}

async function saveBio(){

    const user = auth.currentUser;
    if(!user) return;

    const bio =
        document.getElementById('edit-bio')?.value || '';

    await db.collection('users')
    .doc(user.uid)
    .set({
        bio
    }, { merge:true });

    showMessage('Bio updated!');
}

document.addEventListener('click', e => {

    if(e.target.classList.contains('save-field-btn')){

        const group = e.target.closest('.edit-field-group');

        if(group?.querySelector('#edit-username')){
            updateUsername();
        }
        else if(group?.querySelector('#edit-bio')){
            saveBio();
        }
        else if(group?.querySelector('#edit-confirm-password')){
            updatePasswordCustom();
        }
    }
});
