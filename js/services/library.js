import { auth, db, firebase } from '../firebase.js';
import { uploadBook } from './storage-service.js';

const COLLECTION = 'userBooks';
const MAX_BYTES = 50 * 1024 * 1024;

async function fetchUserBooks() {
    const user = auth.currentUser;
    if (!user) return [];

    const snap = await db.collection(COLLECTION)
        .where('userId', '==', user.uid)
        .get();

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function sortByUploadedAt(books) {
    return [...books].sort((a, b) => {
        const ta = a.uploadedAt?.toMillis?.() || 0;
        const tb = b.uploadedAt?.toMillis?.() || 0;
        return tb - ta;
    });
}

function sortByLastOpened(books) {
    return [...books].sort((a, b) => {
        const ta = a.lastOpened?.toMillis?.() || 0;
        const tb = b.lastOpened?.toMillis?.() || 0;
        return tb - ta;
    });
}

export function isBookFinished(book) {
    const total = book.totalPages || 0;
    const current = book.currentPage || 0;
    return total > 0 && current >= total;
}

export function isBookInProgress(book) {
    return !!book.lastOpened && !isBookFinished(book);
}

export function getReadingProgress(book) {
    const total = book.totalPages || 0;
    const current = book.currentPage || 1;
    if (!total) return 0;
    return Math.round((current / total) * 100);
}

export async function getLibrary() {
    return sortByUploadedAt(await fetchUserBooks());
}

export async function getContinueReading() {
    const books = sortByLastOpened(await fetchUserBooks());
    return books.find((b) => b.lastOpened) || null;
}

export async function getRecentlyAdded(limit = 5) {
    const books = await getLibrary();
    return books.slice(0, limit);
}

export async function getBook(bookId) {
    const doc = await db.collection(COLLECTION).doc(bookId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export async function addBookToLibrary(file, title) {
    const user = auth.currentUser;
    if (!user) throw new Error('Please sign in to upload books.');

    if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
        throw new Error('Only PDF files are supported.');
    }

    if (file.size > MAX_BYTES) {
        throw new Error('PDF must be 50 MB or smaller.');
    }

    const bookId = db.collection(COLLECTION).doc().id;
    const storagePath = `users/${user.uid}/books/${bookId}.pdf`;
    const downloadURL = await uploadBook(file, storagePath);

    const doc = {
        id: bookId,
        userId: user.uid,
        title: title || file.name.replace(/\.pdf$/i, ''),
        format: 'pdf',
        storagePath,
        downloadURL,
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
        currentPage: 1,
        totalPages: 0,
        lastOpened: null,
    };

    await db.collection(COLLECTION).doc(bookId).set(doc);
    return { id: bookId, ...doc };
}

export async function updateReadingProgress(bookId, currentPage, totalPages) {
    const user = auth.currentUser;
    if (!user || !bookId) return;

    await db.collection(COLLECTION).doc(bookId).set({
        currentPage,
        totalPages,
        lastOpened: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}

export async function getLibraryStats() {
    const books = await getLibrary();
    return {
        total: books.length,
        reading: books.filter(isBookInProgress).length,
        finished: books.filter(isBookFinished).length,
    };
}
