import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, onSnapshot, 
    query, orderBy, deleteDoc, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const quoteInput = document.getElementById('quoteInput');
const authorInput = document.getElementById('authorInput');
const submitBtn = document.getElementById('submitBtn');
const quotesList = document.getElementById('quotesList');

// --- 1. Create (Add Quote) ---
submitBtn.addEventListener('click', async () => {
    const text = quoteInput.value;
    const author = authorInput.value;

    if (text && author) {
        try {
            await addDoc(collection(db, "quotes"), {
                text: text,
                author: author,
                createdAt: new Date()
            });
            quoteInput.value = "";
            authorInput.value = "";
        } catch (e) { alert("Error: " + e.message); }
    } else {
        alert("Please fill both fields!");
    }
});

// --- 2. Read (Real-time List) ---
const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    quotesList.innerHTML = ""; 
    snapshot.forEach((snapshotDoc) => {
        const data = snapshotDoc.data();
        const id = snapshotDoc.id; // Document ID for edit/delete

        const quoteCard = document.createElement('div');
        quoteCard.className = 'quote-item';
        quoteCard.innerHTML = `
            <div>
                <p id="text-${id}">"${data.text}"</p>
                <span id="author-${id}">- ${data.author}</span>
            </div>
            <div class="actions">
                <button class="edit-btn" onclick="editQuote('${id}')">Edit</button>
                <button class="delete-btn" onclick="deleteQuote('${id}')">Delete</button>
            </div>
        `;
        quotesList.appendChild(quoteCard);
    });
});

// --- 3. Delete Quote ---
window.deleteQuote = async (id) => {
    if (confirm("Are you sure you want to delete this quote?")) {
        try {
            await deleteDoc(doc(db, "quotes", id));
        } catch (e) { alert("Error deleting: " + e.message); }
    }
};

// --- 4. Edit Quote ---
window.editQuote = async (id) => {
    const oldText = document.getElementById(`text-${id}`).innerText.replace(/"/g, "");
    const oldAuthor = document.getElementById(`author-${id}`).innerText.replace("- ", "");

    const newText = prompt("Edit Quote:", oldText);
    const newAuthor = prompt("Edit Author:", oldAuthor);

    if (newText && newAuthor) {
        try {
            const quoteRef = doc(db, "quotes", id);
            await updateDoc(quoteRef, {
                text: newText,
                author: newAuthor
            });
        } catch (e) { alert("Error updating: " + e.message); }
    }
};