// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { html, render } from "lit-html";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5UVUYsscdWbWT0CeAcuJn3Z0ma1kVWBE",
  authDomain: "bullethell-game.firebaseapp.com",
  projectId: "bullethell-game",
  storageBucket: "bullethell-game.appspot.com",
  messagingSenderId: "605049523666",
  appId: "1:605049523666:web:deb0c20d7d49b77831cc0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
let messages = [];
const messagesRef = collection(db, "score");
const auth = getAuth();
var username = "anonymous";

function signInAnon() {
  signInAnonymously(auth)
    .then(() => {
      console.log(auth.currentUser);
      updateProfile(auth.currentUser, { displayName: username });
    })
    .catch((error) => {
      console.error(`Error ${error.code}: ${error.message}.`);
    });
}

// This function is called if the Sign Out button is clicked
function signOutUser() {
  signOut(auth)
    .then(() => {
      username = "anonymous";
      console.info("Sign out was successful");
    })
    .catch((error) => {
      console.error(`Error ${error.code}: ${error.message}.`);
    });
}

// This is an observer which runs whenever the authentication state is changed
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("AUTH STATE CHANGED");
    const uid = user.uid;

    // If there is an authenticated user, we render the normal view
    render(view(), document.body);
    // getAllMessages();
  } else {
    // Otherwise, we render the sign in view
    render(signInView(), document.body);
  }
});

async function sendMessage(message) {
  console.log("Sending a score!");
  const user = auth.currentUser;
  // Add some data to the messages collection
  try {
    const docRef = await addDoc(collection(db, "score"), {
      displayName: user.displayName,
      uid: user.uid,
      content: Number(message),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

window.sendMessage = sendMessage;

function updateValue(event) {
  username = event.target.value;
}

function signInView() {
  return html` 
  <div class="board">
    <h3 style="text-align:left;">Enter Your ID:</h3>
    <input type="text" @input=${updateValue} />
    <button class="button" @click=${signInAnon}>Log In</button>
    <h3 style="text-align:left;">Or:</h3>
    <button class="button" @click=${signInAnon}>Anonymous Log in</button>
  </div>`;
}

function view() {
  let user = auth.currentUser;
  var order = Array.from({length: 10}, (_, i) => i + 1)
  return html`
  <div class="board">
  <h4 style="margin-bottom: 5%">
  <span
    >Signed in as
    ${user.isAnonymous ? username : auth.currentUser.displayName}</h4
  >
  <button class="button" @click=${signOutUser}>Sign Out</button>
  <h2>Learderboard</h2>
  <div id="rank">
  <div class="row">
    ${order.map((num) => html`<div>${num}</div>`)}
  </div>
  <div class="row">
    ${messages.map((msg) => html`<div>${msg.displayName}</div>`)}
  </div>
  <div class="row">
    ${messages.map((msg) => html`<div>${msg.content}</div>`)}
  </div>
  </div>
  </div>`;
}

async function getAllMessages() {
  messages = [];

  const querySnapshot = await getDocs(
    query(messagesRef, orderBy("content", "desc"), limit(10))
  );
  querySnapshot.forEach((doc) => {
    let msgData = doc.data();
    messages.push(msgData);
  });

  console.log(messages);
  render(view(), document.body);
}

onSnapshot(
  collection(db, "score"),
  (snapshot) => {
    console.log("snap", snapshot);
    getAllMessages();
  },
  (error) => {
    console.error(error);
  }
);
