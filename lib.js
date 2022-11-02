import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js'
import { getFirestore, onSnapshot, setDoc, addDoc, doc, collection } from 'https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js'

const app = initializeApp({
    apiKey: "AIzaSyAwtEjjtCX8l4vw9s12hzT7fhYIHYEtf0w",
    authDomain: "coven-191a0.firebaseapp.com",
    projectId: "coven-191a0",
    storageBucket: "coven-191a0.appspot.com",
    messagingSenderId: "166090112479",
    appId: "1:166090112479:web:c9313c64c357f44ced986a"
});

const db = getFirestore(app)

export function useCollection(name, callback, fallback) {
    let unsub = () => {}
    useName(name, async split => {
        unsub()
        unsub = onSnapshot(collection(db, ...split), (snap) =>
            callback(snap.docs.map((doc) => [doc.id, doc.data()]))
        )
    }, fallback)
}

export async function useDocument(name, callback, fallback) {
    let unsub = () => {}
    useName(name, async split => {
        unsub()
        unsub = onSnapshot(doc(db, ...split), (snap) =>
            callback(snap.data())
        )
    }, fallback)
}

export function setDocument(name, data) {
    setDoc(doc(db, ...resolveName(name)), data, { merge: true })
}

export function addDocument(name, data) {
    addDoc(collection(db, ...resolveName(name)), data);
}

export function get(name) {
    return name.charAt(0) === "#"
        ? refs.get(name.substring(1))
        : name 
}

export function resolveName(name) {
    return name.split(".").map((part) =>
        part.charAt(0) === "#"
            ? refs.get(part.substring(1))
            : part
    )
}

function useName(name, cb, fb = () => {}) {
    function isValid(split) {
        return split.every((part) => typeof part === "string")
    }

    function isEqual(a, b) {
        return a.length === b.length && a.every((val, index) => val === b[index])
    }

    let oldSplit = []

    function self() {
        let newSplit = resolveName(name)

        if (!isEqual(newSplit, oldSplit)) {
            oldSplit = newSplit
            if (isValid(oldSplit)) {
                cb(oldSplit)
            } else {
                fb()
            }
        }
    }

    cbs.push(self)

    self()
}

export function setChildren(id, callback) {
    const root = document.getElementById(id)
    return (pairs) => {
        root.replaceChildren(...pairs.map(callback))
        if (root.onchange) {
            root.onchange(root.children[0].value)
        }
    }
}

let refs = new Map()
let cbs = []

export function select(...changes) {
    for (let [name, value] of changes) {
        refs.set(name, value)
    }
    cbs.forEach((cb) => cb(changes))
}
