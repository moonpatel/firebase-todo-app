import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";

// Add Firebase products that you want to use
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    FieldValue,
    onSnapshot,
    query,
    where,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAM40dAArC96r9KKNvOzM7g2WQQqDJka10",
    authDomain: "fir-basics-35bef.firebaseapp.com",
    projectId: "fir-basics-35bef",
    storageBucket: "fir-basics-35bef.appspot.com",
    messagingSenderId: "342966114039",
    appId: "1:342966114039:web:8bcbdaf7ec54a729f765f2",
    measurementId: "G-BHZDSN09D5",
};

const whenSignedIn = document.querySelector("#whenSignedIn");
const whenSignedOut = document.querySelector("#whenSignedOut");

const signInBtn = document.querySelector("#signInBtn");
const signOutBtn = document.querySelector("#signOutBtn");

const userDetails = document.querySelector("#userDetails");

const taskList = document.querySelector("#taskList");
const addTask = document.querySelector("#addTask");
const taskInput = document.querySelector("#addTask input");
const loader = document.querySelector("#loader");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

let unsubscribe;

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(user.uid);
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;

        addTask.onsubmit = async (event) => {
            event.preventDefault();
            loader.hidden = false;
            let task = taskInput.value;
            console.log("Task: ", task);

            try {
                const docRef = await addDoc(collection(db, "tasks"), {
                    uid: user.uid,
                    task,
                    createdAt: Date.now(),
                });
                console.log("Document added with reference id", docRef.id);
            } catch (e) {
                console.log("Error adding document: ", e);
            }
            taskInput.value = "";
            loader.hidden = true;
        };

        const q = query(collection(db, "tasks"), where("uid", "==", user.uid));

        unsubscribe = onSnapshot(q, (snapShot) => {
            let tasks = "";
            snapShot.forEach((doc) => {
                tasks += `<li>${doc.data().task}</li>`;
            });
            taskList.innerHTML = tasks;
        });

        userDetails.innerHTML = `<h5>Hello, ${user.displayName}</h5><p>User email: ${user.email} <br /> User Id: ${user.uid}</p>`;
    } else {
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        userDetails.innerHTML = "";
        unsubscribe && unsubscribe();
    }
});
signInBtn.onclick = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            whenSignedIn.hidden = true;
            whenSignedOut.hidden = false;
            userDetails.innerHTML = result.displayName;
        })
        .catch((error) => {
            console.log("Error", error);
        });
};

signOutBtn.onclick = () => {
    signOut(auth).then(() => {
        console.log("User signed out");
    });
};
