import { auth, db, firebase } from '../firebase.js';
import { uploadCommunityCover } from './storage-service.js';

const COLLECTION = 'communities';
const MAX_COVER_BYTES = 5 * 1024 * 1024;

function getOwnerName(user) {
    return user.displayName || user.email?.split('@')[0] || 'Reader';
}

export async function getAllCommunities() {
    const snap = await db.collection(COLLECTION).get();
    return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() || 0;
            const tb = b.createdAt?.toMillis?.() || 0;
            return tb - ta;
        });
}

export async function getCommunity(communityId) {
    const doc = await db.collection(COLLECTION).doc(communityId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export async function createCommunity({ name, description, category, coverFile }) {
    const user = auth.currentUser;
    if (!user) throw new Error('Please sign in to create a community.');

    const trimmedName = name?.trim();
    if (!trimmedName) throw new Error('Community name is required.');

    const communityId = db.collection(COLLECTION).doc().id;
    let coverImage = '';

    if (coverFile) {
        if (!coverFile.type.startsWith('image/')) {
            throw new Error('Cover image must be a JPG, PNG, or WebP file.');
        }
        if (coverFile.size > MAX_COVER_BYTES) {
            throw new Error('Cover image must be 5 MB or smaller.');
        }
        const ext = coverFile.name.split('.').pop() || 'jpg';
        const path = `communities/${communityId}/cover.${ext}`;
        coverImage = await uploadCommunityCover(coverFile, path);
    }

    const doc = {
        name: trimmedName,
        description: description?.trim() || '',
        category: category?.trim() || 'General',
        coverImage,
        ownerId: user.uid,
        ownerName: getOwnerName(user),
        members: [user.uid],
        membersCount: 1,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(COLLECTION).doc(communityId).set(doc);
    return { id: communityId, ...doc };
}

export async function joinCommunity(communityId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Please sign in to join a community.');

    const ref = db.collection(COLLECTION).doc(communityId);

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error('Community not found.');

        const data = snap.data();
        const members = data.members || [];

        if (members.includes(user.uid)) {
            throw new Error('You are already a member of this community.');
        }

        const updated = [...members, user.uid];
        tx.update(ref, {
            members: updated,
            membersCount: updated.length,
        });
    });
}

export async function leaveCommunity(communityId) {
    const user = auth.currentUser;
    if (!user) throw new Error('Please sign in to leave a community.');

    const ref = db.collection(COLLECTION).doc(communityId);

    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new Error('Community not found.');

        const data = snap.data();

        if (data.ownerId === user.uid) {
            throw new Error('Community owners cannot leave their own community.');
        }

        const members = data.members || [];
        if (!members.includes(user.uid)) {
            throw new Error('You are not a member of this community.');
        }

        const updated = members.filter((id) => id !== user.uid);
        tx.update(ref, {
            members: updated,
            membersCount: updated.length,
        });
    });
}

export function isMember(community, userId) {
    return !!(userId && community?.members?.includes(userId));
}
